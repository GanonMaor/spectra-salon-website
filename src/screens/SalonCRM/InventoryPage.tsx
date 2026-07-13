import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Box,
  Droplet,
  Droplets,
  Flame,
  LayoutGrid,
  List,
  Search,
  Save,
  Loader2,
  Package,
  Plus,
  Eye,
  EyeOff,
  ScanBarcode,
  AlertTriangle,
  Check,
  ChevronDown,
  Palette,
  Pencil,
  Settings2,
  ShoppingBag,
  Sparkles,
  Layers3,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useToast } from "../../components/ui/toast";
import { useCrmT } from "./i18n/CrmLocale";
import {
  useBrands,
  useCRMActions,
  useInventoryItems,
  useProductLines,
  useProducts,
} from "./data/crmHooks";
import { useCRMContext, useCRMState } from "./data/CRMDataProvider";
import {
  addSalonInventory,
  listCatalogStock,
  searchGlobalCatalog,
  updateSalonInventory,
  upsertSalonInventoryByProduct,
  type SalonInventoryRow,
  type SalonCatalogSearchRow,
  type SalonCatalogStockRow,
} from "./data/salonProductsApi";
import { useDebouncedAutosaveMap, type AutosaveStatus } from "./data/useDebouncedAutosaveMap";
import {
  buildUIInventoryList,
  draftEditToActionInput,
  toUIBrand,
  toUIProductLine,
  type UIBrand as Brand,
  type UIInventoryProduct as InventoryProduct,
  type UIProductLine as ProductLine,
} from "./inventoryAdapters";

const CRM_INVENTORY_THEME = {
  nectarine: "#D7897F",
  peche: "#F9B95C",
  menthe: "#96C7B3",
  lagune: "#6398A9",
  rose: "#E8A6A0",
  sauge: "#B9CFA5",
  lilas: "#B8A7D9",
  shell: "#F5D3C2",
  paper: "#FFF8F0",
  paperStrong: "#FFFDF8",
  grid: "#EBDDD2",
  ink: "#141414",
  muted: "#7E7066",
};

// ── Types ─────────────────────────────────────────────────────────

interface DraftEdits {
  [productId: string]: {
    units_in_stock?: number;
    min_stock?: number;
    cost_usd?: number;
    selling_price_usd?: number;
    margin_pct?: number;
  };
}

interface DraftBarcodes {
  [productId: string]: string;
}

type ViewMode = "stock-grid" | "stock-table" | "shade-families" | "shade-wall" | "barcodes" | "visibility";
type StockFilter = "all" | "in-stock" | "low-stock";
type ProductVisualKind = "tube" | "bleach" | "shampoo" | "mask" | "retail" | "bottle";

// ── Helpers ───────────────────────────────────────────────────────

function getStockBadgeColor(qty: number, minStock: number): string {
  if (qty === 0) return "bg-gray-400";
  if (qty <= minStock) return "bg-red-500";
  if (qty <= minStock * 2) return "bg-amber-400";
  return "bg-emerald-400";
}

const INVENTORY_ACCENTS = [
  CRM_INVENTORY_THEME.nectarine,
  CRM_INVENTORY_THEME.peche,
  CRM_INVENTORY_THEME.menthe,
  CRM_INVENTORY_THEME.lagune,
  CRM_INVENTORY_THEME.rose,
  CRM_INVENTORY_THEME.lilas,
  CRM_INVENTORY_THEME.sauge,
];

function accentForIndex(index: number): string {
  return INVENTORY_ACCENTS[index % INVENTORY_ACCENTS.length];
}

function productVisualMeta(kind: ProductVisualKind, isHebrew: boolean) {
  switch (kind) {
    case "bleach":
      return { label: isHebrew ? "הבהרה" : "Lightener", icon: Sparkles, color: "#F3D9A2" };
    case "shampoo":
      return { label: isHebrew ? "שמפו" : "Shampoo", icon: Droplets, color: "#C8DDE2" };
    case "mask":
      return { label: isHebrew ? "מסכה" : "Mask", icon: Box, color: "#D9D0EA" };
    case "retail":
      return { label: isHebrew ? "ריטייל" : "Retail", icon: ShoppingBag, color: "#DCE7D1" };
    case "bottle":
      return { label: isHebrew ? "בקבוק" : "Bottle", icon: Droplet, color: "#CFE7DC" };
    default:
      return { label: isHebrew ? "טיובה" : "Tube", icon: Palette, color: "#EBC7C1" };
  }
}

function assertSalonLoaded(salonId: string): void {
  if (!salonId) throw new Error("Salon is not loaded yet");
}

function formatPackageSize(product: {
  package_size_value: number | string | null;
  package_size_unit: string | null;
}): string {
  if (product.package_size_value === null || product.package_size_value === undefined) return "";
  const numericValue = Number(product.package_size_value);
  const value = Number.isFinite(numericValue) ? String(numericValue) : String(product.package_size_value);
  return `${value}${product.package_size_unit ? ` ${product.package_size_unit}` : ""}`;
}

function catalogProductKind(row: SalonCatalogStockRow): ProductVisualKind {
  const text = `${row.canonical_name} ${row.product_line_name ?? ""} ${row.primary_product_type ?? ""}`.toLowerCase();
  if (/(blond|bleach|platinium|premium|הבהר)/.test(text)) return "bleach";
  if (/(shampoo|שמפו)/.test(text)) return "shampoo";
  if (/(mask|masque|מסכה|k18)/.test(text)) return "mask";
  if (/(retail|home|no\.|bonding|acidic|olaplex|טיפול)/.test(text)) return "retail";
  if (/(keratin|straight|החלק)/.test(text)) return "bottle";
  return "tube";
}

