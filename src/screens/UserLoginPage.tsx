import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, LockKeyhole, Phone, ShieldCheck } from "lucide-react";
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

function shouldUseLocalDemoFallback(err: unknown): boolean {
  if (err instanceof SyntaxError) return true;
  if (err instanceof TypeError) return true;
  if (!(err instanceof Error)) return false;
  return /Unexpected token|not valid JSON|Failed to fetch|NetworkError/i.test(err.message);
}

const UserLoginInner: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useSiteTheme();
  const c = useSiteColors();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = phone.trim().length > 0 && password.length > 0 && !loading;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    try {
      let result: LoginResponse;
      try {
        result = await loginSalonUser(phone.trim(), password);
      } catch (err) {
        // When the app is served directly by Vite on localhost:3000, Netlify
        // Functions may be unavailable and Vite may return HTML instead of JSON.
        // Do not mask real 401/403 login responses as a tokenless demo session.
        if (isFastLocalDemo() && shouldUseLocalDemoFallback(err)) {
          result = localDemoLogin();
        } else {
          throw err;
        }
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

        <section className={`grid w-full max-w-5xl overflow-hidden rounded-[34px] border shadow-[0_28px_90px_rgba(55,36,28,0.18)] lg:grid-cols-[0.95fr_1.05fr] ${
          isDark ? "border-white/[0.12] bg-black/60" : "border-[#EBDDD2] bg-[#FFF8F0]/92"
        }`}>
          <div className={`hidden p-8 lg:block ${isDark ? "bg-white/[0.04]" : "bg-white/45"}`}>
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
                בלוקל, הכניסה משתמשת ב־Salon Look לצורך בדיקת המוצר. בפרודקשן נחבר הזמנה / איפוס סיסמה ייחודי לכל משתמש.
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
