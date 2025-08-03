import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useChatNotifications } from '../hooks/useChatNotifications';
import { NotificationBadge } from './NotificationBadge';
import { useUnifiedChatPolling } from '../hooks/useUnifiedChatPolling';
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
  MegaphoneIcon
} from '@heroicons/react/24/outline';

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
  onLogout
}) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['dashboard']));
  const { unreadCount } = useChatNotifications();
  
  // Real-time unified chat polling
  const { stats, hasNewActivity } = useUnifiedChatPolling({
    enabled: true,
    interval: 10000, // Poll every 10 seconds
    onNewMessage: (message) => {
      console.log('New message received:', message);
    }
  });

  const navigationGroups: NavGroup[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: ChartBarIcon,
      items: [
        { id: 'overview', label: 'Overview', path: '/admin/dashboard' }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: MegaphoneIcon,
      items: [
        { id: 'marketing-dashboard', label: 'Marketing Dashboard', path: '/admin/marketing' },
        { id: 'campaigns', label: 'Campaigns', path: '/admin/marketing/campaigns' },
        { id: 'conversion-funnel', label: 'Conversion Funnel', path: '/admin/marketing/funnel' }
      ]
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: UsersIcon,
      items: [
        { id: 'active', label: 'Active', path: '/admin/clients/active' },
        { id: 'trials', label: 'Trials', path: '/admin/clients/trials' },
        { id: 'churned', label: 'Churned', path: '/admin/clients/churned' }
      ]
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: CurrencyDollarIcon,
      items: [
        { id: 'leads', label: 'Leads', path: '/admin/sales/leads' },
        { id: 'utm-reporting', label: 'UTM Reporting', path: '/admin/sales/utm-reporting' },
        { id: 'regional-funnel', label: 'Regional Funnel', path: '/admin/sales/regional-funnel' }
      ],
      roles: ['admin'] // Only admins can see sales data for now
    },
    {
      id: 'success',
      label: 'Success',
      icon: TrophyIcon,
      items: [
        { id: 'onboarding-status', label: 'Onboarding Status', path: '/admin/success/onboarding-status' },
        { id: 'video-call-requests', label: 'Video Call Requests', path: '/admin/success/video-call-requests' },
        { id: 'ai-alerts', label: 'AI Alerts', path: '/admin/success/ai-alerts' }
      ]
    },
    {
      id: 'support',
      label: 'Support',
      icon: WrenchScrewdriverIcon,
      items: [
        { id: 'unified-chat', label: 'Unified Chat', path: '/admin/support/unified-chat' },
        { id: 'customer-messages', label: 'Customer Messages', path: '/admin/support/messages' },
        { id: 'error-logs', label: 'Error Logs', path: '/admin/support/error-logs' },
        { id: 'reweighs', label: 'Reweighs', path: '/admin/support/reweighs' },
        { id: 'formula-fails', label: 'Formula Fails', path: '/admin/support/formula-fails' },
        { id: 'hardware-status', label: 'Hardware Status', path: '/admin/support/hardware-status' }
      ]
    },
    {
      id: 'live',
      label: 'Live Support',
      icon: VideoCameraIcon,
      items: [
        { id: 'zoom-links', label: 'Zoom Links', path: '/admin/live/zoom-links' },
        { id: 'help-videos', label: 'Help Videos', path: '/admin/live/help-videos' },
        { id: 'diagnostics', label: 'Diagnostics', path: '/admin/live/diagnostics' }
      ]
    },
    {
      id: 'logs',
      label: 'Logs',
      icon: DocumentTextIcon,
      items: [
        { id: 'user-actions', label: 'User Actions', path: '/admin/logs/user-actions' },
        { id: 'usage-heatmap', label: 'Usage Heatmap', path: '/admin/logs/usage-heatmap' },
        { id: 'exports', label: 'Exports', path: '/admin/logs/exports' }
      ],
      roles: ['admin'] // Only admins can see logs
    },
    {
      id: 'system',
      label: 'System',
      icon: CogIcon,
      items: [
        { id: 'users', label: 'Users', path: '/admin/system/users' },
        { id: 'api-keys', label: 'API Keys', path: '/admin/system/api-keys' },
        { id: 'permissions', label: 'Permissions', path: '/admin/system/permissions' }
      ],
      roles: ['admin'] // Only admins can see system settings
    }
  ];

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const isGroupVisible = (group: NavGroup) => {
    if (!group.roles) return true;
    return group.roles.includes(user?.role || '');
  };

  const isItemVisible = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || '');
  };

  const isPathActive = (path: string) => {
    return location.pathname === path;
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some(item => isPathActive(item.path));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          <img src="/spectra_logo.png" alt="Spectra" className={`${isCollapsed ? 'h-6' : 'h-8'} w-auto transition-all duration-300`} />
        </div>
        
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
          {navigationGroups.filter(isGroupVisible).map((group) => {
            const Icon = group.icon;
            const isExpanded = expandedGroups.has(group.id);
            const isActive = isGroupActive(group);

            return (
              <div key={group.id}>
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg
                    transition-colors duration-200 group
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`flex-shrink-0 w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 flex-1 text-left">{group.label}</span>
                      <div className="flex items-center space-x-1">
                        {/* Show unread count for Support group */}
                        {group.id === 'support' && (stats.unreadCount > 0 || unreadCount > 0) && (
                          <NotificationBadge
                            count={stats.unreadCount + unreadCount}
                            color="red"
                            size="sm"
                            pulse={hasNewActivity()}
                          >
                            <span></span>
                          </NotificationBadge>
                        )}
                        <ChevronDownIcon 
                          className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                      </div>
                    </>
                  )}
                </button>

                {/* Group Items */}
                {!isCollapsed && isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {group.items.filter(isItemVisible).map((item) => (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={`
                          flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors
                          ${isPathActive(item.path)
                            ? 'text-blue-700 bg-blue-50 font-medium' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }
                        `}
                      >
                        <span>{item.label}</span>
                        {/* Show unread count for Unified Chat and Customer Messages */}
                        {(item.id === 'unified-chat' && stats.unreadCount > 0) && (
                          <NotificationBadge
                            count={stats.unreadCount}
                            color="purple"
                            size="sm"
                            pulse={stats.newMessages > 0}
                          >
                            <span></span>
                          </NotificationBadge>
                        )}
                        {item.id === 'customer-messages' && unreadCount > 0 && (
                          <NotificationBadge
                            count={unreadCount}
                            color="red"
                            size="sm"
                          >
                            <span></span>
                          </NotificationBadge>
                        )}
                      </Link>
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