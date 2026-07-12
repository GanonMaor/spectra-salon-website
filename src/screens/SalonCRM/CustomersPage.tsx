import React, { useCallback, useDeferredValue, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  X,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Edit3,
  Save,
  Calendar,
  Clock,
  Trash2,
  Beaker,
  Droplets,
} from "lucide-react";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useCrmLocale, useCrmT } from "./i18n/CrmLocale";
import {
  useCRMActions,
  useBrands,
  useCustomerById,
  useCustomerVisits,
  useCustomerVisitStats,
  useCustomers,
  useProductLines,
  useProductUsage,
  useProducts,
} from "./data/crmHooks";
import type {
  Brand,
  CreateCustomerInput,
  Customer,
  Product,
  ProductLine,
  ProductUsage,
} from "./data/crmTypes";

const CRM_PASTEL = {
  nectarine: "#D7897F",
  peche: "#F9B95C",
  menthe: "#96C7B3",
  paper: "#FFF8F0",
  paperStrong: "#FFFDF8",
  grid: "#EBDDD2",
  ink: "#141414",
  muted: "#7E7066",
};

// ── Customer Row ────────────────────────────────────────────────────

interface CustomerRowVm extends Customer {
  visitCount: number;
  lastVisitIso?: string;
}

function CustomerRow({
  customer,
  onClick,
  isDark,
}: {
  customer: CustomerRowVm;
  onClick: () => void;
  isDark: boolean;
}) {
  const crmT = useCrmT();
  const { isRTL } = useCrmLocale();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const initials =
    `${customer.firstName?.[0] ?? ""}${customer.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`w-full text-start flex items-center gap-3 px-4 py-3 border-b transition-colors group ${
        isDark
          ? "border-white/[0.06] hover:bg-white/[0.04]"
          : "border-[#EBDDD2] hover:bg-[#FFF3E8]"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full border flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${
          isDark
            ? "bg-white/[0.10] border-white/[0.10] text-white/70"
            : "bg-[#F3C3BC] border-white/70 text-[#141414]"
        }`}
      >
        {customer.avatarUrl ? (
          <img
            src={customer.avatarUrl}
            alt=""
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials || "?"
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={`text-[13px] font-semibold truncate ${
              isDark ? "text-white" : "text-[#141414]"
            }`}
          >
            {customer.firstName} {customer.lastName ?? ""}
          </p>
          {customer.tags.length > 0 &&
            customer.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                  isDark
                    ? "bg-white/[0.08] text-white/50"
                    : "bg-[#F8E5D8] text-[#7E7066]"
                }`}
              >
                {tag}
              </span>
            ))}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {customer.phone && (
            <span
              className={`text-[11px] flex items-center gap-1 ${
                isDark ? "text-white/55" : "text-[#7E7066]"
              }`}
            >
              <Phone className="w-3 h-3" /> {customer.phone}
            </span>
          )}
          {customer.email && (
            <span
              className={`text-[11px] flex items-center gap-1 ${
                isDark ? "text-white/55" : "text-[#7E7066]"
              }`}
            >
              <Mail className="w-3 h-3" /> {customer.email}
            </span>
          )}
        </div>
      </div>
      <div className="text-end flex-shrink-0 hidden sm:block">
        <p
          className={`text-[11px] ${
            isDark ? "text-white/50" : "text-[#7E7066]"
          }`}
        >
          {customer.visitCount} {crmT.customers.visits}
        </p>
        {customer.lastVisitIso && (
          <p
            className={`text-[10px] ${
              isDark ? "text-white/50" : "text-[#9A8B80]"
            }`}
          >
            {crmT.customers.lastVisit}:{" "}
            {new Date(customer.lastVisitIso).toLocaleDateString()}
          </p>
        )}
      </div>
      <Chevron
        className={`w-4 h-4 flex-shrink-0 ${
          isDark
            ? "text-white/50 group-hover:text-white/55"
            : "text-[#9A8B80] group-hover:text-[#141414]"
        }`}
      />
    </button>
  );
}

// ── Add/Edit Customer Modal ─────────────────────────────────────────

