import React, { useMemo, useState } from "react";
import { SiteThemeProvider, useSiteColors } from "../../contexts/SiteTheme";

const ACCESS_CODE = "2009";
const SESSION_KEY = "spectra_story_unlocked";

function hasUnlockedAccess(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

interface InternalRouteGateProps {
  children: React.ReactNode;
}

const GateInner: React.FC<InternalRouteGateProps> = ({ children }) => {
  const c = useSiteColors();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const authorized = useMemo(() => hasUnlockedAccess(), []);

  if (authorized) return <>{children}</>;

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center px-4 sm:px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      style={{ background: c.bg.page }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 sm:p-8 text-center shadow-2xl"
        style={{
          background: c.bg.cardSolid,
          border: `1px solid ${c.border.medium}`,
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: c.text.muted }}>
          Internal Access
        </p>
        <h1 className="mt-2 text-2xl font-bold" style={{ color: c.text.primary }}>
          Enter Access Code
        </h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: c.text.secondary }}>
          Unlock the internal Spectra origin archive.
        </p>

        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={code}
          onChange={(e) => {
            const digits = e.currentTarget.value.replace(/\D/g, "");
            setCode(digits);
            if (error) setError("");
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (code === ACCESS_CODE) {
              sessionStorage.setItem(SESSION_KEY, "1");
              window.location.reload();
              return;
            }
            setError("Incorrect code. Try again.");
          }}
          className="mt-6 w-full text-center tracking-[0.6em] text-2xl font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:ring-2"
          style={{
            background: c.bg.card,
            border: `1px solid ${error ? "rgba(239,68,68,0.45)" : c.border.medium}`,
            color: c.text.primary,
          }}
          placeholder="• • • •"
        />

        {error && (
          <p className="mt-3 text-xs text-red-500">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            if (code === ACCESS_CODE) {
              sessionStorage.setItem(SESSION_KEY, "1");
              window.location.reload();
              return;
            }
            setError("Incorrect code. Try again.");
          }}
          className="mt-6 w-full rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(to right, #EAB776, #B18059)",
            color: "#ffffff",
          }}
        >
          Unlock
        </button>
      </div>
    </div>
  );
};

export const InternalRouteGate: React.FC<InternalRouteGateProps> = ({
  children,
}) => (
  <SiteThemeProvider>
    <GateInner>{children}</GateInner>
  </SiteThemeProvider>
);
