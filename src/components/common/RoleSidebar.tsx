/**
 * RoleSidebar — Role-specific left navigation for authenticated dashboard views.
 * Shows different menu items based on user role.
 * Always includes "Portal Home" (goes back to public home) and Logout.
 */
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import type { UserRole } from '../../types/auth';
import type { NavigationTab } from './Sidebar';
import {
  LayoutDashboard, FileText, Upload, CheckSquare, Map,
  BarChart3, Users, Settings, Home, LogOut,
  X, Clock, Search, User
} from 'lucide-react';

interface SidebarItem {
  id: NavigationTab;
  labelKey: string;
  icon: React.ElementType;
  badge?: number;
}

const SIDEBAR_CONFIG: Record<UserRole, { titleKey: string; items: SidebarItem[] }> = {
  ADMIN: {
    titleKey: 'sidebar.adminPortal',
    items: [
      { id: 'users',        labelKey: 'sidebar.userManagement',  icon: Users },
      { id: 'audit',        labelKey: 'sidebar.auditLogs',       icon: Clock },
      { id: 'analytics',    labelKey: 'sidebar.reports',         icon: BarChart3 },
      { id: 'settings',     labelKey: 'sidebar.settings',        icon: Settings },
      { id: 'profile',      labelKey: 'sidebar.myProfile',       icon: User },
    ]
  },
  LAND_RECORD_OFFICER: {
    titleKey: 'sidebar.officerPortal',
    items: [
      { id: 'dashboard',    labelKey: 'sidebar.dashboard',          icon: LayoutDashboard },
      { id: 'upload',       labelKey: 'sidebar.digitizeUpload',     icon: Upload },
      { id: 'verification', labelKey: 'sidebar.pendingRequests',    icon: CheckSquare, badge: 8 },
      { id: 'records',      labelKey: 'sidebar.recordManagement',   icon: FileText },
      { id: 'gis',          labelKey: 'navbar.gisMaps',             icon: Map },
      { id: 'analytics',    labelKey: 'sidebar.reports',            icon: BarChart3 },
      { id: 'profile',      labelKey: 'sidebar.myProfile',          icon: User },
    ]
  },
  PUBLIC_USER: {
    titleKey: 'sidebar.citizenPortal',
    items: [
      { id: 'records',      labelKey: 'sidebar.findRecord',      icon: Search },
      { id: 'gis',          labelKey: 'sidebar.myLandMap',       icon: Map },
      { id: 'profile',      labelKey: 'sidebar.myProfile',       icon: User },
    ]
  }
};

interface RoleSidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onPortalHome: () => void;
  onClose: () => void;
}

export const RoleSidebar: React.FC<RoleSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onPortalHome,
  onClose,
}) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const role = (user?.role || 'PUBLIC_USER') as UserRole;
  const config = SIDEBAR_CONFIG[role] || SIDEBAR_CONFIG['PUBLIC_USER'];

  const sidebarContent = (
    <nav className="h-full flex flex-col bg-white border-r border-slate-200 text-slate-800 text-xs select-none">
      {/* Sidebar Header */}
      <div className="bg-[#1B365D] text-white px-3 py-3">
        <div className="font-bold text-[11px] uppercase tracking-wider text-amber-300">
          {t(config.titleKey)}
        </div>
        <div className="text-[10px] text-slate-300 mt-0.5 truncate">
          {user?.name} · {user?.department?.split(',')[0]}
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-1">
        {config.items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors border-l-2 ${
                isActive
                  ? 'bg-blue-50 border-[#1B365D] text-[#1B365D] font-bold'
                  : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#1B365D]' : 'text-slate-400'}`} />
              <span className="flex-1 truncate">{t(item.labelKey)}</span>
              {item.badge && (
                <span className="bg-amber-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-slate-200 py-1">
        <button
          onClick={onPortalHome}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[#1B365D] font-bold hover:bg-blue-50 border-l-2 border-transparent hover:border-[#1B365D] transition-colors"
        >
          <Home className="w-3.5 h-3.5 shrink-0" />
          <span>{t('sidebar.portalHome')}</span>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-red-600 hover:bg-red-50 border-l-2 border-transparent transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>{t('common.logout')}</span>
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar — in-flow flex item */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 h-full bg-white border-r border-slate-200 z-10">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
          <aside className="fixed top-0 left-0 bottom-0 w-56 z-40 lg:hidden shadow-xl">
            <button onClick={onClose} className="absolute top-2 right-2 p-1 text-slate-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
};
