import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Droplet,
  Loader2,
  Package,
  RefreshCw,
  Save,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useToast } from "../../components/ui/toast";
import { useCrmLocale } from "./i18n/CrmLocale";
import { useCRMContext } from "./data/CRMDataProvider";
import {
  listBrandProductLines,
  listCatalogBrands,
  listEnabledProductLines,
  setBrandEnabled,
  setProductLineEnabled,
  type SalonCatalogBrand,
  type SalonProductLine,
} from "./data/salonProductsApi";

function ProductLineVisual({ name }: { name: string }) {
  const key = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "").toLowerCase();
  const src = key.includes("majirelcoolcover")
    ? "/inventory-products/majirel-cool-cover.png"
    : key.includes("majirel")
      ? "/inventory-products/majirel-natural.png"
      : key.includes("dialight")
        ? "/inventory-products/dia-light.png"
        : key.includes("diarichesse")
          ? "/inventory-products/dia-richesse.png"
          : key.includes("luocolor")
            ? "/inventory-products/luo-color.png"
            : key.includes("inoasupreme")
              ? "/inventory-products/inoa-supreme.png"
              : key.includes("inoa")
                ? "/inventory-products/inoa.png"
                : null;
  const isLightening = /(blond|bleach|lighten|efassor)/.test(key);
  const isDeveloper = /(developer|diactivator|oxidant)/.test(key);

  return (
    <span className={`grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/70 ${src ? "bg-[#F8F3EE]" : isLightening ? "bg-[#F9E5BE]" : isDeveloper ? "bg-[#DDEBF0]" : "bg-[#F1E8E1]"}`}>
      {src ? <img src={src} alt="" className="h-9 w-7 object-contain drop-shadow-[0_3px_4px_rgba(74,48,35,0.16)]" /> : isLightening ? <Sparkles className="h-4 w-4 text-[#A77928]" /> : isDeveloper ? <Droplet className="h-4 w-4 text-[#6790A0]" /> : <Package className="h-4 w-4 text-[#8C7465]" />}
    </span>
  );
}

function productLineCategory(line: SalonProductLine, isHebrew: boolean) {
  const productType = line.primary_product_type?.toLowerCase() ?? "";
  const text = `${productType} ${line.name}`.toLowerCase();
  if (/(developer_oxidant|developer|oxidant|diactivator|activator)/.test(text)) {
    return { id: "developer", order: 3, label: isHebrew ? "חמצנים ואקטיבטורים" : "Developers & activators" };
  }
  if (/(lightener_bleach|lightener|bleach|blond|efassor|lift)/.test(text)) {
    return { id: "lightener", order: 4, label: isHebrew ? "הבהרות" : "Lighteners" };
  }
  if (/(bond_builder|bond|plex)/.test(text)) {
    return { id: "bond", order: 5, label: isHebrew ? "בונדינג וחיזוק" : "Bond builders" };
  }
  if (/(treatment_care|shampoo|mask|masque|treatment|care|repair|serum|oil|keratin)/.test(text)) {
    return { id: "care", order: 6, label: isHebrew ? "טיפוח ושיקום" : "Care & treatment" };
  }
  if (/(straightening|perm|straight|wave)/.test(text)) {
    return { id: "texture", order: 7, label: isHebrew ? "החלקות וסלסול" : "Straightening & perm" };
  }
  if (/(demi_permanent|acidic_toner|direct_dye|mixer_corrector|toner|gloss|dia light|color touch|shades eq)/.test(text)) {
    return { id: "toner", order: 2, label: isHebrew ? "גלוס, טונר ודמי" : "Demi, gloss & toner" };
  }
  if (/(permanent_color|hair_color_shade|color|colour|permanent|shade|majirel|inoa|dia|luo|cover)/.test(text)) {
    return { id: "color", order: 1, label: isHebrew ? "צבע קבוע וגוונים" : "Permanent color" };
  }
  return { id: "other", order: 8, label: isHebrew ? "מוצרים נוספים" : "Other products" };
}

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

interface ProductCatalogSetupPageProps {
  embedded?: boolean;
  onBack?: () => void;
}

