import React from "react";
import { usePdfExportMode } from "../SpectraInvestorExperience/primitives";
import type { UpdateLang } from "./finalCopy";

type Props = {
  lang: UpdateLang;
  reducedMotion: boolean;
  dark?: boolean;
};

/**
 * Frames captured from the customers' own published reels. Each one shows
 * Spectra in use rather than a portrait, so the strip reads as reportage.
 */
const CUSTOMERS = [
  {
    name: "Summer",
    image: "/customers/summer.jpg",
    alt: {
      en: "A colorist registering a client in the Spectra app on her phone",
      he: "צבעית מרשמת לקוחה באפליקציית ספקטרה בטלפון",
    },
  },
  {
    name: "Kendall",
    image: "/customers/kendall.jpg",
    alt: {
      en: "The Spectra tablet showing 15.5 grams of a 46.5 gram formula during a mix",
      he: "הטאבלט של ספקטרה מציג 15.5 גרם מתוך פורמולה של 46.5 גרם בזמן ערבוב",
    },
  },
  {
    name: "Serina Renee",
    image: "/customers/serina.jpg",
    alt: {
      en: "A scanned colour tube and its measured weight and cost on the Spectra screen",
      he: "שפופרת צבע סרוקה עם המשקל והעלות שנמדדו על מסך ספקטרה",
    },
  },
  {
    name: "Bri Stangle",
    image: "/customers/bri.jpg",
    alt: {
      en: "A busy salon floor during a Spectra colour education session",
      he: "רצפת סלון עמוסה במהלך הדרכת צבע של ספקטרה",
    },
  },
] as const;

export const InvestorHeroCustomerProof: React.FC<Props> = ({ lang, reducedMotion, dark = false }) => {
  const pdfExport = usePdfExportMode();
  const eager = reducedMotion || pdfExport;

  return (
    <ul
      dir="ltr"
      aria-label={lang === "he" ? "אנשי מקצוע אמיתיים המשתמשים בספקטרה" : "Real professionals using Spectra"}
      className="grid grid-cols-4 gap-2 sm:gap-4"
    >
      {CUSTOMERS.map((customer) => (
        <li key={customer.name} className="min-w-0">
          <figure>
            <div className="aspect-square overflow-hidden bg-[#17110d]">
              <img
                src={customer.image}
                alt={customer.alt[lang]}
                width={900}
                height={900}
                loading={eager ? "eager" : "lazy"}
                decoding={eager ? "sync" : "async"}
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption
              className={`mt-2 truncate text-[11px] font-semibold uppercase tracking-[0.1em] ${
                dark ? "text-[#fbf6ef]/62" : "text-[#2b221b]/62"
              }`}
            >
              {customer.name}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
};

export default InvestorHeroCustomerProof;
