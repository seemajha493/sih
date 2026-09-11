import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  LayoutDashboard,
  FileText,
  Upload,
  CheckSquare,
  Map,
  BarChart3,
  ShieldAlert,
  Settings,
  Users,
  Lock
} from 'lucide-react';

export type NavigationTab =
  | 'home'
  | 'dashboard'
  | 'records'
  | 'upload'
  | 'verification'
  | 'gis'
  | 'analytics'
  | 'audit'
  | 'users'
  | 'settings';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose?: () => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  pendingCount = 8,
}) => {
  const { permissions } = useAuth();

  const navItems = [
    {
      id: 'home' as NavigationTab,
      label: 'Portal Home',
      icon: Home,
      allowed: true,
    },
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowed: true,
    },
    {
      id: 'records' as NavigationTab,
      label: 'Land Records',
      icon: FileText,
      allowed: true,
    },
    {
      id: 'upload' as NavigationTab,
      label: 'Upload & Process',
      icon: Upload,
      allowed: permissions.canUploadDocuments,
    },
    {
      id: 'verification' as NavigationTab,
      label: 'Verification Desk',
      icon: CheckSquare,
      allowed: permissions.canVerifyRecords || permissions.canAccessAllRecords,
      badge: pendingCount,
    },
    {
      id: 'gis' as NavigationTab,
      label: 'GIS Map',
      icon: Map,
      allowed: true,
    },
    {
      id: 'analytics' as NavigationTab,
      label: 'Reports & Analytics',
      icon: BarChart3,
      allowed: permissions.canViewAnalytics,
    },
    {
      id: 'audit' as NavigationTab,
      label: 'Audit Logs',
      icon: ShieldAlert,
      allowed: permissions.canViewAuditLogs,
    },
    {
      id: 'users' as NavigationTab,
      label: 'User Management',
      icon: Users,
      allowed: permissions.canManageUsers,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: Settings,
      allowed: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-[69px] bottom-0 left-0 z-30 w-60 bg-white border-r border-slate-300 text-slate-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between select-none shadow-sm`}
      >
        {/* Navigation List */}
        <div className="py-2 overflow-y-auto flex-1">
          <div className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 border-y border-slate-200">
            Navigation Menu
          </div>

          <nav className="mt-1 divide-y divide-slate-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isAllowed = item.allowed;

              return (
                <button
                  key={item.id}
                  disabled={!isAllowed}
                  onClick={() => {
                    if (isAllowed) {
                      setActiveTab(item.id);
                      if (onClose) onClose();
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-left transition-colors border-l-4 ${
                    isActive
                      ? 'border-[#002B49] bg-slate-100 text-[#002B49]'
                      : isAllowed
                      ? 'border-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      : 'border-transparent text-slate-400 opacity-60 cursor-not-allowed bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#002B49]' : isAllowed ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.badge && item.badge > 0 && isAllowed && (
                      <span className="w-5 h-5 bg-amber-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                    {!isAllowed && <Lock className="w-3 h-3 text-slate-400" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Administrative Details */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
          {/* Portal info */}
          <div className="bg-slate-100 border border-slate-200 rounded px-2 py-1.5 mb-2">
            <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">BhumiTrace</div>
            <div className="text-[10px] text-slate-500">DoLR · Ministry of Rural Development</div>
          </div>
          <div className="font-bold text-slate-800">Department of Land Resources</div>
          <div>
            System:{' '}
            <span className="font-bold text-emerald-700">● Operational</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200">
            Portal v1.0.4 | NIC Cloud Node
          </div>
        </div>
      </aside>
    </>
  );
};
