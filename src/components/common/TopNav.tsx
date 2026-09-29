/**
 * TopNav — Horizontal government top navigation bar.
 * Replaces both the fixed Header and the Sidebar.
 * NOT sticky / NOT fixed — scrolls normally with the page.
 * Public view: Home | About | Land Records | Services | Help | Contact | [Login]
 * Authenticated view: Dashboard | Land Records | Upload | Verification | GIS Map | Analytics | Audit | [User]
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';
import type { NavigationTab } from './Sidebar';
import { EmblemLogo } from './EmblemLogo';
import { NotificationBell } from './NotificationBell';
import { LanguageSelector } from './LanguageSelector';
import { MOCK_NOTIFICATIONS } from '../../mockData/mockData';
import type { Notification } from '../../types/landRecord';
import {
  Menu, X, LogOut, ChevronDown, ShieldCheck, Check, Clock
} from 'lucide-react';

// ── Public nav links ──────────────────────────────────────────────────────────
const PUBLIC_LINKS = [
  { label: 'Home',         href: '#'        },
  { label: 'About',        href: '#about'   },
  { label: 'Land Records', href: '#search'  },
  { label: 'Services',     href: '#services'},
  { label: 'Help',         href: '#faq'     },
  { label: 'Contact',      href: '#contact' },
];

// ── Authenticated officer nav tabs ────────────────────────────────────────────
interface NavTabItem {
  id: NavigationTab;
  label: string;
  roles: UserRole[];          // which roles see this tab
  badge?: number;
}
const OFFICER_TABS: NavTabItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    roles: ['LAND_RECORD_OFFICER'] },
  { id: 'upload',       label: 'Record Entry / Digitize', roles: ['LAND_RECORD_OFFICER'] },
  { id: 'verification', label: 'Pending Requests', roles: ['LAND_RECORD_OFFICER'], badge: 8 },
  { id: 'records',      label: 'Land Records', roles: ['LAND_RECORD_OFFICER','PUBLIC_USER'] },
  { id: 'gis',          label: 'GIS Map',      roles: ['ADMIN','LAND_RECORD_OFFICER','PUBLIC_USER'] },
  { id: 'analytics',    label: 'Analytics',    roles: ['ADMIN','LAND_RECORD_OFFICER'] },
  { id: 'audit',        label: 'Audit Logs',   roles: ['ADMIN'] },
  { id: 'users',        label: 'Users',        roles: ['ADMIN'] },
  { id: 'settings',     label: 'System Configuration', roles: ['ADMIN'] },
  { id: 'profile',      label: 'My Profile',   roles: ['ADMIN','LAND_RECORD_OFFICER','PUBLIC_USER'] },
];

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN:                 'System Administrator',
  LAND_RECORD_OFFICER:   'Land Record Officer',
  PUBLIC_USER:           'Citizen / Public User',
};

interface TopNavProps {
  // For authenticated views
  activeTab?: NavigationTab;
  setActiveTab?: (tab: NavigationTab) => void;
  // For public view
  onNavigateToLogin?: () => void;
  onNavigateToDashboard?: () => void;
  isAuthenticated?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onNavigateToLogin,
  onNavigateToDashboard,
  isAuthenticated = false,
}) => {
  const { user, logout, switchRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const visibleTabs = OFFICER_TABS.filter(t =>
    user?.role && t.roles.includes(user.role as UserRole)
  );

  const handleTabClick = (tab: NavigationTab) => {
    setActiveTab?.(tab);
    setMobileOpen(false);
  };

  // ── Shared header shell ──────────────────────────────────────────────────
  return (
    <header className="w-full bg-white border-b border-slate-300 shadow-none" style={{ position: 'static' }}>
      {/* National tricolor accent */}
      <div className="gov-tricolor-bar" />

      {/* Top government identity bar */}
      <div className="bg-[#064E3B] text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Emblem + portal name */}
          <div className="flex items-center gap-3 min-w-0">
            <EmblemLogo variant="header" />
          </div>

          {/* Center: portal title (desktop only) */}
          <div className="hidden xl:block text-center flex-1">
            <div className="text-sm font-bold tracking-wide text-white uppercase leading-tight">
              BhumiTrace
            </div>
            <div className="text-[11px] text-amber-300 font-medium">
              BhumiTrace — Department of Land Resources, MoRD
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Clock */}
            {isAuthenticated && currentTime && (
              <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-200 font-mono bg-[#043D2E] px-2 py-1 rounded border border-emerald-700/60">
                <Clock className="w-3 h-3 text-amber-400" />
                {currentTime}
              </div>
            )}

            {/* Language selector */}
            <LanguageSelector variant="compact" />

            {/* Role switcher (demo evaluator tool) — authenticated only */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => { setShowRoleMenu(!showRoleMenu); setShowUserMenu(false); }}
                  className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 border border-amber-500/60 rounded text-amber-300 hover:border-amber-400 transition"
                  title="Switch role (evaluation preset)"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{ROLE_LABELS[user?.role as UserRole] || 'User'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showRoleMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)} />
                    <div className="absolute right-0 mt-1 w-52 bg-white text-slate-900 border border-slate-300 rounded shadow-lg z-50 py-1 text-xs">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500 bg-slate-50 border-b border-slate-200">
                        Switch Active Role
                      </div>
                      {(['ADMIN','LAND_RECORD_OFFICER','PUBLIC_USER'] as UserRole[]).map(r => (
                        <button key={r} onClick={() => { switchRole(r); setShowRoleMenu(false); }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 ${user?.role === r ? 'font-bold text-[#1B365D] bg-blue-50' : ''}`}>
                          {ROLE_LABELS[r]}
                          {user?.role === r && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Notification bell */}
            {isAuthenticated && (
              <NotificationBell
                notifications={notifications}
                onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
              />
            )}

            {/* User menu / Login button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => { setShowUserMenu(!showUserMenu); setShowRoleMenu(false); }}
                  className="flex items-center gap-1.5 text-[11px] font-semibold pl-2 border-l border-slate-600"
                >
                  <div className="w-7 h-7 rounded-full bg-[#1B365D] border border-slate-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {user?.name?.split(' ').map(p => p[0]).slice(0, 2).join('') || 'U'}
                  </div>
                  <span className="hidden md:block text-white">{user?.name?.split(' ')[0]}</span>
                </button>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded shadow-lg z-50 py-1 text-xs">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="font-bold text-slate-900">{user?.name}</div>
                        <div className="text-[10px] text-slate-500">{user?.email}</div>
                        <div className="text-[10px] text-slate-500">{user?.department}</div>
                      </div>
                      <button onClick={() => { handleTabClick('profile'); setShowUserMenu(false); }}
                        className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100">My Profile</button>
                      {user?.role === 'ADMIN' && (
                        <button onClick={() => { handleTabClick('settings'); setShowUserMenu(false); }}
                          className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100">System Configuration</button>
                      )}
                      <button onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full text-left px-3 py-2 text-red-700 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100">
                        <LogOut className="w-3 h-3" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onNavigateToLogin}
                className="gov-btn-primary py-1.5 px-3 text-xs flex items-center gap-1"
              >
                Officer Login
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 rounded border border-slate-600 text-slate-300 hover:text-white"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Navigation tabs bar ──────────────────────────────────────── */}
      <div className="bg-[#1B365D] border-t border-[#0d2540]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          {/* Desktop nav */}
          <nav className="hidden lg:flex items-end overflow-x-auto">
            {isAuthenticated ? (
              /* Officer tabs */
              visibleTabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                      isActive
                        ? 'border-amber-400 text-white bg-[#002B49]/40'
                        : 'border-transparent text-slate-300 hover:text-white hover:bg-[#002B49]/30'
                    }`}
                  >
                    {tab.label}
                    {tab.badge && (
                      <span className="bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              /* Public links */
              <>
                {PUBLIC_LINKS.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#002B49]/40 border-b-2 border-transparent hover:border-amber-400 transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </a>
                ))}
                {onNavigateToDashboard && (
                  <button
                    onClick={onNavigateToDashboard}
                    className="ml-auto px-4 py-2.5 text-xs font-semibold text-amber-300 hover:text-amber-200 border-b-2 border-transparent"
                  >
                    → Officer Desk
                  </button>
                )}
              </>
            )}
          </nav>
        </div>
      </div>

      {/* ── Mobile nav drawer ────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#002B49] border-t border-slate-700 divide-y divide-slate-700">
          {isAuthenticated ? (
            visibleTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full text-left px-4 py-3 text-xs font-semibold flex items-center justify-between ${
                  activeTab === tab.id ? 'text-white bg-[#1B365D]' : 'text-slate-300 hover:text-white hover:bg-[#1B365D]/60'
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className="bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))
          ) : (
            <>
              {PUBLIC_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1B365D]"
                >
                  {link.label}
                </a>
              ))}
              <div className="px-4 py-3">
                <button
                  onClick={() => { onNavigateToLogin?.(); setMobileOpen(false); }}
                  className="gov-btn-primary py-2 px-4 text-xs w-full"
                >
                  Officer Login
                </button>
              </div>
            </>
          )}
          {isAuthenticated && (
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="text-xs text-slate-300">
                <div className="font-semibold">{user?.name}</div>
                <div className="text-[10px] text-slate-500">{ROLE_LABELS[user?.role as UserRole]}</div>
              </div>
              <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