interface CustomerModalProps {
  customer?: Customer | null;
  onClose: () => void;
  onSave: (input: CreateCustomerInput, existingId: string | null) => Promise<boolean>;
  isDark: boolean;
}

function CustomerModal({
  customer,
  onClose,
  onSave,
  isDark,
}: CustomerModalProps) {
  const crmT = useCrmT();
  const isNew = !customer;
  const [form, setForm] = useState({
    firstName: customer?.firstName || "",
    lastName: customer?.lastName || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    notes: customer?.notes || "",
    tags: customer?.tags?.join(", ") || "",
    isVip: customer?.isVip ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.firstName.trim()) return;
    setSaving(true);
    setError(null);
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const saved = await onSave(
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        notes: form.notes.trim() || undefined,
        tags,
        isVip: form.isVip,
      },
      customer?.id ?? null,
    );
    setSaving(false);
    if (saved) {
      onClose();
    } else {
      setError("Could not save customer. Please try again.");
    }
  };

  const inputCls = isDark
    ? "bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
    : "bg-[#FFF8F0] border border-[#EBDDD2] rounded-lg px-3 py-2 text-[#141414] text-sm focus:outline-none focus:border-[#D7897F]";
  const labelCls = isDark
    ? "text-[11px] text-white/55 mb-1 block"
    : "text-[11px] text-[#7E7066] mb-1 block";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center px-0 sm:px-4"
      onClick={onClose}
    >
      <div
        className={`absolute inset-0 ${
          isDark ? "bg-black/50" : "bg-[#D7897F]/35"
        }`}
      />
      <div
        className={`relative z-10 w-full sm:max-w-md rounded-t-[28px] sm:rounded-[28px] border p-6 max-h-[90svh] overflow-y-auto ${
          isDark
            ? "border-white/[0.12] bg-black/[0.70]"
            : "border-white/70 bg-[#FFF8F0]"
        }`}
        style={{
          boxShadow: isDark
            ? "0 16px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 24px 80px rgba(92,52,35,0.20)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark ? "bg-white/[0.10]" : "bg-black/[0.05]"
              }`}
            >
              {isNew ? (
                <UserPlus
                  className={`w-5 h-5 ${
                    isDark ? "text-emerald-400" : "text-emerald-600"
                  }`}
                />
              ) : (
                <Edit3
                  className={`w-5 h-5 ${
                    isDark ? "text-white/60" : "text-black/50"
                  }`}
                />
              )}
            </div>
            <p
              className={`text-base font-bold ${
                isDark ? "text-white" : "text-[#1A1A1A]"
              }`}
            >
              {isNew ? crmT.customers.addClient : crmT.customers.editClient}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isDark
                ? "bg-white/10 text-white/60 hover:text-white"
                : "bg-black/[0.05] text-black/50 hover:text-black"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                {crmT.customers.firstNameRequired}
              </label>
              <input
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
                className={`w-full ${inputCls}`}
              />
            </div>
            <div>
              <label className={labelCls}>{crmT.customers.lastName}</label>
              <input
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
                className={`w-full ${inputCls}`}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>{crmT.customers.phone}</label>
            <input
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="+972..."
              className={`w-full ${inputCls}`}
            />
          </div>
          <div>
            <label className={labelCls}>{crmT.customers.email}</label>
            <input
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="email@example.com"
              className={`w-full ${inputCls}`}
            />
          </div>
          <div>
            <label className={labelCls}>{crmT.customers.tags}</label>
            <input
              value={form.tags}
              onChange={(e) =>
                setForm((f) => ({ ...f, tags: e.target.value }))
              }
              placeholder={crmT.customers.tagsPlaceholder}
              className={`w-full ${inputCls}`}
            />
          </div>
          <div>
            <label className={labelCls}>{crmT.common.notes}</label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              className={`w-full ${inputCls} h-20 resize-none`}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isVip}
              onChange={(e) =>
                setForm((f) => ({ ...f, isVip: e.target.checked }))
              }
              className="w-4 h-4 accent-amber-500"
            />
            <span
              className={`text-[12px] font-medium ${
                isDark ? "text-white/70" : "text-black/65"
              }`}
            >
              VIP
            </span>
          </label>
          <button
            onClick={handleSubmit}
            disabled={!form.firstName.trim() || saving}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2 ${
              isDark
                ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            }`}
          >
            <Save className="w-4 h-4" />{" "}
            {isNew ? crmT.customers.addClient : crmT.customers.saveChanges}
          </button>
          {error && (
            <p className={`text-[11px] font-medium ${isDark ? "text-red-300" : "text-red-700"}`}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Materials (product usage per visit) ─────────────────────────────

interface MaterialLabels {
  brand?: string;
  line?: string;
  shade?: string;
}

/**
 * Resolve human-readable labels for a usage row. The imported source
 * metadata (`sourceBrand`/`sourceSeries`/`sourceShade`) is authoritative
 * because it reflects exactly what was recorded; catalog product lookup is
 * only a fallback for rows that lack that metadata.
 */
function resolveMaterialLabels(
  usage: ProductUsage,
  productById: Map<string, Product>,
  brandById: Map<string, Brand>,
  lineById: Map<string, ProductLine>,
): MaterialLabels {
  const product = productById.get(usage.productId);
  const brand = usage.sourceBrand
    ?? (product ? brandById.get(product.brandId)?.name : undefined);
  const line = usage.sourceSeries
    ?? (product ? lineById.get(product.productLineId)?.name : undefined);
  const shade = usage.sourceShade
    ?? product?.shadeCode
    ?? product?.displayName;
  return { brand, line, shade };
}

const DEVELOPER_PATTERN =
  /develop|oxid|peroxide|activ|מחמצן|חמצן|vol(?:ume)?\b|\bv\d/i;

function isDeveloperMaterial(usage: ProductUsage, labels: MaterialLabels): boolean {
  const hay = `${usage.sourceServiceName ?? ""} ${labels.brand ?? ""} ${labels.line ?? ""} ${labels.shade ?? ""}`;
  return DEVELOPER_PATTERN.test(hay);
}

function MaterialRow({
  usage,
  labels,
  isDark,
}: {
  usage: ProductUsage;
  labels: MaterialLabels;
  isDark: boolean;
}) {
  const crmT = useCrmT();
  const shade = labels.shade || labels.line || labels.brand || "—";
  const subtitle = [labels.brand, labels.line].filter(Boolean).join(" · ");
  const grams = Math.round(usage.grams * 10) / 10;

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
          isDark
            ? "bg-white/[0.06] text-white/70 border border-white/[0.06]"
            : "bg-white text-[#141414] border border-[#EBDDD2]"
        }`}
      >
        {(labels.brand?.[0] ?? labels.shade?.[0] ?? "?").toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[12px] font-semibold truncate ${
            isDark ? "text-white" : "text-[#141414]"
          }`}
        >
          {shade}
        </p>
        {subtitle && (
          <p
            className={`text-[10px] truncate ${
              isDark ? "text-white/50" : "text-[#9A8B80]"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {usage.costAtUseUsd > 0 && (
          <span
            className={`text-[10px] ${
              isDark ? "text-white/45" : "text-[#9A8B80]"
            }`}
          >
            {Math.round(usage.costAtUseUsd)} {crmT.customers.currencySymbol}
          </span>
        )}
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            isDark
              ? "bg-white/[0.08] text-white/80"
              : "bg-[#F8E5D8] text-[#7E7066]"
          }`}
        >
          {grams} {crmT.customers.gramsSuffix}
        </span>
      </div>
    </div>
  );
}

const MATERIALS_COLLAPSED_COUNT = 4;

function VisitMaterials({
  usage,
  productById,
  brandById,
  lineById,
  isDark,
}: {
  usage: ProductUsage[];
  productById: Map<string, Product>;
  brandById: Map<string, Brand>;
  lineById: Map<string, ProductLine>;
  isDark: boolean;
}) {
  const crmT = useCrmT();
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => {
    const mapped = usage.map((u) => {
      const labels = resolveMaterialLabels(u, productById, brandById, lineById);
      return { usage: u, labels, isDeveloper: isDeveloperMaterial(u, labels) };
    });
    // Colors first, developer/oxidant rows grouped at the end.
    return mapped.sort((a, b) => Number(a.isDeveloper) - Number(b.isDeveloper));
  }, [usage, productById, brandById, lineById]);

  const totals = useMemo(() => {
    let grams = 0;
    let cost = 0;
    for (const u of usage) {
      grams += u.grams;
      cost += u.costAtUseUsd;
    }
    return { grams: Math.round(grams * 10) / 10, cost: Math.round(cost) };
  }, [usage]);

  if (rows.length === 0) return null;

  const canCollapse = rows.length > MATERIALS_COLLAPSED_COUNT;
  const visibleRows = expanded ? rows : rows.slice(0, MATERIALS_COLLAPSED_COUNT);
  let developerDividerRendered = false;

  return (
    <div
      className={`mt-2 rounded-xl border p-2.5 ${
        isDark
          ? "bg-white/[0.03] border-white/[0.06]"
          : "bg-white/70 border-[#EBDDD2]"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Beaker
          className={`w-3.5 h-3.5 ${isDark ? "text-white/55" : "text-[#7E7066]"}`}
        />
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide ${
            isDark ? "text-white/55" : "text-[#7E7066]"
          }`}
        >
          {crmT.customers.materials}
        </span>
      </div>

      <div
        className={`divide-y ${isDark ? "divide-white/[0.05]" : "divide-[#F0E3D8]"}`}
      >
        {visibleRows.map((row) => {
          const showDeveloperDivider = row.isDeveloper && !developerDividerRendered;
          if (row.isDeveloper) developerDividerRendered = true;
          return (
            <React.Fragment key={row.usage.id}>
              {showDeveloperDivider && (
                <div className="flex items-center gap-2 py-1.5">
                  <span
                    className={`h-px flex-1 ${isDark ? "bg-white/[0.08]" : "bg-[#EBDDD2]"}`}
                  />
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-wide flex items-center gap-1 ${
                      isDark ? "text-white/45" : "text-[#9A8B80]"
                    }`}
                  >
                    <Droplets className="w-3 h-3" />
                    {crmT.customers.developer}
                  </span>
                  <span
                    className={`h-px flex-1 ${isDark ? "bg-white/[0.08]" : "bg-[#EBDDD2]"}`}
                  />
                </div>
              )}
              <MaterialRow usage={row.usage} labels={row.labels} isDark={isDark} />
            </React.Fragment>
          );
        })}
      </div>

      {canCollapse && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`mt-1.5 w-full flex items-center justify-center gap-1 text-[10px] font-medium py-1 rounded-lg transition-colors ${
            isDark
              ? "text-white/55 hover:bg-white/[0.04]"
              : "text-[#7E7066] hover:bg-[#F8E5D8]"
          }`}
        >
          <ChevronDown
            className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
          {expanded
            ? crmT.customers.showLess
            : `${crmT.customers.showAllMaterials} (${rows.length})`}
        </button>
      )}

      <div
        className={`flex items-center justify-between mt-1.5 pt-1.5 border-t text-[10px] ${
          isDark
            ? "border-white/[0.06] text-white/55"
            : "border-[#EBDDD2] text-[#7E7066]"
        }`}
      >
        <span>
          {crmT.customers.totalMaterialGrams}: {totals.grams}{" "}
          {crmT.customers.gramsSuffix}
        </span>
        {totals.cost > 0 && (
          <span>
            {crmT.customers.materialCost}: {totals.cost}{" "}
            {crmT.customers.currencySymbol}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Customer Detail Panel ───────────────────────────────────────────

function CustomerDetailPanel({
  customerId,
  onClose,
  onEdit,
  onArchive,
  isDark,
}: {
  customerId: string;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onArchive: (id: string) => void;
  isDark: boolean;
}) {
  const crmT = useCrmT();
  const customer = useCustomerById(customerId);
  const visits = useCustomerVisits(customerId);
  const stats = useCustomerVisitStats()[customerId];
  const productUsage = useProductUsage();
  const products = useProducts();
  const brands = useBrands();
  const productLines = useProductLines();

  // Group this customer's material usage by visit. Imported usage rows carry
  // the appointment/visit id in `mixSessionId`, so scoping to this customer's
  // visit ids guarantees no cross-customer (or cross-tenant) rows leak in.
  const { usageByVisit, productById, brandById, lineById, materialTotals } =
    useMemo(() => {
      const productById = new Map(products.map((p) => [p.id, p]));
      const brandById = new Map(brands.map((b) => [b.id, b]));
      const lineById = new Map(productLines.map((l) => [l.id, l]));
      const visitIds = new Set(visits.map((v) => v.id));
      const usageByVisit = new Map<string, ProductUsage[]>();
      for (const u of productUsage) {
        if (!visitIds.has(u.mixSessionId)) continue;
        const bucket = usageByVisit.get(u.mixSessionId) ?? [];
        bucket.push(u);
        usageByVisit.set(u.mixSessionId, bucket);
      }
      let totalGrams = 0;
      let totalCost = 0;
      for (const bucket of usageByVisit.values()) {
        for (const u of bucket) {
          totalGrams += u.grams;
          totalCost += u.costAtUseUsd;
        }
      }
      const visitsWithUsage = usageByVisit.size;
      return {
        usageByVisit,
        productById,
        brandById,
        lineById,
        materialTotals: {
          totalGrams: Math.round(totalGrams),
          totalCost: Math.round(totalCost),
          avgCost: visitsWithUsage
            ? Math.round(totalCost / visitsWithUsage)
            : 0,
          visitsWithUsage,
        },
      };
    }, [productUsage, products, brands, productLines, visits]);

  if (!customer) return null;

  const initials =
    `${customer.firstName?.[0] ?? ""}${customer.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center px-0 sm:px-4"
      onClick={onClose}
    >
      <div className={`absolute inset-0 ${isDark ? "bg-black/50" : "bg-[#D7897F]/35"}`} />
      <div
        className={`relative z-10 w-full sm:max-w-lg rounded-t-[28px] sm:rounded-[28px] border p-6 max-h-[90svh] overflow-y-auto ${
          isDark
            ? "border-white/[0.12] bg-black/[0.70]"
            : "border-white/70 bg-[#FFF8F0]"
        }`}
        style={{
          boxShadow: isDark
            ? "0 16px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 24px 80px rgba(92,52,35,0.20)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center text-[14px] font-bold ${
                isDark
                  ? "bg-white/[0.10] border-white/[0.10] text-white/70"
                  : "bg-[#F3C3BC] border-white/70 text-[#141414]"
              }`}
            >
              {initials}
            </div>
            <div>
              <p
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-[#1A1A1A]"
                }`}
              >
                {customer.firstName} {customer.lastName ?? ""}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                      isDark
                        ? "bg-white/[0.08] text-white/50"
                        : "bg-black/[0.05] text-black/50"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
                <span
                  className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                    customer.status === "active"
                      ? isDark
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-emerald-100 text-emerald-700"
                      : isDark
                        ? "bg-white/[0.08] text-white/55"
                        : "bg-black/[0.05] text-black/55"
                  }`}
                >
                  {customer.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(customer)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isDark
                  ? "bg-white/10 text-white/60 hover:text-white"
                  : "bg-black/[0.05] text-black/50 hover:text-black"
              }`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            {customer.status !== "archived" && (
              <button
                onClick={() => onArchive(customer.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isDark
                    ? "bg-white/10 text-white/60 hover:text-white"
                    : "bg-black/[0.05] text-black/50 hover:text-black"
                }`}
                title="Archive customer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isDark
                  ? "bg-white/10 text-white/60 hover:text-white"
                  : "bg-black/[0.05] text-black/50 hover:text-black"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {customer.phone && (
            <div
              className={`flex items-center gap-2 text-sm ${
                isDark ? "text-white/70" : "text-black/60"
              }`}
            >
              <Phone
                className={`w-4 h-4 ${
                  isDark ? "text-white/55" : "text-black/55"
                }`}
              />{" "}
              {customer.phone}
            </div>
          )}
          {customer.email && (
            <div
              className={`flex items-center gap-2 text-sm ${
                isDark ? "text-white/70" : "text-black/60"
              }`}
            >
              <Mail
                className={`w-4 h-4 ${
                  isDark ? "text-white/55" : "text-black/55"
                }`}
              />{" "}
              {customer.email}
            </div>
          )}
          {customer.notes && (
            <div
              className={`mt-2 p-3 rounded-xl border ${
                isDark
                  ? "bg-white/[0.04] border-white/[0.06]"
                  : "bg-black/[0.02] border-black/[0.04]"
              }`}
            >
              <p
                className={`text-[11px] mb-1 ${
                  isDark ? "text-white/55" : "text-black/55"
                }`}
              >
                {crmT.common.notes}
              </p>
              <p
                className={`text-sm ${
                  isDark ? "text-white/60" : "text-black/60"
                }`}
              >
                {customer.notes}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            {
              value: stats?.totalVisits ?? 0,
              label: crmT.customers.totalVisits,
            },
            {
              value: stats
                ? Math.round(stats.totalSpentCents / 100).toString()
                : "0",
              label: crmT.customers.totalSpent,
            },
            {
              value: stats?.lastVisitIso
                ? new Date(stats.lastVisitIso).toLocaleDateString("he-IL", {
                    day: "numeric",
                    month: "short",
                  })
                : "—",
              label: crmT.customers.lastVisit,
            },
          ].map(({ value, label }) => (
            <div
              key={label}
              className={`rounded-xl border p-3 text-center ${
                isDark
                  ? "bg-white/[0.06] border-white/[0.06]"
                  : "bg-black/[0.02] border-black/[0.04]"
              }`}
            >
              <p
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-[#1A1A1A]"
                }`}
              >
                {value}
              </p>
              <p
                className={`text-[10px] ${
                  isDark ? "text-white/55" : "text-black/55"
                }`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {materialTotals.visitsWithUsage > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              {
                value: `${materialTotals.totalGrams} ${crmT.customers.gramsSuffix}`,
                label: crmT.customers.totalMaterialGrams,
              },
              {
                value: `${materialTotals.totalCost} ${crmT.customers.currencySymbol}`,
                label: crmT.customers.totalMaterialCost,
              },
              {
                value: `${materialTotals.avgCost} ${crmT.customers.currencySymbol}`,
                label: crmT.customers.avgMaterialPerVisit,
              },
            ].map(({ value, label }) => (
              <div
                key={label}
                className={`rounded-xl border p-3 text-center ${
                  isDark
                    ? "bg-white/[0.04] border-white/[0.06]"
                    : "bg-[#FFF3E8] border-[#EBDDD2]"
                }`}
              >
                <p
                  className={`text-[13px] font-bold flex items-center justify-center gap-1 ${
                    isDark ? "text-white" : "text-[#1A1A1A]"
                  }`}
                >
                  <Beaker
                    className={`w-3 h-3 ${isDark ? "text-white/45" : "text-[#B08968]"}`}
                  />
                  {value}
                </p>
                <p
                  className={`text-[10px] ${
                    isDark ? "text-white/55" : "text-black/55"
                  }`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        <div>
          <p
            className={`text-[12px] font-semibold mb-3 ${
              isDark ? "text-white/60" : "text-black/50"
            }`}
          >
            {crmT.customers.visitHistory}
          </p>
          {visits.length === 0 ? (
            <p
              className={`text-sm text-center py-4 ${
                isDark ? "text-white/50" : "text-[#9A8B80]"
              }`}
            >
              {crmT.customers.noVisits}
            </p>
          ) : (
            <div className="space-y-2">
              {visits.map((v) => {
                const visitUsage = usageByVisit.get(v.id) ?? [];
                return (
                <div
                  key={v.id}
                  className={`py-2 border-b ${
                    isDark ? "border-white/[0.04]" : "border-[#EBDDD2]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isDark ? "bg-white/[0.06]" : "bg-[#F8E5D8]"
                    }`}
                  >
                    <Calendar
                      className={`w-3.5 h-3.5 ${
                        isDark ? "text-white/55" : "text-[#7E7066]"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-[12px] font-semibold truncate ${
                          isDark ? "text-white" : "text-[#141414]"
                        }`}
                      >
                        {v.serviceName ?? "Visit"}
                      </p>
                      {v.serviceCategoryId && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            isDark
                              ? "bg-white/[0.08] text-white/55"
                              : "bg-black/[0.05] text-black/55"
                          }`}
                        >
                          {v.serviceCategoryId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[11px] ${
                          isDark ? "text-white/55" : "text-black/55"
                        }`}
                      >
                        {new Date(v.visitDateIso).toLocaleDateString("he-IL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {v.staffName && (
                        <span
                          className={`text-[11px] ${
                            isDark ? "text-white/50" : "text-black/50"
                          }`}
                        >
                          {v.staffName}
                        </span>
                      )}
                    </div>
                    {v.notes && (
                      <p
                        className={`text-[11px] mt-1 ${
                          isDark ? "text-white/50" : "text-black/50"
                        }`}
                      >
                        {v.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-end flex-shrink-0">
                    {v.durationMinutes != null && (
                      <p
                        className={`text-[11px] flex items-center gap-1 ${
                          isDark ? "text-white/55" : "text-black/55"
                        }`}
                      >
                        <Clock className="w-3 h-3" /> {v.durationMinutes}
                        {crmT.customers.durationMinSuffix}
                      </p>
                    )}
                    {v.priceCents != null && (
                      <p
                        className={`text-[11px] font-medium ${
                          isDark ? "text-white/50" : "text-black/50"
                        }`}
                      >
                        {Math.round(v.priceCents / 100)}{" "}
                        {crmT.customers.currencySymbol}
                      </p>
                    )}
                  </div>
                  </div>
                  {visitUsage.length > 0 && (
                    <VisitMaterials
                      usage={visitUsage}
                      productById={productById}
                      brandById={brandById}
                      lineById={lineById}
                      isDark={isDark}
                    />
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Customers Page ─────────────────────────────────────────────

const CustomersPage: React.FC = () => {
  const { isDark } = useSiteTheme();
  const crmT = useCrmT();
  const allCustomers = useCustomers();
  const visitStats = useCustomerVisitStats();
  const actions = useCRMActions();

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );

  // ── Derived rows ─────────────────────────────────────────────────
  const rows = useMemo<CustomerRowVm[]>(() => {
    const enriched = allCustomers.map<CustomerRowVm>((c) => {
      const stats = visitStats[c.id];
      return {
        ...c,
        visitCount: stats?.totalVisits ?? 0,
        lastVisitIso: stats?.lastVisitIso,
      };
    });
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return enriched;
    return enriched.filter((c) =>
      `${c.firstName} ${c.lastName ?? ""} ${c.phone ?? ""} ${c.email ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [allCustomers, visitStats, deferredSearch]);

  const summary = useMemo(() => {
    const total = allCustomers.length;
    const active = allCustomers.filter((c) => c.status === "active").length;
    const now = new Date();
    const monthAnchor = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const newThisMonth = allCustomers.filter(
      (c) => new Date(c.createdAt).getTime() >= monthAnchor,
    ).length;
    return { total, active, newThisMonth };
  }, [allCustomers]);

  const handleSaveCustomer = useCallback(
    async (input: CreateCustomerInput, existingId: string | null): Promise<boolean> => {
      const result = existingId
        ? await actions.updateCustomer(existingId, input)
        : await actions.createCustomer(input);
      if (!result.ok) {
        // Surface validation/repository failures inline; never silently
        // close the editor as if the save succeeded.
        if (typeof console !== "undefined") {
          // eslint-disable-next-line no-console
          console.warn("[Customers] save failed", result.error);
        }
        if (typeof window !== "undefined" && typeof window.alert === "function") {
          window.alert(`Could not save customer: ${result.error.message}`);
        }
        return false;
      }
      setEditingCustomer(null);
      return true;
    },
    [actions],
  );

  const handleArchiveCustomer = useCallback(
    async (id: string) => {
      const result = await actions.archiveCustomer(id);
      if (!result.ok) {
        if (typeof window !== "undefined" && typeof window.alert === "function") {
          window.alert(`Could not archive customer: ${result.error.message}`);
        }
        return;
      }
      setSelectedCustomerId(null);
    },
    [actions],
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className={`rounded-[28px] border px-3 sm:px-5 py-4 ${
          isDark
            ? "border-white/[0.12] bg-black/[0.30]"
            : "border-white/70 bg-[#FFF8F0]/90"
        }`}
        style={{
          boxShadow: isDark
            ? "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "0 24px 70px rgba(92,52,35,0.14)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 me-auto min-w-0">
            <Users
              className={`w-5 h-5 flex-shrink-0 hidden sm:block ${
                isDark ? "text-white/50" : "text-[#7E7066]"
              }`}
            />
            <div className="min-w-0">
              <h1
                className={`text-lg sm:text-xl font-bold tracking-tight ${
                  isDark ? "text-white" : "text-[#141414]"
                }`}
              >
                {crmT.customers.title}
              </h1>
              <p
                className={`text-[11px] ${
                  isDark ? "text-white/55" : "text-[#7E7066]"
                }`}
              >
                {summary.total} {crmT.customers.statsTotal} &middot;{" "}
                {summary.active} {crmT.customers.statsActive} &middot;{" "}
                {summary.newThisMonth} {crmT.customers.statsNew}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCustomer(null);
                setShowModal(true);
              }}
              className={`ms-2 w-9 h-9 flex-shrink-0 rounded-xl border flex items-center justify-center transition-all shadow-sm ${
                isDark
                  ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300"
                  : "border-white/70 text-white hover:opacity-90"
              }`}
              style={!isDark ? { background: CRM_PASTEL.nectarine } : undefined}
              title={crmT.customers.addClient}
              aria-label={crmT.customers.addClient}
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search
              className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
                isDark ? "text-white/50" : "text-[#9A8B80]"
              }`}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={crmT.customers.searchPlaceholder}
              className={`w-full h-9 ps-9 pe-3 rounded-xl border text-[12px] focus:outline-none focus:ring-2 ${
                isDark
                  ? "border-white/[0.12] bg-black/[0.35] text-white placeholder:text-white/50 focus:ring-white/30"
                  : "border-[#EBDDD2] bg-white/55 text-[#141414] placeholder:text-[#9A8B80] focus:ring-[#D7897F]/20"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className={`rounded-[28px] border overflow-hidden ${
          isDark
            ? "border-white/[0.12] bg-black/[0.30]"
            : "border-white/70 bg-[#FFFDF8]/88"
        }`}
        style={{
          boxShadow: isDark
            ? "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "0 24px 70px rgba(92,52,35,0.12)",
        }}
      >
        {rows.length === 0 ? (
          <div className="p-12 text-center">
            <div
              className={`mx-auto mb-4 w-14 h-14 rounded-2xl border flex items-center justify-center ${
                isDark
                  ? "bg-white/10 border-white/10"
                  : "bg-[#F8E5D8] border-[#EBDDD2]"
              }`}
            >
              <Users
                className={`w-6 h-6 ${
                  isDark ? "text-white/50" : "text-[#7E7066]"
                }`}
              />
            </div>
            <p
              className={`text-sm font-medium mb-1 ${
                isDark ? "text-white/60" : "text-[#7E7066]"
              }`}
            >
              {crmT.customers.noClients}
            </p>
            <p
              className={`text-[12px] ${
                isDark ? "text-white/50" : "text-[#9A8B80]"
              }`}
            >
              {crmT.customers.noClientsDesc}
            </p>
          </div>
        ) : (
          <div>
            {rows.map((c) => (
              <CustomerRow
                key={c.id}
                customer={c}
                onClick={() => setSelectedCustomerId(c.id)}
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => {
            setShowModal(false);
            setEditingCustomer(null);
          }}
          onSave={handleSaveCustomer}
          isDark={isDark}
        />
      )}

      {/* Detail Panel */}
      {selectedCustomerId && (
        <CustomerDetailPanel
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
          onArchive={handleArchiveCustomer}
          onEdit={(cust) => {
            setSelectedCustomerId(null);
            setEditingCustomer(cust);
            setShowModal(true);
          }}
          isDark={isDark}
        />
      )}
    </div>
  );
};

export default CustomersPage;
