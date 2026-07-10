import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
  Loader2,
  Package,
  RefreshCw,
  Save,
  Search,
  Settings2,
} from "lucide-react";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useToast } from "../../components/ui/toast";
import { useCrmLocale } from "./i18n/CrmLocale";
import {
  listBrandProductLines,
  listCatalogBrands,
  listEnabledProductLines,
  setBrandEnabled,
  setProductLineEnabled,
  type SalonCatalogBrand,
  type SalonProductLine,
} from "./data/salonProductsApi";

const SETUP_THEME = {
  nectarine: "#D7897F",
  peche: "#F9B95C",
  menthe: "#96C7B3",
  paper: "#FFF8F0",
  paperStrong: "#FFFDF8",
  grid: "#EBDDD2",
  ink: "#141414",
  muted: "#7E7066",
};

function toSet(ids: string[]): Set<string> {
  return new Set(ids);
}

function sameSet(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

function replaceToken(template: string, key: string, value: string | number) {
  return template.replace(`{${key}}`, String(value));
}

const ProductCatalogSetupPage: React.FC = () => {
  const { isDark } = useSiteTheme();
  const { addToast } = useToast();
  const { t } = useCrmLocale();
  const copy = t.catalogSetup;
  const [query, setQuery] = useState("");
  const [brands, setBrands] = useState<SalonCatalogBrand[]>([]);
  const [productLinesByBrand, setProductLinesByBrand] = useState<Record<string, SalonProductLine[]>>({});
  const [expandedBrandId, setExpandedBrandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingLines, setLoadingLines] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [savedEnabledBrandIds, setSavedEnabledBrandIds] = useState<Set<string>>(() => new Set());
  const [draftEnabledBrandIds, setDraftEnabledBrandIds] = useState<Set<string>>(() => new Set());
  const [savedEnabledLineIds, setSavedEnabledLineIds] = useState<Set<string>>(() => new Set());
  const [draftEnabledLineIds, setDraftEnabledLineIds] = useState<Set<string>>(() => new Set());
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  const loadSetup = useCallback(async (nextQuery = query) => {
    setLoading(true);
    try {
      const [brandResult, enabledLinesResult] = await Promise.all([
        listCatalogBrands(nextQuery, 150),
        listEnabledProductLines(),
      ]);
      const enabledBrandIds = toSet(brandResult.brands.filter((brand) => brand.enabled).map((brand) => brand.id));
      const enabledLineIds = toSet(enabledLinesResult.productLines.map((line) => line.id));
      setBrands(brandResult.brands);
      setSavedEnabledBrandIds(enabledBrandIds);
      setDraftEnabledBrandIds(new Set(enabledBrandIds));
      setSavedEnabledLineIds(enabledLineIds);
      setDraftEnabledLineIds(new Set(enabledLineIds));
      setSavedAt(null);
      setApiNotice(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.loadFailed;
      if (message.includes("Netlify Functions are not available")) {
        setApiNotice(message);
        setBrands([]);
      } else {
        addToast({ type: "error", message });
      }
    } finally {
      setLoading(false);
    }
  }, [addToast, query]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadSetup(query);
    }, 250);
    return () => window.clearTimeout(id);
  }, [loadSetup, query]);

  const hasUnsavedChanges = useMemo(
    () => !sameSet(savedEnabledBrandIds, draftEnabledBrandIds) || !sameSet(savedEnabledLineIds, draftEnabledLineIds),
    [savedEnabledBrandIds, draftEnabledBrandIds, savedEnabledLineIds, draftEnabledLineIds],
  );

  const enabledBrandCount = draftEnabledBrandIds.size;
  const enabledLineCount = draftEnabledLineIds.size;

  const loadLinesForBrand = useCallback(async (brandId: string) => {
    if (productLinesByBrand[brandId]) return;
    setLoadingLines(brandId);
    try {
      const result = await listBrandProductLines(brandId);
      setProductLinesByBrand((prev) => ({ ...prev, [brandId]: result.productLines }));
    } catch (err) {
      addToast({
        type: "error",
        message: err instanceof Error ? err.message : copy.loadLinesFailed,
      });
    } finally {
      setLoadingLines(null);
    }
  }, [addToast, productLinesByBrand]);

  const toggleExpanded = (brandId: string) => {
    setExpandedBrandId((prev) => (prev === brandId ? null : brandId));
    void loadLinesForBrand(brandId);
  };

  const toggleBrand = (brand: SalonCatalogBrand) => {
    setDraftEnabledBrandIds((prev) => {
      const next = new Set(prev);
      if (next.has(brand.id)) next.delete(brand.id);
      else next.add(brand.id);
      return next;
    });
  };

  const toggleLine = (lineId: string) => {
    setDraftEnabledLineIds((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  };

  const selectedLineCountForBrand = (brand: SalonCatalogBrand) => {
    const loadedLines = productLinesByBrand[brand.id];
    if (!loadedLines) return brand.selected_product_line_count;
    return loadedLines.filter((line) => draftEnabledLineIds.has(line.id)).length;
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const loadedBrandIds = new Set(brands.map((brand) => brand.id));
      const loadedLineIds = new Set(Object.values(productLinesByBrand).flat().map((line) => line.id));
      const warnings: string[] = [];

      for (const brandId of loadedBrandIds) {
        const wasEnabled = savedEnabledBrandIds.has(brandId);
        const shouldBeEnabled = draftEnabledBrandIds.has(brandId);
        if (wasEnabled !== shouldBeEnabled) {
          // eslint-disable-next-line no-await-in-loop
          const result = await setBrandEnabled(brandId, shouldBeEnabled);
          if (result.warning) warnings.push(result.warning);
        }
      }

      for (const lineId of loadedLineIds) {
        const wasEnabled = savedEnabledLineIds.has(lineId);
        const shouldBeEnabled = draftEnabledLineIds.has(lineId);
        if (wasEnabled !== shouldBeEnabled) {
          // eslint-disable-next-line no-await-in-loop
          const result = await setProductLineEnabled(lineId, shouldBeEnabled);
          if (result.warning) warnings.push(result.warning);
        }
      }

      setSavedEnabledBrandIds(new Set(draftEnabledBrandIds));
      setSavedEnabledLineIds(new Set(draftEnabledLineIds));
      setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      addToast({
        type: warnings.length > 0 ? "warning" : "success",
        message: warnings[0] ?? copy.savedSuccess,
      });
      void loadSetup(query);
    } catch (err) {
      addToast({
        type: "error",
        message: err instanceof Error ? err.message : copy.saveFailed,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <section
        className={`overflow-hidden rounded-[28px] border shadow-[0_22px_70px_rgba(92,52,35,0.12)] ${
          isDark ? "border-white/[0.10] bg-black/55" : "border-[#EBDDD2] bg-[#FFF8F0]/92"
        }`}
      >
        <div className="flex flex-col gap-4 border-b border-[#EBDDD2]/70 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
              style={{ background: SETUP_THEME.menthe, color: SETUP_THEME.ink }}
            >
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-[11px] font-black uppercase tracking-[0.24em] ${isDark ? "text-white/45" : "text-[#7E7066]"}`}>
                {copy.eyebrow}
              </p>
              <h1 className={`mt-1 text-2xl font-black tracking-[-0.04em] ${isDark ? "text-white" : "text-[#141414]"}`}>
                {copy.title}
              </h1>
              <p className={`mt-1 max-w-2xl text-[13px] font-medium ${isDark ? "text-white/55" : "text-[#7E7066]"}`}>
                {copy.subtitle}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1.5 text-[12px] font-black ${isDark ? "bg-white/[0.08] text-white/70" : "bg-white/70 text-[#141414]"}`}>
              {replaceToken(copy.brandsCount, "n", enabledBrandCount)}
            </span>
            <span className={`rounded-full px-3 py-1.5 text-[12px] font-black ${isDark ? "bg-white/[0.08] text-white/70" : "bg-white/70 text-[#141414]"}`}>
              {replaceToken(copy.selectedSeriesCount, "n", enabledLineCount)}
            </span>
            <button
              type="button"
              onClick={() => void loadSetup(query)}
              className={`grid h-10 w-10 place-items-center rounded-2xl transition ${isDark ? "bg-white/[0.08] text-white/70 hover:bg-white/[0.13]" : "bg-white/70 text-[#7E7066] hover:bg-white"}`}
              aria-label={copy.refreshAria}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={saveChanges}
              disabled={!hasUnsavedChanges || saving}
              className="inline-flex h-10 items-center gap-2 rounded-2xl px-4 text-[13px] font-black text-[#141414] shadow-[0_12px_28px_rgba(215,137,127,0.25)] transition disabled:cursor-not-allowed disabled:opacity-45"
              style={{ background: SETUP_THEME.nectarine }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {hasUnsavedChanges ? copy.saveChanges : savedAt ? replaceToken(copy.savedAt, "time", savedAt) : copy.done}
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[320px_1fr]">
          <aside className={`rounded-[24px] border p-4 ${isDark ? "border-white/[0.08] bg-white/[0.04]" : "border-[#EBDDD2] bg-white/60"}`}>
            <label className={`mb-2 block text-[11px] font-black uppercase tracking-[0.18em] ${isDark ? "text-white/45" : "text-[#7E7066]"}`}>
              {copy.searchBrands}
            </label>
            <div className={`flex h-11 items-center gap-2 rounded-2xl border px-3 ${isDark ? "border-white/[0.10] bg-black/25 text-white" : "border-[#EBDDD2] bg-white text-[#141414]"}`}>
              <Search className="h-4 w-4 text-[#7E7066]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-semibold outline-none placeholder:text-[#9A8B80]"
              />
            </div>
            <div className={`mt-4 rounded-2xl p-3 text-[12px] font-semibold leading-5 ${isDark ? "bg-white/[0.05] text-white/55" : "bg-[#FFF3E8] text-[#7E7066]"}`}>
              {copy.fallbackHint}
            </div>
            {hasUnsavedChanges && (
              <div className="mt-3 rounded-2xl border border-[#F9B95C]/50 bg-[#F9B95C]/20 px-3 py-2 text-[12px] font-bold text-[#7C4A0E]">
                {copy.unsavedChanges}
              </div>
            )}
            {apiNotice && (
              <div className="mt-3 rounded-2xl border border-[#F9B95C]/50 bg-[#F9B95C]/20 px-3 py-2 text-[12px] font-bold leading-5 text-[#7C4A0E]">
                {apiNotice}
              </div>
            )}
          </aside>

          <div className="space-y-3">
            {loading ? (
              <div className={`grid min-h-[320px] place-items-center rounded-[24px] border ${isDark ? "border-white/[0.08] bg-white/[0.04] text-white/60" : "border-[#EBDDD2] bg-white/55 text-[#7E7066]"}`}>
                <div className="flex items-center gap-2 text-[13px] font-black">
                  <Loader2 className="h-4 w-4 animate-spin" /> {copy.loadingBrands}
                </div>
              </div>
            ) : brands.length === 0 ? (
              <div className={`rounded-[24px] border p-8 text-center text-[13px] font-bold ${isDark ? "border-white/[0.08] bg-white/[0.04] text-white/55" : "border-[#EBDDD2] bg-white/55 text-[#7E7066]"}`}>
                {copy.noBrandsFound}
              </div>
            ) : (
              brands.map((brand) => {
                const enabled = draftEnabledBrandIds.has(brand.id);
                const expanded = expandedBrandId === brand.id;
                const lines = productLinesByBrand[brand.id] ?? [];
                const selectedLines = selectedLineCountForBrand(brand);
                const wholeBrandActive = enabled && selectedLines === 0;
                const disablingWithInventory = savedEnabledBrandIds.has(brand.id) && !enabled && brand.inventory_count > 0;

                return (
                  <article
                    key={brand.id}
                    className={`overflow-hidden rounded-[24px] border transition ${
                      enabled
                        ? isDark ? "border-white/[0.16] bg-white/[0.08]" : "border-[#D7897F]/45 bg-white/80"
                        : isDark ? "border-white/[0.08] bg-white/[0.035]" : "border-[#EBDDD2] bg-white/55"
                    }`}
                  >
                    <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(brand.id)}
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl transition ${isDark ? "bg-white/[0.06] text-white/65 hover:bg-white/[0.12]" : "bg-[#FFF3E8] text-[#7E7066] hover:bg-[#F8E5D8]"}`}
                        aria-label={expanded ? copy.collapseBrandAria : copy.expandBrandAria}
                      >
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className={`truncate text-[16px] font-black ${isDark ? "text-white" : "text-[#141414]"}`}>
                            {brand.display_name || brand.name}
                          </h2>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${enabled ? "bg-[#96C7B3]/25 text-[#2F6C58]" : isDark ? "bg-white/[0.08] text-white/45" : "bg-[#F8E5D8] text-[#7E7066]"}`}>
                            {enabled ? copy.enabled : copy.disabled}
                          </span>
                          {wholeBrandActive && (
                            <span className="rounded-full bg-[#F9B95C]/20 px-2 py-0.5 text-[10px] font-black text-[#7C4A0E]">
                              {copy.wholeBrand}
                            </span>
                          )}
                        </div>
                        <div className={`mt-1 flex flex-wrap gap-3 text-[11px] font-bold ${isDark ? "text-white/45" : "text-[#7E7066]"}`}>
                          <span className="inline-flex items-center gap-1"><Layers className="h-3 w-3" /> {brand.product_line_count} {copy.series}</span>
                          <span className="inline-flex items-center gap-1"><Package className="h-3 w-3" /> {brand.product_count} {copy.products}</span>
                          <span>{selectedLines} {copy.selectedSeries}</span>
                          {brand.inventory_count > 0 && <span>{brand.inventory_count} {copy.inventoryItems}</span>}
                        </div>
                        {disablingWithInventory && (
                          <div className="mt-2 flex items-start gap-2 rounded-2xl border border-[#F9B95C]/50 bg-[#F9B95C]/20 px-3 py-2 text-[12px] font-bold text-[#7C4A0E]">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {copy.inventoryWarning}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleBrand(brand)}
                        className={`inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-[12px] font-black transition ${
                          enabled
                            ? "bg-[#96C7B3] text-[#141414]"
                            : isDark ? "bg-white/[0.08] text-white/65 hover:bg-white/[0.12]" : "bg-[#FFF3E8] text-[#7E7066] hover:bg-[#F8E5D8]"
                        }`}
                      >
                        {enabled && <Check className="h-4 w-4" />}
                        {enabled ? copy.enabled : copy.enableBrand}
                      </button>
                    </div>

                    {expanded && (
                      <div className={`border-t px-4 pb-4 pt-3 ${isDark ? "border-white/[0.08]" : "border-[#EBDDD2]"}`}>
                        {loadingLines === brand.id ? (
                          <div className={`flex items-center gap-2 rounded-2xl px-3 py-4 text-[12px] font-black ${isDark ? "bg-white/[0.04] text-white/55" : "bg-[#FFF8F0] text-[#7E7066]"}`}>
                            <Loader2 className="h-4 w-4 animate-spin" /> {copy.loadingProductLines}
                          </div>
                        ) : lines.length === 0 ? (
                          <p className={`rounded-2xl px-3 py-4 text-[12px] font-bold ${isDark ? "bg-white/[0.04] text-white/55" : "bg-[#FFF8F0] text-[#7E7066]"}`}>
                            {copy.noProductLines}
                          </p>
                        ) : (
                          <div className="grid gap-2 md:grid-cols-2">
                            {lines.map((line) => {
                              const lineEnabled = draftEnabledLineIds.has(line.id);
                              const lineDisabled = !enabled;
                              return (
                                <button
                                  key={line.id}
                                  type="button"
                                  disabled={lineDisabled}
                                  onClick={() => toggleLine(line.id)}
                                  className={`flex items-start justify-between gap-3 rounded-2xl border px-3 py-3 text-start transition disabled:cursor-not-allowed disabled:opacity-45 ${
                                    lineEnabled
                                      ? "border-[#96C7B3]/60 bg-[#96C7B3]/18"
                                      : isDark ? "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08]" : "border-[#EBDDD2] bg-white/60 hover:bg-white"
                                  }`}
                                >
                                  <span className="min-w-0">
                                    <span className={`block truncate text-[13px] font-black ${isDark ? "text-white" : "text-[#141414]"}`}>
                                      {line.name}
                                    </span>
                                    <span className={`mt-0.5 block text-[11px] font-bold ${isDark ? "text-white/45" : "text-[#7E7066]"}`}>
                                      {line.product_count} {copy.products}
                                      {line.inventory_count > 0 ? ` · ${line.inventory_count} ${copy.inventoryItems}` : ""}
                                    </span>
                                  </span>
                                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${lineEnabled ? "bg-[#96C7B3] text-[#141414]" : isDark ? "bg-white/[0.08] text-white/35" : "bg-[#F8E5D8] text-[#9A8B80]"}`}>
                                    {lineEnabled && <Check className="h-3.5 w-3.5" />}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductCatalogSetupPage;
