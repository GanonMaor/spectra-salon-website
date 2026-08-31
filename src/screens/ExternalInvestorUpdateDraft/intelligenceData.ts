// Investor-facing aggregate only. Source: src/data/paul-usage-findings.json,
// generated from 12 workbooks (the "All" sheet for six salons, 2025–2026).
// No salon or client identities are shipped through this file.
export const SIX_SALON_SAMPLE = {
  caveat: {
    en: "Directional snapshot · 6 real Spectra salons in Israel · not representative of the full market",
    he: "תמונה כיוונית · 6 סלוני Spectra אמיתיים בישראל · אינה מייצגת את השוק המלא",
  },
  totals: [
    { value: "6 salons", en: "Spectra locations in sample", he: "בתי עסק במדגם" },
    { value: "30,111", en: "Color services", he: "שירותי צבע" },
    { value: "5,438", en: "Unique clients", he: "לקוחות ייחודיים" },
    { value: "1,209 kg", en: "Salon raw materials", he: "חומרי גלם לסלון" },
  ],
  // Supporting detail only — deliberately not presented as a headline KPI.
  journeyClients: "1,372",
  clientCount: "5,438",
  families: [
    { name: "Brunette", he: "חום", value: 65, color: "#7b5036" },
    { name: "Blonde", he: "בלונד", value: 29.5, color: "#d7b76f" },
    { name: "Copper", he: "נחושת", value: 3.6, color: "#c8733d" },
    { name: "Red", he: "אדום", value: 1.9, color: "#a93e48" },
  ],
  products: [
    { name: "New Inoa 6.0", kg: 96.6, tone: "#6a4632" },
    { name: "New Inoa 7.0", kg: 84.5, tone: "#8b6748" },
    { name: "New Inoa 7.11", kg: 38.2, tone: "#7d7064" },
    { name: "Majirel 6.0", kg: 31.7, tone: "#634433" },
    { name: "New Inoa 8.0", kg: 26.6, tone: "#b49468" },
    { name: "Cool Cover 11", kg: 26.1, tone: "#d7c8a7" },
    { name: "Dia Light 10.13", kg: 25.8, tone: "#d8c9a3" },
  ],
  journeyShare: "25.2%",
  journeyExamples: [
    { en: "Brunette → Blonde", he: "חום → בלונד", from: "#654331", to: "#d7bd82" },
    { en: "Natural → Cool", he: "טבעי → קר", from: "#92745b", to: "#868994" },
    { en: "2+ level depth change", he: "שינוי עומק של 2 דרגות ומעלה", from: "#493329", to: "#c4a77d" },
  ],
} as const;

// Canonical monthly network aggregate, Jan 2023 to Jun 2026.
// Source: src/data/market-intelligence.json monthlyTrends.
export const NETWORK_ACCUMULATION_SERIES = [
  ["Jan 2023", 5039, 130], ["Feb 2023", 6090, 166], ["Mar 2023", 7823, 182],
  ["Apr 2023", 5455, 181], ["May 2023", 7105, 230], ["Jun 2023", 7279, 273],
  ["Jul 2023", 8332, 299], ["Aug 2023", 11137, 339], ["Sep 2023", 10545, 346],
  ["Oct 2023", 6745, 299], ["Nov 2023", 8222, 306], ["Dec 2023", 10336, 343],
  ["Jan 2024", 10905, 364], ["Feb 2024", 11331, 368], ["Mar 2024", 12592, 379],
  ["Apr 2024", 13493, 381], ["May 2024", 13127, 366], ["Jun 2024", 13142, 374],
  ["Jul 2024", 12865, 379], ["Aug 2024", 12782, 402], ["Sep 2024", 14105, 433],
  ["Oct 2024", 12656, 521], ["Nov 2024", 14382, 518], ["Dec 2024", 14723, 502],
  ["Jan 2025", 15890, 599], ["Feb 2025", 17645, 590], ["Mar 2025", 19801, 607],
  ["Apr 2025", 21442, 648], ["May 2025", 22106, 627], ["Jun 2025", 19790, 669],
  ["Jul 2025", 21937, 687], ["Aug 2025", 22212, 685], ["Sep 2025", 20822, 636],
  ["Oct 2025", 19120, 638], ["Nov 2025", 18360, 651], ["Dec 2025", 19995, 639],
  ["Jan 2026", 17257, 630], ["Feb 2026", 16513, 617], ["Mar 2026", 18297, 592],
  ["Apr 2026", 13955, 526], ["May 2026", 16284, 528], ["Jun 2026", 12806, 492],
] as const;

// Compressed to role lines only. Full biographies are intentionally not shipped
// to the investor page.
export const CORE_TEAM = [
  {
    name: { en: "Maor Ganon", he: "מאור גנון" },
    role: {
      en: "Founder / Salon domain / Product / AI",
      he: "מייסד / עולם הסלון / מוצר / AI",
    },
  },
  {
    name: { en: "Elad Gotlieb", he: "אלעד גוטליב" },
    role: { en: "Operations / Finance / Commercial", he: "תפעול / כספים / מסחר" },
  },
  {
    name: { en: "Achela", he: "אצ׳לה" },
    role: { en: "Engineering / Platform", he: "הנדסה / פלטפורמה" },
  },
  {
    name: { en: "Lital", he: "ליטל" },
    role: { en: "Frontend / UX / Quality", he: "פרונט / חוויית משתמש / איכות" },
  },
  {
    name: { en: "Yaar Ben-Jay", he: "יער בן־ג׳יי" },
    role: { en: "Customer Operations / Data", he: "תפעול לקוחות / דאטה" },
  },
] as const;

export const TEAM_ADVISOR = {
  name: { en: "Roy Gefen", he: "רועי גפן" },
  role: { en: "Advisor, GTM", he: "יועץ, GTM" },
} as const;

// Names and short roles only. Board mechanics and voting detail are kept out of
// the main deck; `investorNote` preserves the not-an-investor distinction.
export const BACKERS = [
  {
    name: { en: "Yoav Horovitz", he: "יואב הורוביץ" },
    role: { en: "Investor & Board", he: "משקיע ובורד" },
    investor: true,
  },
  {
    name: { en: "Brian Cooper", he: "בריאן קופר" },
    role: { en: "Early Investor", he: "משקיע מוקדם" },
    investor: true,
  },
  {
    name: { en: "Oren Revach", he: "אורן רווח" },
    role: { en: "Industry Operator", he: "איש תעשייה" },
    investor: false,
  },
  {
    name: { en: "Paul Hagag", he: "פול חג׳ג׳" },
    role: { en: "Data Advisor", he: "יועץ דאטה" },
    investor: false,
  },
  {
    name: { en: "Aquilo", he: "Aquilo" },
    role: { en: "Strategy & Growth", he: "אסטרטגיה וצמיחה" },
    investor: false,
  },
] as const;
