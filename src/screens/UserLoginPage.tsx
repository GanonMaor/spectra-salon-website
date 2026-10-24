import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, LockKeyhole, Phone, Search, ShieldCheck, Users } from "lucide-react";
import { Navigation } from "../components/Navigation";
import { SiteThemeProvider, useSiteColors, useSiteTheme } from "../contexts/SiteTheme";
import { setSalonSessionToken } from "./SalonCRM/data/salonSession";

interface LoginResponse {
  token: string | null;
  salonId?: string;
  userId?: string;
  role?: string;
  exp?: number;
  devMode?: boolean;
  message?: string;
}

interface LoginErrorPayload {
  error?: string | {
    code?: string;
    message?: string;
  };
}

interface LoginProfile {
  id: string;
  userId: string;
  displayName: string;
  identifier: string;
  email: string | null;
  phone: string | null;
  salonId: string;
  salonName: string;
  role: string;
  isDefault: boolean;
}

interface LoginProfilesResponse {
  profiles?: LoginProfile[];
  error?: string;
}

const PROFILE_DIRECTORY_CODE_KEY = "spectra.profileDirectoryAccessCode";

function safeRedirectTarget(raw: string | null): string {
  // Only allow same-app CRM paths to avoid open-redirect via the query param.
  if (raw && raw.startsWith("/crm")) return raw;
  return "/crm/setup";
}

function hebrewLoginError(message: string): string {
  if (
    message.includes("INVALID_LOGIN") ||
    message.includes("Invalid phone/email or password") ||
    message.includes("Unauthorized")
  ) {
    return "הטלפון/אימייל או הסיסמה אינם נכונים, או שאין לך הרשאה לסלון פעיל.";
  }
  if (
    message.includes("PASSWORD_LOGIN_NOT_CONFIGURED") ||
    message.includes("Salon password login is not configured")
  ) {
    return "הכניסה עדיין לא מוגדרת בפרודקשן. צריך להגדיר סיסמת פיילוט ב-Netlify.";
  }
  if (message.includes("PASSWORD_LOGIN_NOT_PROVISIONED") || message.includes("Not Implemented")) {
    return "גרסת ההתחברות החדשה עדיין לא עלתה לאתר הפעיל. צריך לבצע deploy מחדש.";
  }
  if (message.includes("NO_ACTIVE_MEMBERSHIP")) {
    return "המשתמש קיים אבל אינו מקושר לסלון פעיל. צריך לשייך אותו לסלון.";
  }
  if (message.includes("AMBIGUOUS_MEMBERSHIP")) {
    return "המשתמש מקושר לכמה סלונים פעילים ללא סלון ברירת מחדל יחיד. צריך לבחור סלון.";
  }
  if (message.includes("SALON_SESSION_SECRET_NOT_CONFIGURED")) {
    return "הכניסה לפרודקשן אינה מוגדרת (חסר SALON_SESSION_SECRET). צריך להגדיר ב-Netlify.";
  }
  return message || "ההתחברות נכשלה. נסה שוב בעוד רגע.";
}

async function loginSalonUser(phone: string, password: string): Promise<LoginResponse> {
  const response = await fetch("/.netlify/functions/salon-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as LoginErrorPayload | null;
    const rawError = payload?.error;
    const detail = typeof rawError === "string"
      ? rawError
      : [rawError?.code, rawError?.message].filter(Boolean).join(": ") || response.statusText;
    throw new Error(hebrewLoginError(detail));
  }

  return (await response.json()) as LoginResponse;
}

async function fetchLoginProfiles(accessCode: string): Promise<LoginProfile[]> {
  const response = await fetch("/.netlify/functions/salon-login-profiles", {
    method: "GET",
    headers: { "X-Access-Code": accessCode },
  });
  const payload = (await response.json().catch(() => null)) as LoginProfilesResponse | null;
  if (!response.ok) {
    throw new Error(payload?.error || "לא ניתן לטעון את רשימת הפרופילים.");
  }
  return Array.isArray(payload?.profiles) ? payload.profiles : [];
}

