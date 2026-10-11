import React from "react";
import { FlaskConical } from "lucide-react";
import { useMarketing } from "../MarketingProvider";
import { actorLabel } from "../permissions";
import { formatDateTime } from "../time";
import type { MarketingActorRole } from "../types";
import { useMarketingCopy } from "./helpers";
import { fmt, useMk } from "./ui";

const ROLES: MarketingActorRole[] = ["owner", "manager_publisher", "manager_editor", "viewer"];

/** Permanent: this preview never sends real messages, in any mode. */
export const DemoBanner: React.FC = () => {
  const { m, lang } = useMarketingCopy();
  const mk = useMk();
  const { mode, now, timezone, state, actions } = useMarketing();

  return (
    <div
      role="note"
      aria-label={m.banner.title}
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border px-3.5 py-2.5 ${
        mk.isDark ? "border-[#D7897F]/35 bg-[#D7897F]/10" : "border-[#D7897F]/40 bg-[#FBEDEA]"
      }`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${mk.isDark ? "bg-[#D7897F]/20 text-[#F2B5AD]" : "bg-white text-[#B05F57]"}`}>
        <FlaskConical className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 basis-[220px]">
        <p className={`text-[13px] font-bold ${mk.isDark ? "text-white" : "text-[#7A332D]"}`}>{m.banner.title}</p>
        <p className={`text-[11px] leading-4 ${mk.isDark ? "text-white/60" : "text-[#8E5A52]"}`}>
          {mode === "demo"
            ? fmt(m.banner.demoData, { time: formatDateTime(now, timezone, lang) })
            : m.banner.salonData}
          {" · "}
          {m.banner.simulated}
        </p>
      </div>
      {mode === "demo" && (
        <label className="ms-auto flex items-center gap-1.5">
          <span className={`text-[11px] font-semibold ${mk.isDark ? "text-white/60" : "text-[#8E5A52]"}`}>{m.mode.actingAs}</span>
          <select
            value={state.actingRole ?? "owner"}
            onChange={(event) => actions.setActingRole(event.target.value as MarketingActorRole)}
            className={`h-8 max-w-[200px] rounded-lg px-2 text-[11.5px] font-semibold outline-none ${mk.focus} ${
              mk.isDark ? "border border-white/15 bg-white/10 text-white" : "border border-[#E3B0AA] bg-white text-[#141414]"
            }`}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {actorLabel(role, lang)}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
};
