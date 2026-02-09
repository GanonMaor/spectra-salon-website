import React, { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Megaphone,
  LineChart,
  Users,
  Settings,
  UserCog,
  ShieldCheck,
  SlidersHorizontal,
  CreditCard,
  ChevronDown,
  ChevronRight,
  LogOut,
  Workflow,
} from "lucide-react";
import clsx from "clsx";

const SECTIONS = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { label: "Overview", to: "/admin" },
      { label: "Payments", to: "/dashboard" },
      { label: "Salon Performance", to: "/salon-performance" },
    ],
  },
];

interface Props {
  user?: {
    full_name?: string;
    email?: string;
    role?: string;
    avatar_url?: string;
  };
  collapsed?: boolean;
  onToggle?: () => void;
  onLogout?: () => void;
}

export default function NewAdminSidebar({ user, collapsed = false, onToggle, onLogout }: Props) {
  const { pathname } = useLocation();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const activeSection = useMemo(() => {
    const match = (to: string) => pathname === to || pathname.startsWith(to + "/");
    for (const section of SECTIONS) {
      if (section.items.some(item => match(item.to))) {
        return section.title;
      }
    }
    return "";
  }, [pathname]);

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isSectionOpen = (title: string) => {
    return openSections[title] ?? (title === activeSection);
  };

  return (
    <aside
      className={clsx(
        "fixed top-0 left-0 h-screen border-r border-orange-400/20 bg-gradient-to-b from-black/60 via-gray-900/40 to-black/60 backdrop-blur-xl",
        "transition-all duration-200 ease-in-out",
        "flex flex-col z-40",
        "shadow-2xl shadow-black/50",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200/60 p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <span className="font-semibold text-white">Spectra Admin</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isOpen = isSectionOpen(section.title);
            const hasActiveItem = section.items.some(item => 
              pathname === item.to || pathname.startsWith(item.to + "/")
            );

            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className={clsx(
                    "group flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-150 relative",
                    hasActiveItem
                      ? "bg-orange-500/20 text-white ring-1 ring-orange-400/30"
                      : "text-white/70 hover:bg-white/10 hover:text-white hover:scale-[1.02]"
                  )}
                  title={collapsed ? section.title : undefined}
                >
                  <Icon className={clsx(
                    "h-5 w-5 shrink-0 transition-all duration-150", 
                    hasActiveItem ? "text-white" : "text-white/60 group-hover:text-orange-300"
                  )} />
                  {!collapsed && (
                    <>
                      <span className="text-sm font-medium flex-1">{section.title}</span>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform group-hover:text-white" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:text-white" />
                      )}
                    </>
                  )}
                </button>

                {isOpen && !collapsed && (
                  <div className="mt-1 ml-7 space-y-1">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          clsx(
                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                            isActive
                              ? "bg-orange-500/30 text-white ring-1 ring-orange-400/40 font-medium"
                              : "text-white/60 hover:bg-white/10 hover:text-white"
                          )
                        }
                      >
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-white/20 p-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || user?.email || "User")}&background=FF7A1A&color=fff&size=32`}
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover ring-2 ring-orange-400/60"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium text-white">
                {user?.full_name || user?.email || "User"}
              </div>
              <div className="truncate text-xs text-white/60 capitalize">
                {user?.role || "User"} • Online
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onLogout}
              className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-red-400 transition-all duration-150"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
          {collapsed && (
            <button
              onClick={onLogout}
              className="absolute top-2 right-2 rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-red-400 transition-all duration-150"
              title="Logout"
            >
              <LogOut className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}