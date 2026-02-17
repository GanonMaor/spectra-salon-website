import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Users,
  UserPlus,
  Search,
  X,
  Phone,
  Mail,
  Tag,
  ChevronRight,
  MoreHorizontal,
  Edit3,
  Archive,
  Save,
  Calendar,
  Clock,
  DollarSign,
} from "lucide-react";
import { apiClient } from "../../api/client";
import type { CrmCustomer, CustomerVisit } from "./calendar/calendarTypes";

// ── Customer Row ────────────────────────────────────────────────────

function CustomerRow({
  customer,
  onClick,
}: {
  customer: CrmCustomer;
  onClick: () => void;
}) {
  const initials = `${customer.firstName?.[0] || ""}${customer.lastName?.[0] || ""}`.toUpperCase();

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors group"
    >
      <div className="w-9 h-9 rounded-full bg-white/[0.10] border border-white/[0.10] flex items-center justify-center text-[12px] font-bold text-white/70 flex-shrink-0">
        {customer.avatarUrl ? (
          <img src={customer.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          initials || "?"
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-white truncate">
            {customer.firstName} {customer.lastName || ""}
          </p>
          {customer.tags?.length > 0 && customer.tags.map((tag) => (
            <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white/[0.08] text-white/50">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {customer.phone && (
            <span className="text-[11px] text-white/40 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {customer.phone}
            </span>
          )}
          {customer.email && (
            <span className="text-[11px] text-white/40 flex items-center gap-1">
              <Mail className="w-3 h-3" /> {customer.email}
            </span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0 hidden sm:block">
        {customer.visitCount != null && (
          <p className="text-[11px] text-white/50">{customer.visitCount} visits</p>
        )}
        {customer.lastVisit && (
          <p className="text-[10px] text-white/30">Last: {new Date(customer.lastVisit).toLocaleDateString()}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 flex-shrink-0" />
    </button>
  );
}

// ── Add/Edit Customer Modal ─────────────────────────────────────────

function CustomerModal({
  customer,
  onClose,
  onSave,
}: {
  customer?: CrmCustomer | null;
  onClose: () => void;
  onSave: (data: Record<string, unknown>, isNew: boolean) => void;
}) {
  const isNew = !customer;
  const [form, setForm] = useState({
    first_name: customer?.firstName || "",
    last_name: customer?.lastName || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    notes: customer?.notes || "",
    tags: customer?.tags?.join(", ") || "",
  });

  const handleSubmit = () => {
    if (!form.first_name.trim()) return;
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave(
      {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        notes: form.notes.trim() || null,
        tags: `{${tags.join(",")}}`,
      },
      isNew,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/[0.12] bg-black/[0.70] backdrop-blur-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 16px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.10] flex items-center justify-center">
              {isNew ? <UserPlus className="w-5 h-5 text-emerald-400" /> : <Edit3 className="w-5 h-5 text-white/60" />}
            </div>
            <p className="text-base font-bold text-white">{isNew ? "Add Client" : "Edit Client"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">First Name *</label>
              <input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Last Name</label>
              <input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-white/40 mb-1 block">Phone</label>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+972..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-white/40 mb-1 block">Email</label>
            <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@example.com"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-white/40 mb-1 block">Tags (comma separated)</label>
            <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="vip, regular, sensitive-scalp"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-white/40 mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm h-20 resize-none" />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!form.first_name.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-[13px] font-semibold hover:bg-emerald-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            <Save className="w-4 h-4" /> {isNew ? "Add Client" : "Save Changes"}
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
}: {
  customerId: string;
  onClose: () => void;
  onEdit: (customer: CrmCustomer) => void;
}) {
  const [customer, setCustomer] = useState<CrmCustomer | null>(null);
  const [visits, setVisits] = useState<CustomerVisit[]>([]);
  const [visitStats, setVisitStats] = useState<{ total_visits?: number; total_spent?: number; first_visit?: string; last_visit?: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.getCustomer(customerId);
        if (cancelled) return;
        if (res.customer) {
          setCustomer({
            id: res.customer.id,
            salonId: res.customer.salon_id,
            firstName: res.customer.first_name,
            lastName: res.customer.last_name,
            phone: res.customer.phone,
            email: res.customer.email,
            notes: res.customer.notes,
            tags: res.customer.tags || [],
            avatarUrl: res.customer.avatar_url,
            status: res.customer.status,
            createdAt: res.customer.created_at,
            updatedAt: res.customer.updated_at,
          });
        }
        if (res.visits) setVisits(res.visits.map((v: any) => ({
          id: v.id,
          salonId: v.salon_id,
          customerId: v.customer_id,
          appointmentId: v.appointment_id,
          visitDate: v.visit_date,
          serviceName: v.service_name,
          serviceCategory: v.service_category,
          employeeName: v.employee_name,
          employeeId: v.employee_id,
          durationMinutes: v.duration_minutes,
          price: v.price ? parseFloat(v.price) : undefined,
          notes: v.notes,
          createdAt: v.created_at,
        })));
        if (res.visitStats) setVisitStats(res.visitStats);
      } catch (err) {
        console.error("Load customer detail failed:", err);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [customerId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative z-10 p-6 text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  if (!customer) return null;

  const initials = `${customer.firstName?.[0] || ""}${customer.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg rounded-3xl border border-white/[0.12] bg-black/[0.70] backdrop-blur-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 16px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/[0.10] border border-white/[0.10] flex items-center justify-center text-[14px] font-bold text-white/70">
              {initials}
            </div>
            <div>
              <p className="text-lg font-bold text-white">{customer.firstName} {customer.lastName || ""}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {customer.tags?.map((tag) => (
                  <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white/[0.08] text-white/50">
                    {tag}
                  </span>
                ))}
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                  customer.status === "active" ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.08] text-white/40"
                }`}>
                  {customer.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(customer)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-2 mb-5">
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Phone className="w-4 h-4 text-white/40" /> {customer.phone}
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Mail className="w-4 h-4 text-white/40" /> {customer.email}
            </div>
          )}
          {customer.notes && (
            <div className="mt-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <p className="text-[11px] text-white/40 mb-1">Notes</p>
              <p className="text-sm text-white/60">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-xl bg-white/[0.06] border border-white/[0.06] p-3 text-center">
            <p className="text-lg font-bold text-white">{visitStats.total_visits || 0}</p>
            <p className="text-[10px] text-white/40">Total Visits</p>
          </div>
          <div className="rounded-xl bg-white/[0.06] border border-white/[0.06] p-3 text-center">
            <p className="text-lg font-bold text-white">{visitStats.total_spent ? `${Number(visitStats.total_spent).toFixed(0)}` : "0"}</p>
            <p className="text-[10px] text-white/40">Total Spent</p>
          </div>
          <div className="rounded-xl bg-white/[0.06] border border-white/[0.06] p-3 text-center">
            <p className="text-lg font-bold text-white">
              {visitStats.last_visit ? new Date(visitStats.last_visit).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
            </p>
            <p className="text-[10px] text-white/40">Last Visit</p>
          </div>
        </div>

        {/* Visit History */}
        <div>
          <p className="text-[12px] font-semibold text-white/60 mb-3">Visit History</p>
          {visits.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-4">No visits recorded yet</p>
          ) : (
            <div className="space-y-2">
              {visits.map((v) => (
                <div key={v.id} className="flex items-start gap-3 py-2 border-b border-white/[0.04]">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-semibold text-white truncate">{v.serviceName || "Visit"}</p>
                      {v.serviceCategory && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.08] text-white/40">{v.serviceCategory}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-white/40">
                        {new Date(v.visitDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {v.employeeName && <span className="text-[11px] text-white/30">{v.employeeName}</span>}
                    </div>
                    {v.notes && <p className="text-[11px] text-white/30 mt-1">{v.notes}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {v.durationMinutes && (
                      <p className="text-[11px] text-white/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {v.durationMinutes}m
                      </p>
                    )}
                    {v.price != null && (
                      <p className="text-[11px] text-white/50 font-medium">{v.price} ILS</p>
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
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [stats, setStats] = useState<{ total?: number; active?: number; new_this_month?: number }>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CrmCustomer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const loadCustomers = useCallback(async (searchQuery?: string) => {
    try {
      const res = await apiClient.getCustomers({ search: searchQuery, limit: 100 });
      const mapped: CrmCustomer[] = (res.customers || []).map((c: any) => ({
        id: c.id,
        salonId: c.salon_id,
        firstName: c.first_name,
        lastName: c.last_name,
        phone: c.phone,
        email: c.email,
        notes: c.notes,
        tags: c.tags || [],
        avatarUrl: c.avatar_url,
        status: c.status,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        visitCount: parseInt(c.visit_count) || 0,
        lastVisit: c.last_visit,
      }));
      setCustomers(mapped);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error("Load customers failed:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => loadCustomers(query), 400);
  }, [loadCustomers]);

  const handleSaveCustomer = useCallback(async (data: Record<string, unknown>, isNew: boolean) => {
    try {
      if (isNew) {
        await apiClient.createCustomer(data as any);
      } else if (editingCustomer) {
        await apiClient.updateCustomer(editingCustomer.id, data);
      }
      loadCustomers(search);
    } catch (err) {
      console.error("Save customer failed:", err);
    }
    setEditingCustomer(null);
  }, [editingCustomer, loadCustomers, search]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-black/[0.30] backdrop-blur-xl px-3 sm:px-5 py-3"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 mr-auto">
            <Users className="w-5 h-5 text-white/50 flex-shrink-0 hidden sm:block" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Customers</h1>
              <p className="text-[11px] text-white/40">
                {stats.total || 0} total &middot; {stats.active || 0} active &middot; {stats.new_this_month || 0} new this month
              </p>
            </div>
            <button
              onClick={() => { setEditingCustomer(null); setShowModal(true); }}
              className="ml-2 w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300 transition-all shadow-sm"
              title="Add Client"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-white/[0.12] bg-black/[0.35] backdrop-blur-xl text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-black/[0.30] backdrop-blur-xl overflow-hidden"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)" }}
      >
        {loading ? (
          <div className="p-12 text-center text-white/40 text-sm">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-white/50" />
            </div>
            <p className="text-sm font-medium text-white/60 mb-1">
              {search ? "No clients found" : "No clients yet"}
            </p>
            <p className="text-[12px] text-white/35">
              {search ? "Try a different search term" : "Click + to add your first client"}
            </p>
          </div>
        ) : (
          <div>
            {customers.map((c) => (
              <CustomerRow key={c.id} customer={c} onClick={() => setSelectedCustomerId(c.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => { setShowModal(false); setEditingCustomer(null); }}
          onSave={handleSaveCustomer}
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
        />
      )}
    </div>
  );
};

export default CustomersPage;
