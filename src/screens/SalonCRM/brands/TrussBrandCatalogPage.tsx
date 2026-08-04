import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Loader2,
  Package,
  Search,
  Settings2,
  ShoppingBag,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../../../components/ui/toast";
import { useCrmLocale } from "../i18n/CrmLocale";
import {
  listBrandProductLines,
  listCatalogBrands,
  listCatalogStock,
  setBrandEnabled,
  setProductLineEnabled,
  upsertSalonInventoryByProduct,
  type SalonCatalogBrand,
  type SalonCatalogStockRow,
  type SalonProductLine,
} from "../data/salonProductsApi";

const TRUSS_BRAND_QUERY = "truss";
const THEME = {
  paper: "#FFFDF8",
  ink: "#2A211C",
  muted: "#8C7465",
  line: "#EBDDD2",
  accent: "#B05F57",
  accentSoft: "#F3E0DC",
  mint: "#96C7B3",
  card: "#FFF8F0",
};

type DivisionFilter = "all" | "CARE" | "COLOR" | "professional" | "retail" | "review";

function sizeLabel(row: SalonCatalogStockRow) {
  if (row.package_size_value == null) return null;
  return `${row.package_size_value}${row.package_size_unit || ""}`;
}

function ProductArtwork({ row }: { row: SalonCatalogStockRow }) {
  if (row.image_url) {
    return (
      <img
        src={row.image_url}
        alt={row.canonical_name}
        className="h-full w-full object-contain p-3"
        loading="lazy"
      />
    );
  }
  return (
    <div className="grid h-full w-full place-items-center text-[#C4A99A]">
      <Package className="h-10 w-10" />
    </div>
  );
}

