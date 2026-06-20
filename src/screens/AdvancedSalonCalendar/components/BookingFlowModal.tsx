import React, { useState, useMemo } from "react";
import { PALETTE, STAFF } from "../mockData";
import {
  CALENDAR_ACTIONS,
  CLIENT_DATABASE,
  DEPARTMENTS,
  SERVICE_CATEGORIES,
  SERVICES,
  type CalendarActionType,
  type ClientRecord,
  type ServiceCategory,
  type ServiceItem,
} from "../bookingFlowData";

interface Props {
  open: boolean;
  staffId: string | null;
  startHour: number | null;
  onClose: () => void;
}

type FlowStep = 1 | 2 | 3 | 4 | 5;

export const BookingFlowModal: React.FC<Props> = ({ open, staffId, startHour, onClose }) => {
  const [step, setStep] = useState<FlowStep>(1);
  const [actionType, setActionType] = useState<CalendarActionType | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const staff = STAFF.find((s) => s.id === staffId);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return CLIENT_DATABASE.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return CLIENT_DATABASE.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone?.includes(q)
    );
  }, [searchQuery]);

  const departmentCategories = useMemo(
    () => SERVICE_CATEGORIES.filter((c) => c.departmentId === selectedDepartment),
    [selectedDepartment]
  );

  const categoryServices = useMemo(
    () => SERVICES.filter((s) => s.categoryId === selectedCategory),
    [selectedCategory]
  );

  const reset = () => {
    setStep(1);
    setActionType(null);
    setSelectedClient(null);
    setSearchQuery("");
    setSelectedDepartment(null);
    setSelectedCategory(null);
    setSelectedService(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const goBack = () => {
    if (step === 1) { handleClose(); return; }
    if (step === 2) { setActionType(null); }
    if (step === 3) { setSelectedClient(null); setSearchQuery(""); }
    if (step === 4) { setSelectedDepartment(null); }
    if (step === 5) { setSelectedCategory(null); }
    setStep((s) => (s - 1) as FlowStep);
  };

  if (!open) return null;

  const fmtHour = (h: number) => {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10,6,3,0.60)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        style={{
          width: "min(92vw, 720px)",
          maxHeight: "min(88vh, 680px)",
          background: PALETTE.surface,
          borderRadius: "20px",
          boxShadow: "0 32px 100px rgba(10,6,3,0.40), 0 8px 32px rgba(10,6,3,0.20)",
          border: `1px solid ${PALETTE.border}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${PALETTE.borderSoft}`, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {step > 1 && (
                <button onClick={goBack} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", fontSize: "14px", color: PALETTE.textSoft, borderRadius: "6px" }}>
                  ← Back
                </button>
              )}
              <div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: PALETTE.textStrong }}>New Calendar Entry</p>
                <p style={{ fontSize: "11px", color: PALETTE.textFaint, marginTop: "2px" }}>
                  {staff && `${staff.name} · `}{startHour !== null && fmtHour(startHour)}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: PALETTE.textFaint, padding: "4px 8px", lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: "4px", marginTop: "14px" }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: "3px",
                  borderRadius: "2px",
                  background: s <= step ? PALETTE.accent : PALETTE.borderSoft,
                  transition: "background 0.2s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* Summary strip */}
        {step > 1 && (
          <div style={{ padding: "10px 24px", background: PALETTE.surfaceAlt, borderBottom: `1px solid ${PALETTE.borderSoft}`, display: "flex", gap: "16px", flexShrink: 0, flexWrap: "wrap" }}>
            {actionType && <SummaryPill label="Type" value={CALENDAR_ACTIONS.find((a) => a.id === actionType)?.label || ""} />}
            {selectedClient && <SummaryPill label="Client" value={selectedClient.name} />}
            {selectedDepartment && <SummaryPill label="Department" value={DEPARTMENTS.find((d) => d.id === selectedDepartment)?.label || ""} />}
            {selectedCategory && <SummaryPill label="Category" value={SERVICE_CATEGORIES.find((c) => c.id === selectedCategory)?.label || ""} />}
            {selectedService && <SummaryPill label="Service" value={selectedService.label} />}
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 24px" }}>
          {step === 1 && (
            <Step1ActionType
              onSelect={(id) => { setActionType(id); setStep(2); }}
            />
          )}
          {step === 2 && (
            <Step2Client
              query={searchQuery}
              onQueryChange={setSearchQuery}
              clients={filteredClients}
              onSelect={(c) => { setSelectedClient(c); setStep(3); }}
            />
          )}
          {step === 3 && (
            <Step3Department
              onSelect={(id) => { setSelectedDepartment(id); setStep(4); }}
            />
          )}
          {step === 4 && (
            <Step4Category
              categories={departmentCategories}
              onSelect={(id) => { setSelectedCategory(id); setStep(5); }}
            />
          )}
          {step === 5 && (
            <Step5Service
              services={categoryServices}
              onSelect={(svc) => { setSelectedService(svc); }}
              selected={selectedService}
              onConfirm={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ── Summary pill ─────────────────────────────────────────────────────────────
const SummaryPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
    <span style={{ fontSize: "9px", fontWeight: 600, color: PALETTE.textFaint, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}:</span>
    <span style={{ fontSize: "11px", fontWeight: 600, color: PALETTE.textStrong }}>{value}</span>
  </div>
);

// ── Step 1: Action type ──────────────────────────────────────────────────────
const Step1ActionType: React.FC<{ onSelect: (id: CalendarActionType) => void }> = ({ onSelect }) => (
  <div>
    <p style={{ fontSize: "13px", fontWeight: 600, color: PALETTE.textStrong, marginBottom: "4px" }}>What would you like to create?</p>
    <p style={{ fontSize: "11px", color: PALETTE.textFaint, marginBottom: "16px" }}>Choose the type of calendar entry</p>
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {CALENDAR_ACTIONS.map((action) => (
        <button
          key={action.id}
          onClick={() => onSelect(action.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "14px 18px",
            background: PALETTE.surface,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: "12px",
            cursor: "pointer",
            textAlign: "left",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = PALETTE.accentMed;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px rgba(212,87,26,0.08)`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = PALETTE.border;
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          <span style={{ fontSize: "22px", flexShrink: 0 }}>{action.icon}</span>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: PALETTE.textStrong }}>{action.label}</p>
            <p style={{ fontSize: "11px", color: PALETTE.textFaint, marginTop: "2px" }}>{action.description}</p>
          </div>
        </button>
      ))}
    </div>
  </div>
);

// ── Step 2: Client selection ─────────────────────────────────────────────────
const Step2Client: React.FC<{
  query: string;
  onQueryChange: (q: string) => void;
  clients: ClientRecord[];
  onSelect: (c: ClientRecord) => void;
}> = ({ query, onQueryChange, clients, onSelect }) => (
  <div>
    <p style={{ fontSize: "13px", fontWeight: 600, color: PALETTE.textStrong, marginBottom: "4px" }}>Select Client</p>
    <p style={{ fontSize: "11px", color: PALETTE.textFaint, marginBottom: "14px" }}>Search by name or phone number</p>

    {/* Search input */}
    <div style={{ position: "relative", marginBottom: "14px" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Start typing a name..."
        autoFocus
        style={{
          width: "100%",
          padding: "12px 16px",
          fontSize: "13px",
          border: `1px solid ${PALETTE.border}`,
          borderRadius: "10px",
          background: PALETTE.surfaceAlt,
          color: PALETTE.textStrong,
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => { (e.target as HTMLElement).style.borderColor = PALETTE.accentMed; }}
        onBlur={(e) => { (e.target as HTMLElement).style.borderColor = PALETTE.border; }}
      />
    </div>

    {/* Client list */}
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "320px", overflowY: "auto" }}>
      {clients.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: PALETTE.surface,
            border: `1px solid ${PALETTE.borderSoft}`,
            borderRadius: "10px",
            cursor: "pointer",
            textAlign: "left",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = PALETTE.surfaceAlt; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = PALETTE.surface; }}
        >
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: PALETTE.textStrong }}>{c.name}</p>
            {c.phone && <p style={{ fontSize: "10px", color: PALETTE.textFaint, marginTop: "2px" }}>{c.phone}</p>}
          </div>
          <div style={{ textAlign: "right" }}>
            {c.lastVisit && <p style={{ fontSize: "9px", color: PALETTE.textFaint }}>{c.lastVisit}</p>}
          </div>
        </button>
      ))}
      {clients.length === 0 && (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: PALETTE.textFaint, marginBottom: "8px" }}>No clients found</p>
          <button
            style={{
              padding: "8px 16px",
              fontSize: "11px",
              fontWeight: 600,
              color: PALETTE.accent,
              background: PALETTE.accentSoft,
              border: `1px solid ${PALETTE.accentMed}`,
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            + Add New Client
          </button>
        </div>
      )}
    </div>
  </div>
);

// ── Step 3: Department ───────────────────────────────────────────────────────
const Step3Department: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => (
  <div>
    <p style={{ fontSize: "13px", fontWeight: 600, color: PALETTE.textStrong, marginBottom: "4px" }}>Select Department</p>
    <p style={{ fontSize: "11px", color: PALETTE.textFaint, marginBottom: "16px" }}>Choose the service area</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
      {DEPARTMENTS.map((dept) => (
        <button
          key={dept.id}
          onClick={() => onSelect(dept.id)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            padding: "24px 16px",
            background: PALETTE.surface,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: "14px",
            cursor: "pointer",
            transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = PALETTE.accentMed;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px rgba(212,87,26,0.10)`;
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = PALETTE.border;
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
            (e.currentTarget as HTMLElement).style.transform = "none";
          }}
        >
          <span style={{ fontSize: "32px" }}>{dept.icon}</span>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: PALETTE.textStrong }}>{dept.label}</p>
            <p style={{ fontSize: "10px", color: PALETTE.textFaint, marginTop: "4px" }}>{dept.description}</p>
          </div>
        </button>
      ))}
    </div>
  </div>
);

// ── Step 4: Category (visual cards) ──────────────────────────────────────────
const Step4Category: React.FC<{
  categories: ServiceCategory[];
  onSelect: (id: string) => void;
}> = ({ categories, onSelect }) => (
  <div>
    <p style={{ fontSize: "13px", fontWeight: 600, color: PALETTE.textStrong, marginBottom: "4px" }}>Select Category</p>
    <p style={{ fontSize: "11px", color: PALETTE.textFaint, marginBottom: "16px" }}>Choose a service category</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          style={{
            display: "flex",
            flexDirection: "column",
            background: PALETTE.surface,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: "14px",
            overflow: "hidden",
            cursor: "pointer",
            textAlign: "left",
            transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = PALETTE.accentMed;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px rgba(212,87,26,0.10)`;
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = PALETTE.border;
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
            (e.currentTarget as HTMLElement).style.transform = "none";
          }}
        >
          <div
            style={{
              height: "100px",
              background: `url(${cat.image}) center/cover no-repeat`,
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(10,6,3,0.50) 100%)" }} />
          </div>
          <div style={{ padding: "12px 14px" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: PALETTE.textStrong }}>{cat.label}</p>
            <p style={{ fontSize: "10px", color: PALETTE.textFaint, marginTop: "3px" }}>
              {cat.serviceCount} services
            </p>
          </div>
        </button>
      ))}
    </div>
  </div>
);

// ── Step 5: Service selection ────────────────────────────────────────────────
const Step5Service: React.FC<{
  services: ServiceItem[];
  selected: ServiceItem | null;
  onSelect: (svc: ServiceItem) => void;
  onConfirm: () => void;
}> = ({ services, selected, onSelect, onConfirm }) => (
  <div>
    <p style={{ fontSize: "13px", fontWeight: 600, color: PALETTE.textStrong, marginBottom: "4px" }}>Select Service</p>
    <p style={{ fontSize: "11px", color: PALETTE.textFaint, marginBottom: "16px" }}>Choose the specific service to book</p>
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
      {services.map((svc) => {
        const isSelected = selected?.id === svc.id;
        return (
          <button
            key={svc.id}
            onClick={() => onSelect(svc)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: isSelected ? PALETTE.accentSoft : PALETTE.surface,
              border: `1.5px solid ${isSelected ? PALETTE.accent : PALETTE.border}`,
              borderRadius: "10px",
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isSelected && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill={PALETTE.accent} />
                  <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: PALETTE.textStrong }}>{svc.label}</p>
                  {svc.popular && (
                    <span style={{ fontSize: "8px", fontWeight: 700, color: PALETTE.accent, background: PALETTE.accentSoft, borderRadius: "4px", padding: "1px 5px", letterSpacing: "0.04em" }}>
                      POPULAR
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "10px", color: PALETTE.textFaint, marginTop: "2px" }}>
                  {svc.durationMin} min
                </p>
              </div>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: isSelected ? PALETTE.accent : PALETTE.textSoft }}>
              ${svc.price}
            </span>
          </button>
        );
      })}
    </div>

    {/* Confirm button */}
    {selected && (
      <button
        onClick={onConfirm}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "13px",
          fontWeight: 700,
          color: "#fff",
          background: `linear-gradient(135deg, ${PALETTE.accent} 0%, #A83A0A 100%)`,
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(212,87,26,0.28)",
        }}
      >
        Book {selected.label} · {selected.durationMin} min · ${selected.price}
      </button>
    )}
  </div>
);
