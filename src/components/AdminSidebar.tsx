import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  EnvelopeIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  FolderIcon,
  DocumentIcon,
  TagIcon
} from '@heroicons/react/24/outline';

export type TabType = 'overview' | 'retention' | 'customers' | 'payments' | 'trial_customers' | 'leads' | 'users';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<any>;
  children?: SubNavItem[];
}

interface SubNavItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  action?: () => void;
}

interface AdminSidebarProps {
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

const AdminSidebar: React.FC<AdminSidebarProps> = ({
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
      id: 'overview',
      label: 'Overview',
      icon: HomeIcon
    },
    {
      id: 'retention',
      label: 'Retention & Churn',
      icon: ChartBarIcon
    },
    {
      id: 'customers',
      label: 'SUMIT Customers',
      icon: UsersIcon,
      children: [
        {
          id: 'customers-all',
          label: 'All Customers',
          icon: FolderIcon
        },
        {
          id: 'customers-active',
          label: 'Active',
          icon: DocumentIcon
        },
        {
          id: 'customers-inactive',
          label: 'Inactive',
          icon: DocumentIcon
        }
      ]
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CurrencyDollarIcon,
      children: [
        {
          id: 'payments-all',
          label: 'All Payments',
          icon: FolderIcon
        },
        {
          id: 'payments-monthly',
          label: 'Monthly View',
          icon: DocumentIcon
        },
        {
          id: 'payments-detailed',
          label: 'Detailed View',
          icon: DocumentIcon
        }
      ]
    },
    {
      id: 'trial_customers',
      label: 'Trial Customers',
      icon: ClockIcon
    },
    {
      id: 'leads',
      label: 'Website Leads',
      icon: EnvelopeIcon,
      children: [
        {
          id: 'leads-all',
          label: 'All Leads',
          icon: FolderIcon
        },
        {
          id: 'leads-source',
          label: 'By Source',
          icon: TagIcon
        },
        {
          id: 'leads-campaign',
          label: 'By Campaign',
          icon: DocumentIcon
        }
      ]
    },
    {
      id: 'users',
      label: 'System Users',
      icon: UserIcon
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

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarWidth}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-all duration-300 ease-in-out
        bg-white border-r border-gray-200 shadow-lg
        flex flex-col h-screen
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-spectra-gold to-spectra-gold-light rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">✦</span>
              </div>
              <span className="font-semibold text-gray-900">Admin</span>
            </div>
          )}
          
          {/* Toggle buttons */}
          <div className="flex items-center space-x-2">
            {/* Mobile Close */}
            <button
              onClick={onMobileToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Desktop Collapse */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bars3Icon className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isExpanded = expandedItems.has(item.id);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.id}>
                {/* Main Nav Item */}
                <button
                  onClick={() => {
                    onTabChange(item.id);
                    if (hasChildren && !isCollapsed) {
                      toggleExpanded(item.id);
                    }
                  }}
                  className={`
                    w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all group
                    ${isActive 
                      ? 'bg-gray-900 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`
                    w-5 h-5 flex-shrink-0
                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}
                  `} />
                  
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 font-medium text-sm">{item.label}</span>
                      {hasChildren && (
                        <div className="ml-auto">
                          {isExpanded ? (
                            <ChevronDownIcon className="w-4 h-4" />
                          ) : (
                            <ChevronRightIcon className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </button>

                {/* Submenu */}
                {hasChildren && !isCollapsed && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children?.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            onTabChange(item.id); // Navigate to parent tab
                            child.action?.(); // Execute any custom action
                          }}
                          className="w-full flex items-center px-3 py-2 rounded-lg text-left transition-all text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                          {ChildIcon && <ChildIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                          <span className={`${ChildIcon ? 'ml-2' : ''} font-medium`}>{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile Section - Sticky at bottom */}
        <div className="mt-auto border-t border-gray-200 bg-white">
          {!isCollapsed ? (
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-spectra-gold to-spectra-gold-light rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.full_name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'admin@spectra-ci.com'}
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </div>
                </div>
              </div>

              {/* Settings & Logout */}
              <div className="space-y-1">
                <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                
                <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Help & Support
                </button>
                
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed user section */
            <div className="p-3 flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-gradient-to-br from-spectra-gold to-spectra-gold-light rounded-full flex items-center justify-center text-white font-bold text-xs">
                {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD'}
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button 
                onClick={onLogout}
                className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;