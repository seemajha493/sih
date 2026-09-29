/**
 * DashboardLayout — Authenticated shell used by all officer roles.
 * Contains a compact gov header, role-specific sidebar (RoleSidebar),
 * and renders the active page in the main content area.
 * "Portal Home" in sidebar/header routes back to the public homepage.
 */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleSidebar } from '../common/RoleSidebar';
import { NotificationBell } from '../common/NotificationBell';
import type { NavigationTab } from '../common/Sidebar';
import type { UserRole } from '../../types/auth';
import { MOCK_NOTIFICATIONS } from '../../mockData/mockData';
import type { Notification } from '../../types/landRecord';
import { DashboardPage } from '../pages/DashboardPage';
import { LandRecordsPage } from '../pages/LandRecordsPage';
import { PublicLandRecordSearch } from '../pages/PublicLandRecordSearch';
import { UploadPage } from '../pages/UploadPage';
import { VerificationPage } from '../pages/VerificationPage';
import { GisMapPage } from '../pages/GisMapPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { UserManagementPage } from '../pages/UserManagementPage';
import { SettingsPage } from '../pages/SettingsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { Menu, Home, LogOut } from 'lucide-react';
import { LanguageSelector } from '../common/LanguageSelector';
import { useTranslation } from '../../i18n/LanguageContext';

interface DashboardLayoutProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onPortalHome: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  setActiveTab,
  onPortalHome,
}) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const role = (user?.role || 'PUBLIC_USER') as UserRole;

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'ADMIN': return t('auth.admin');
      case 'LAND_RECORD_OFFICER': return t('auth.landRecordOfficer');
      case 'PUBLIC_USER': return t('auth.citizen');
      default: return r;
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':    
        if (role === 'PUBLIC_USER') return <PublicLandRecordSearch isAuthenticated={true} onLoginClick={() => {}} />;
        if (role === 'ADMIN') return <UserManagementPage />;
        return <DashboardPage onNavigate={setActiveTab} />;
      case 'records':      return role === 'PUBLIC_USER' 
                             ? <PublicLandRecordSearch isAuthenticated={true} onLoginClick={() => {}} />
                             : <LandRecordsPage onNavigateToUpload={() => setActiveTab('upload')} />;
      case 'upload':       return <UploadPage onNavigateToVerification={(_recordId) => {
                             setActiveTab('verification');
                           }} />;
      case 'verification': return <VerificationPage />;
      case 'gis':          return <GisMapPage />;
      case 'analytics':    return <AnalyticsPage />;
      case 'audit':        return <AuditLogsPage />;
      case 'users':        return <UserManagementPage />;
      case 'settings':     
        if (role !== 'ADMIN') {
          return <SettingsPage onNavigateToDashboard={() => setActiveTab('dashboard')} />;
        }
        return <SettingsPage onNavigateToDashboard={() => setActiveTab('dashboard')} />;
      case 'profile':      return <ProfilePage />;
      default:             return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col font-sans select-none">

      {/* ── Compact Dashboard Header ──────────────────────────────────── */}
      <header className="shrink-0 z-20 relative">
        <div className="gov-tricolor-bar" />
        <div className="bg-[#064E3B] text-white">
          <div className="flex items-center justify-between px-4 py-2 gap-4">

            {/* Left: hamburger + portal title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded border border-slate-600 text-slate-300 hover:text-white"
                aria-label="Open navigation"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div>
                <div className="font-bold text-sm text-white tracking-wide leading-tight">
                  BhumiTrace
                </div>
                <div className="text-[10px] text-amber-300 leading-tight hidden sm:block">
                  {t('gov.dolr')} · {t('gov.mord')}
                </div>
              </div>
            </div>

            {/* Right: language selector + notifications + user + portal home */}
            <div className="flex items-center gap-2.5 text-xs">
              <LanguageSelector variant="compact" />
              <NotificationBell
                notifications={notifications}
                onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
              />
              <div className="hidden sm:block text-right border-l border-slate-600 pl-3">
                <div className="font-semibold text-white text-[11px]">{user?.name}</div>
                <div className="text-[10px] text-amber-300">{getRoleLabel(role)}</div>
              </div>
              <button
                onClick={onPortalHome}
                className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 hover:text-amber-200 border border-amber-500/50 px-2 py-1 rounded transition-colors"
                title="Return to BhumiTrace Home"
              >
                <Home className="w-3 h-3" />
                <span className="hidden sm:inline">{t('sidebar.portalHome')}</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                title={t('common.logout')}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── Body: sidebar + content ───────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        <RoleSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false); }}
          isOpen={sidebarOpen}
          onPortalHome={onPortalHome}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 min-w-0">
          {renderPage()}
        </main>

      </div>
    </div>
  );
};
