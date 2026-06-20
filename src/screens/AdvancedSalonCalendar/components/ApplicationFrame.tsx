import React from "react";
import { PALETTE } from "../mockData";

interface Props {
  children: React.ReactNode;
}

export const ApplicationFrame: React.FC<Props> = ({ children }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      borderRadius: "16px",
      overflow: "hidden",
      border: `1px solid ${PALETTE.border}`,
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 16px 64px rgba(20,12,4,0.14), 0 4px 16px rgba(20,12,4,0.08)",
      background: PALETTE.bg,
    }}
  >
    {/* Browser chrome */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        height: "40px",
        gap: "14px",
        paddingInline: "18px",
        background: PALETTE.surface,
        borderBottom: `1px solid ${PALETTE.border}`,
      }}
    >
      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        {(["#ff5f57", "#febc2e", "#28c840"] as const).map((c) => (
          <span
            key={c}
            style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, display: "block" }}
          />
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "4px 14px",
            borderRadius: "100px",
            background: PALETTE.surfaceAlt,
            border: `1px solid ${PALETTE.border}`,
            width: "min(56%, 280px)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <rect x="5" y="11" width="14" height="9" rx="2" fill="rgba(20,12,4,0.28)" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="rgba(20,12,4,0.28)" strokeWidth="2" fill="none" />
          </svg>
          <span
            style={{
              fontSize: "11px",
              color: PALETTE.textSoft,
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            app.spectra-salon.com/calendar
          </span>
        </div>
      </div>
      <div style={{ width: "42px", flexShrink: 0 }} aria-hidden />
    </div>
    {/* Content */}
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  </div>
);
