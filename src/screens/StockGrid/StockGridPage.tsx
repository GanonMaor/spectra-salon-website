import React, { useState } from "react";
import { Home, ShoppingCart, Users, MessageSquare, Package, LayoutList, LayoutGrid } from "lucide-react";

const BRANDS = [
  { id: "loreal", label: "Loreal Profesional" },
  { id: "wella", label: "Wella Professionals" },
  { id: "matrix", label: "Matrix" },
  { id: "redken", label: "Redken" },
  { id: "joico", label: "Joico" },
];

const SUB_LINES = [
  { id: "majirel", label: "Majirel" },
  { id: "dia-richesse", label: "Dia Richesse" },
  { id: "dia-colorur", label: "Dia Colorur" },
  { id: "new-inoa", label: "New Inoa" },
  { id: "fonda", label: "Fonda" },
  { id: "bleach", label: "Bleach & Developers" },
];

type BadgeColor = "gray" | "green" | "orange" | "red";

interface ProductCard {
  code: string;
  qty: number;
  badgeColor: BadgeColor;
}

interface LevelRow {
  level: number;
  items: ProductCard[];
}

const BADGE_COLORS: Record<BadgeColor, string> = {
  gray: "bg-[#9B9B9B]",
  green: "bg-[#0DD1A2]",
  orange: "bg-[#FFBD2D]",
  red: "bg-[#FF6B6B]",
};

const STOCK_DATA: LevelRow[] = [
  {
    level: 1,
    items: [
      { code: "1.0", qty: 2, badgeColor: "gray" },
      { code: "1.1", qty: 7, badgeColor: "green" },
      { code: "1.2", qty: 5, badgeColor: "orange" },
      { code: "1.3", qty: 2, badgeColor: "red" },
      { code: "1.4", qty: 7, badgeColor: "gray" },
      { code: "1.5", qty: 5, badgeColor: "orange" },
      { code: "1.6", qty: 2, badgeColor: "red" },
      { code: "1.22", qty: 2, badgeColor: "gray" },
    ],
  },
  { level: 2, items: [] },
  { level: 3, items: [] },
  {
    level: 4,
    items: [{ code: "1.11", qty: 2, badgeColor: "red" }],
  },
  { level: 5, items: [] },
  { level: 6, items: [] },
  { level: 7, items: [] },
  { level: 8, items: [] },
  { level: 9, items: [] },
  { level: 10, items: [] },
];

const SIDEBAR_NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "stock", label: "Stock", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "customers", label: "Customers", icon: Users },
  { id: "mixes", label: "My Mixes", icon: MessageSquare },
];

