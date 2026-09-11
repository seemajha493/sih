/**
 * App.tsx — Root application router with dedicated public page destinations.
 *
 * Dedicated Navigation:
 *   - 'home'         → Public HomePage (hero, carousel, previews)
 *   - 'land-records' → Dedicated Public Land Records Directory page
 *   - 'gis'          → Dedicated Public GIS Map Cadastral page
 *   - 'services'     → Dedicated Public Services page
 *   - 'notices'      → Dedicated Public Notices Gazette Directory page
 *   - 'help'         → Dedicated Public Help & Support page
 *   - 'login'        → LoginPage
 *   - 'portal'       → DashboardLayout (authenticated officer views)
 */
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { NavigationTab } from './components/common/Sidebar';
import type { UserRole } from './types/auth';
import type { PublicPageTab } from './components/common/PublicHeader';
import { HomePage } from './components/pages/HomePage';
import { PublicLandRecordsPage } from './components/pages/PublicLandRecordsPage';
import { PublicGisMapPage } from './components/pages/PublicGisPage';
import { ServicesPage } from './components/pages/ServicesPage';
import { NoticesPage } from './components/pages/NoticesPage';
import { HelpPage } from './components/pages/HelpPage';
import { LoginPage } from './components/pages/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';

type AppView = 'public' | 'login' | 'portal';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [appView, setAppView] = useState<AppView>('public');
  const [publicPage, setPublicPage] = useState<PublicPageTab>('home');
  const [loginRole, setLoginRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // ── Loading splash ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#064E3B] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-[11px] text-slate-300 uppercase tracking-widest">
            Connecting to BhumiTrace…
          </div>
          <div className="text-[10px] text-slate-500">Department of Land Resources · MoRD · Govt. of India</div>
        </div>
      </div>
    );
  }

  // ── Guard: unauthenticated user trying to access portal ────────────────
  if (!isAuthenticated && appView === 'portal') {
    return (
      <LoginPage
        preselectedRole={loginRole}
        onSuccess={() => setAppView('portal')}
        onBack={() => setAppView('public')}
      />
    );
  }

  // ── PUBLIC PAGES (Dedicated Destinations) ──────────────────────────────
  if (appView === 'public') {
    const commonProps = {
      isAuthenticated,
      onNavigatePage: (page: PublicPageTab) => {
        setPublicPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onLoginClick: (role?: UserRole) => {
        setLoginRole(role ?? null);
        setAppView('login');
      },
      onGoToDashboard: isAuthenticated ? () => setAppView('portal') : undefined,
    };

    switch (publicPage) {
      case 'land-records':
        return <PublicLandRecordsPage {...commonProps} />;
      case 'gis':
        return <PublicGisMapPage {...commonProps} />;
      case 'services':
        return <ServicesPage {...commonProps} />;
      case 'notices':
        return <NoticesPage {...commonProps} />;
      case 'help':
        return <HelpPage {...commonProps} />;
      case 'home':
      default:
        return <HomePage {...commonProps} />;
    }
  }

  // ── LOGIN SCREEN ────────────────────────────────────────────────────────
  if (appView === 'login') {
    if (isAuthenticated) {
      setAppView('portal');
      return null;
    }
    return (
      <LoginPage
        preselectedRole={loginRole}
        onSuccess={() => {
          setLoginRole(null);
          setAppView('portal');
        }}
        onBack={() => setAppView('public')}
      />
    );
  }

  // ── AUTHENTICATED PORTAL (role-specific dashboard) ─────────────────────
  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onPortalHome={() => {
        setPublicPage('home');
        setAppView('public');
      }}
    />
  );
};

import { LandRecordProvider } from './context/LandRecordContext';

export function App() {
  return (
    <AuthProvider>
      <LandRecordProvider>
        <AppContent />
      </LandRecordProvider>
    </AuthProvider>
  );
}

export default App;
