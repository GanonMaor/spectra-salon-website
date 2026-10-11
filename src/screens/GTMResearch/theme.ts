/**
 * Admin Dashboard visual tokens, extracted so GTM Research can match
 * without editing AdminDashboard.tsx. Keep names and values identical.
 */

export function buildAdminTokens(isDark: boolean) {
  return {
    page:          isDark ? "bg-[#0a0a0f] text-white"                 : "bg-[#FAFAF8] text-[#1A1A1A]",
    sticky:        isDark ? "bg-[#0a0a0f]/80"                         : "bg-[#FAFAF8]/90",
    card:          isDark ? "bg-white/[0.03] border-white/[0.06]"     : "bg-white border-black/[0.08] shadow-sm",
    cardHover:     isDark ? "hover:bg-white/[0.05]"                    : "hover:bg-gray-50",
    subCard:       isDark ? "bg-white/[0.02] border-white/[0.06]"     : "bg-white/60 border-black/[0.06]",
    stickyBorder:  isDark ? "border-white/5"                           : "border-black/[0.06]",
    textPrimary:   isDark ? "text-white"                               : "text-[#1A1A1A]",
    text90:        isDark ? "text-white/90"                            : "text-[#1A1A1A]",
    textSec:       isDark ? "text-white/70"                            : "text-[#555555]",
    textMuted:     isDark ? "text-white/55"                            : "text-[#777777]",
    textFaint:     isDark ? "text-white/50"                            : "text-[#999999]",
    textDim:       isDark ? "text-white/15"                            : "text-[#CCCCCC]",
    border:        isDark ? "border-white/[0.06]"                      : "border-black/[0.08]",
    borderMed:     isDark ? "border-white/[0.08]"                      : "border-black/[0.10]",
    input:         isDark
      ? "bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/50 focus:border-indigo-500/50 focus:ring-indigo-500/20"
      : "bg-white border-black/[0.12] text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:border-indigo-400 focus:ring-indigo-400/20",
    select:        isDark ? "bg-white/[0.06] border-white/[0.1] text-white"          : "bg-white border-black/[0.10] text-[#1A1A1A]",
    selectBg:      isDark ? "#1a1a2e"                                  : "#ffffff",
    tabWrap:       isDark ? "bg-white/[0.04] border-white/[0.06]"     : "bg-black/[0.04] border-black/[0.06]",
    tabActive:     isDark ? "bg-white/[0.1] text-white shadow-sm"      : "bg-white text-[#1A1A1A] shadow-sm",
    tabInactive:   isDark ? "text-white/55 hover:text-white/70"         : "text-[#888888] hover:text-[#555555]",
    rowDivide:     isDark ? "divide-white/[0.03]"                      : "divide-black/[0.04]",
    rowHover:      isDark ? "hover:bg-white/[0.03]"                    : "hover:bg-black/[0.02]",
    filterPanel:   isDark ? "bg-white/[0.02] border-white/[0.06]"     : "bg-black/[0.02] border-black/[0.05]",
    tagActive:     isDark ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700",
    tagInactive:   isDark ? "bg-white/[0.03] border-white/[0.06] text-white/55 hover:text-white/70 hover:bg-white/[0.05]" : "bg-black/[0.03] border-black/[0.06] text-[#888] hover:text-[#555] hover:bg-black/[0.05]",
    filterActive:  isDark ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700",
    filterInactive:isDark ? "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70" : "bg-white border-black/[0.08] text-[#888] hover:text-[#555]",
    expandRow:     isDark ? "bg-white/[0.02]"                          : "bg-black/[0.02]",
    toggleBtn:     isDark ? "bg-white/[0.06] hover:bg-white/[0.12] text-white/55 hover:text-white/70" : "bg-black/[0.04] hover:bg-black/[0.08] text-black/55 hover:text-black/70",
    spinner:       isDark ? "border-indigo-500/30 border-t-indigo-500" : "border-indigo-400/40 border-t-indigo-500",
    freshnessBg:   isDark ? "bg-white/[0.02] border-white/[0.06]"     : "bg-[#EAB776]/8 border-[#EAB776]/20",
    freshnessDot:  "bg-green-400",
  };
}

export type AdminTokens = ReturnType<typeof buildAdminTokens>;

export function chartTheme(isDark: boolean) {
  return {
    tooltip: {
      background: isDark ? "#1a1a2e" : "#ffffff",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
      borderRadius: "12px",
      color: isDark ? "#fff" : "#1A1A1A",
      fontSize: "12px",
    },
    tick: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)",
    grid: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)",
  };
}
