import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';
import { EmblemLogo } from './EmblemLogo';
import { NotificationBell } from './NotificationBell';
import { MOCK_NOTIFICATIONS } from '../../mockData/mockData';
import type { Notification } from '../../types/landRecord';
import { 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  Menu, 
  X, 
  Clock,
  Languages,
  Check
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout, switchRole } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ', ' +
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleTitle = (role?: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'ADMINISTRATOR';
      case 'LAND_RECORD_OFFICER': return 'LAND RECORD OFFICER';
      case 'VERIFICATION_OFFICER': return 'VERIFICATION OFFICER';
      case 'PUBLIC_USER': return 'PUBLIC USER';
      default: return 'GUEST';
    }
  };

  return (
    <header className="w-full bg-[#064E3B] text-white border-b border-emerald-800 shadow-sm select-none">
      <div className="gov-tricolor-bar"></div>
      
      {/* Top Formal Department Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        
        {/* Mobile menu toggle & Bilingual Emblem */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 rounded bg-[#1B365D] text-slate-200 hover:text-white border border-slate-600 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <EmblemLogo variant="header" />
        </div>

        {/* System Title (Center - Desktop) */}
        <div className="hidden lg:flex flex-col text-center border-x border-slate-700 px-6 py-1">
          <h1 className="text-sm font-bold tracking-wide text-white uppercase">
            Intelligent Land Record Digitization & Validation System
          </h1>
          <p className="text-[11px] text-amber-300 font-medium">
            डिजिटल भूमि अभिलेख एवं सत्यापन प्रणाली
          </p>
        </div>

        {/* Officer Profile & Administrative Time */}
        <div className="flex items-center gap-3">
          
          {/* Timestamp */}
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-300 bg-[#1B365D] px-2.5 py-1 rounded border border-slate-600 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentTime}</span>
          </div>

          {/* Quick Role Switcher (Departmental Evaluator Preset) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded bg-[#1B365D] hover:bg-[#2C5282] border border-amber-500/50 text-amber-300 transition"
              title="Click to switch role for evaluation demonstration"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{getRoleTitle(user?.role)}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-1 w-64 bg-white text-slate-900 border border-slate-300 rounded shadow-lg z-50 py-1 text-xs">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-600 bg-slate-100 border-b border-slate-200">
                  Switch Active Role (Evaluation Preset)
                </div>
                {(['ADMIN', 'LAND_RECORD_OFFICER', 'VERIFICATION_OFFICER', 'PUBLIC_USER'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 transition ${
                      user?.role === r ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span>{getRoleTitle(r)}</span>
                    {user?.role === r && <Check className="w-3.5 h-3.5 text-blue-800" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(l => l === 'EN' ? 'HI' : 'EN')}
            className="flex items-center gap-1 p-1.5 rounded bg-[#1B365D] text-slate-300 hover:text-white border border-slate-600 text-[11px] font-bold transition"
            title="Toggle Language"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{lang === 'EN' ? 'EN | हि' : 'हि | EN'}</span>
          </button>

          {/* Notifications */}
          <NotificationBell
            notifications={notifications}
            onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
          />

          {/* Officer Info & Sign Out */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
            <div className="hidden md:block text-right">
              <div className="text-xs font-bold text-white leading-tight">{user?.name}</div>
              <div className="text-[10px] text-slate-300">{user?.district || 'Jaipur Rural'} Zone</div>
            </div>

            <button
              onClick={() => logout()}
              className="p-1.5 rounded bg-rose-900/80 hover:bg-rose-900 text-rose-200 border border-rose-700 text-xs font-semibold flex items-center gap-1 transition"
              title="Sign Out of Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>

      </div>

      {/* Sub-Header Application Banner for Mobile/Tablet */}
      <div className="lg:hidden bg-[#1B365D] py-1.5 px-4 text-center border-t border-slate-700">
        <h1 className="text-xs font-bold text-white uppercase tracking-wider">
          Intelligent Land Record Digitization & Validation System
        </h1>
      </div>

    </header>
  );
};
