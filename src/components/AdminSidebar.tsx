import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	ChevronDownIcon,
	ChevronRightIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
// Support notifications removed
import { NotificationBadge } from "./NotificationBadge";
// Support polling removed
import {
	ChartBarIcon,
	UsersIcon,
	CurrencyDollarIcon,
	ChartPieIcon,
	WrenchScrewdriverIcon,
	VideoCameraIcon,
	DocumentTextIcon,
	CogIcon,
	TrophyIcon,
	ChatBubbleLeftRightIcon,
	MegaphoneIcon,
} from "@heroicons/react/24/outline";

interface NavGroup {
	id: string;
	label: string;
	icon: React.ComponentType<any>;
	items: NavItem[];
	roles?: string[]; // Which roles can see this group
}

interface NavItem {
	id: string;
	label: string;
	path: string;
	roles?: string[]; // Which roles can see this item
}

interface AdminSidebarProps {
	user?: {
		full_name?: string;
		email?: string;
		role?: string;
	};
	isCollapsed?: boolean;
	isMobileOpen?: boolean;
	onToggleCollapse?: () => void;
	onMobileToggle?: () => void;
	onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
	user,
	isCollapsed = false,
	isMobileOpen = false,
	onToggleCollapse,
	onMobileToggle,
	onLogout,
}) => {
	const location = useLocation();
	const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
		new Set(["dashboard"]),
	);
	const unreadCount = 0;

	// Real-time unified chat polling removed
	const stats = undefined as any;
	const hasNewActivity = false;

	const navigationGroups: NavGroup[] = [
		{
			id: "dashboard",
			label: "Dashboard",
			icon: ChartBarIcon,
			items: [{ id: "overview", label: "Overview", path: "/admin/dashboard" }],
		},
		{
			id: "marketing",
			label: "Marketing",
			icon: MegaphoneIcon,
			items: [
				{
					id: "marketing-dashboard",
					label: "Marketing Dashboard",
					path: "/admin/marketing",
				},
				{
					id: "campaigns",
					label: "Campaigns",
					path: "/admin/marketing/campaigns",
				},
				{
					id: "conversion-funnel",
					label: "Conversion Funnel",
					path: "/admin/marketing/funnel",
				},
			],
		},
		{
			id: "clients",
			label: "Clients",
			icon: UsersIcon,
			items: [
				{ id: "active", label: "Active", path: "/admin/clients/active" },
				{ id: "trials", label: "Trials", path: "/admin/clients/trials" },
				{ id: "churned", label: "Churned", path: "/admin/clients/churned" },
			],
		},
		{
			id: "sales",
			label: "Sales",
			icon: CurrencyDollarIcon,
			items: [
				{ id: "leads", label: "Leads", path: "/admin/sales/leads" },
				{
					id: "utm-reporting",
					label: "UTM Reporting",
					path: "/admin/sales/utm-reporting",
				},
				{
					id: "regional-funnel",
					label: "Regional Funnel",
					path: "/admin/sales/regional-funnel",
				},
			],
		},
		// Support group removed
	];

	const isActive = (path: string) => location.pathname.startsWith(path);

	return (
		<nav className="h-full flex flex-col bg-white/80 backdrop-blur-xl border-r border-gray-200">
			<div className="flex-1 overflow-y-auto">
				{navigationGroups.map((group) => (
					<div key={group.id} className="px-3">
						<button
							onClick={() => {
								const next = new Set(expandedGroups);
								if (next.has(group.id)) next.delete(group.id);
								else next.add(group.id);
								setExpandedGroups(next);
							}}
							className="flex items-center justify-between w-full py-2 text-gray-700 hover:text-black"
						>
							<div className="flex items-center gap-2">
								<group.icon className="w-5 h-5" />
								<span className="font-semibold">{group.label}</span>
							</div>
							{expandedGroups.has(group.id) ? (
								<ChevronDownIcon className="w-4 h-4" />
							) : (
								<ChevronRightIcon className="w-4 h-4" />
							)}
						</button>
						{expandedGroups.has(group.id) && (
							<ul className="pl-7 space-y-1 mb-3">
								{group.items.map((item) => (
									<li key={item.id}>
										<Link
											to={item.path}
											className={`${
												isActive(item.path)
													? "text-black font-semibold"
													: "text-gray-700 hover:text-black"
											}`}
										>
											{item.label}
										</Link>
									</li>
								))}
							</ul>
						)}
					</div>
				))}
			</div>
		</nav>
	);
};
