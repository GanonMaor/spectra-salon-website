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
  Edit3,
  Save,
  Calendar,
  Clock,
} from "lucide-react";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useCrmLocale, useCrmT } from "./i18n/CrmLocale";
import {
  useCRMActions,
  useCustomerById,
  useCustomerVisits,
  useCustomerVisitStats,
  useCustomers,
} from "./data/crmHooks";
import type { CreateCustomerInput, Customer } from "./data/crmTypes";

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
  onSave: (input: CreateCustomerInput, existingId: string | null) => void;
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

  const handleSubmit = () => {
    if (!form.firstName.trim()) return;
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave(
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
    onClose();
  };

  const inputCls = isDark
    ? "bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
    : "bg-[#FFF8F0] border border-[#EBDDD2] rounded-lg px-3 py-2 text-[#141414] text-sm focus:outline-none focus:border-[#D7897F]";
  const labelCls = isDark
    ? "text-[11px] text-white/55 mb-1 block"
    : "text-[11px] text-[#7E7066] mb-1 block";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className={`absolute inset-0 ${
          isDark ? "bg-black/50" : "bg-[#D7897F]/35"
        }`}
      />
      <div
        className={`relative z-10 w-full max-w-md rounded-[28px] border p-6 max-h-[90vh] overflow-y-auto ${
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
            disabled={!form.firstName.trim()}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2 ${
              isDark
                ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            }`}
          >
            <Save className="w-4 h-4" />{" "}
            {isNew ? crmT.customers.addClient : crmT.customers.saveChanges}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Customer Detail Panel ───────────────────────────────────────────

function CustomerDetailPanel({
  customerId,
  onClose,
  onEdit,
  isDark,
}: {
  customerId: string;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  isDark: boolean;
}) {
  const crmT = useCrmT();
  const customer = useCustomerById(customerId);
  const visits = useCustomerVisits(customerId);
  const stats = useCustomerVisitStats()[customerId];

  if (!customer) return null;

  const initials =
    `${customer.firstName?.[0] ?? ""}${customer.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className={`absolute inset-0 ${isDark ? "bg-black/50" : "bg-[#D7897F]/35"}`} />
      <div
        className={`relative z-10 w-full max-w-lg rounded-[28px] border p-6 max-h-[90vh] overflow-y-auto ${
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
              {visits.map((v) => (
                <div
                  key={v.id}
                  className={`flex items-start gap-3 py-2 border-b ${
                    isDark ? "border-white/[0.04]" : "border-[#EBDDD2]"
                  }`}
                >
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
              ))}
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
    (input: CreateCustomerInput, existingId: string | null) => {
      const result = existingId
        ? actions.updateCustomer(existingId, input)
        : actions.createCustomer(input);
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
        return;
      }
      setEditingCustomer(null);
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