export default function TrussBrandCatalogPage() {
  const { lang } = useCrmLocale();
  const isHe = lang === "he";
  const { addToast } = useToast();

  const [brand, setBrand] = useState<SalonCatalogBrand | null>(null);
  const [lines, setLines] = useState<SalonProductLine[]>([]);
  const [items, setItems] = useState<SalonCatalogStockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [division, setDivision] = useState<DivisionFilter>("all");
  const [lineId, setLineId] = useState<string>("");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selected, setSelected] = useState<SalonCatalogStockRow | null>(null);
  const [manageLinesOpen, setManageLinesOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const brandsRes = await listCatalogBrands(TRUSS_BRAND_QUERY, 20);
        const truss =
          brandsRes.brands.find((b) => /truss/i.test(b.name) || /truss/i.test(b.display_name || "")) ||
          brandsRes.brands[0] ||
          null;
        if (!truss) {
          if (!cancelled) {
            setError(isHe ? "מותג TRUSS לא נמצא בקטלוג" : "TRUSS brand not found in catalog");
            setLoading(false);
          }
          return;
        }
        const [linesRes, stockRes] = await Promise.all([
          listBrandProductLines(truss.id),
          listCatalogStock({ brandId: truss.id, brandBrowse: true, limit: 500 }),
        ]);
        if (cancelled) return;
        setBrand(truss);
        setLines(linesRes.productLines);
        setItems(stockRes.items);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isHe]);

  useEffect(() => {
    if (!brand) return;
    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      try {
        const stockRes = await listCatalogStock({
          brandId: brand.id,
          productLineId: lineId || undefined,
          q: deferredQuery || undefined,
          brandBrowse: true,
          limit: 500,
          signal: controller.signal,
        });
        if (!cancelled) setItems(stockRes.items);
      } catch (err) {
        if (!cancelled && (err as { name?: string }).name !== "AbortError") {
          // keep previous items
        }
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [brand, lineId, deferredQuery]);

  const filtered = useMemo(() => {
    return items.filter((row) => {
      if (division === "CARE" && row.division !== "CARE") return false;
      if (division === "COLOR" && row.division !== "COLOR") return false;
      if (division === "professional") {
        const size = Number(row.package_size_value) || 0;
        const unit = String(row.package_size_unit || "").toUpperCase();
        const pro = (unit === "ML" && size >= 1000) || unit === "L" || (unit === "G" && size >= 500);
        if (!pro && row.primary_product_type !== "color" && row.primary_product_type !== "toner") return false;
      }
      if (division === "retail") {
        const size = Number(row.package_size_value) || 0;
        const unit = String(row.package_size_unit || "").toUpperCase();
        const pro = (unit === "ML" && size >= 1000) || unit === "L" || (unit === "G" && size >= 500);
        if (pro) return false;
      }
      if (division === "review") {
        if (row.validation_status === "approved" && row.image_status !== "missing_official_image") return false;
      }
      return true;
    });
  }, [items, division]);

  const lineCount = lines.length;
  const productCount = brand?.product_count || items.length;

  async function refreshBrand() {
    if (!brand) return;
    const [brandsRes, linesRes, stockRes] = await Promise.all([
      listCatalogBrands(TRUSS_BRAND_QUERY, 20),
      listBrandProductLines(brand.id),
      listCatalogStock({
        brandId: brand.id,
        productLineId: lineId || undefined,
        q: deferredQuery || undefined,
        brandBrowse: true,
        limit: 500,
      }),
    ]);
    const next =
      brandsRes.brands.find((b) => b.id === brand.id) ||
      brandsRes.brands.find((b) => /truss/i.test(b.name)) ||
      brand;
    setBrand(next);
    setLines(linesRes.productLines);
    setItems(stockRes.items);
  }

  async function onEnableBrand() {
    if (!brand) return;
    setBusy(true);
    try {
      await setBrandEnabled(brand.id, true);
      addToast({ type: "success", message: isHe ? "TRUSS הופעל למספרה" : "TRUSS enabled for salon" });
      await refreshBrand();
    } catch (err) {
      addToast({ type: "error", message: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  }

  async function onToggleLine(line: SalonProductLine, enabled: boolean) {
    setBusy(true);
    try {
      if (brand && !brand.enabled) {
        await setBrandEnabled(brand.id, true);
      }
      await setProductLineEnabled(line.id, enabled);
      addToast({
        type: "success",
        message: enabled
          ? isHe
            ? `הסדרה ${line.name} הופעלה`
            : `${line.name} enabled`
          : isHe
            ? `הסדרה ${line.name} כובתה`
            : `${line.name} disabled`,
      });
      await refreshBrand();
    } catch (err) {
      addToast({ type: "error", message: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  }

  async function onAddToInventory(row: SalonCatalogStockRow) {
    setBusy(true);
    try {
      if (brand && !brand.enabled) {
        await setBrandEnabled(brand.id, true);
      }
      await upsertSalonInventoryByProduct(row.product_id, {
        unitsInStock: Number(row.units_in_stock) || 0,
        minStock: Number(row.min_stock) || 0,
        isFavorite: false,
        isVisible: true,
        clientVersion: Date.now(),
      });
      addToast({ type: "success", message: isHe ? "נוסף למלאי" : "Added to inventory" });
      await refreshBrand();
      setSelected((prev) =>
        prev && prev.product_id === row.product_id ? { ...prev, in_inventory: true } : prev,
      );
    } catch (err) {
      addToast({ type: "error", message: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center" style={{ background: THEME.paper }}>
        <Loader2 className="h-8 w-8 animate-spin text-[#B05F57]" />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16" style={{ background: THEME.paper, color: THEME.ink }}>
        <p className="text-lg font-semibold">{error || "TRUSS unavailable"}</p>
        <Link to="/crm/product-catalog-setup" className="mt-4 inline-flex text-[#B05F57] underline">
          {isHe ? "חזרה להגדרת קטלוג" : "Back to catalog setup"}
        </Link>
      </div>
    );
  }

  const divisions: { id: DivisionFilter; label: string }[] = [
    { id: "all", label: isHe ? "הכל" : "All" },
    { id: "CARE", label: isHe ? "טיפוח" : "Care" },
    { id: "COLOR", label: isHe ? "צבע" : "Color" },
    { id: "professional", label: isHe ? "מקצועי" : "Professional" },
    { id: "retail", label: isHe ? "קמעונאי" : "Retail" },
    { id: "review", label: isHe ? "לבדיקה" : "Needs review" },
  ];

  return (
    <div className="min-h-full" style={{ background: `linear-gradient(180deg, #FFF8F0 0%, ${THEME.paper} 40%)`, color: THEME.ink }}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[28px] border px-6 py-8 sm:px-10" style={{ borderColor: THEME.line, background: THEME.card }}>
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(circle at 12% 20%, rgba(176,95,87,0.14), transparent 40%), radial-gradient(circle at 88% 0%, rgba(150,199,179,0.18), transparent 35%)",
            }}
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8C7465]">
                {isHe ? "קטלוג מותג" : "Brand catalog"}
              </p>
              <h1 className="mt-2 font-black tracking-tight text-4xl sm:text-5xl">TRUSS</h1>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#6F5A4E]">
                {isHe
                  ? "קטלוג רשמי לסלון — זהות מוצרים לפי קודי TRS וברקודים מאומתים, עם הפעלה למלאי ולסדרות."
                  : "Official salon catalog — product identity from validated TRS codes and EAN barcodes, wired to brand enablement and inventory."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border px-3 py-1" style={{ borderColor: THEME.line }}>
                  {productCount} {isHe ? "מוצרים" : "products"}
                </span>
                <span className="rounded-full border px-3 py-1" style={{ borderColor: THEME.line }}>
                  {lineCount} {isHe ? "סדרות" : "lines"}
                </span>
                <span className="rounded-full border px-3 py-1" style={{ borderColor: THEME.line }}>
                  {brand.enabled ? (isHe ? "מופעל במספרה" : "Enabled") : isHe ? "לא מופעל" : "Not enabled"}
                </span>
              </div>
            </div>
            <div className="relative flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy || brand.enabled}
                onClick={onEnableBrand}
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: THEME.accent }}
              >
                {brand.enabled ? <Check className="h-4 w-4" /> : null}
                {brand.enabled ? (isHe ? "TRUSS פעיל" : "TRUSS enabled") : isHe ? "הפעל TRUSS" : "Enable TRUSS"}
              </button>
              <button
                type="button"
                onClick={() => setManageLinesOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold"
                style={{ borderColor: THEME.line, background: "#fff" }}
              >
                <Settings2 className="h-4 w-4" />
                {isHe ? "ניהול סדרות" : "Manage lines"}
              </button>
              <Link
                to="/crm/inventory"
                className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold"
                style={{ borderColor: THEME.line, background: "#fff" }}
              >
                {isHe ? "למלאי" : "Inventory"}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {divisions.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDivision(d.id)}
                className="rounded-full px-3 py-1.5 text-sm font-semibold transition"
                style={{
                  background: division === d.id ? THEME.accentSoft : "#fff",
                  color: division === d.id ? THEME.accent : THEME.muted,
                  border: `1px solid ${THEME.line}`,
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C7465]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isHe ? "חיפוש שם, EAN, TRS, גוון..." : "Search name, EAN, TRS, shade..."}
              className="w-full rounded-2xl border bg-white py-3 pl-10 pr-3 text-sm outline-none"
              style={{ borderColor: THEME.line }}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setLineId("")}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              background: !lineId ? THEME.ink : "#fff",
              color: !lineId ? "#fff" : THEME.muted,
              border: `1px solid ${THEME.line}`,
            }}
          >
            {isHe ? "כל הסדרות" : "All lines"}
          </button>
          {lines.map((line) => (
            <button
              key={line.id}
              type="button"
              onClick={() => setLineId(line.id)}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                background: lineId === line.id ? THEME.ink : "#fff",
                color: lineId === line.id ? "#fff" : THEME.muted,
                border: `1px solid ${THEME.line}`,
              }}
            >
              {line.name}
              {line.enabled ? " ·" : ""}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <button
              key={row.product_id}
              type="button"
              onClick={() => setSelected(row)}
              className="rounded-[24px] border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: THEME.line, background: "#fff" }}
            >
              <div className="mb-3 aspect-[4/3] overflow-hidden rounded-2xl" style={{ background: THEME.card }}>
                <ProductArtwork row={row} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8C7465]">
                  {row.product_line_name || "—"}
                </p>
                <h3 className="text-[15px] font-bold leading-snug">{row.canonical_name}</h3>
                <p className="text-xs text-[#8C7465]">
                  {[row.primary_product_type, sizeLabel(row), row.shade_code].filter(Boolean).join(" · ")}
                </p>
                <p className="pt-1 font-mono text-[11px] text-[#6F5A4E]">
                  {row.supplier_sku || "—"} · {row.primary_barcode || "—"}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      background: row.in_inventory ? "rgba(150,199,179,0.25)" : THEME.accentSoft,
                      color: row.in_inventory ? "#2F6B56" : THEME.accent,
                    }}
                  >
                    {row.in_inventory ? (isHe ? "במלאי" : "In inventory") : isHe ? "לא במלאי" : "Not in inventory"}
                  </span>
                  <span className="text-xs text-[#8C7465]">{row.division || ""}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {!filtered.length && (
          <p className="mt-12 text-center text-sm text-[#8C7465]">
            {isHe ? "לא נמצאו מוצרים לפי הסינון הנוכחי" : "No products match the current filters"}
          </p>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 p-0 sm:p-4" onClick={() => setSelected(null)}>
          <aside
            className="flex h-full w-full max-w-lg flex-col overflow-hidden rounded-none bg-white shadow-2xl sm:rounded-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: THEME.line }}>
              <h2 className="text-lg font-bold">{isHe ? "פרטי מוצר" : "Product detail"}</h2>
              <button type="button" onClick={() => setSelected(null)} className="rounded-full p-2 hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="aspect-square overflow-hidden rounded-[24px]" style={{ background: THEME.card }}>
                <ProductArtwork row={selected} />
              </div>
              <h3 className="mt-4 text-xl font-black">{selected.canonical_name}</h3>
              {selected.supplier_name && selected.supplier_name !== selected.canonical_name && (
                <p className="mt-1 text-sm text-[#8C7465]">
                  {isHe ? "שם ספק:" : "Supplier:"} {selected.supplier_name}
                </p>
              )}
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[#8C7465]">{isHe ? "סדרה" : "Line"}</dt>
                  <dd className="font-semibold">{selected.product_line_name || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[#8C7465]">{isHe ? "קטגוריה" : "Category"}</dt>
                  <dd className="font-semibold">{selected.product_category || selected.primary_product_type || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[#8C7465]">TRS</dt>
                  <dd className="font-mono font-semibold">{selected.supplier_sku || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[#8C7465]">EAN</dt>
                  <dd className="font-mono font-semibold">{selected.primary_barcode || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[#8C7465]">{isHe ? "גודל" : "Size"}</dt>
                  <dd className="font-semibold">{sizeLabel(selected) || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[#8C7465]">{isHe ? "גוון" : "Shade"}</dt>
                  <dd className="font-semibold">{selected.shade_code || "—"}</dd>
                </div>
              </dl>
              {selected.official_description && (
                <div className="mt-5">
                  <h4 className="text-sm font-bold">{isHe ? "תיאור רשמי" : "Official description"}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-[#5C4A40]">{selected.official_description}</p>
                  {selected.official_product_url && (
                    <a
                      href={selected.official_product_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-semibold text-[#B05F57] underline"
                    >
                      {isHe ? "מקור רשמי" : "Official source"}
                    </a>
                  )}
                </div>
              )}
              {!selected.official_description && (
                <p className="mt-5 rounded-2xl border px-3 py-2 text-xs text-[#8C7465]" style={{ borderColor: THEME.line }}>
                  {isHe
                    ? "אין תיאור רשמי מאומת עדיין — זהות המוצר מבוססת על קטלוג ה-PDF."
                    : "No verified official description yet — identity is from the PDF catalog."}
                </p>
              )}
            </div>
            <div className="border-t px-5 py-4" style={{ borderColor: THEME.line }}>
              <button
                type="button"
                disabled={busy || selected.in_inventory}
                onClick={() => onAddToInventory(selected)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: THEME.accent }}
              >
                <ShoppingBag className="h-4 w-4" />
                {selected.in_inventory
                  ? isHe
                    ? "כבר במלאי"
                    : "Already in inventory"
                  : isHe
                    ? "הוסף למלאי"
                    : "Add to inventory"}
              </button>
            </div>
          </aside>
        </div>
      )}

      {manageLinesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setManageLinesOpen(false)}>
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: THEME.line }}>
              <h2 className="text-lg font-bold">{isHe ? "סדרות TRUSS" : "TRUSS product lines"}</h2>
              <button type="button" onClick={() => setManageLinesOpen(false)} className="rounded-full p-2 hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-5 py-3">
              {lines.map((line) => (
                <div key={line.id} className="flex items-center justify-between border-b py-3" style={{ borderColor: THEME.line }}>
                  <div>
                    <p className="font-semibold">{line.name}</p>
                    <p className="text-xs text-[#8C7465]">
                      {line.product_count} {isHe ? "מוצרים" : "products"}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onToggleLine(line, !line.enabled)}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: line.enabled ? "rgba(150,199,179,0.25)" : THEME.accentSoft,
                      color: line.enabled ? "#2F6B56" : THEME.accent,
                    }}
                  >
                    {line.enabled ? (isHe ? "פעיל" : "Enabled") : isHe ? "הפעל" : "Enable"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
