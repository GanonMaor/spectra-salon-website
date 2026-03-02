import React, { useState } from "react";
import { useSiteColors, useSiteTheme } from "../../../contexts/SiteTheme";

const GRAMS_PER_BOWL = 75;
const WASTE_RATE = 0.225;

export const InvisibleLossSection: React.FC = () => {
  const [colorists, setColorists] = useState(3);
  const [servicesPerDay, setServicesPerDay] = useState(12);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [workingDays, setWorkingDays] = useState(250);
  const [costPerBowl, setCostPerBowl] = useState(2.5);

  const c = useSiteColors();
  const { isDark } = useSiteTheme();

  const annualServices = servicesPerDay * workingDays;
  const annualWasteUSD = annualServices * costPerBowl;
  const annualWastedKg = (annualServices * GRAMS_PER_BOWL * WASTE_RATE) / 1000;
  const showTip = servicesPerDay > 0 && colorists > 0 && servicesPerDay < colorists;

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const safeInt = (v: string, fb: number) => { const n = parseInt(v, 10); return isNaN(n) || n < 0 ? fb : n; };
  const safeFloat = (v: string, fb: number) => { const n = parseFloat(v); return isNaN(n) || n < 0 ? fb : n; };

  const inputCls = isDark
    ? "w-full h-11 px-4 border border-white/12 rounded-xl text-white text-sm font-light outline-none focus:border-[#EAB776]/40 transition-all bg-white/5"
    : "w-full h-11 px-4 border border-gray-200 rounded-xl text-gray-900 text-sm font-light outline-none focus:border-[#B18059]/40 transition-all bg-white";
  const labelCls = isDark
    ? "block text-xs text-white/55 mb-1.5 font-light"
    : "block text-xs text-gray-500 mb-1.5 font-light";

  return (
    <section className="py-16 lg:py-24" style={{ background: c.bg.page }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-[#EAB776]/60 rounded-full" />
            <span className="text-xs font-medium uppercase tracking-[0.15em]" style={{ color: c.text.faint }}>
              Business Insight
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight mb-3" style={{ color: c.text.primary }}>
            Estimate Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">
              Invisible Loss
            </span>
          </h2>
          <p className="text-base sm:text-lg font-light max-w-xl mx-auto" style={{ color: c.text.muted }}>
            A simple projection based on average bowl usage and waste rates
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div
            className="rounded-3xl p-8 sm:p-10 border"
            style={{
              background: isDark ? "rgba(15,15,20,0.70)" : "white",
              borderColor: c.border.light,
              boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className={labelCls}>Colorists in your salon</label>
                <input type="number" min={1} value={colorists} onChange={(e) => setColorists(safeInt(e.target.value, 1))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Color services per day</label>
                <input type="number" min={1} value={servicesPerDay} onChange={(e) => setServicesPerDay(safeInt(e.target.value, 1))} className={inputCls} />
              </div>
            </div>

            {showTip && (
              <p className="text-xs font-light mb-3" style={{ color: "#EAB776" }}>
                Tip: Most salons run multiple color services per colorist per day.
              </p>
            )}

            <button onClick={() => setShowAdvanced((v) => !v)} className="text-xs font-light mb-4 transition-colors" style={{ color: c.text.faint }}>
              {showAdvanced ? "Hide" : "Show"} advanced settings
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className={labelCls}>Working days / year</label>
                  <input type="number" min={1} value={workingDays} onChange={(e) => setWorkingDays(safeInt(e.target.value, 1))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Wasted cost / bowl ($)</label>
                  <input type="number" min={0} step={0.1} value={costPerBowl} onChange={(e) => setCostPerBowl(safeFloat(e.target.value, 0))} className={inputCls} />
                </div>
              </div>
            )}

            <div className="text-center pt-5 border-t" style={{ borderColor: c.border.light }}>
              <p className="text-xs mb-3 font-light" style={{ color: c.text.faint }}>
                Based on average bowl waste in salons
              </p>
              <div className="text-4xl sm:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059] mb-2">
                ${fmt(annualWasteUSD)}
              </div>
              <p className="text-sm font-light mb-1" style={{ color: c.text.muted }}>
                Estimated annual color waste
              </p>
              <p className="text-xs font-light mb-5" style={{ color: c.text.faint }}>
                That's about {annualWastedKg.toFixed(1)} kg of product lost per year.
              </p>
              <p className="text-xs font-light leading-relaxed max-w-sm mx-auto" style={{ color: c.text.muted }}>
                Spectra is designed to eliminate this invisible loss through precision + tracking.
              </p>
              <p className="text-[10px] font-light mt-4" style={{ color: c.text.faint }}>
                Results are estimates. Waste varies by technique, brand, and workflow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
