import React from "react";
import { MessageSquare } from "lucide-react";
import type { LanguageCode } from "../types";
import { useMk } from "./ui";

/** Phone-like SMS bubble. Text direction follows the message language. */
export const PhonePreview: React.FC<{
  sender: string;
  text: string;
  lang: LanguageCode;
  footer?: React.ReactNode;
  compact?: boolean;
}> = ({ sender, text, lang, footer, compact = false }) => {
  const mk = useMk();
  return (
    <div
      className={`mx-auto w-full ${compact ? "max-w-[340px]" : "max-w-[320px]"} rounded-[28px] border p-2.5 ${
        mk.isDark ? "border-white/10 bg-black/40" : "border-[#EBDDD2] bg-white"
      }`}
      style={{ boxShadow: mk.isDark ? "none" : "0 18px 40px rgba(92,52,35,0.10)" }}
    >
      <div className={`rounded-[22px] ${mk.isDark ? "bg-[#1F1B19]" : "bg-[#F8F0E6]"} px-3 pb-4 pt-3`}>
        <div className="flex items-center justify-center gap-1.5 pb-3">
          <span className={`grid h-7 w-7 place-items-center rounded-full ${mk.isDark ? "bg-white/10 text-white/70" : "bg-white text-[#B05F57]"}`}>
            <MessageSquare className="h-3.5 w-3.5" />
          </span>
          <span className={`text-[12px] font-semibold ${mk.textStrong}`} dir="ltr">
            {sender || "SMS"}
          </span>
        </div>
        <div
          dir={lang === "he" ? "rtl" : "ltr"}
          className={`max-w-[92%] whitespace-pre-wrap break-words rounded-2xl rounded-ss-md px-3 py-2 text-[12.5px] leading-5 ${
            mk.isDark ? "bg-white/10 text-white" : "bg-white text-[#141414]"
          }`}
          style={{ unicodeBidi: "plaintext" }}
        >
          {text || "…"}
        </div>
      </div>
      {footer && <div className="px-1.5 pt-2">{footer}</div>}
    </div>
  );
};