function majirelImageForRow(row: SalonCatalogStockRow): string | null {
  const text = `${row.brand_name ?? ""} ${row.product_line_name ?? ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();
  if (!text.includes("loreal")) return null;

  if (text.includes("dialight")) return "/inventory-products/dia-light.png";
  if (text.includes("diarichesse")) return "/inventory-products/dia-richesse.png";
  if (text.includes("luocolor")) return "/inventory-products/luo-color.png";
  if (text.includes("inoasupreme")) return "/inventory-products/inoa-supreme.png";
  if (text.includes("inoa")) return "/inventory-products/inoa.png";
  if (!text.includes("majirel")) return null;

  if (text.includes("coolcover")) return "/inventory-products/majirel-cool-cover.png";
  if (text.includes("highlift")) return "/inventory-products/majirel-high-lift.png";
  if (text.includes("glow")) return "/inventory-products/majirel-glow.png";

  const shadeCode = shadeCodeForRow(row)?.replace(",", ".") ?? "";
  const primaryTone = shadeCode.match(/^[0-9]{1,2}[.-]([0-9])/)?.[1];
  const imageByTone: Record<string, string> = {
    "0": "/inventory-products/majirel-natural.png",
    "1": "/inventory-products/majirel-ash.png",
    "2": "/inventory-products/majirel-violet.png",
    "3": "/inventory-products/majirel-natural.png",
    "4": "/inventory-products/majirel-copper.png",
    "5": "/inventory-products/majirel-violet.png",
    "6": "/inventory-products/majirel-red.png",
    "7": "/inventory-products/majirel-matte.png",
    "8": "/inventory-products/majirel-natural.png",
    "9": "/inventory-products/majirel-violet.png",
  };
  if (primaryTone) return imageByTone[primaryTone] ?? "/inventory-products/majirel-natural.png";

  return "/inventory-products/majirel-natural.png";
}

function shadeLevelForRow(row: SalonCatalogStockRow): string {
  const code = shadeCodeForRow(row);
  return code?.match(/^\d{1,2}/)?.[0] ?? "other";
}

function shadeCodeForRow(row: SalonCatalogStockRow): string | null {
  if (row.shade_code?.trim()) return row.shade_code.trim();
  const shadeMatch = row.canonical_name.match(/(?:^|\s)(\d{1,2}(?:[./]\d+)*(?:\s|$))/);
  return shadeMatch?.[1].trim() ?? null;
}

const LOREAL_SHADE_LEVELS: Record<string, string> = {
  "1": "Black",
  "2": "Very dark brown",
  "3": "Dark brown",
  "4": "Brown",
  "5": "Light brown",
  "6": "Dark blonde",
  "7": "Blonde",
  "8": "Light blonde",
  "9": "Very light blonde",
  "10": "Lightest blonde",
  "11": "Ultra light blonde",
  "12": "High-lift blonde",
};

const LOREAL_SHADE_TONES: Record<string, string> = {
  "0": "Natural",
  "1": "Ash / blue",
  "2": "Iridescent / violet",
  "3": "Gold",
  "4": "Copper",
  "5": "Mahogany / red-violet",
  "6": "Red",
  "7": "Green / matte",
  "8": "Mocha",
  "9": "Pearl",
};

function shadeDescriptionForRow(row: SalonCatalogStockRow, shadeCode: string | null): string | null {
  if (row.shade_description?.trim()) return row.shade_description.trim();
  if (!shadeCode) return null;

  const catalogScope = `${row.brand_name ?? ""} ${row.product_line_name ?? ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const isLorealSystem = catalogScope.includes("l'oreal")
    || catalogScope.includes("loreal")
    || /\b(inoa|majirel|dia)\b/.test(catalogScope);
  if (!isLorealSystem) return null;

  const match = shadeCode.match(/^(\d{1,2})(?:\.(\d)(\d*)?)?$/);
  if (!match) return null;
  const [, level, primaryTone, secondaryTone = ""] = match;
  const levelName = LOREAL_SHADE_LEVELS[level];
  if (!levelName) return null;
  const tones = [primaryTone, secondaryTone]
    .filter(Boolean)
    .map((tone) => LOREAL_SHADE_TONES[tone] ?? tone);
  return tones.length > 0 ? `${levelName} · ${tones.join(" / ")}` : levelName;
}

function catalogStockStatus(units: number, minStock: number, inInventory: boolean): SalonCatalogStockRow["stock_status"] {
  if (!inInventory) return "not_tracked";
  if (units <= 0) return "out";
  if (units <= minStock) return "low";
  return "ok";
}

// ── Main Page Component ───────────────────────────────────────────

const InventoryPage: React.FC = () => {
  const { isDark } = useSiteTheme();
  const { addToast } = useToast();
  const t = useCrmT();
  const isHebrew = t.common.add !== "Add";
  const copy = {
    eyebrow: isHebrew ? "סטודיו מלאי" : "Inventory studio",
    title: isHebrew ? "ניהול מלאי צבעוני" : "Color inventory management",
    subtitle: isHebrew
      ? "מותגים, סדרות ומוצרים במבנה מהיר: בוחרים מותג, סדרה, ומעדכנים מלאי ישירות בכרטיס."
      : "Brands, series, and products in a fast workflow: choose a brand, choose a series, and update stock directly in the card.",
    productsTab: isHebrew ? "מוצרים" : "Products",
    tableTab: isHebrew ? "טבלה" : "Table",
    displayTab: isHebrew ? "תצוגה" : "Display",
    brandProducts: isHebrew ? "מוצרים במותג" : "Brand products",
    stockUnits: isHebrew ? "יחידות במלאי" : "Stock units",
    brandsTitle: isHebrew ? "מותגים" : "Brands",
    brandsHint: isHebrew ? "תפריט מהיר לפי מותג." : "Quick filter by brand.",
    brandProductCount: isHebrew ? "מוצרים" : "products",
    seriesTitlePrefix: isHebrew ? "סדרות של" : "Series for",
    brandFallback: isHebrew ? "המותג" : "brand",
    seriesHint: isHebrew ? "בחירה מהירה של סדרה." : "Quick series selection.",
    seriesProducts: isHebrew ? "מוצרים" : "products",
    seriesUnits: isHebrew ? "יחידות" : "units",
    lowStockSuffix: isHebrew ? "במלאי נמוך" : "low stock",
    displayed: isHebrew ? "מוצגים" : "Displayed",
    minimum: isHebrew ? "מינימום" : "Minimum",
    inventory: isHebrew ? "מלאי" : "Stock",
    statEnabledBrands: isHebrew ? "מותגים פעילים" : "Enabled brands",
    statSelectedSeries: isHebrew ? "סדרות נבחרות" : "Selected series",
    statInventoryProducts: isHebrew ? "מוצרים במלאי" : "Inventory products",
    scopeTitle: isHebrew ? "מותגים וסדרות פעילים" : "Enabled brands & series",
    scopeSubtitle: isHebrew
      ? "טווח הקטלוג שבחרת בהגדרת המוצרים."
      : "The catalog scope you selected in Product Catalog Setup.",
    allLinesEnabled: isHebrew ? "כל הסדרות פעילות" : "All product lines enabled",
    manageBrandsLines: isHebrew ? "ניהול מותגים וסדרות" : "Manage brands & lines",
    scopedSearchHint: isHebrew
      ? "החיפוש מוגבל למותגים ולסדרות הפעילים שלך."
      : "Search stays within your enabled brands & series.",
    noBrandsScope: isHebrew ? "עדיין לא הופעלו מותגים." : "No brands enabled yet.",
    emptyTitle: isHebrew ? "קטלוג המוצרים שלך מוכן" : "Your product catalog is ready",
    emptyBody: isHebrew
      ? "בחרת מותגים וסדרות, אבל עדיין לא נוספו מוצרים למלאי."
      : "You selected brands and product lines, but no inventory products have been added yet.",
    emptyHint: isHebrew
      ? "כבר בחרת את המותגים שאיתם אתה עובד. עכשיו צריך להוסיף מוצרים אמיתיים למלאי."
      : "You already chose the brands you work with. Now add actual products to your inventory.",
    addFromCatalog: isHebrew ? "הוסף מוצרים מהקטלוג" : "Add products from catalog",
    comingNext: isHebrew ? "בקרוב" : "Coming next",
    addCatalogTitle: isHebrew ? "הוספת מוצרים מהקטלוג שלך" : "Add products from your catalog",
    addCatalogSubtitle: isHebrew
      ? "חפש מוצרים מתוך המותגים והסדרות שבחרת."
      : "Search products from the brands and series you selected.",
    catalogSearchPlaceholder: isHebrew ? "שם מוצר, גוון, סדרה או מותג..." : "Product name, shade, line, or brand...",
    searchToStart: isHebrew ? "הקלד לפחות 2 תווים כדי לחפש." : "Type at least 2 characters to search.",
    noCatalogResults: isHebrew ? "לא נמצאו מוצרים בסקופ שבחרת." : "No products found in your selected scope.",
    alreadyAdded: isHebrew ? "כבר נוסף" : "Already added",
    selectedCount: isHebrew ? "נבחרו" : "selected",
    addSelected: isHebrew ? "הוסף נבחרים" : "Add selected",
    addingSelected: isHebrew ? "מוסיף..." : "Adding...",
    addedSuccess: isHebrew ? "המוצרים נוספו למלאי" : "Products added to inventory",
    addFailed: isHebrew ? "הוספת המוצרים נכשלה" : "Failed to add products",
    cancel: isHebrew ? "ביטול" : "Cancel",
    catalogGridLoading: isHebrew ? "טוען מוצרי קטלוג..." : "Loading catalog products...",
    catalogGridEmpty: isHebrew
      ? "אין מוצרי קטלוג בסקופ שנבחר."
      : "No catalog products in the selected scope.",
    inStockBadge: isHebrew ? "במלאי" : "in stock",
    addToStock: isHebrew ? "הוסף למלאי" : "Add to stock",
    saveStock: isHebrew ? "שמור" : "Save",
    notTracked: isHebrew ? "לא במלאי" : "Not in stock",
    autosaveDirty: isHebrew ? "ממתין לשמירה" : "Pending save",
    autosaveSaving: isHebrew ? "שומר..." : "Saving...",
    autosaveSaved: isHebrew ? "נשמר" : "Saved",
    autosaveError: isHebrew ? "שמירה נכשלה · נסה שוב" : "Save failed · retry",
    minStockShort: isHebrew ? "מינ׳" : "Min",
    favoriteShort: isHebrew ? "מועדף" : "Fav",
    visibleShort: isHebrew ? "מוצג" : "Visible",
  };
  const { reload: reloadCRMData } = useCRMContext();
  const crmState = useCRMState();
  const actions = useCRMActions();
  const inventoryHydratedRef = useRef(false);

  // Canonical CRM data → projected to legacy view-model the UI was built for.
  const crmBrands = useBrands();
  const crmLines = useProductLines();
  const crmProducts = useProducts();
  const crmInventory = useInventoryItems();

  const brands = useMemo<Brand[]>(() => crmBrands.map(toUIBrand), [crmBrands]);
  const lines = useMemo<ProductLine[]>(
    () => crmLines.map(toUIProductLine),
    [crmLines],
  );
  const products = useMemo<InventoryProduct[]>(
    () => buildUIInventoryList(crmState),
    [crmState, crmInventory, crmProducts],
  );

  const navigate = useNavigate();
  const goToCatalogSetup = useCallback(
    () => navigate("/crm/product-catalog-setup"),
    [navigate],
  );

  // Enabled catalog scope: `brands` and `lines` come from the salon-scoped
  // API, which only ever returns the salon's enabled brands and selected
  // product lines. We surface this scope so an empty inventory still shows
  // what the owner configured in Product Catalog Setup.
  const catalogScope = useMemo(
    () =>
      brands.map((brand) => ({
        brand,
        seriesNames: lines.filter((l) => l.brand_id === brand.id).map((l) => l.name),
      })),
    [brands, lines],
  );
  const enabledBrandCount = brands.length;
  const selectedSeriesCount = lines.length;
  const inventoryProductCount = products.length;
  const [addCatalogOpen, setAddCatalogOpen] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogResults, setCatalogResults] = useState<SalonCatalogSearchRow[]>([]);
  const [catalogSearching, setCatalogSearching] = useState(false);
  const [catalogSearchError, setCatalogSearchError] = useState<string | null>(null);
  const [selectedCatalogIds, setSelectedCatalogIds] = useState<Set<string>>(() => new Set());
  const [addingCatalogProducts, setAddingCatalogProducts] = useState(false);

  useEffect(() => {
    if (inventoryHydratedRef.current) return;
    inventoryHydratedRef.current = true;
    void reloadCRMData();
  }, [reloadCRMData]);

  useEffect(() => {
    if (!addCatalogOpen) return;
    const q = catalogQuery.trim();
    if (q.length < 2) {
      setCatalogResults([]);
      setCatalogSearching(false);
      setCatalogSearchError(null);
      return;
    }

    let cancelled = false;
    setCatalogSearching(true);
    setCatalogSearchError(null);
    const timer = window.setTimeout(() => {
      searchGlobalCatalog(q, undefined, 40)
        .then((result) => {
          if (cancelled) return;
          setCatalogResults(result.items);
          setSelectedCatalogIds((prev) => {
            const resultIds = new Set(result.items.map((item) => item.id));
            return new Set(Array.from(prev).filter((id) => resultIds.has(id)));
          });
        })
        .catch((err) => {
          if (cancelled) return;
          setCatalogResults([]);
          setCatalogSearchError(err instanceof Error ? err.message : String(err));
        })
        .finally(() => {
          if (!cancelled) setCatalogSearching(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [addCatalogOpen, catalogQuery]);

  const openAddCatalog = useCallback(() => {
    setAddCatalogOpen(true);
    setCatalogSearchError(null);
  }, []);

  const closeAddCatalog = useCallback(() => {
    if (addingCatalogProducts) return;
    setAddCatalogOpen(false);
    setSelectedCatalogIds(new Set());
  }, [addingCatalogProducts]);

  const toggleCatalogSelection = useCallback((product: SalonCatalogSearchRow) => {
    if (product.in_inventory) return;
    setSelectedCatalogIds((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
  }, []);

  const selectedCatalogProducts = useMemo(
    () => catalogResults.filter((product) => selectedCatalogIds.has(product.id) && !product.in_inventory),
    [catalogResults, selectedCatalogIds],
  );

  const addSelectedCatalogProducts = useCallback(async () => {
    if (selectedCatalogProducts.length === 0) return;
    setAddingCatalogProducts(true);
    try {
      for (const product of selectedCatalogProducts) {
        // eslint-disable-next-line no-await-in-loop
        await addSalonInventory({ productId: product.id });
      }
      addToast({ type: "success", message: copy.addedSuccess });
      setSelectedCatalogIds(new Set());
      setAddCatalogOpen(false);
      await reloadCRMData();
    } catch (err) {
      addToast({
        type: "error",
        message: `${copy.addFailed}: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setAddingCatalogProducts(false);
    }
  }, [addToast, copy.addFailed, copy.addedSuccess, reloadCRMData, selectedCatalogProducts]);

  const [saving, setSaving] = useState(false);

  // Filter state
  const [activeBrand, setActiveBrand] = useState<string>("");
  const [activeLine, setActiveLine] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [stockFilterOpen, setStockFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("shade-families");

  // Draft state (shared between grid and table)
  const [draftEdits, setDraftEdits] = useState<DraftEdits>({});
  const [draftBarcodes, setDraftBarcodes] = useState<DraftBarcodes>({});

  // Catalog-first stock grid state
  const [catalogStockRows, setCatalogStockRows] = useState<SalonCatalogStockRow[]>([]);
  const [catalogStockLoading, setCatalogStockLoading] = useState(false);
  const [catalogStockError, setCatalogStockError] = useState<string | null>(null);
  const [catalogStockReloadKey, setCatalogStockReloadKey] = useState(0);

  const hasDirtyEdits = Object.keys(draftEdits).length > 0;

  // Default brand selection once CRM hydrates.
  useEffect(() => {
    if (brands.length > 0 && !activeBrand) {
      setActiveBrand(brands[0].id);
    }
  }, [brands, activeBrand]);

  // Filtered lines for active brand
  const filteredLines = useMemo(
    () => lines.filter((l) => !activeBrand || l.brand_id === activeBrand),
    [lines, activeBrand],
  );

  // Filtered products
  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeBrand) result = result.filter((p) => p.brand_id === activeBrand);
    if (activeLine) result = result.filter((p) => p.product_line_id === activeLine);
    if (stockFilter === "in-stock") result = result.filter((p) => p.units_in_stock > 0);
    if (stockFilter === "low-stock") result = result.filter((p) => p.units_in_stock <= p.min_stock);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.shade_code.toLowerCase().includes(q) ||
          (p.display_name || "").toLowerCase().includes(q) ||
          (p.barcode || "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [products, activeBrand, activeLine, stockFilter, searchQuery]);

  // Data hydration is handled by `CRMDataProvider`; the page just
  // reads the latest snapshot from `crmHooks` above.

  // Auto-select first line when brand changes
  useEffect(() => {
    if (filteredLines.length > 0 && !filteredLines.find((l) => l.id === activeLine)) {
      setActiveLine(filteredLines[0].id);
    }
  }, [filteredLines, activeLine]);

  // ── Catalog-first stock grid ────────────────────────────────────
  // Fetch every catalog product in the salon's enabled scope with a stock
  // overlay so products with no inventory row still appear (stock 0).
  useEffect(() => {
    if (enabledBrandCount === 0) {
      setCatalogStockRows([]);
      setCatalogStockLoading(false);
      setCatalogStockError(null);
      return;
    }
    let cancelled = false;
    setCatalogStockLoading(true);
    setCatalogStockError(null);
    const timer = window.setTimeout(() => {
      listCatalogStock({
        brandId: activeBrand || undefined,
        productLineId: activeLine || undefined,
        q: searchQuery.trim() || undefined,
        limit: 300,
      })
        .then((result) => {
          if (cancelled) return;
          setCatalogStockRows(result.items);
        })
        .catch((err) => {
          if (cancelled) return;
          setCatalogStockRows([]);
          setCatalogStockError(err instanceof Error ? err.message : String(err));
        })
        .finally(() => {
          if (!cancelled) setCatalogStockLoading(false);
        });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeBrand, activeLine, searchQuery, enabledBrandCount, catalogStockReloadKey]);

  const filteredCatalogRows = useMemo(() => {
    let rows = catalogStockRows;
    if (stockFilter === "in-stock") rows = rows.filter((r) => Number(r.units_in_stock) > 0);
    if (stockFilter === "low-stock") {
      rows = rows.filter((r) => r.in_inventory && Number(r.units_in_stock) <= Number(r.min_stock));
    }
    return rows;
  }, [catalogStockRows, stockFilter]);

  const applyCatalogStockPatch = useCallback((productId: string, patch: Partial<{
    salonInventoryProductId: string | null;
    unitsInStock: number;
    minStock: number;
    openProductAmount: number;
    openProductUnit: "g" | "oz";
    costAmount: number;
    costCurrency: string;
    sellPriceAmount: number;
    sellPriceCurrency: string;
    isFavorite: boolean;
    isVisible: boolean;
  }>) => {
    setCatalogStockRows((rows) =>
      rows.map((row) => {
        if (row.product_id !== productId) return row;
        const units = patch.unitsInStock ?? (Number(row.units_in_stock) || 0);
        const minStock = patch.minStock ?? (Number(row.min_stock) || 0);
        const inInventory = row.in_inventory || Object.keys(patch).length > 0;
        return {
          ...row,
          salon_inventory_product_id: patch.salonInventoryProductId !== undefined
            ? patch.salonInventoryProductId
            : row.salon_inventory_product_id,
          units_in_stock: units,
          min_stock: minStock,
          open_product_amount: patch.openProductAmount ?? row.open_product_amount,
          open_product_unit: patch.openProductUnit ?? row.open_product_unit,
          cost_amount: patch.costAmount ?? row.cost_amount,
          cost_currency: patch.costCurrency ?? row.cost_currency,
          sell_price_amount: patch.sellPriceAmount ?? row.sell_price_amount,
          sell_price_currency: patch.sellPriceCurrency ?? row.sell_price_currency,
          is_favorite: patch.isFavorite ?? row.is_favorite,
          is_visible: patch.isVisible ?? row.is_visible,
          in_inventory: inInventory,
          stock_status: catalogStockStatus(units, minStock, inInventory),
        };
      }),
    );
  }, []);

  type CatalogStockAutosaveDraft = {
    unitsInStock?: number;
    minStock?: number;
    openProductAmount?: number;
    openProductUnit?: "g" | "oz";
    costAmount?: number;
    costCurrency?: string;
    sellPriceAmount?: number;
    sellPriceCurrency?: string;
    isFavorite?: boolean;
    isVisible?: boolean;
  };

  const catalogStockAutosave = useDebouncedAutosaveMap<string, CatalogStockAutosaveDraft, SalonInventoryRow>({
    save: async (productId, draft, { version, signal }) => {
      assertSalonLoaded(crmState.currentSalonId);
      const result = await upsertSalonInventoryByProduct(productId, { ...draft, clientVersion: version }, signal);
      return { server: result.item, version: result.clientVersion };
    },
    applyServer: (productId, item) => {
      applyCatalogStockPatch(productId, {
        salonInventoryProductId: item.id,
        unitsInStock: Number(item.units_in_stock) || 0,
        minStock: Number(item.min_stock) || 0,
        openProductAmount: Number(item.open_product_amount) || 0,
        openProductUnit: item.open_product_unit,
        costAmount: Number(item.cost_amount) || 0,
        costCurrency: item.cost_currency ?? "USD",
        sellPriceAmount: Number(item.sell_price_amount) || 0,
        sellPriceCurrency: item.sell_price_currency ?? "USD",
        isFavorite: item.is_favorite,
        isVisible: item.is_visible,
      });
    },
    onError: (_productId, err) => {
      addToast({
        type: "error",
        message: `${copy.addFailed}: ${err instanceof Error ? err.message : String(err)}`,
      });
    },
  });

  const editCatalogStock = useCallback(
    (row: SalonCatalogStockRow, patch: CatalogStockAutosaveDraft) => {
      applyCatalogStockPatch(row.product_id, patch);
      catalogStockAutosave.edit(row.product_id, patch);
    },
    [applyCatalogStockPatch, catalogStockAutosave],
  );

  // ── Draft helpers ───────────────────────────────────────────────

  const setDraftField = (productId: string, field: string, value: number) => {
    setDraftEdits((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const getDraftValue = (product: InventoryProduct, field: keyof DraftEdits[string]): number => {
    const draft = draftEdits[product.id];
    if (draft && draft[field] !== undefined) return draft[field] as number;
    if (field === "units_in_stock") return product.units_in_stock;
    if (field === "min_stock") return product.min_stock;
    return parseFloat((product as any)[field]) || 0;
  };

  const isProductDirty = (productId: string): boolean => !!draftEdits[productId];

  // ── Save handlers ──────────────────────────────────────────────
  // All mutations go through `crmActions.updateInventory`. The reducer
  // updates the canonical state; React re-renders pull fresh values
  // through the selectors above, which in turn updates Home, Analytics,
  // AI insights, and any other consumer that watches the same data.

  const saveStockEdits = useCallback(async () => {
    const entries = Object.entries(draftEdits);
    if (entries.length === 0) return;

    setSaving(true);
    try {
      assertSalonLoaded(crmState.currentSalonId);
      const failures: string[] = [];
      for (const [id, fields] of entries) {
        // salon_id is derived from the authenticated session server-side; we
        // only send the salon inventory item id and the changed fields.
        await updateSalonInventory(id, {
          unitsInStock: fields.units_in_stock,
          minStock: fields.min_stock,
          costAmount: fields.cost_usd,
          sellPriceAmount: fields.selling_price_usd,
        });
        const r = actions.updateInventory(draftEditToActionInput(id, fields));
        if (!r.ok) failures.push(`${id}: ${r.error.message}`);
      }
      if (failures.length > 0) {
        addToast({
          message: `${t.inventory.saveFailed}\n${failures.join("\n")}`,
          type: "error",
        });
      } else {
        setDraftEdits({});
        // Keep the catalog-stock grid (stock-grid view) in sync: the table save
        // persists to DB via salon-products but does not automatically re-fetch
        // the catalog-stock overlay, so bump the key to trigger a fresh fetch.
        setCatalogStockReloadKey((k) => k + 1);
        addToast({
          message: t.inventory.updatedProducts.replace("{n}", String(entries.length)),
          type: "success",
        });
      }
    } catch (err) {
      addToast({
        message: `${t.inventory.saveFailed}\n${err instanceof Error ? err.message : String(err)}`,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }, [draftEdits, actions, addToast, t, crmState.currentSalonId]);

  const saveBarcode = useCallback(async (productId: string) => {
    const barcode = draftBarcodes[productId];
    if (barcode === undefined) return;

    setSaving(true);
    try {
      assertSalonLoaded(crmState.currentSalonId);
      await updateSalonInventory(productId, { localBarcodeOverride: barcode || null });
      const r = actions.updateInventory({ inventoryItemId: productId, barcode: barcode || null });
      if (!r.ok) {
        addToast({ message: `${t.inventory.barcodeFailed}: ${r.error.message}`, type: "error" });
        return;
      }
      setDraftBarcodes((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      addToast({ message: t.inventory.barcodeUpdated, type: "success" });
    } catch (err) {
      addToast({
        message: `${t.inventory.barcodeFailed}: ${err instanceof Error ? err.message : String(err)}`,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }, [draftBarcodes, actions, addToast, t, crmState.currentSalonId]);

  const toggleVisibility = useCallback(async (productId: string, newVisible: boolean) => {
    setSaving(true);
    try {
      assertSalonLoaded(crmState.currentSalonId);
      await updateSalonInventory(productId, { isVisible: newVisible });
      const r = actions.updateInventory({ inventoryItemId: productId, isVisible: newVisible });
      if (!r.ok) {
        addToast({ message: `${t.inventory.visibilityFailed}: ${r.error.message}`, type: "error" });
        return;
      }
      addToast({
        message: newVisible ? t.inventory.productShown : t.inventory.productHidden,
        type: "success",
      });
    } catch (err) {
      addToast({
        message: `${t.inventory.visibilityFailed}: ${err instanceof Error ? err.message : String(err)}`,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }, [actions, addToast, t, crmState.currentSalonId]);

  // ── Style helpers ───────────────────────────────────────────────

  const cardBg = isDark ? "bg-white/[0.06] border-white/[0.08]" : "bg-[#FFFDF8] border-[#EBDDD2]";
  const textPrimary = isDark ? "text-white" : "text-[#141414]";
  const textSecondary = isDark ? "text-white/60" : "text-[#7E7066]";
  const textMuted = isDark ? "text-white/55" : "text-[#9A8B80]";
  const inputBg = isDark
    ? "bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/50"
    : "bg-[#FFF8F0] border-[#EBDDD2] text-[#141414] placeholder:text-[#9A8B80]";
  const chipActive = isDark ? "bg-white/[0.15] text-white" : "bg-[#F3C3BC] text-[#B05F57]";
  const chipInactive = isDark
    ? "bg-white/[0.05] text-white/50 hover:bg-white/[0.08]"
    : "bg-white/55 text-[#7E7066] hover:bg-[#F8E5D8] hover:text-[#141414]";

  // ── Derived scope stats (compact header + series chips) ──────────

  const activeBrandIndex = Math.max(0, brands.findIndex((b) => b.id === activeBrand));
  const seriesCards = filteredLines.map((line, index) => {
    const seriesProducts = products.filter((p) => p.product_line_id === line.id);
    return {
      line,
      accent: accentForIndex(index + activeBrandIndex),
      productCount: seriesProducts.length,
      units: seriesProducts.reduce((sum, p) => sum + p.units_in_stock, 0),
      low: seriesProducts.filter((p) => p.units_in_stock <= p.min_stock).length,
    };
  });

  const isStockView = viewMode === "stock-grid" || viewMode === "stock-table" || viewMode === "shade-families" || viewMode === "shade-wall";

  return (
    <div className="space-y-2.5">
      <section
        className="rounded-[20px] border border-[#EBDDD2] bg-[#FFFDF8]/90 px-5 py-4 shadow-[0_8px_24px_rgba(92,52,35,0.05)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#B05F57]">{copy.eyebrow}</p>
            <h1 className={`mt-0.5 text-[21px] font-black leading-tight tracking-[-0.04em] ${textPrimary}`} title={copy.subtitle}>
              {copy.title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {isStockView && (
              <div className="relative">
                {(() => {
                  const options = [
                    { id: "all" as StockFilter, label: t.inventory.fullCatalog, icon: Package, color: "text-[#7E7066]" },
                    { id: "in-stock" as StockFilter, label: t.inventory.inStock, icon: Check, color: "text-[#42A77E]" },
                    { id: "low-stock" as StockFilter, label: t.inventory.lowStock, icon: AlertTriangle, color: "text-[#D7897F]" },
                  ];
                  const active = options.find((option) => option.id === stockFilter) ?? options[0];
                  const ActiveIcon = active.icon;
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => setStockFilterOpen((open) => !open)}
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#EBDDD2] bg-white px-3 text-[10px] font-black text-[#7E7066] shadow-[0_4px_10px_rgba(92,52,35,0.05)] transition hover:border-[#D8C8BC]"
                        aria-haspopup="menu"
                        aria-expanded={stockFilterOpen}
                      >
                        <span className={`grid h-5 w-5 place-items-center rounded-md bg-[#FFF8F0] ${active.color}`}>
                          <ActiveIcon className="h-3 w-3" />
                        </span>
                        <span>{active.label}</span>
                        <span className="text-[#9A8B80]">⌄</span>
                      </button>
                      {stockFilterOpen && (
                        <div className="absolute end-0 top-11 z-30 min-w-[140px] overflow-hidden rounded-xl border border-[#EBDDD2] bg-[#FFFDF8] p-1 shadow-[0_14px_32px_rgba(92,52,35,0.14)]" role="menu">
                          {options.map((option) => {
                            const OptionIcon = option.icon;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                  setStockFilter(option.id);
                                  setStockFilterOpen(false);
                                }}
                                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-[10px] font-black transition ${
                                  stockFilter === option.id ? "bg-[#F8E5D8] text-[#B05F57]" : "text-[#7E7066] hover:bg-white"
                                }`}
                                role="menuitem"
                              >
                                <span className={`grid h-5 w-5 place-items-center rounded-md bg-[#FFF8F0] ${option.color}`}>
                                  <OptionIcon className="h-3 w-3" />
                                </span>
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            <button
              type="button"
              onClick={openAddCatalog}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#141414] px-3.5 py-2 text-[11px] font-black text-white shadow-[0_8px_16px_rgba(20,20,20,0.16)]"
            >
              <Plus className="h-3.5 w-3.5" /> {copy.addFromCatalog}
            </button>
          </div>
        </div>
      </section>

      {enabledBrandCount === 0 ? (
        <InventoryEmptyState
          scope={catalogScope}
          enabledBrandCount={enabledBrandCount}
          selectedSeriesCount={selectedSeriesCount}
          copy={copy}
          onManage={goToCatalogSetup}
          onAdd={openAddCatalog}
        />
      ) : (
      <>
      <div
        className={`sticky top-2 z-20 space-y-3 rounded-[18px] border p-3 shadow-[0_8px_22px_rgba(92,52,35,0.07)] backdrop-blur ${
          isDark ? "border-white/[0.08] bg-black/60" : "border-[#EBDDD2] bg-[#FFFDF8]/94"
        }`}
      >
        <div className="space-y-2">
          <div className="flex min-w-0 items-center gap-3 border-b border-[#EBDDD2]">
          <div className="-mb-px flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {brands.map((brand) => {
              const seriesForBrand = lines.filter((l) => l.brand_id === brand.id).length;
              const active = activeBrand === brand.id;
              return (
                <button
                  key={brand.id}
                  onClick={() => {
                    setActiveBrand(brand.id);
                    const firstLine = lines.find((line) => line.brand_id === brand.id);
                    setActiveLine(firstLine ? firstLine.id : "");
                  }}
                  className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-[14px] font-black tracking-[-0.025em] transition ${
                    active
                      ? "border-[#D7897F] text-[#B05F57]"
                      : "border-transparent text-[#7E7066]/65 hover:border-[#EBDDD2] hover:text-[#141414]"
                  }`}
                >
                  <span className="max-w-[160px] truncate">{brand.name}</span>
                  {seriesForBrand > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${active ? "bg-[#F8E5D8] text-[#B05F57]" : "bg-[#F5F1EC] text-[#9A8B80]"}`}>{seriesForBrand}</span>}
                </button>
              );
            })}
          </div>
          <div className="flex shrink-0 items-center gap-2">
          {isStockView && hasDirtyEdits && (
            <button
              onClick={saveStockEdits}
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#D7897F] px-3 py-1.5 text-[11px] font-black text-white shadow-[0_8px_16px_rgba(215,137,127,0.22)] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {t.inventory.saveChanges} ({Object.keys(draftEdits).length})
            </button>
          )}
          <div className="flex shrink-0 items-center gap-1">
            {([
              { id: "shade-families", label: isHebrew ? "משפחות גוון" : "Shade families", icon: Palette },
              { id: "shade-wall", label: isHebrew ? "קיר גוונים" : "Shade wall", icon: Layers3 },
              { id: "stock-grid", label: copy.productsTab, icon: LayoutGrid },
              { id: "stock-table", label: copy.tableTab, icon: List },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                title={tab.label}
                aria-label={tab.label}
                className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                  viewMode === tab.id ? "bg-[#F3C3BC] text-[#B05F57]" : "text-[#7E7066]/45 hover:bg-white/60 hover:text-[#7E7066]"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
          <div className="relative shrink-0 w-[200px]">
            <Search className={`pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${textMuted}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.inventory.searchPlaceholder}
              aria-label={copy.scopedSearchHint}
              className={`w-full rounded-xl border py-2 pe-3 ps-9 text-[12px] font-semibold ${inputBg}`}
            />
          </div>
          </div>
          </div>
        </div>

        {isStockView && seriesCards.length > 0 && (
          <div className="-mx-0.5 flex gap-1.5 overflow-x-auto px-0.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {seriesCards.map(({ line }) => {
              const active = activeLine === line.id;
              return (
                <button
                  key={line.id}
                  onClick={() => setActiveLine(line.id)}
                  className={`inline-flex shrink-0 items-center rounded-lg border px-3.5 py-2.5 text-[11px] font-semibold transition ${
                    active
                      ? "border-[#D7897F]/35 bg-[#F8E5D8] text-[#B05F57]"
                      : "border-transparent bg-transparent text-[#7E7066] hover:border-[#EBDDD2] hover:bg-white"
                  }`}
                >
                  <span className="max-w-[160px] truncate">{line.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Views ── */}
      {viewMode === "stock-grid" && (
        <CatalogStockGrid
          rows={filteredCatalogRows}
          loading={catalogStockLoading}
          error={catalogStockError}
          isHebrew={isHebrew}
          copy={copy}
          onPatch={editCatalogStock}
          getStatus={(productId) => catalogStockAutosave.status(productId)}
          onRetry={(productId) => catalogStockAutosave.retry(productId)}
        />
      )}

      {/* Legacy manual-save table retained for internal compatibility, but not
          exposed in the normal pilot view toggle. The primary pilot inventory
          flow is the catalog-first autosave grid above. */}
      {viewMode === "stock-table" && (
        <StockTableView
          products={filteredProducts}
          draftEdits={draftEdits}
          getDraftValue={getDraftValue}
          setDraftField={setDraftField}
          isProductDirty={isProductDirty}
          isDark={isDark}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          inputBg={inputBg}
        />
      )}

      {viewMode === "shade-families" && (
        <ShadeFamilyView
          rows={filteredCatalogRows}
          isHebrew={isHebrew}
          copy={copy}
          onPatch={editCatalogStock}
          getStatus={(productId) => catalogStockAutosave.status(productId)}
          onRetry={(productId) => catalogStockAutosave.retry(productId)}
        />
      )}

      {viewMode === "shade-wall" && (
        <ShadeWallView
          rows={filteredCatalogRows}
          isHebrew={isHebrew}
          copy={copy}
          onPatch={editCatalogStock}
          getStatus={(productId) => catalogStockAutosave.status(productId)}
          onRetry={(productId) => catalogStockAutosave.retry(productId)}
        />
      )}

      {viewMode === "barcodes" && (
        <BarcodeView
          products={products}
          brands={brands}
          lines={lines}
          activeBrand={activeBrand}
          setActiveBrand={setActiveBrand}
          draftBarcodes={draftBarcodes}
          setDraftBarcodes={setDraftBarcodes}
          saveBarcode={saveBarcode}
          saving={saving}
          isDark={isDark}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          inputBg={inputBg}
          cardBg={cardBg}
          chipActive={chipActive}
          chipInactive={chipInactive}
        />
      )}

      {viewMode === "visibility" && (
        <VisibilityView
          products={products}
          brands={brands}
          lines={lines}
          activeBrand={activeBrand}
          setActiveBrand={setActiveBrand}
          toggleVisibility={toggleVisibility}
          saving={saving}
          isDark={isDark}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          cardBg={cardBg}
          chipActive={chipActive}
          chipInactive={chipInactive}
        />
      )}
      </>
      )}
      {addCatalogOpen && (
        <AddCatalogModal
          copy={copy}
          query={catalogQuery}
          setQuery={setCatalogQuery}
          results={catalogResults}
          searching={catalogSearching}
          error={catalogSearchError}
          selectedIds={selectedCatalogIds}
          selectedCount={selectedCatalogProducts.length}
          adding={addingCatalogProducts}
          onToggle={toggleCatalogSelection}
          onAddSelected={addSelectedCatalogProducts}
          onClose={closeAddCatalog}
        />
      )}
    </div>
  );
};

type InventoryCopy = {
  statEnabledBrands: string;
  statSelectedSeries: string;
  statInventoryProducts: string;
  scopeTitle: string;
  scopeSubtitle: string;
  allLinesEnabled: string;
  manageBrandsLines: string;
  noBrandsScope: string;
  emptyTitle: string;
  emptyBody: string;
  emptyHint: string;
  addFromCatalog: string;
  comingNext: string;
  catalogGridLoading: string;
  catalogGridEmpty: string;
  inStockBadge: string;
  addToStock: string;
  saveStock: string;
  notTracked: string;
  autosaveDirty: string;
  autosaveSaving: string;
  autosaveSaved: string;
  autosaveError: string;
  minStockShort: string;
  favoriteShort: string;
  visibleShort: string;
  addCatalogTitle: string;
  addCatalogSubtitle: string;
  catalogSearchPlaceholder: string;
  searchToStart: string;
  noCatalogResults: string;
  alreadyAdded: string;
  selectedCount: string;
  addSelected: string;
  addingSelected: string;
  addedSuccess: string;
  addFailed: string;
  cancel: string;
};

interface CatalogScopeEntry {
  brand: Brand;
  seriesNames: string[];
}

function CatalogScopeCard({ brand, seriesNames, allLinesLabel }: {
  brand: Brand;
  seriesNames: string[];
  allLinesLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-[#EBDDD2] bg-white/70 px-3 py-2.5 text-start">
      <div className="flex items-center gap-1.5">
        <Flame className="h-3.5 w-3.5 text-[#B05F57]" />
        <span className="truncate text-[13px] font-black text-[#141414]">{brand.name}</span>
      </div>
      <p className="mt-1 text-[11px] font-semibold leading-5 text-[#7E7066]">
        {seriesNames.length > 0 ? seriesNames.join(", ") : allLinesLabel}
      </p>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#EBDDD2] bg-white/70 px-3 py-1.5">
      <span className="text-[15px] font-black text-[#141414]">{value}</span>
      <span className="text-[10px] font-bold text-[#7E7066]">{label}</span>
    </div>
  );
}

function InventoryEmptyState({ scope, enabledBrandCount, selectedSeriesCount, copy, onManage, onAdd }: {
  scope: CatalogScopeEntry[];
  enabledBrandCount: number;
  selectedSeriesCount: number;
  copy: InventoryCopy;
  onManage: () => void;
  onAdd: () => void;
}) {
  return (
    <section className="rounded-[24px] border border-[#EBDDD2] bg-[#FFFDF8]/82 p-6 text-center shadow-[0_10px_26px_rgba(92,52,35,0.07)]">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#D9E8DB]">
        <Sparkles className="h-6 w-6 text-[#2F6C58]" />
      </div>
      <h2 className="mt-3 text-[18px] font-black text-[#141414]">{copy.emptyTitle}</h2>
      <p className="mx-auto mt-1 max-w-[480px] text-[12px] font-semibold leading-5 text-[#7E7066]">{copy.emptyBody}</p>
      <p className="mx-auto mt-1 max-w-[480px] text-[11px] font-bold leading-5 text-[#B05F57]">{copy.emptyHint}</p>

      <div className="mx-auto mt-4 flex max-w-[440px] flex-wrap justify-center gap-2">
        <StatusPill label={copy.statEnabledBrands} value={enabledBrandCount} />
        <StatusPill label={copy.statSelectedSeries} value={selectedSeriesCount} />
        <StatusPill label={copy.statInventoryProducts} value={0} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#D7897F] px-4 py-2 text-[12px] font-black text-white shadow-[0_10px_20px_rgba(215,137,127,0.22)]"
        >
          <Plus className="h-4 w-4" /> {copy.addFromCatalog}
        </button>
        <button
          type="button"
          onClick={onManage}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#96C7B3] px-4 py-2 text-[12px] font-black text-[#141414]"
        >
          <Settings2 className="h-4 w-4" /> {copy.manageBrandsLines}
        </button>
      </div>

      {scope.length > 0 && (
        <div className="mx-auto mt-5 grid max-w-[560px] gap-2 sm:grid-cols-2">
          {scope.map(({ brand, seriesNames }) => (
            <CatalogScopeCard key={brand.id} brand={brand} seriesNames={seriesNames} allLinesLabel={copy.allLinesEnabled} />
          ))}
        </div>
      )}
    </section>
  );
}

function AddCatalogModal({
  copy,
  query,
  setQuery,
  results,
  searching,
  error,
  selectedIds,
  selectedCount,
  adding,
  onToggle,
  onAddSelected,
  onClose,
}: {
  copy: InventoryCopy;
  query: string;
  setQuery: (value: string) => void;
  results: SalonCatalogSearchRow[];
  searching: boolean;
  error: string | null;
  selectedIds: Set<string>;
  selectedCount: number;
  adding: boolean;
  onToggle: (product: SalonCatalogSearchRow) => void;
  onAddSelected: () => void;
  onClose: () => void;
}) {
  const trimmedQuery = query.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 backdrop-blur-sm sm:items-center">
      <section className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-[28px] border border-[#EBDDD2] bg-[#FFFDF8] shadow-[0_30px_90px_rgba(20,20,20,0.25)]">
        <div className="flex items-start justify-between gap-3 border-b border-[#EBDDD2] p-4">
          <div>
            <p className="text-[18px] font-black tracking-[-0.04em] text-[#141414]">{copy.addCatalogTitle}</p>
            <p className="mt-1 text-[12px] font-semibold text-[#7E7066]">{copy.addCatalogSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={adding}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#FFF3E8] text-[#7E7066] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8B80]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
              placeholder={copy.catalogSearchPlaceholder}
              className="h-11 w-full rounded-2xl border border-[#EBDDD2] bg-white px-10 text-[13px] font-semibold text-[#141414] outline-none placeholder:text-[#9A8B80] focus:border-[#D7897F]"
            />
            {searching && <Loader2 className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#D7897F]" />}
          </div>

          <div className="min-h-[260px] overflow-y-auto rounded-2xl border border-[#EBDDD2] bg-[#FFF8F0]/62 p-2">
            {trimmedQuery.length < 2 ? (
              <div className="grid min-h-[240px] place-items-center text-center text-[12px] font-bold text-[#7E7066]">
                {copy.searchToStart}
              </div>
            ) : error ? (
              <div className="grid min-h-[240px] place-items-center px-4 text-center text-[12px] font-bold text-[#B05F57]">
                {error}
              </div>
            ) : !searching && results.length === 0 ? (
              <div className="grid min-h-[240px] place-items-center text-center text-[12px] font-bold text-[#7E7066]">
                {copy.noCatalogResults}
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((product) => {
                  const selected = selectedIds.has(product.id);
                  const packageSize = formatPackageSize(product);
                  return (
                    <button
                      type="button"
                      key={product.id}
                      disabled={product.in_inventory || adding}
                      onClick={() => onToggle(product)}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-start transition disabled:cursor-not-allowed ${
                        product.in_inventory
                          ? "border-[#EBDDD2] bg-white/45 opacity-65"
                          : selected
                            ? "border-[#96C7B3] bg-[#D9E8DB]/70"
                            : "border-[#EBDDD2] bg-white/80 hover:bg-white"
                      }`}
                    >
                      <span className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                        selected ? "border-[#2F6C58] bg-[#96C7B3] text-[#141414]" : "border-[#D8C8BC] bg-white"
                      }`}>
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[13px] font-black text-[#141414]">{product.canonical_name}</span>
                          {product.in_inventory && (
                            <span className="rounded-full bg-[#F3C3BC] px-2 py-0.5 text-[9px] font-black text-[#B05F57]">
                              {copy.alreadyAdded}
                            </span>
                          )}
                        </span>
                        <span className="mt-1 flex flex-wrap gap-2 text-[10px] font-bold text-[#7E7066]">
                          <span>{product.brand_name ?? "-"}</span>
                          {product.product_line_name && <span>{product.product_line_name}</span>}
                          {product.primary_product_type && <span>{product.primary_product_type}</span>}
                          {packageSize && <span>{packageSize}</span>}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#EBDDD2] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] font-bold text-[#7E7066]">
            {selectedCount} {copy.selectedCount}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={adding}
              className="rounded-2xl bg-[#FFF3E8] px-4 py-2 text-[12px] font-black text-[#7E7066] disabled:opacity-50"
            >
              {copy.cancel}
            </button>
            <button
              type="button"
              onClick={onAddSelected}
              disabled={selectedCount === 0 || adding}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#D7897F] px-4 py-2 text-[12px] font-black text-white shadow-[0_10px_20px_rgba(215,137,127,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {adding ? copy.addingSelected : copy.addSelected}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function CatalogStockGrid({
  rows,
  loading,
  error,
  isHebrew,
  copy,
  onPatch,
  getStatus,
  onRetry,
}: {
  rows: SalonCatalogStockRow[];
  loading: boolean;
  error: string | null;
  isHebrew: boolean;
  copy: InventoryCopy;
  onPatch: (row: SalonCatalogStockRow, patch: {
    unitsInStock?: number;
    minStock?: number;
    openProductAmount?: number;
    openProductUnit?: "g" | "oz";
    costAmount?: number;
    costCurrency?: string;
    sellPriceAmount?: number;
    sellPriceCurrency?: string;
    isFavorite?: boolean;
    isVisible?: boolean;
  }) => void;
  getStatus: (productId: string) => AutosaveStatus;
  onRetry: (productId: string) => void;
}) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [collapsedLevels, setCollapsedLevels] = useState<Set<string>>(() => new Set());
  const selectedRow = rows.find((row) => row.product_id === selectedProductId) ?? null;
  const groupedRows = useMemo(() => {
    const groups = new Map<string, SalonCatalogStockRow[]>();
    rows.forEach((row) => {
      const level = shadeLevelForRow(row);
      groups.set(level, [...(groups.get(level) ?? []), row]);
    });
    return Array.from(groups.entries())
      .sort(([a], [b]) => {
        if (a === "other") return 1;
        if (b === "other") return -1;
        return Number(a) - Number(b);
      })
      .map(([level, grouped]) => ({ level, rows: grouped }));
  }, [rows]);

  if (loading && rows.length === 0) {
    return (
      <div className="grid min-h-[240px] place-items-center rounded-[24px] border border-[#EBDDD2] bg-[#FFFDF8]/82 text-[13px] font-black text-[#7E7066]">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> {copy.catalogGridLoading}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[200px] place-items-center rounded-[24px] border border-[#EBDDD2] bg-[#FFFDF8]/82 px-6 text-center text-[12px] font-bold text-[#B05F57]">
        {error}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="grid min-h-[200px] place-items-center rounded-[24px] border border-[#EBDDD2] bg-[#FFFDF8]/82 px-6 text-center text-[12px] font-bold text-[#7E7066]">
        <span className="inline-flex flex-col items-center gap-2">
          <Package className="h-8 w-8 opacity-40" />
          {copy.catalogGridEmpty}
        </span>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-5">
      {groupedRows.map(({ level, rows: levelRows }) => {
        const isCollapsed = collapsedLevels.has(level);
        const groupLabel = level === "other"
          ? (isHebrew ? "מוצרים נוספים" : "Other products")
          : (isHebrew ? `דרגת גוון ${level}` : `Level ${level}`);
        return (
          <section key={level}>
            <button
              type="button"
              onClick={() => setCollapsedLevels((current) => {
                const next = new Set(current);
                if (next.has(level)) next.delete(level);
                else next.add(level);
                return next;
              })}
              className="flex w-full items-center gap-3 border-b border-[#EBDDD2] py-2.5 text-start"
              aria-expanded={!isCollapsed}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#F8E5D8] text-[#B05F57]">
                <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
              </span>
              <span className="text-[14px] font-black tracking-[-0.025em] text-[#141414]">{groupLabel}</span>
              <span className="rounded-full bg-[#F5F1EC] px-2 py-0.5 text-[9px] font-black text-[#7E7066]">{levelRows.length} {isHebrew ? "גוונים" : "shades"}</span>
              <span className="ms-auto text-[10px] font-bold text-[#9A8B80]">{isCollapsed ? (isHebrew ? "פתיחה" : "Expand") : (isHebrew ? "סגירה" : "Collapse")}</span>
            </button>
            {!isCollapsed && (
            <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(155px,1fr))] items-start gap-x-4 gap-y-6">
      {levelRows.map((row) => {
        const kind = catalogProductKind(row);
        const meta = productVisualMeta(kind, isHebrew);
        const ProductIcon = meta.icon;
        const units = Number(row.units_in_stock) || 0;
        const min = Number(row.min_stock) || 0;
        const openAmount = Number(row.open_product_amount) || 0;
        const openUnit = row.open_product_unit ?? "g";
        const isLow = row.in_inventory && units <= min;
        const status = getStatus(row.product_id);
        const dirty = status === "dirty" || status === "error";
        const productImage = majirelImageForRow(row) ?? row.image_url;
        const shadeCode = shadeCodeForRow(row) ?? row.canonical_name;
        const shadeDescription = shadeDescriptionForRow(row, shadeCode);
        const shadeFamilySoft = SHADE_FAMILY_SOFT[shadeFamilyForRow(row)];

        return (
          <article
            key={row.product_id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedProductId(row.product_id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedProductId(row.product_id);
              }
            }}
            className={`group relative flex min-w-0 cursor-pointer flex-col overflow-visible rounded-[15px] outline-none transition ${
              dirty
                ? "opacity-80"
                : "hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#D7897F]/40"
            }`}
          >
            <span
              className={`absolute end-2.5 top-2.5 z-10 h-3 w-3 rounded-full ring-[3px] ring-white shadow-[0_2px_5px_rgba(20,20,20,0.16)] ${getStockBadgeColor(units, min)}`}
              title={row.in_inventory ? `${units} ${copy.inStockBadge}` : copy.notTracked}
            />

            <div className="flex items-stretch gap-2 rounded-[15px] border border-white/65 p-2.5 shadow-[0_4px_12px_rgba(92,52,35,0.045)] transition group-hover:border-[#D7897F]/45 group-hover:shadow-[0_8px_18px_rgba(92,52,35,0.08)]" style={{ background: shadeFamilySoft }}>
              <div className="relative grid h-[78px] w-[78px] shrink-0 place-items-center overflow-hidden rounded-[13px] border border-white/75 bg-white/70">
                {!productImage && (
                  <div className="grid h-16 w-9 place-items-center rounded-[10px] border border-white/80 bg-white shadow-[0_8px_16px_rgba(92,52,35,0.10)]">
                    <ProductIcon className="h-6 w-6" style={{ color: meta.color }} />
                  </div>
                )}
                {productImage && (
                  <img
                    src={productImage}
                    alt=""
                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                    className="absolute inset-0 h-full w-full object-contain p-1 drop-shadow-[0_8px_7px_rgba(74,48,35,0.20)]"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <div className="rounded-lg border border-white/70 bg-white/65 px-2 py-1.5">
                  <Package className="h-3 w-3 text-[#9A8B80]" />
                  <p className="mt-0.5 text-[14px] font-black leading-none text-[#141414]">{units}<span className="ms-1 text-[8px] font-bold text-[#7E7066]">{isHebrew ? "יח׳" : "units"}</span></p>
                </div>
                <div className="rounded-lg border border-white/70 bg-white/65 px-2 py-1.5">
                  <Droplet className="h-3 w-3 text-[#9A8B80]" />
                  <p className="mt-0.5 text-[14px] font-black leading-none text-[#141414]">{openAmount}<span className="ms-1 text-[8px] font-bold text-[#7E7066]">{openUnit}</span></p>
                </div>
              </div>
            </div>

            <div className="mt-3 px-1.5">
              <h3 className="text-[19px] font-black leading-none tracking-[-0.04em] text-[#141414]">
                {shadeCode}
              </h3>
              {shadeDescription && <p className="mt-1 line-clamp-1 text-[10px] font-semibold leading-snug text-[#6F6259]">{shadeDescription}</p>}
            </div>

          </article>
        );
      })}
            </div>
            )}
          </section>
        );
      })}
    </div>
    {selectedRow && (
      <InventoryDetailPanel
        row={selectedRow}
        isHebrew={isHebrew}
        copy={copy}
        status={getStatus(selectedRow.product_id)}
        onPatch={onPatch}
        onRetry={onRetry}
        onClose={() => setSelectedProductId(null)}
      />
    )}
    </>
  );
}

type ShadeFamilyId = "natural" | "cool" | "warm" | "vibrant" | "other";

const SHADE_FAMILY_SOFT: Record<ShadeFamilyId, string> = {
  natural: "#F2E8DE",
  cool: "#E8F0F2",
  warm: "#F8E8DF",
  vibrant: "#F8E4E9",
  other: "#F2F0ED",
};

function shadeFamilyForRow(row: SalonCatalogStockRow): ShadeFamilyId {
  const shadeCode = shadeCodeForRow(row);
  const description = (shadeDescriptionForRow(row, shadeCode) ?? "").toLowerCase();
  if (description.includes("natural")) return "natural";
  if (/(ash|blue|violet|pearl|iridescent|matte|cool)/.test(description)) return "cool";
  if (/(red|copper|mahogany|gold|warm|mocha)/.test(description)) return "warm";
  if (/(pink|orange|green|intensifier|mix)/.test(description)) return "vibrant";
  return "other";
}

function ShadeFamilyView({
  rows,
  isHebrew,
  copy,
  onPatch,
  getStatus,
  onRetry,
}: {
  rows: SalonCatalogStockRow[];
  isHebrew: boolean;
  copy: InventoryCopy;
  onPatch: (row: SalonCatalogStockRow, patch: {
    unitsInStock?: number;
    minStock?: number;
    openProductAmount?: number;
    openProductUnit?: "g" | "oz";
    costAmount?: number;
    costCurrency?: string;
    sellPriceAmount?: number;
    sellPriceCurrency?: string;
    isFavorite?: boolean;
    isVisible?: boolean;
  }) => void;
  getStatus: (productId: string) => AutosaveStatus;
  onRetry: (productId: string) => void;
}) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const selectedRow = rows.find((row) => row.product_id === selectedProductId) ?? null;
  const familyStyles: Record<ShadeFamilyId, { label: string; accent: string; soft: string }> = {
    natural: { label: isHebrew ? "טבעיים" : "Natural", accent: "#92765B", soft: "#F2E8DE" },
    cool: { label: isHebrew ? "קרים" : "Cool", accent: "#7795A6", soft: "#E8F0F2" },
    warm: { label: isHebrew ? "חמים" : "Warm", accent: "#B56B50", soft: "#F8E8DF" },
    vibrant: { label: isHebrew ? "נועזים" : "Vibrant", accent: "#B85768", soft: "#F8E4E9" },
    other: { label: isHebrew ? "נוספים" : "Other shades", accent: "#8F8A83", soft: "#F2F0ED" },
  };
  const groups = useMemo(() => {
    const grouped = new Map<ShadeFamilyId, SalonCatalogStockRow[]>();
    rows.forEach((row) => {
      const family = shadeFamilyForRow(row);
      grouped.set(family, [...(grouped.get(family) ?? []), row]);
    });
    return (Object.keys(familyStyles) as ShadeFamilyId[])
      .map((family) => ({ family, rows: grouped.get(family) ?? [] }))
      .filter((group) => group.rows.length > 0);
  }, [rows]);

  return (
    <>
      <div className="space-y-5">
        {groups.map(({ family, rows: familyRows }) => {
          const style = familyStyles[family];
          const sample = familyRows[0];
          const sampleImage = majirelImageForRow(sample) ?? sample.image_url;
          const SampleIcon = productVisualMeta(catalogProductKind(sample), isHebrew).icon;
          return (
            <section key={family} className="rounded-[20px] border border-[#EBDDD2] bg-[#FFFDFC]/88 p-3">
              <header className="flex items-center gap-3 border-b border-[#EBDDD2] pb-3">
                <div className="relative grid h-14 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
                  {sampleImage ? (
                    <img src={sampleImage} alt="" className="h-12 w-10 object-contain drop-shadow-[0_6px_6px_rgba(74,48,35,0.18)]" />
                  ) : (
                    <SampleIcon className="h-5 w-5" style={{ color: style.accent }} />
                  )}
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: style.accent }}>{isHebrew ? "משפחת גוון" : "Shade family"}</p>
                  <h3 className="mt-0.5 text-[17px] font-black tracking-[-0.03em] text-[#141414]">{style.label}</h3>
                </div>
                <span className="ms-auto rounded-full px-2.5 py-1 text-[10px] font-black" style={{ background: style.soft, color: style.accent }}>
                  {familyRows.length} {isHebrew ? "גוונים" : "shades"}
                </span>
              </header>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                {familyRows.map((row) => {
                  const shadeCode = shadeCodeForRow(row) ?? row.canonical_name;
                  const shadeDescription = shadeDescriptionForRow(row, shadeCode);
                  const image = majirelImageForRow(row) ?? row.image_url;
                  const Icon = productVisualMeta(catalogProductKind(row), isHebrew).icon;
                  const units = Number(row.units_in_stock) || 0;
                  const min = Number(row.min_stock) || 0;
                  return (
                    <button
                      key={row.product_id}
                      type="button"
                      onClick={() => setSelectedProductId(row.product_id)}
                      className="group rounded-xl border border-transparent bg-white p-2 text-center transition hover:-translate-y-0.5 hover:border-[#D7897F]/45 hover:shadow-[0_8px_16px_rgba(92,52,35,0.08)]"
                    >
                      <span className="relative mx-auto grid h-14 place-items-center overflow-hidden rounded-lg" style={{ background: style.soft }}>
                        {image ? <img src={image} alt="" className="h-12 w-10 object-contain drop-shadow-[0_5px_5px_rgba(74,48,35,0.18)]" /> : <Icon className="h-4 w-4" style={{ color: style.accent }} />}
                        <span
                          className={`absolute end-1 top-1 grid h-5 min-w-[20px] place-items-center rounded-full px-1 text-[9px] font-black text-white shadow-[0_3px_7px_rgba(20,20,20,0.16)] ${getStockBadgeColor(units, min)}`}
                          title={`${units} ${copy.inStockBadge}`}
                        >
                          {units}
                        </span>
                      </span>
                      <span className="mt-1 block text-[11px] font-black text-[#141414]">{shadeCode}</span>
                      {shadeDescription && <span className="mt-0.5 block truncate text-[8px] font-semibold text-[#7E7066]">{shadeDescription}</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      {selectedRow && (
        <InventoryDetailPanel
          row={selectedRow}
          isHebrew={isHebrew}
          copy={copy}
          status={getStatus(selectedRow.product_id)}
          onPatch={onPatch}
          onRetry={onRetry}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </>
  );
}

const SHADE_WALL_TONE_COLORS: Record<string, string> = {
  "0": "#B58B69",
  "1": "#7898A9",
  "2": "#A38FB7",
  "3": "#D3A64C",
  "4": "#C9794E",
  "5": "#A85F69",
  "6": "#BF5054",
  "7": "#709B7B",
  "8": "#8B6E61",
  "9": "#C3A6BF",
};

function shadeWallColorForRow(row: SalonCatalogStockRow): string {
  const shadeCode = shadeCodeForRow(row)?.replace(",", ".") ?? "";
  const primaryTone = shadeCode.match(/^[0-9]{1,2}[.-]([0-9])/)?.[1];
  if (primaryTone && SHADE_WALL_TONE_COLORS[primaryTone]) return SHADE_WALL_TONE_COLORS[primaryTone];

  const level = Number(shadeLevelForRow(row));
  if (!Number.isFinite(level)) return "#9E9992";
  if (level <= 3) return "#60463C";
  if (level <= 5) return "#89624B";
  if (level <= 7) return "#B98D65";
  if (level <= 9) return "#D4B17E";
  return "#E2D0AC";
}

function shadeWallStackCount(units: number, minStock: number): number {
  if (units <= 0) return 1;
  if (minStock <= 0) return Math.min(3, Math.max(1, Math.ceil(units / 2)));
  if (units <= minStock) return 1;
  if (units <= minStock * 2) return 2;
  return 3;
}

function ShadeWallView({
  rows,
  isHebrew,
  copy,
  onPatch,
  getStatus,
  onRetry,
}: {
  rows: SalonCatalogStockRow[];
  isHebrew: boolean;
  copy: InventoryCopy;
  onPatch: (row: SalonCatalogStockRow, patch: {
    unitsInStock?: number;
    minStock?: number;
    openProductAmount?: number;
    openProductUnit?: "g" | "oz";
    costAmount?: number;
    costCurrency?: string;
    sellPriceAmount?: number;
    sellPriceCurrency?: string;
    isFavorite?: boolean;
    isVisible?: boolean;
  }) => void;
  getStatus: (productId: string) => AutosaveStatus;
  onRetry: (productId: string) => void;
}) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const selectedRow = rows.find((row) => row.product_id === selectedProductId) ?? null;
  const levels = useMemo(() => {
    const grouped = new Map<string, SalonCatalogStockRow[]>();
    rows.forEach((row) => {
      const level = shadeLevelForRow(row);
      grouped.set(level, [...(grouped.get(level) ?? []), row]);
    });
    return Array.from(grouped.entries())
      .sort(([a], [b]) => {
        if (a === "other") return 1;
        if (b === "other") return -1;
        return Number(b) - Number(a);
      })
      .map(([level, levelRows]) => ({
        level,
        rows: levelRows.sort((a, b) => (shadeCodeForRow(a) ?? "").localeCompare(shadeCodeForRow(b) ?? "", undefined, { numeric: true })),
      }));
  }, [rows]);

  return (
    <>
      <div className="rounded-[24px] border border-white/60 bg-white/30 px-3 py-4 shadow-[0_10px_30px_rgba(92,52,35,0.045)] sm:px-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B56B50]">{isHebrew ? "מפת צבעים חיה" : "Live colour map"}</p>
            <h2 className="mt-0.5 text-[18px] font-black tracking-[-0.035em] text-[#141414]">{isHebrew ? "קיר הגוונים שלך" : "Your shade wall"}</h2>
          </div>
          <p className="text-[10px] font-semibold text-[#7E7066]">{isHebrew ? "העיגול מציג יחידות · הצבע מציג מצב מלאי" : "Circle = units · colour = stock status"}</p>
        </div>

        <div className="space-y-5">
          {levels.map(({ level, rows: levelRows }) => {
            const totalUnits = levelRows.reduce((total, row) => total + (Number(row.units_in_stock) || 0), 0);
            const label = level === "other"
              ? (isHebrew ? "נוספים" : "Other formulas")
              : (isHebrew ? `דרגה ${level}` : `Level ${level}`);
            return (
              <section key={level} className="border-t border-[#E8DDD4]/85 pt-3 first:border-t-0 first:pt-0">
                <header className="mb-3 flex items-center gap-2">
                  <span className="rounded-lg bg-[#F6E2D6] px-2 py-1 text-[10px] font-black text-[#A85E52]">{label}</span>
                  <span className="text-[10px] font-semibold text-[#85766B]">{levelRows.length} {isHebrew ? "גוונים" : "shades"}</span>
                  <span className="ms-auto rounded-full bg-white/65 px-2 py-1 text-[9px] font-black text-[#6E6259]">{totalUnits} {isHebrew ? "יח׳ במלאי" : "units in stock"}</span>
                </header>

                <div className="flex flex-wrap items-end gap-x-2 gap-y-4">
                  {levelRows.map((row) => {
                    const shadeCode = shadeCodeForRow(row) ?? row.canonical_name;
                    const shadeDescription = shadeDescriptionForRow(row, shadeCode);
                    const units = Number(row.units_in_stock) || 0;
                    const min = Number(row.min_stock) || 0;
                    const shadeColor = shadeWallColorForRow(row);
                    const stackCount = shadeWallStackCount(units, min);
                    return (
                      <button
                        key={row.product_id}
                        type="button"
                        onClick={() => setSelectedProductId(row.product_id)}
                        className="group relative flex w-[64px] flex-col items-stretch text-center outline-none transition hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[#D7897F]/50"
                        title={`${shadeCode} · ${units} ${copy.inStockBadge}`}
                      >
                        <span className="relative flex h-[68px] flex-col-reverse gap-[2px] overflow-visible rounded-[9px] border border-white/70 bg-white/35 p-1 shadow-[0_5px_10px_rgba(92,52,35,0.08)]">
                          {Array.from({ length: stackCount }).map((_, index) => (
                            <span
                              key={index}
                              className={`min-h-0 flex-1 rounded-[4px] border border-white/25 transition group-hover:brightness-105 ${units <= 0 ? "border-dashed opacity-35" : ""}`}
                              style={{ background: shadeColor, opacity: units <= 0 ? undefined : 0.74 + index * 0.11 }}
                            />
                          ))}
                          <span className={`absolute -end-2 -top-2 grid h-6 min-w-[24px] place-items-center rounded-full px-1 text-[10px] font-black text-white ring-[3px] ring-[#FFF9F4] shadow-[0_3px_8px_rgba(40,28,20,0.18)] ${getStockBadgeColor(units, min)}`}>
                            {units}
                          </span>
                        </span>
                        <span className="mt-1.5 truncate text-[11px] font-black tracking-[-0.03em] text-[#201B18]">{shadeCode}</span>
                        <span className="mt-0.5 truncate text-[8px] font-semibold text-[#7E7066]">{shadeDescription ?? (isHebrew ? "גוון מקצועי" : "Professional shade")}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {selectedRow && (
        <InventoryDetailPanel
          row={selectedRow}
          isHebrew={isHebrew}
          copy={copy}
          status={getStatus(selectedRow.product_id)}
          onPatch={onPatch}
          onRetry={onRetry}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </>
  );
}

function InventoryDetailPanel({
  row,
  isHebrew,
  copy,
  status,
  onPatch,
  onRetry,
  onClose,
}: {
  row: SalonCatalogStockRow;
  isHebrew: boolean;
  copy: InventoryCopy;
  status: AutosaveStatus;
  onPatch: (row: SalonCatalogStockRow, patch: {
    unitsInStock?: number;
    minStock?: number;
    openProductAmount?: number;
    openProductUnit?: "g" | "oz";
    costAmount?: number;
    costCurrency?: string;
    sellPriceAmount?: number;
    sellPriceCurrency?: string;
    isFavorite?: boolean;
    isVisible?: boolean;
  }) => void;
  onRetry: (productId: string) => void;
  onClose: () => void;
}) {
  const kind = catalogProductKind(row);
  const meta = productVisualMeta(kind, isHebrew);
  const MetaIcon = meta.icon;
  const units = Number(row.units_in_stock) || 0;
  const min = Number(row.min_stock) || 0;
  const openAmount = Number(row.open_product_amount) || 0;
  const openUnit = row.open_product_unit ?? "g";
  const cost = Number(row.cost_amount) || 0;
  const sellPrice = Number(row.sell_price_amount) || 0;
  const currency = row.sell_price_currency || row.cost_currency || "USD";
  const margin = sellPrice > 0 ? ((sellPrice - cost) / sellPrice) * 100 : null;
  const saving = status === "saving";
  const isLow = row.in_inventory && units <= min;
  const packageSize = formatPackageSize(row);
  const productImage = majirelImageForRow(row) ?? row.image_url;
  const shadeCode = shadeCodeForRow(row) ?? row.canonical_name;
  const shadeDescription = shadeDescriptionForRow(row, shadeCode);
  const statusLabel = status === "dirty"
    ? copy.autosaveDirty
    : status === "saving"
      ? copy.autosaveSaving
      : status === "saved"
        ? copy.autosaveSaved
        : status === "error"
          ? copy.autosaveError
          : "";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#141414]/35 backdrop-blur-[2px]" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-[460px] flex-col bg-[#FFFDF8] shadow-[-18px_0_50px_rgba(20,20,20,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-[#EBDDD2] px-6 py-4">
          <button type="button" onClick={onClose} className="text-[11px] font-black text-[#7E7066] hover:text-[#141414]">
            {isHebrew ? "חזרה למלאי" : "Back to inventory"}
          </button>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#FFF3E8] text-[#7E7066]">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-4">
            <div className="relative grid h-24 w-20 shrink-0 place-items-center overflow-hidden rounded-[22px]" style={{ background: `${meta.color}55` }}>
              {!productImage && <MetaIcon className="h-9 w-9" style={{ color: meta.color }} />}
              {productImage && <img src={productImage} alt="" className="absolute h-20 w-16 object-contain drop-shadow-[0_10px_8px_rgba(74,48,35,0.22)]" />}
            </div>
            <div className="min-w-0 pt-1">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-[#B05F57]">
                {[row.brand_name, row.product_line_name].filter(Boolean).join(" · ")}
              </p>
              <h2 className="mt-1 text-[28px] font-black leading-none tracking-[-0.05em] text-[#141414]">{shadeCode}</h2>
              {shadeDescription && <p className="mt-2 text-[12px] font-semibold leading-snug text-[#7E7066]">{shadeDescription}</p>}
              {packageSize && <p className="mt-2 text-[10px] font-bold text-[#9A8B80]">{packageSize}</p>}
            </div>
          </div>

          <section className="mt-7 rounded-[22px] border border-[#EBDDD2] bg-[#FFF8F0]/72 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7E7066]">{isHebrew ? "מצב מלאי" : "Stock overview"}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-3 shadow-[0_5px_12px_rgba(92,52,35,0.05)]">
                <p className="text-[10px] font-bold text-[#7E7066]">{isHebrew ? "זמין עכשיו" : "Available now"}</p>
                <p className="mt-1 text-[28px] font-black tracking-[-0.05em] text-[#141414]">{units}</p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-[0_5px_12px_rgba(92,52,35,0.05)]">
                <p className="text-[10px] font-bold text-[#7E7066]">{isHebrew ? "מינימום" : "Minimum"}</p>
                <p className="mt-1 text-[28px] font-black tracking-[-0.05em] text-[#141414]">{min}</p>
              </div>
            </div>
            <div className={`mt-3 rounded-xl px-3 py-2 text-[11px] font-black ${
              isLow ? "bg-[#FBE2DE] text-[#B05F57]" : "bg-[#D9E8DB] text-[#2F6C58]"
            }`}>
              {isLow ? (isHebrew ? "נדרשת השלמת מלאי" : "Restock recommended") : (isHebrew ? "רמת מלאי תקינה" : "Stock level is healthy")}
            </div>
          </section>

          <section className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#7E7066]">{isHebrew ? "מוצר פתוח" : "Open product"}</p>
              <div className="flex rounded-lg border border-[#EBDDD2] bg-white p-0.5">
                {(["g", "oz"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => {
                      if (unit === openUnit) return;
                      const converted = unit === "oz" ? openAmount / 28.3495 : openAmount * 28.3495;
                      onPatch(row, { openProductAmount: Number(converted.toFixed(1)), openProductUnit: unit });
                    }}
                    className={`rounded-md px-2 py-1 text-[9px] font-black ${openUnit === unit ? "bg-[#F3C3BC] text-[#B05F57]" : "text-[#7E7066]"}`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-[20px] border border-[#EBDDD2] bg-white p-3">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={openAmount}
                  onChange={(event) => onPatch(row, { openProductAmount: Math.max(0, parseFloat(event.target.value) || 0) })}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-[#EBDDD2] bg-[#FFFDF8] px-3 text-[17px] font-black text-[#141414] outline-none focus:border-[#D7897F]"
                />
                <span className="text-[12px] font-black text-[#7E7066]">{openUnit}</span>
              </div>
              {packageSize && <p className="mt-2 text-[10px] font-bold text-[#9A8B80]">{isHebrew ? `מתוך ${packageSize} באריזה` : `of ${packageSize} per product`}</p>}
            </div>
          </section>

          <section className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#7E7066]">{isHebrew ? "עדכון מלאי" : "Update stock"}</p>
              <Pencil className="h-3.5 w-3.5 text-[#B05F57]" />
            </div>
            <div className="mt-3 rounded-[20px] border border-[#EBDDD2] bg-white p-3">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onPatch(row, { unitsInStock: Math.max(0, units - 1) })} disabled={saving || units <= 0} className="grid h-11 w-11 place-items-center rounded-xl bg-[#FFF3E8] text-[19px] font-black text-[#7E7066] disabled:opacity-40">–</button>
                <input type="number" min={0} value={units} onChange={(event) => onPatch(row, { unitsInStock: Math.max(0, parseInt(event.target.value, 10) || 0) })} className="h-11 min-w-0 flex-1 rounded-xl border border-[#EBDDD2] bg-[#FFFDF8] text-center text-[18px] font-black text-[#141414] outline-none focus:border-[#D7897F]" />
                <button type="button" onClick={() => onPatch(row, { unitsInStock: units + 1 })} disabled={saving} className="grid h-11 w-11 place-items-center rounded-xl bg-[#D7897F] text-white disabled:opacity-40"><Plus className="h-4 w-4" /></button>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#F1E6DE] pt-3">
                <span className="text-[11px] font-black text-[#7E7066]">{isHebrew ? "מלאי מינימום" : "Minimum stock"}</span>
                <input type="number" min={0} value={min} onChange={(event) => onPatch(row, { minStock: Math.max(0, parseInt(event.target.value, 10) || 0) })} className="h-9 w-20 rounded-lg border border-[#EBDDD2] bg-[#FFFDF8] text-center text-[13px] font-black text-[#141414] outline-none focus:border-[#D7897F]" />
              </div>
            </div>
          </section>

          <section className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#7E7066]">{isHebrew ? "עלות ומרווח" : "Cost & margin"}</p>
              <span className={`text-[13px] font-black ${margin !== null && margin < 0 ? "text-[#B05F57]" : "text-[#2F6C58]"}`}>
                {margin === null ? "—" : `${margin.toFixed(1)}%`}
              </span>
            </div>
            <div className="mt-3 space-y-2 rounded-[20px] border border-[#EBDDD2] bg-white p-3">
              <label className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-black text-[#7E7066]">{isHebrew ? "עלות" : "Cost"}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#9A8B80]">{currency}</span>
                  <input type="number" min={0} step={0.01} value={cost} onChange={(event) => onPatch(row, { costAmount: Math.max(0, parseFloat(event.target.value) || 0), costCurrency: currency })} className="h-9 w-24 rounded-lg border border-[#EBDDD2] bg-[#FFFDF8] px-2 text-end text-[13px] font-black text-[#141414] outline-none focus:border-[#D7897F]" />
                </span>
              </label>
              <label className="flex items-center justify-between gap-3 border-t border-[#F1E6DE] pt-2">
                <span className="text-[11px] font-black text-[#7E7066]">{isHebrew ? "מחיר מכירה" : "Sell price"}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#9A8B80]">{currency}</span>
                  <input type="number" min={0} step={0.01} value={sellPrice} onChange={(event) => onPatch(row, { sellPriceAmount: Math.max(0, parseFloat(event.target.value) || 0), sellPriceCurrency: currency })} className="h-9 w-24 rounded-lg border border-[#EBDDD2] bg-[#FFFDF8] px-2 text-end text-[13px] font-black text-[#141414] outline-none focus:border-[#D7897F]" />
                </span>
              </label>
              <p className="pt-1 text-[9px] font-bold text-[#9A8B80]">{isHebrew ? "המרווח מחושב אוטומטית מהעלות וממחיר המכירה." : "Margin is calculated automatically from cost and sell price."}</p>
            </div>
          </section>

          <section className="mt-5 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onPatch(row, { isFavorite: !row.is_favorite })} disabled={saving} className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-[11px] font-black ${row.is_favorite ? "border-[#F9B95C] bg-[#FFF0CD] text-[#7B571D]" : "border-[#EBDDD2] bg-white text-[#7E7066]"}`}><Sparkles className="h-3.5 w-3.5" /> {copy.favoriteShort}</button>
            <button type="button" onClick={() => onPatch(row, { isVisible: !row.is_visible })} disabled={saving} className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-[11px] font-black ${row.is_visible ? "border-[#96C7B3] bg-[#D9E8DB] text-[#2F6C58]" : "border-[#EBDDD2] bg-white text-[#7E7066]"}`}>{row.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{copy.visibleShort}</button>
          </section>
        </div>

        <footer className="border-t border-[#EBDDD2] bg-white/80 px-6 py-4">
          {statusLabel ? (
            <button type="button" onClick={() => status === "error" && onRetry(row.product_id)} className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-black ${status === "error" ? "bg-[#FBE2DE] text-[#B05F57]" : status === "saved" ? "bg-[#D9E8DB] text-[#2F6C58]" : "bg-[#FFF3E8] text-[#7E7066]"}`}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : status === "saved" ? <Check className="h-3.5 w-3.5" /> : null}{statusLabel}
            </button>
          ) : <p className="text-center text-[10px] font-bold text-[#9A8B80]">{isHebrew ? "השינויים נשמרים אוטומטית" : "Changes save automatically"}</p>}
        </footer>
      </aside>
    </div>
  );
}

// ── Stock Table View ──────────────────────────────────────────────

interface StockTableViewProps {
  products: InventoryProduct[];
  draftEdits: DraftEdits;
  getDraftValue: (p: InventoryProduct, f: keyof DraftEdits[string]) => number;
  setDraftField: (id: string, field: string, value: number) => void;
  isProductDirty: (id: string) => boolean;
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
  inputBg: string;
}

const StockTableView: React.FC<StockTableViewProps> = ({
  products,
  getDraftValue,
  setDraftField,
  isProductDirty,
  isDark,
  textPrimary,
  textSecondary,
  inputBg,
}) => {
  const t = useCrmT();

  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${textSecondary}`}>
        <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">{t.inventory.noProductsFilter}</p>
      </div>
    );
  }

  const colHeader = `text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-white/55" : "text-[#7E7066]"}`;
  const cellInput = `w-full text-xs text-center rounded border px-2 py-1.5 ${inputBg} focus:outline-none focus:ring-1 ${
    isDark ? "focus:ring-white/20" : "focus:ring-black/20"
  }`;

  return (
    <div className={`rounded-2xl border overflow-x-auto ${isDark ? "border-white/[0.08]" : "border-[#EBDDD2] bg-[#FFFDF8]"}`}>
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className={isDark ? "bg-white/[0.04]" : "bg-[#F8E5D8]/70"}>
            <th className={`px-3 py-2.5 text-start ${colHeader}`}>{t.inventory.shade}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.inventory.unitsInStock}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.inventory.minStock}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.inventory.costUsd}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.inventory.sellPriceUsd}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.inventory.marginPct}</th>
            <th className={`px-3 py-2.5 w-8 ${colHeader}`}></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const dirty = isProductDirty(p.id);
            const qty = getDraftValue(p, "units_in_stock");
            const isLow = qty <= p.min_stock;

            return (
              <tr
                key={p.id}
                className={`border-t transition-colors ${
                  isDark ? "border-white/[0.04]" : "border-[#EBDDD2]"
                } ${dirty ? (isDark ? "bg-amber-900/10" : "bg-amber-50/60") : ""} ${
                  isLow ? (isDark ? "bg-red-900/10" : "bg-red-50/40") : ""
                }`}
              >
                <td className={`px-3 py-2 ${textPrimary}`}>
                  <div className="flex items-center gap-2">
                    {isLow && <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                    <div>
                      <div className="text-xs font-medium">{p.shade_code}</div>
                      {p.display_name && (
                        <div className={`text-[10px] ${textSecondary}`}>{p.display_name}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={getDraftValue(p, "units_in_stock")}
                    onChange={(e) =>
                      setDraftField(p.id, "units_in_stock", Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className={cellInput}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={getDraftValue(p, "min_stock")}
                    onChange={(e) =>
                      setDraftField(p.id, "min_stock", Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className={cellInput}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={getDraftValue(p, "cost_usd")}
                    onChange={(e) =>
                      setDraftField(p.id, "cost_usd", Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className={cellInput}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={getDraftValue(p, "selling_price_usd")}
                    onChange={(e) =>
                      setDraftField(
                        p.id,
                        "selling_price_usd",
                        Math.max(0, parseFloat(e.target.value) || 0),
                      )
                    }
                    className={cellInput}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step={0.1}
                    value={getDraftValue(p, "margin_pct")}
                    onChange={(e) =>
                      setDraftField(p.id, "margin_pct", parseFloat(e.target.value) || 0)
                    }
                    className={cellInput}
                  />
                </td>
                <td className="px-3 py-2">
                  {dirty && (
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400" title={t.inventory.unsaved} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── Barcode View ──────────────────────────────────────────────────

interface BarcodeViewProps {
  products: InventoryProduct[];
  brands: Brand[];
  lines: ProductLine[];
  activeBrand: string;
  setActiveBrand: (id: string) => void;
  draftBarcodes: DraftBarcodes;
  setDraftBarcodes: React.Dispatch<React.SetStateAction<DraftBarcodes>>;
  saveBarcode: (id: string) => Promise<void>;
  saving: boolean;
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  inputBg: string;
  cardBg: string;
  chipActive: string;
  chipInactive: string;
}

const BarcodeView: React.FC<BarcodeViewProps> = ({
  products,
  brands,
  activeBrand,
  setActiveBrand,
  draftBarcodes,
  setDraftBarcodes,
  saveBarcode,
  saving,
  isDark,
  textPrimary,
  textSecondary,
  textMuted,
  inputBg,
  cardBg,
  chipActive,
  chipInactive,
}) => {
  const t = useCrmT();
  const [scanMode, setScanMode] = useState(false);
  const [scanTarget, setScanTarget] = useState<string | null>(null);
  const scanBuffer = useRef("");
  const scanTimer = useRef<ReturnType<typeof setTimeout>>();

  const filtered = useMemo(
    () => products.filter((p) => !activeBrand || p.brand_id === activeBrand),
    [products, activeBrand],
  );

  // Scanner keyboard-wedge handler: fast burst of chars + Enter
  useEffect(() => {
    if (!scanMode || !scanTarget) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && scanBuffer.current.length >= 3) {
        e.preventDefault();
        const code = scanBuffer.current.trim();
        setDraftBarcodes((prev) => ({ ...prev, [scanTarget]: code }));
        scanBuffer.current = "";
        setScanMode(false);
        setScanTarget(null);
        return;
      }
      if (e.key.length === 1) {
        scanBuffer.current += e.key;
        clearTimeout(scanTimer.current);
        scanTimer.current = setTimeout(() => {
          scanBuffer.current = "";
        }, 200);
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      clearTimeout(scanTimer.current);
    };
  }, [scanMode, scanTarget, setDraftBarcodes]);

  return (
    <div className="space-y-4">
      {/* Brand filter */}
      <div className="flex flex-wrap items-center gap-2">
        {brands.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveBrand(b.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeBrand === b.id ? chipActive : chipInactive
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Scan mode banner */}
      {scanMode && scanTarget && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
            isDark ? "bg-blue-900/20 border-blue-400/30" : "bg-[#D9E8DB] border-[#96C7B3]/50"
          }`}
        >
          <ScanBarcode className="w-5 h-5 text-[#315A4B] animate-pulse" />
          <span className={`text-sm ${textPrimary}`}>
            {t.inventory.scanBarcodeFor}{" "}
            <strong>{products.find((p) => p.id === scanTarget)?.shade_code}</strong>...
          </span>
          <button
            onClick={() => {
              setScanMode(false);
              setScanTarget(null);
              scanBuffer.current = "";
            }}
            className={`ms-auto p-1 rounded ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Product list */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.08]" : "border-[#EBDDD2] bg-[#FFFDF8]"}`}>
        <table className="w-full">
          <thead>
            <tr className={isDark ? "bg-white/[0.04]" : "bg-[#F8E5D8]/70"}>
              <th className={`px-3 py-2 text-start text-[10px] uppercase tracking-wider font-semibold ${textMuted}`}>
                {t.inventory.shade}
              </th>
              <th className={`px-3 py-2 text-start text-[10px] uppercase tracking-wider font-semibold ${textMuted}`}>
                {t.inventory.barcodes}
              </th>
              <th className={`px-3 py-2 text-center text-[10px] uppercase tracking-wider font-semibold ${textMuted}`}>
                {t.common.edit}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const draftVal = draftBarcodes[p.id];
              const currentBarcode = draftVal !== undefined ? draftVal : p.barcode || "";
              const isDirty = draftVal !== undefined;

              return (
                <tr
                  key={p.id}
                  className={`border-t ${isDark ? "border-white/[0.04]" : "border-[#EBDDD2]"}`}
                >
                  <td className={`px-3 py-2.5 ${textPrimary}`}>
                    <div className="text-xs font-medium">{p.shade_code}</div>
                    <div className={`text-[10px] ${textSecondary}`}>{p.display_name || p.line_name}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="text"
                      value={currentBarcode}
                      onChange={(e) =>
                        setDraftBarcodes((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                      placeholder={t.inventory.enterOrScanBarcode}
                      className={`w-full text-xs rounded border px-2 py-1.5 font-mono ${inputBg}`}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => {
                          setScanTarget(p.id);
                          setScanMode(true);
                          scanBuffer.current = "";
                        }}
                        className={`p-1.5 rounded transition-colors ${
                          isDark ? "hover:bg-white/10 text-white/50" : "hover:bg-black/5 text-black/50"
                        }`}
                        title={t.inventory.scanBarcodeBtn}
                      >
                        <ScanBarcode className="w-3.5 h-3.5" />
                      </button>
                      {isDirty && (
                        <button
                          onClick={() => saveBarcode(p.id)}
                          disabled={saving}
                          className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          title={t.inventory.saveBarcodeBtn}
                        >
                          {saving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Visibility View ───────────────────────────────────────────────

interface VisibilityViewProps {
  products: InventoryProduct[];
  brands: Brand[];
  lines: ProductLine[];
  activeBrand: string;
  setActiveBrand: (id: string) => void;
  toggleVisibility: (id: string, visible: boolean) => Promise<void>;
  saving: boolean;
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardBg: string;
  chipActive: string;
  chipInactive: string;
}

const VisibilityView: React.FC<VisibilityViewProps> = ({
  products,
  brands,
  activeBrand,
  setActiveBrand,
  toggleVisibility,
  saving,
  isDark,
  textPrimary,
  textSecondary,
  textMuted,
  cardBg,
  chipActive,
  chipInactive,
}) => {
  const t = useCrmT();
  const [visFilter, setVisFilter] = useState<"all" | "visible" | "hidden">("all");

  const filtered = useMemo(() => {
    let result = products;
    if (activeBrand) result = result.filter((p) => p.brand_id === activeBrand);
    if (visFilter === "visible") result = result.filter((p) => p.is_visible);
    if (visFilter === "hidden") result = result.filter((p) => !p.is_visible);
    return result;
  }, [products, activeBrand, visFilter]);

  const visibleCount = products.filter((p) => (!activeBrand || p.brand_id === activeBrand) && p.is_visible).length;
  const hiddenCount = products.filter((p) => (!activeBrand || p.brand_id === activeBrand) && !p.is_visible).length;

  return (
    <div className="space-y-4">
      {/* Brand filter */}
      <div className="flex flex-wrap items-center gap-2">
        {brands.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveBrand(b.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeBrand === b.id ? chipActive : chipInactive
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Visibility filter tabs */}
      <div className="flex items-center gap-2">
        {(
          [
            { id: "all" as const, label: `${t.inventory.visAll} (${visibleCount + hiddenCount})` },
            { id: "visible" as const, label: `${t.inventory.visDisplayed} (${visibleCount})` },
            { id: "hidden" as const, label: `${t.inventory.visHidden} (${hiddenCount})` },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setVisFilter(f.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              visFilter === f.id ? chipActive : chipInactive
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className={`relative rounded-lg border p-3 transition-all ${cardBg} ${
              !p.is_visible ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-1 mb-2">
              <div>
                <div className={`text-xs font-semibold ${textPrimary}`}>{p.shade_code}</div>
                <div className={`text-[10px] ${textSecondary}`}>{p.display_name || p.line_name}</div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleVisibility(p.id, !p.is_visible)}
                disabled={saving}
                className={`p-1 rounded transition-colors ${
                  p.is_visible
                    ? "text-emerald-500 hover:bg-emerald-500/10"
                    : isDark
                      ? "text-white/50 hover:bg-white/5"
                      : "text-black/50 hover:bg-black/5"
                }`}
                title={p.is_visible ? t.inventory.hideProduct : t.inventory.showProduct}
              >
                {p.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className={`text-[10px] ${textMuted}`}>
              {p.is_visible ? t.inventory.displayed : t.inventory.hidden}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={`text-center py-12 ${textSecondary}`}>
          <Eye className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{t.inventory.noProductsFilter}</p>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