function isFastLocalDemo(): boolean {
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

function localDemoLogin(): LoginResponse {
  return {
    token: null,
    salonId: "salon-look",
    userId: "dev-local-user",
    devMode: true,
    message: "Local Vite login: using Salon Look dev tenant.",
  };
}

const UserLoginInner: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useSiteTheme();
  const c = useSiteColors();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<LoginProfile[]>([]);
  const [profileCode, setProfileCode] = useState("");
  const [profileSearch, setProfileSearch] = useState("");
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState("");
  const [directoryUnlocked, setDirectoryUnlocked] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const canSubmit = phone.trim().length > 0 && password.length > 0 && !loading;

  const loadProfiles = useCallback(async (accessCode: string) => {
    const code = accessCode.trim();
    if (!code) return;
    setProfilesLoading(true);
    setProfilesError("");
    try {
      const result = await fetchLoginProfiles(code);
      setProfiles(result);
      setDirectoryUnlocked(true);
      window.sessionStorage.setItem(PROFILE_DIRECTORY_CODE_KEY, code);
    } catch (err) {
      setProfiles([]);
      setDirectoryUnlocked(false);
      window.sessionStorage.removeItem(PROFILE_DIRECTORY_CODE_KEY);
      setProfilesError(err instanceof Error ? err.message : "טעינת הפרופילים נכשלה.");
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedCode = window.sessionStorage.getItem(PROFILE_DIRECTORY_CODE_KEY);
    if (!savedCode) return;
    setProfileCode(savedCode);
    void loadProfiles(savedCode);
  }, [loadProfiles]);

  const visibleProfiles = useMemo(() => {
    const query = profileSearch.trim().toLowerCase();
    if (!query) return profiles;
    return profiles.filter((profile) =>
      [profile.displayName, profile.identifier, profile.salonName, profile.role]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [profileSearch, profiles]);

  const selectProfile = (profile: LoginProfile) => {
    setSelectedProfileId(profile.id);
    setPhone(profile.identifier);
    setPassword("");
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    try {
      let result: LoginResponse;
      if (isFastLocalDemo() && !selectedProfileId) {
        // Local previews intentionally use the seeded Salon Look workspace and
        // never depend on Netlify Functions unless an explicit profile was
        // selected from the internal directory.
        result = localDemoLogin();
      } else {
        result = await loginSalonUser(phone.trim(), password);
      }

      setSalonSessionToken(result.token);
      window.localStorage.setItem("spectra.salonLoginState", JSON.stringify({
        salonId: result.salonId ?? "salon-look",
        userId: result.userId ?? "dev-local-user",
        role: result.role ?? "owner",
        exp: result.exp,
        devMode: Boolean(result.devMode),
        loggedInAt: new Date().toISOString(),
      }));
      const redirect = safeRedirectTarget(new URLSearchParams(window.location.search).get("redirect"));
      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] overflow-hidden" style={{ background: c.bg.page }}>
      <Navigation />
      <main className="relative flex min-h-[100dvh] items-center justify-center px-4 pb-10 pt-24">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-35"
          style={{ backgroundImage: "url('/salooon0000.jpg')" }}
        />
        <div className="absolute inset-0 -z-10" style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(0,0,0,0.82), rgba(32,24,20,0.72))"
            : "linear-gradient(135deg, rgba(255,248,240,0.92), rgba(248,225,209,0.86), rgba(217,232,219,0.84))",
        }} />

        <section className={`grid w-full max-w-[1480px] overflow-hidden rounded-[34px] border shadow-[0_28px_90px_rgba(55,36,28,0.18)] lg:grid-cols-[0.9fr_1.1fr] xl:grid-cols-[0.9fr_0.8fr_1.1fr] ${
          isDark ? "border-white/[0.12] bg-black/60" : "border-[#EBDDD2] bg-[#FFF8F0]/92"
        }`}>
          <aside
            dir="rtl"
            className={`flex min-h-[420px] flex-col border-b p-5 sm:p-6 lg:border-b-0 lg:border-l ${
              isDark ? "border-white/[0.10] bg-black/35" : "border-[#EBDDD2] bg-[#FFF3E8]/85"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`text-[11px] font-black uppercase tracking-[0.18em] ${isDark ? "text-white/40" : "text-[#8F7E72]"}`}>
                  Internal profiles
                </p>
                <h2 className={`mt-1 text-xl font-black ${isDark ? "text-white" : "text-[#141414]"}`}>
                  פרופילים במערכת
                </h2>
              </div>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#96C7B3] text-[#141414]">
                <Users className="h-5 w-5" />
              </div>
            </div>

            {!directoryUnlocked ? (
              <form
                className="mt-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  void loadProfiles(profileCode);
                }}
              >
                <p className={`text-[12px] font-semibold leading-5 ${isDark ? "text-white/50" : "text-[#7E7066]"}`}>
                  הרשימה כוללת שמות משתמש פעילים בלבד. סיסמאות נשמרות בצד השרת ואינן מוצגות.
                </p>
                <label className="mt-4 block">
                  <span className={`mb-2 block text-[11px] font-black ${isDark ? "text-white/60" : "text-[#141414]"}`}>
                    קוד גישה פנימי
                  </span>
                  <div className={`flex h-11 items-center gap-2 rounded-2xl border px-3 ${
                    isDark ? "border-white/[0.12] bg-white/[0.06] text-white" : "border-[#EBDDD2] bg-white text-[#141414]"
                  }`}>
                    <LockKeyhole className="h-4 w-4 text-[#7E7066]" />
                    <input
                      type="password"
                      value={profileCode}
                      onChange={(event) => setProfileCode(event.target.value)}
                      autoComplete="off"
                      className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-bold outline-none"
                      placeholder="••••••"
                    />
                  </div>
                </label>
                {profilesError && (
                  <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">
                    {profilesError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!profileCode.trim() || profilesLoading}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#141414] px-4 text-[12px] font-black text-white disabled:opacity-45"
                >
                  {profilesLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  פתיחת הרשימה
                </button>
              </form>
            ) : (
              <>
                <div className={`mt-5 flex h-10 items-center gap-2 rounded-2xl border px-3 ${
                  isDark ? "border-white/[0.12] bg-white/[0.06] text-white" : "border-[#EBDDD2] bg-white text-[#141414]"
                }`}>
                  <Search className="h-4 w-4 text-[#7E7066]" />
                  <input
                    value={profileSearch}
                    onChange={(event) => setProfileSearch(event.target.value)}
                    placeholder="חיפוש שם, סלון או משתמש"
                    className="h-full min-w-0 flex-1 bg-transparent text-[12px] font-bold outline-none placeholder:text-[#9A8B80]"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${isDark ? "text-white/45" : "text-[#7E7066]"}`}>
                    {visibleProfiles.length} מתוך {profiles.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      window.sessionStorage.removeItem(PROFILE_DIRECTORY_CODE_KEY);
                      setDirectoryUnlocked(false);
                      setProfiles([]);
                      setProfileCode("");
                      setSelectedProfileId(null);
                    }}
                    className="text-[10px] font-black text-[#B18059]"
                  >
                    נעילה
                  </button>
                </div>
                <div className="mt-3 max-h-[430px] space-y-2 overflow-y-auto pe-1">
                  {visibleProfiles.map((profile) => (
                    <button
                      type="button"
                      key={profile.id}
                      onClick={() => selectProfile(profile)}
                      className={`w-full rounded-2xl border p-3 text-right transition ${
                        selectedProfileId === profile.id
                          ? "border-[#D7897F] bg-[#D7897F]/12"
                          : isDark
                            ? "border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.08]"
                            : "border-[#EBDDD2] bg-white/75 hover:bg-white"
                      }`}
                    >
                      <span className={`block text-[13px] font-black ${isDark ? "text-white" : "text-[#141414]"}`}>
                        {profile.displayName}
                      </span>
                      <span className={`mt-0.5 block text-[10px] font-semibold ${isDark ? "text-white/45" : "text-[#7E7066]"}`}>
                        {profile.salonName} · {profile.role}
                      </span>
                      <span dir="ltr" className="mt-2 block truncate text-left font-mono text-[11px] text-[#B18059]">
                        {profile.identifier}
                      </span>
                    </button>
                  ))}
                  {visibleProfiles.length === 0 && (
                    <p className={`py-8 text-center text-[12px] font-semibold ${isDark ? "text-white/40" : "text-[#7E7066]"}`}>
                      לא נמצאו פרופילים.
                    </p>
                  )}
                </div>
              </>
            )}
          </aside>

          <div className={`hidden p-8 xl:block ${isDark ? "bg-white/[0.04]" : "bg-white/45"}`}>
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className={`text-[11px] font-black uppercase tracking-[0.28em] ${isDark ? "text-white/45" : "text-[#7E7066]"}`}>
                  Salon AI
                </p>
                <h1 className={`mt-4 text-4xl font-black leading-[0.95] tracking-[-0.06em] ${isDark ? "text-white" : "text-[#141414]"}`}>
                  כניסת משתמשים
                </h1>
                <p className={`mt-4 max-w-sm text-[14px] font-semibold leading-6 ${isDark ? "text-white/58" : "text-[#7E7066]"}`}>
                  כניסה מאובטחת לניהול היומן, המלאי, הלקוחות והגדרות הקטלוג של הסלון.
                </p>
              </div>
              <div className={`rounded-[26px] border p-4 ${isDark ? "border-white/[0.10] bg-white/[0.05]" : "border-[#EBDDD2] bg-[#FFF3E8]"}`}>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#96C7B3] text-[#141414]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`text-[13px] font-black ${isDark ? "text-white" : "text-[#141414]"}`}>
                      Tenant-safe session
                    </p>
                    <p className={`mt-0.5 text-[11px] font-semibold ${isDark ? "text-white/45" : "text-[#7E7066]"}`}>
                      salon_id נקבע בצד השרת בלבד.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-md">
              <div className="mb-8 text-center lg:text-start">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-3xl bg-[#D7897F] text-[#141414] lg:mx-0">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <h2 className={`text-2xl font-black tracking-[-0.04em] ${isDark ? "text-white" : "text-[#141414]"}`}>
                  התחברות למערכת
                </h2>
                <p className={`mt-2 text-[13px] font-semibold ${isDark ? "text-white/50" : "text-[#7E7066]"}`}>
                  הזן טלפון או אימייל וסיסמה כדי להיכנס לחשבון הסלון שלך.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className={`mb-2 block text-[12px] font-black ${isDark ? "text-white/65" : "text-[#141414]"}`}>
                    טלפון או אימייל
                  </span>
                  <div className={`flex h-12 items-center gap-3 rounded-2xl border px-4 ${isDark ? "border-white/[0.12] bg-white/[0.06] text-white" : "border-[#EBDDD2] bg-white text-[#141414]"}`}>
                    <Phone className="h-4 w-4 text-[#7E7066]" />
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      type="text"
                      inputMode="email"
                      autoComplete="username"
                      placeholder="050-0000000 או demo@salonos.ai"
                      className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-bold outline-none placeholder:text-[#9A8B80]"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className={`mb-2 block text-[12px] font-black ${isDark ? "text-white/65" : "text-[#141414]"}`}>
                    סיסמה
                  </span>
                  <div className={`flex h-12 items-center gap-3 rounded-2xl border px-4 ${isDark ? "border-white/[0.12] bg-white/[0.06] text-white" : "border-[#EBDDD2] bg-white text-[#141414]"}`}>
                    <LockKeyhole className="h-4 w-4 text-[#7E7066]" />
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-bold outline-none placeholder:text-[#9A8B80]"
                    />
                  </div>
                </label>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-bold text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#141414] px-5 text-[14px] font-black text-white transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                כניסה למערכת
              </button>

              <p className={`mt-4 text-center text-[11px] font-semibold leading-5 ${isDark ? "text-white/42" : "text-[#7E7066]"}`}>
                בחירת פרופיל ממלאת את שם המשתמש בלבד. את הסיסמה מזינים בשדה המאובטח והיא אינה נשמרת בדפדפן.
              </p>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

const UserLoginPage: React.FC = () => (
  <SiteThemeProvider>
    <UserLoginInner />
  </SiteThemeProvider>
);

export default UserLoginPage;
