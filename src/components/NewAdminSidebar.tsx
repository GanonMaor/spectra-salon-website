import React, { useState } from 'react';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  MegaphoneIcon,
  BeakerIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export type TabType = 'dashboard' | 'clients' | 'payments' | 'leads-marketing' | 
                     'color-insights' | 'ai-assistant' | 'campaigns' | 'system';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<any>;
  children?: SubNavItem[];
}

interface SubNavItem {
  id: string;
  label: string;
  path?: string;
  action?: () => void;
}

interface NewAdminSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
  user?: {
    full_name?: string;
    email?: string;
  };
  onLogout?: () => void;
}

const NewAdminSidebar: React.FC<NewAdminSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileToggle,
  user,
  onLogout
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const navigationItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: ChartBarIcon,
      children: [
        { id: 'overview', label: 'Overview', path: '/admin/dashboard' },
        { id: 'marketing', label: 'Marketing', path: '/admin/marketing' },
        { id: 'key-metrics', label: 'Key Metrics', path: '/admin/metrics' }
      ]
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: UsersIcon,
      children: [
        { id: 'all-customers', label: 'All Customers', path: '/admin/clients' },
        { id: 'active-inactive', label: 'Active / Inactive', path: '/admin/clients/status' },
        { id: 'trials', label: 'Trials', path: '/admin/clients/trials' },
        { id: 'sumit-integration', label: 'SUMIT Integration', path: '/admin/clients/sumit' }
      ]
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CurrencyDollarIcon,
      children: [
        { id: 'summary-dashboard', label: 'Summary Dashboard', path: '/admin/payments' },
        { id: 'monthly-view', label: 'Monthly View', path: '/admin/payments/monthly' },
        { id: 'detailed-history', label: 'Detailed History', path: '/admin/payments/history' }
      ]
    },
    {
      id: 'leads-marketing',
      label: 'Leads & Marketing',
      icon: MegaphoneIcon,
      children: [
        { id: 'all-leads', label: 'All Website Leads', path: '/admin/leads' },
        { id: 'by-campaign', label: 'By Campaign', path: '/admin/leads/campaigns' },
        { id: 'by-source', label: 'By Source', path: '/admin/leads/sources' },
        { id: 'lead-import', label: 'Lead Import', path: '/admin/leads/import' },
        { id: 'utm-analytics', label: 'UTM / Referral Analytics', path: '/admin/leads/analytics' }
      ]
    },
    {
      id: 'color-insights',
      label: 'Color Insights',
      icon: BeakerIcon,
      children: [
        { id: 'top-brands', label: 'Top Used Brands', path: '/admin/insights/brands' },
        { id: 'formula-trends', label: 'Formula Trends', path: '/admin/insights/formulas' },
        { id: 'reweigh-issues', label: 'Reweigh Issues', path: '/admin/insights/reweigh' }
      ]
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      icon: CpuChipIcon,
      children: [
        { id: 'formula-suggestions', label: 'Formula Suggestions', path: '/admin/ai/formulas' },
        { id: 'missed-opportunities', label: 'Missed Opportunities', path: '/admin/ai/opportunities' },
        { id: 'inventory-forecast', label: 'Inventory Forecast', path: '/admin/ai/inventory' }
      ]
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: ChatBubbleLeftRightIcon,
      children: [
        { id: 'whatsapp-email', label: 'WhatsApp / Email Logs', path: '/admin/campaigns/logs' },
        { id: 'engagement-rate', label: 'Engagement Rate', path: '/admin/campaigns/engagement' },
        { id: 'conversion-analytics', label: 'Conversion Analytics', path: '/admin/campaigns/conversion' }
      ]
    },
    {
      id: 'system',
      label: 'System',
      icon: CogIcon,
      children: [
        { id: 'users-roles', label: 'Users & Roles', path: '/admin/system/users' },
        { id: 'settings', label: 'Settings', path: '/admin/system/settings' },
        { id: 'help-support', label: 'Help & Support', path: '/admin/system/help' }
      ]
    }
  ];

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: NavItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    } else {
      onTabChange(item.id);
    }
  };

  const handleSubItemClick = (parentId: TabType, subItem: SubNavItem) => {
    if (subItem.action) {
      subItem.action();
    } else {
      onTabChange(parentId);
      // Here you would handle routing to subItem.path
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center">
            <img src="/spectra_logo.png" alt="Spectra" className="h-8 w-auto" />
            <span className="ml-2 text-xl font-bold text-gray-900">Admin</span>
          </div>
        )}
        
        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:block p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <ChevronRightIcon className={`w-5 h-5 transform transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>

        {/* Mobile close button */}
        <button
          onClick={onMobileToggle}
          className="md:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedItems.has(item.id);
            const isActive = activeTab === item.id;

            return (
              <div key={item.id}>
                {/* Main nav item */}
                <button
                  onClick={() => handleItemClick(item)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg
                    transition-colors duration-200 group
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`flex-shrink-0 w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 flex-1 text-left">{item.label}</span>
                      {item.children && item.children.length > 0 && (
                        <ChevronDownIcon 
                          className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                      )}
                    </>
                  )}
                </button>

                {/* Sub-navigation */}
                {!isCollapsed && item.children && isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubItemClick(item.id, subItem)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          
          <div className="mt-3 space-y-1">
            <button className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors">
              Settings
            </button>
            <button className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors">
              Help & Support
            </button>
            <button
              onClick={onLogout}
              className="w-full text-left px-2 py-1 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Collapsed user section */}
      {isCollapsed && (
        <div className="border-t border-gray-200 p-3">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-1 text-red-400 hover:text-red-600 rounded transition-colors"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 md:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Desktop sidebar */}
      <div className={`hidden md:flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
        {sidebarContent}
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 md:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>
    </>
  );
};

export default NewAdminSidebar;