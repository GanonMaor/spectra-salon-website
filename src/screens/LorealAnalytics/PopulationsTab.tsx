import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Population, QualityConfig, DEFAULT_QUALITY_CONFIG, QUALITY_COLOR_CLASSES, EMPTY_FILTER, AnalyticsFilter,
} from "./types";
import {
  analyticsRequest, israelRawRows, availableMonths, UserDetail,
  fmtNumber, ALL_COMPANIES, SERIES_PRESETS, ALL_SERVICE_TYPES, SERVICE_LABELS, ACCESS_CODE,
} from "./data";
import { computeUserQualityScore } from "./qualityScore";

// ── Shared UI helpers ───────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
}

function QualityBadge({ score, color }: { score: number; color: string }) {
  const cls = QUALITY_COLOR_CLASSES[color as keyof typeof QUALITY_COLOR_CLASSES] || QUALITY_COLOR_CLASSES.gray;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls.bg} ${cls.text} ${cls.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cls.dot}`} />
      {score}
    </span>
  );
}

// ── Types ───────────────────────────────────────────────────────────
interface Props {
  allUserDetails: UserDetail[];
}

interface MemberQuality {
  userId: string;
  score: number;
  color: string;
  presenceRatio: number;
  consistencyRatio: number;
  activeMonths: number;
  totalPossibleMonths: number;
}

// ── Default window ──────────────────────────────────────────────────
const defaultWindowStart = availableMonths.length > 0 ? availableMonths[0].label : "Jan 2024";
const defaultWindowEnd   = availableMonths.length > 0 ? availableMonths[availableMonths.length - 1].label : "Jan 2025";

// ── Component ───────────────────────────────────────────────────────
export default function PopulationsTab({ allUserDetails }: Props) {
  const [populations, setPopulations] = useState<Population[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Selected / expanded population
  const [activePopId, setActivePopId] = useState<number | null>(null);
  const [members, setMembers]         = useState<string[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // New population form
  const [showForm, setShowForm]     = useState(false);
  const [formName, setFormName]     = useState("");
  const [formDesc, setFormDesc]     = useState("");
  const [formWinStart, setFormWinStart] = useState(defaultWindowStart);
  const [formWinEnd, setFormWinEnd]     = useState(defaultWindowEnd);
  const [saving, setSaving]         = useState(false);

  // Member management
  const [memberSearch, setMemberSearch] = useState("");
  const [addingUser, setAddingUser]   = useState<string | null>(null);

  // Quality config editor
  const [showQualityEditor, setShowQualityEditor] = useState(false);
  const [qc, setQc] = useState<QualityConfig>(DEFAULT_QUALITY_CONFIG);
  const [qcSaving, setQcSaving] = useState(false);

  const activePop = useMemo(() => populations.find((p) => p.id === activePopId) || null, [populations, activePopId]);

  // ── API ────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const d = await analyticsRequest("/populations");
      setPopulations(d.populations || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const loadMembers = useCallback(async (id: number) => {
    setMembersLoading(true);
    try {
      const d = await analyticsRequest(`/populations/${id}/members`);
      setMembers(d.members || []);
    } catch {}
    finally { setMembersLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (activePopId !== null) {
      loadMembers(activePopId);
      const pop = populations.find((p) => p.id === activePopId);
      if (pop?.quality_config) setQc({ ...DEFAULT_QUALITY_CONFIG, ...pop.quality_config });
      else setQc(DEFAULT_QUALITY_CONFIG);
    } else {
      setMembers([]);
    }
  }, [activePopId, populations, loadMembers]);

  // ── Quality scores for current members ───────────────────────────
  const memberScores: MemberQuality[] = useMemo(() => {
    if (!activePop || !members.length) return [];
    const winStart = activePop.eligibility_window_start || defaultWindowStart;
    const winEnd   = activePop.eligibility_window_end   || defaultWindowEnd;
    return members.map((uid) => {
      const userRows = israelRawRows.filter((r) => r.uid === uid);
      const qs = computeUserQualityScore(userRows, winStart, winEnd, activePop.quality_config);
      return { userId: uid, ...qs };
    });
  }, [activePop, members]);

  // ── Member search ─────────────────────────────────────────────────
  const memberSearchResults = useMemo(() => {
    const term = memberSearch.toLowerCase();
    const results = term
      ? allUserDetails.filter((u) => u.userId.toLowerCase().includes(term) || u.city.toLowerCase().includes(term))
      : allUserDetails;
    return results.slice(0, 30).filter((u) => !members.includes(u.userId));
  }, [memberSearch, allUserDetails, members]);

  // ── Handlers ──────────────────────────────────────────────────────
  const createPopulation = async () => {
    if (!formName.trim()) { setSaveError("שם אוכלוסייה הוא שדה חובה"); return; }
    setSaving(true); setSaveError(null);
    try {
      await analyticsRequest("/populations", {
        method: "POST",
        body: { name: formName.trim(), description: formDesc.trim() || null, eligibility_window_start: formWinStart, eligibility_window_end: formWinEnd },
      });
      await load();
      setShowForm(false); setFormName(""); setFormDesc("");
    } catch (e: any) { setSaveError(e.message); }
    finally { setSaving(false); }
  };

  const deletePop = async (id: number) => {
    if (!confirm("למחוק את האוכלוסייה? פעולה זו אינה הפיכה.")) return;
    try {
      await analyticsRequest(`/populations/${id}`, { method: "DELETE" });
      if (activePopId === id) setActivePopId(null);
      await load();
    } catch (e: any) { setError(e.message); }
  };

  const addMember = async (userId: string) => {
    if (!activePopId) return;
    setAddingUser(userId);
    try {
      await analyticsRequest(`/populations/${activePopId}/members`, { method: "POST", body: { user_ids: [userId] } });
      setMembers((prev) => [...prev, userId]);
      setPopulations((prev) => prev.map((p) => p.id === activePopId ? { ...p, member_count: p.member_count + 1 } : p));
    } catch (e: any) { setError(e.message); }
    finally { setAddingUser(null); }
  };

  const removeMember = async (userId: string) => {
    if (!activePopId) return;
    try {
      await analyticsRequest(`/populations/${activePopId}/members/${encodeURIComponent(userId)}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((u) => u !== userId));
      setPopulations((prev) => prev.map((p) => p.id === activePopId ? { ...p, member_count: Math.max(0, p.member_count - 1) } : p));
    } catch (e: any) { setError(e.message); }
  };

  const saveQualityConfig = async () => {
    if (!activePopId) return;
    setQcSaving(true);
    try {
      await analyticsRequest(`/populations/${activePopId}`, { method: "PATCH", body: { quality_config: qc } });
      setPopulations((prev) => prev.map((p) => p.id === activePopId ? { ...p, quality_config: qc } : p));
      setShowQualityEditor(false);
    } catch (e: any) { setError(e.message); }
    finally { setQcSaving(false); }
  };

  const updateWindow = async (start: string, end: string) => {
    if (!activePopId) return;
    try {
      await analyticsRequest(`/populations/${activePopId}`, {
        method: "PATCH",
        body: { eligibility_window_start: start, eligibility_window_end: end },
      });
      setPopulations((prev) => prev.map((p) =>
        p.id === activePopId ? { ...p, eligibility_window_start: start, eligibility_window_end: end } : p
      ));
    } catch {}
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">אוכלוסיות</h2>
          <p className="text-sm text-gray-500 mt-0.5">קבוצות לקוחות יציבות ומוגדרות לניתוח</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          אוכלוסייה חדשה
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* New population form */}
      {showForm && (
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-800 text-base">צור אוכלוסייה חדשה</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">שם האוכלוסייה</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder='דוגמה: כשרים ינואר 24 – ינואר 25'
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">תיאור (אופציונלי)</label>
              <input
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="תיאור קצר"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">חלון זכאות (Eligibility Window)</label>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={formWinStart}
                onChange={(e) => setFormWinStart(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                {availableMonths.map((m) => <option key={m.label} value={m.label}>{m.label}</option>)}
              </select>
              <span className="text-gray-400 text-sm">עד</span>
              <select
                value={formWinEnd}
                onChange={(e) => setFormWinEnd(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                {availableMonths.map((m) => <option key={m.label} value={m.label}>{m.label}</option>)}
              </select>
            </div>
            <p className="text-xs text-gray-400 mt-1">חלון הזכאות קובע לאיזו תקופה יחושב ציון איכות השימוש</p>
          </div>
          {saveError && <p className="text-xs text-red-500">{saveError}</p>}
          <div className="flex gap-2">
            <button
              onClick={createPopulation}
              disabled={saving || !formName.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {saving ? "שומר..." : "שמור אוכלוסייה"}
            </button>
            <button
              onClick={() => { setShowForm(false); setSaveError(null); }}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Populations list */}
      {loading ? <Spinner /> : (
        <>
          {populations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">אין אוכלוסיות שמורות עדיין</p>
              <p className="text-gray-400 text-sm mt-1">צור את האוכלוסייה הראשונה שלך</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {populations.map((pop) => (
                <div
                  key={pop.id}
                  className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${activePopId === pop.id ? "border-indigo-400 ring-1 ring-indigo-200" : "border-gray-100 hover:border-gray-200"}`}
                >
                  {/* Card header */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{pop.name}</h3>
                        {pop.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{pop.description}</p>}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372..." /></svg>
                            {fmtNumber(Number(pop.member_count))} חברים
                          </span>
                          {pop.eligibility_window_start && (
                            <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                              {pop.eligibility_window_start} → {pop.eligibility_window_end}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setActivePopId(activePopId === pop.id ? null : pop.id)}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="נהל אוכלוסייה"
                        >
                          <svg className={`w-4 h-4 transition-transform ${activePopId === pop.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deletePop(pop.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="מחק אוכלוסייה"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded panel */}
                  {activePopId === pop.id && (
                    <div className="border-t border-gray-100 px-4 sm:px-5 pb-5 space-y-4 pt-4">

                      {/* Eligibility window editor */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">חלון זכאות</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <select
                            value={activePop?.eligibility_window_start || defaultWindowStart}
                            onChange={(e) => updateWindow(e.target.value, activePop?.eligibility_window_end || defaultWindowEnd)}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          >
                            {availableMonths.map((m) => <option key={m.label} value={m.label}>{m.label}</option>)}
                          </select>
                          <span className="text-gray-400 text-xs">עד</span>
                          <select
                            value={activePop?.eligibility_window_end || defaultWindowEnd}
                            onChange={(e) => updateWindow(activePop?.eligibility_window_start || defaultWindowStart, e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          >
                            {availableMonths.map((m) => <option key={m.label} value={m.label}>{m.label}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Quality config */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ציון איכות שימוש</p>
                          <button
                            onClick={() => setShowQualityEditor(!showQualityEditor)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            {showQualityEditor ? "סגור עריכה" : "ערוך הגדרות"}
                          </button>
                        </div>
                        {/* Badge legend */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {(["green","amber","red","gray"] as const).map((c) => {
                            const cls = QUALITY_COLOR_CLASSES[c];
                            return (
                              <span key={c} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cls.bg} ${cls.text} ${cls.border}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cls.dot}`} />
                                {cls.label}
                              </span>
                            );
                          })}
                        </div>
                        {showQualityEditor && (
                          <div className="bg-gray-50 rounded-xl p-3 space-y-3 border border-gray-100">
                            <div>
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>משקל נוכחות</span>
                                <span>{Math.round(qc.presenceWeight * 100)}%</span>
                              </div>
                              <input
                                type="range" min={0} max={100} value={Math.round(qc.presenceWeight * 100)}
                                onChange={(e) => {
                                  const v = parseInt(e.target.value, 10) / 100;
                                  setQc((p) => ({ ...p, presenceWeight: v, consistencyWeight: Math.round((1 - v) * 100) / 100 }));
                                }}
                                className="w-full accent-indigo-500"
                              />
                              <p className="text-[10px] text-gray-400 mt-0.5">עקביות: {Math.round(qc.consistencyWeight * 100)}%</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">סף ירוק (≥)</label>
                                <input
                                  type="number" min={0} max={100} value={qc.greenMinScore}
                                  onChange={(e) => setQc((p) => ({ ...p, greenMinScore: parseInt(e.target.value, 10) }))}
                                  className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">סף כתום (≥)</label>
                                <input
                                  type="number" min={0} max={100} value={qc.amberMinScore}
                                  onChange={(e) => setQc((p) => ({ ...p, amberMinScore: parseInt(e.target.value, 10) }))}
                                  className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">סטייה מקסימלית טובה (%)</label>
                                <input
                                  type="number" min={0} max={100} value={Math.round(qc.goodDeviationPct * 100)}
                                  onChange={(e) => setQc((p) => ({ ...p, goodDeviationPct: parseInt(e.target.value, 10) / 100 }))}
                                  className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">סטייה מקסימלית חלקית (%)</label>
                                <input
                                  type="number" min={0} max={100} value={Math.round(qc.partialDeviationPct * 100)}
                                  onChange={(e) => setQc((p) => ({ ...p, partialDeviationPct: parseInt(e.target.value, 10) / 100 }))}
                                  className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                />
                              </div>
                            </div>
                            <button
                              onClick={saveQualityConfig}
                              disabled={qcSaving}
                              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium"
                            >
                              {qcSaving ? "שומר..." : "שמור הגדרות"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Members */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">חברי האוכלוסייה ({fmtNumber(members.length)})</p>
                        {membersLoading ? <Spinner /> : (
                          <div className="space-y-2">
                            {/* Current members */}
                            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                              {memberScores.length === 0 && members.length === 0 && (
                                <p className="text-xs text-gray-400 py-2">אין חברים באוכלוסייה זו. הוסף לקוחות מהחיפוש למטה.</p>
                              )}
                              {memberScores.map((m) => {
                                const u = allUserDetails.find((u) => u.userId === m.userId);
                                return (
                                  <div key={m.userId} className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg hover:bg-gray-50 group">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <QualityBadge score={m.score} color={m.color} />
                                      <span className="text-xs font-medium text-gray-700 truncate">{m.userId}</span>
                                      {u && <span className="text-[10px] text-gray-400 flex-shrink-0">{u.city}</span>}
                                    </div>
                                    <button
                                      onClick={() => removeMember(m.userId)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 flex-shrink-0"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                );
                              })}
                              {/* Members without quality info (before window computed) */}
                              {memberScores.length === 0 && members.length > 0 && members.map((uid) => (
                                <div key={uid} className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg hover:bg-gray-50 group">
                                  <span className="text-xs font-medium text-gray-700">{uid}</span>
                                  <button onClick={() => removeMember(uid)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                            {/* Add member search */}
                            <div className="border-t border-gray-100 pt-2">
                              <input
                                type="text"
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                placeholder="חפש לקוח להוספה..."
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                              />
                              {memberSearch && (
                                <div className="mt-1.5 max-h-32 overflow-y-auto space-y-0.5">
                                  {memberSearchResults.length === 0 && (
                                    <p className="text-[10px] text-gray-400 px-2 py-1">לא נמצאו תוצאות</p>
                                  )}
                                  {memberSearchResults.map((u) => (
                                    <div key={u.userId} className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-indigo-50 group cursor-pointer" onClick={() => addMember(u.userId)}>
                                      <div>
                                        <span className="text-xs font-medium text-gray-700">{u.userId}</span>
                                        <span className="text-[10px] text-gray-400 mr-1">{u.city}</span>
                                      </div>
                                      <button className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium" disabled={addingUser === u.userId}>
                                        {addingUser === u.userId ? "..." : "+ הוסף"}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quality distribution summary */}
                      {memberScores.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">התפלגות ציוני איכות</p>
                          <div className="flex gap-2 flex-wrap">
                            {(["green","amber","red","gray"] as const).map((c) => {
                              const count = memberScores.filter((m) => m.color === c).length;
                              if (count === 0) return null;
                              const cls = QUALITY_COLOR_CLASSES[c];
                              return (
                                <div key={c} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium ${cls.bg} ${cls.text} ${cls.border}`}>
                                  <span className={`w-2 h-2 rounded-full ${cls.dot}`} />
                                  {cls.label}: {count}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