function StockBadge({ qty, color }: { qty: number; color: BadgeColor }) {
  return (
    <span
      className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-md border-2 border-white z-10 ${BADGE_COLORS[color]}`}
    >
      {qty}
    </span>
  );
}

function TubeCard({ item }: { item: ProductCard }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[80px] sm:w-[92px] bg-white rounded-sm shadow-[2px_1.5px_4.5px_rgba(6,36,102,0.13)] p-2 pt-4 flex flex-col items-center">
        <StockBadge qty={item.qty} color={item.badgeColor} />
        <div className="w-5 h-[72px] sm:h-[84px] relative flex items-end justify-center">
          <div className="absolute inset-0 w-[18px] mx-auto rounded-sm bg-gradient-to-b from-gray-200 to-gray-300" />
          <div className="relative w-full h-[64px] sm:h-[74px]">
            <div className="absolute inset-0 mx-auto w-[20px] bg-gradient-to-b from-[#e8e8ea] via-[#d0d0d4] to-[#c4c4c8] rounded-[2px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[16px] h-[52px] sm:h-[60px] bg-gradient-to-b from-[#f0f0f2] to-[#dcdce0] rounded-[1px]" />
          </div>
        </div>
        <span className="text-[8px] text-gray-400 mt-1">50gr</span>
      </div>
      <span className="text-xs text-gray-500 font-light tracking-wide">{item.code}</span>
    </div>
  );
}

const StockGridPage: React.FC = () => {
  const [activeBrand, setActiveBrand] = useState("loreal");
  const [activeSubLine, setActiveSubLine] = useState("dia-richesse");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  return (
    <div className="flex h-[100dvh] bg-white overflow-hidden font-['Roboto',sans-serif]">
      {/* ── Left sidebar ── */}
      <aside className="hidden lg:flex flex-col w-[102px] bg-black text-white flex-shrink-0 border-r border-white/10">
        {/* Logo */}
        <div className="flex items-center justify-center pt-5 pb-6">
          <div className="w-[55px] h-[55px] rounded-full bg-[#D8D8D8]/10 flex items-center justify-center">
            <div className="w-[34px] h-[34px] rounded-full border-2 border-white/30 flex items-center justify-center shadow-lg">
              <div className="w-[25px] h-[18px] rounded-full bg-gradient-to-tr from-[#B18059] to-[#EAB776] shadow-md" />
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col items-center gap-1 pt-2">
          {SIDEBAR_NAV.map((item) => {
            const active = item.id === "stock";
            return (
              <button
                key={item.id}
                className={`relative flex flex-col items-center gap-1.5 w-full py-3 text-[14px] font-normal tracking-wide transition-colors ${
                  active ? "text-white" : "text-white/50 hover:text-white/80"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[8px] h-[50px] rounded-r-sm bg-gradient-to-b from-[#B18059] to-[#EAB776] shadow-[0_2px_23px_rgba(0,0,0,0.5)]" />
                )}
                <item.icon className="w-6 h-6" strokeWidth={1.5} />
                <span className="text-[11px] opacity-80">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User avatar at bottom */}
        <div className="flex flex-col items-center pb-4 gap-1">
          <div className="w-[42px] h-[42px] rounded-full bg-gray-500 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600" />
          </div>
          <span className="text-[12px] text-white/80 leading-tight text-center">
            Jane
            <br />
            Cooper
          </span>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* ── Top bar ── */}
        <header className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          {/* Filter chips */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-black/70 text-white text-[11px] font-light rounded-md px-3.5 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              Full Brands Catalogs
            </button>
            <button className="flex items-center gap-2 text-white/90 text-[11px] font-light px-3.5 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#01B307]" />
              My Stock Only
            </button>
            <button className="flex items-center gap-2 text-white/90 text-[11px] font-light px-3.5 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CB0000]" />
              Low In Stock
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-black text-white text-[11px] font-light rounded px-3.5 py-1.5 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-white" />
              Stock Management
            </button>
            <button className="flex items-center gap-2 bg-white text-black text-[11px] font-light rounded px-3.5 py-1.5 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-black" />
              Add New Stock
            </button>
          </div>
        </header>

        {/* ── Brand row ── */}
        <div className="flex-shrink-0 flex flex-wrap items-center gap-3 px-4 sm:px-6 lg:px-8 pb-3">
          {BRANDS.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBrand(b.id)}
              className={`text-[12px] font-light px-4 py-2 rounded-md border transition-colors ${
                activeBrand === b.id
                  ? "border-black/50 bg-gray-50/50 text-black"
                  : "border-black/10 text-black/60 hover:border-black/30"
              }`}
            >
              {b.label}
            </button>
          ))}

          {/* View toggle */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[15px] text-black mr-1">View</span>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded transition-opacity ${viewMode === "list" ? "opacity-100" : "opacity-40"}`}
            >
              <LayoutList className="w-[15px] h-[15px]" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded transition-opacity ${viewMode === "grid" ? "opacity-100" : "opacity-40"}`}
            >
              <LayoutGrid className="w-[15px] h-[15px]" />
            </button>
          </div>
        </div>

        {/* ── Sub-line tabs ── */}
        <div className="flex-shrink-0 flex items-center gap-0 px-4 sm:px-6 lg:px-8 pb-4">
          {SUB_LINES.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSubLine(s.id)}
              className={`flex-1 max-w-[165px] text-center text-[12px] font-light py-1.5 rounded-sm transition-colors ${
                activeSubLine === s.id
                  ? "bg-black text-white"
                  : "bg-[#F8F8F8] text-black"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Section header ── */}
        <div className="flex-shrink-0 flex items-baseline justify-between px-4 sm:px-6 lg:px-8 pb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[12px] font-bold text-black">
              {SUB_LINES.find((s) => s.id === activeSubLine)?.label ?? ""} -
            </span>
            <span className="text-[10px] text-black">161 shades</span>
          </div>
          <div className="text-[10px] text-black">
            Unit price: <span className="font-medium">$12.5</span>
            &nbsp;&nbsp;Units in stock: <span className="font-medium">94</span>
          </div>
        </div>

        {/* ── Stock grid (scrollable) ── */}
        <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 pb-8">
          {STOCK_DATA.map((row) => (
            <div
              key={row.level}
              className={`flex items-start gap-4 sm:gap-6 border-t border-black/[0.06] py-3 min-h-[48px] ${
                row.items.length === 0 ? "opacity-60" : ""
              }`}
            >
              {/* Level label */}
              <div className="w-[70px] sm:w-[80px] flex-shrink-0 pt-1">
                <span
                  className={`text-[13px] whitespace-nowrap ${
                    row.level === 1 ? "font-medium text-black" : "font-normal text-black/60"
                  }`}
                >
                  Level - {row.level}
                </span>
              </div>

              {/* Product cards */}
              {row.items.length > 0 && (
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {row.items.map((item) => (
                    <TubeCard key={item.code} item={item} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockGridPage;