const ProductCatalogSetupPage: React.FC<ProductCatalogSetupPageProps> = ({ embedded = false, onBack }) => {
  const { isDark } = useSiteTheme();
  const { addToast } = useToast();
  const { t } = useCrmLocale();
  const copy = t.catalogSetup;
  const navigate = useNavigate();
  const { reload: reloadCRMData } = useCRMContext();
  const isHebrew = t.common.add !== "Add";
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

  const loadSetup = useCallback(async () => {
    setLoading(true);
    try {
      const [brandResult, enabledLinesResult] = await Promise.all([
        listCatalogBrands("", 150),
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
  }, [addToast, copy.loadFailed]);

  useEffect(() => {
    void loadSetup();
  }, [loadSetup]);

  const hasUnsavedChanges = useMemo(
    () => !sameSet(savedEnabledBrandIds, draftEnabledBrandIds) || !sameSet(savedEnabledLineIds, draftEnabledLineIds),
    [savedEnabledBrandIds, draftEnabledBrandIds, savedEnabledLineIds, draftEnabledLineIds],
  );

  const enabledBrandCount = draftEnabledBrandIds.size;
  const enabledLineCount = draftEnabledLineIds.size;
  const visibleBrands = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return brands;
    return brands.filter((brand) => `${brand.display_name ?? ""} ${brand.name}`.toLocaleLowerCase().includes(normalizedQuery));
  }, [brands, query]);

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

  const goBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    const cameFromCrm = document.referrer.startsWith(window.location.origin) && window.history.length > 1;
    navigate(cameFromCrm ? -1 : "/crm/schedule?tab=settings&section=inventory");
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
      // A catalog scope change is rare but affects every CRM projection. Refresh
      // once here so the inventory brand tabs reflect the saved server state,
      // instead of forcing a full hydrate on every inventory-page mount.
      await reloadCRMData();
      setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      addToast({
        type: warnings.length > 0 ? "warning" : "success",
        message: warnings[0] ?? copy.savedSuccess,
      });
      void loadSetup();
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
    <div className="mx-auto w-full max-w-5xl space-y-2.5">
      <section className={`rounded-[20px] border px-5 py-4 shadow-[0_8px_24px_rgba(92,52,35,0.05)] ${isDark ? "border-white/[0.10] bg-black/45" : "border-[#EBDDD2] bg-[#FFFDF8]"}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={`text-[9px] font-black uppercase tracking-[0.22em] ${isDark ? "text-white/45" : "text-[#B05F57]"}`}>{copy.eyebrow}</p>
            <h1 className={`mt-1 text-[21px] font-black leading-tight tracking-[-0.04em] ${isDark ? "text-white" : "text-[#141414]"}`}>{copy.title}</h1>
            <p className={`mt-1 max-w-xl text-[11px] font-medium leading-5 ${isDark ? "text-white/55" : "text-[#7E7066]"}`}>{copy.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={goBack} className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition ${isDark ? "border-white/[0.10] bg-white/[0.06] text-white/70 hover:bg-white/[0.12]" : "border-[#EBDDD2] bg-white text-[#7E7066] hover:border-[#D8C8BC]"}`}>
              <ArrowLeft className={`h-3.5 w-3.5 ${isHebrew ? "rotate-180" : ""}`} />
              {embedded ? (isHebrew ? "חזרה למלאי ומוצרים" : "Back to inventory & products") : (isHebrew ? "חזרה להגדרות" : "Back to settings")}
            </button>
            <button type="button" onClick={saveChanges} disabled={!hasUnsavedChanges || saving} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#D7897F] px-3.5 text-[11px] font-black text-white shadow-[0_8px_16px_rgba(215,137,127,0.22)] transition disabled:cursor-not-allowed disabled:opacity-45">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {hasUnsavedChanges ? copy.saveChanges : savedAt ? replaceToken(copy.savedAt, "time", savedAt) : copy.done}
            </button>
          </div>
        </div>
      </section>

      <section className={`sticky top-2 z-20 rounded-[18px] border p-3 shadow-[0_8px_22px_rgba(92,52,35,0.07)] backdrop-blur ${isDark ? "border-white/[0.08] bg-black/75" : "border-[#EBDDD2] bg-[#FFFDF8]/95"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <label className={`relative min-w-0 flex-1 sm:max-w-[290px] ${isDark ? "text-white" : "text-[#141414]"}`}>
            <span className="sr-only">{copy.searchBrands}</span>
            <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9A8B80]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} className={`h-9 w-full rounded-xl border py-2 pe-3 ps-9 text-[12px] font-semibold outline-none placeholder:text-[#9A8B80] ${isDark ? "border-white/[0.10] bg-white/[0.06]" : "border-[#EBDDD2] bg-[#FFF8F0] focus:border-[#D7897F]"}`} />
          </label>
          <span className={`hidden items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-semibold sm:flex ${isDark ? "border-white/[0.08] bg-white/[0.05] text-white/65" : "border-[#EBDDD2] bg-white text-[#7E7066]"}`}>
            <span>{replaceToken(copy.brandsCount, "n", enabledBrandCount)}</span><span className="text-[#D8C8BC]">·</span><span>{replaceToken(copy.selectedSeriesCount, "n", enabledLineCount)}</span>
          </span>
          <button type="button" onClick={() => void loadSetup()} className={`grid h-8 w-8 place-items-center rounded-lg transition ${isDark ? "text-white/60 hover:bg-white/[0.10]" : "text-[#7E7066] hover:bg-[#FFF3E8]"}`} aria-label={copy.refreshAria}>
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className={`mt-2 text-[10px] font-medium leading-4 ${isDark ? "text-white/40" : "text-[#9A8B80]"}`}>{copy.fallbackHint}</p>
        {hasUnsavedChanges && <div className="mt-2 rounded-lg border border-[#F9B95C]/35 bg-[#F9B95C]/10 px-3 py-1.5 text-[11px] font-semibold text-[#7C4A0E]">{copy.unsavedChanges}</div>}
        {apiNotice && <div className="mt-2 rounded-lg border border-[#F9B95C]/35 bg-[#F9B95C]/10 px-3 py-1.5 text-[11px] font-semibold text-[#7C4A0E]">{apiNotice}</div>}
      </section>

      <div className="space-y-2">
            {loading ? (
              <div className={`grid min-h-[220px] place-items-center rounded-xl border ${isDark ? "border-white/[0.08] bg-white/[0.04] text-white/60" : "border-[#EBDDD2] bg-[#FFFDF8] text-[#7E7066]"}`}>
                <div className="flex items-center gap-2 text-[12px] font-semibold">
                  <Loader2 className="h-4 w-4 animate-spin" /> {copy.loadingBrands}
                </div>
              </div>
            ) : visibleBrands.length === 0 ? (
              <div className={`rounded-xl border p-7 text-center text-[12px] font-semibold ${isDark ? "border-white/[0.08] bg-white/[0.04] text-white/55" : "border-[#EBDDD2] bg-[#FFFDF8] text-[#7E7066]"}`}>
                {copy.noBrandsFound}
              </div>
            ) : (
              visibleBrands.map((brand) => {
                const enabled = draftEnabledBrandIds.has(brand.id);
                const expanded = expandedBrandId === brand.id;
                const lines = productLinesByBrand[brand.id] ?? [];
                const selectedLines = selectedLineCountForBrand(brand);
                const wholeBrandActive = enabled && selectedLines === 0;
                const disablingWithInventory = savedEnabledBrandIds.has(brand.id) && !enabled && brand.inventory_count > 0;
                const lineGroups = lines.reduce<Record<string, { label: string; order: number; lines: SalonProductLine[] }>>((groups, line) => {
                  const category = productLineCategory(line, isHebrew);
                  (groups[category.id] ??= { label: category.label, order: category.order, lines: [] }).lines.push(line);
                  return groups;
                }, {});

                return (
                  <article
                    key={brand.id}
                    className={`overflow-hidden rounded-2xl border px-5 py-4 transition ${
                      enabled
                        ? isDark ? "border-white/[0.16] bg-white/[0.08]" : "border-[#D7897F]/45 bg-[#FFFDF8] ring-1 ring-[#D7897F]/15"
                        : isDark ? "border-white/[0.08] bg-white/[0.035]" : "border-[#EBDDD2] bg-[#FFFDF8]/82"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(brand.id)}
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-md transition ${isDark ? "bg-white/[0.06] text-white/65 hover:bg-white/[0.12]" : "bg-[#FFF3E8] text-[#7E7066] hover:bg-[#F8E5D8]"}`}
                        aria-label={expanded ? copy.collapseBrandAria : copy.expandBrandAria}
                        aria-expanded={expanded}
                        aria-controls={`brand-series-${brand.id}`}
                      >
                        {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h2 className={`truncate text-[13px] font-semibold ${isDark ? "text-white" : "text-[#141414]"}`}>
                            {brand.display_name || brand.name}
                          </h2>
                          {wholeBrandActive && (
                            <span className="rounded bg-[#F9B95C]/15 px-1.5 py-0.5 text-[9px] font-semibold text-[#7C4A0E]">
                              {copy.wholeBrand}
                            </span>
                          )}
                        </div>
                        <p className={`mt-1 truncate text-[10px] font-medium ${isDark ? "text-white/45" : "text-[#9A8B80]"}`}>
                          {brand.product_line_count} {copy.series}{enabled && selectedLines > 0 ? ` · ${selectedLines} ${copy.selectedSeries}` : ""}
                        </p>
                        {disablingWithInventory && (
                          <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-[#F9B95C]/35 bg-[#F9B95C]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#7C4A0E]">
                            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                            {copy.inventoryWarning}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleBrand(brand)}
                        className={`inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold transition ${
                          enabled
                            ? "bg-[#96C7B3]/35 text-[#315A4B]"
                            : isDark ? "bg-white/[0.08] text-white/65 hover:bg-white/[0.12]" : "bg-[#FFF3E8] text-[#7E7066] hover:bg-[#F8E5D8]"
                        }`}
                        aria-pressed={enabled}
                      >
                        {enabled && <Check className="h-3.5 w-3.5" />}
                        {enabled ? copy.enabled : copy.enableBrand}
                      </button>
                    </div>

                    {expanded && (
                      <div id={`brand-series-${brand.id}`} className={`mt-4 border-t pt-4 ${isDark ? "border-white/[0.08]" : "border-[#EBDDD2]"}`}>
                        {loadingLines === brand.id ? (
                          <div className={`flex items-center gap-2 rounded-lg px-3 py-3 text-[11px] font-semibold ${isDark ? "bg-white/[0.04] text-white/55" : "bg-[#FFF8F0] text-[#7E7066]"}`}>
                            <Loader2 className="h-4 w-4 animate-spin" /> {copy.loadingProductLines}
                          </div>
                        ) : lines.length === 0 ? (
                          <p className={`rounded-lg px-3 py-3 text-[11px] font-semibold ${isDark ? "bg-white/[0.04] text-white/55" : "bg-[#FFF8F0] text-[#7E7066]"}`}>
                            {copy.noProductLines}
                          </p>
                        ) : (
                          <div className="space-y-5">
                            {Object.entries(lineGroups).sort(([, a], [, b]) => a.order - b.order).map(([categoryId, group]) => (
                              <section key={categoryId}>
                                <div className={`mb-2.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] ${isDark ? "text-white/40" : "text-[#9A8B80]"}`}>
                                  <span>{group.label}</span>
                                  <span className="h-px flex-1 bg-[#EBDDD2]" />
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {group.lines.map((line) => {
                              const lineEnabled = draftEnabledLineIds.has(line.id);
                              const lineDisabled = !enabled;
                              return (
                                <button
                                  key={line.id}
                                  type="button"
                                  disabled={lineDisabled}
                                  onClick={() => toggleLine(line.id)}
                                  className={`flex min-h-[58px] items-center gap-3 rounded-xl border px-3 py-3 text-start transition disabled:cursor-not-allowed disabled:opacity-45 ${
                                    lineEnabled
                                      ? "border-[#D7897F]/35 bg-[#F8E5D8]"
                                      : isDark ? "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08]" : "border-[#EBDDD2] bg-white/70 hover:bg-white"
                                  }`}
                                >
                                  <ProductLineVisual name={line.name} />
                                  <span className="min-w-0 flex-1">
                                    <span className={`block truncate text-[12px] font-semibold ${isDark ? "text-white" : "text-[#141414]"}`}>
                                      {line.name}
                                    </span>
                                  </span>
                                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${lineEnabled ? "bg-[#D7897F] text-white" : isDark ? "bg-white/[0.08] text-white/35" : "bg-[#F1E8E1] text-[#9A8B80]"}`}>
                                    {lineEnabled && <Check className="h-3 w-3" />}
                                  </span>
                                </button>
                              );
                            })}
                                </div>
                              </section>
                            ))}
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
  );
};

export default ProductCatalogSetupPage;
