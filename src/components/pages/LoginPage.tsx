/**
 * LoginPage — Government officer / citizen authentication page.
 * Accepts an optional preselectedRole (set when user clicks a specific
 * login button on the public homepage) and an onBack handler.
 *
 * Shows 4 role-option cards at the top (with pre-selection highlight),
 * then the standard username/password form below.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import type { UserRole } from '../../types/auth';
import { EmblemLogo } from '../common/EmblemLogo';
import { LanguageSelector } from '../common/LanguageSelector';
import { ShieldCheck, Eye, EyeOff, Home, Lock, Users, FileText, Settings } from 'lucide-react';

interface LoginPageProps {
  preselectedRole?: UserRole | null;
  onSuccess: () => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  preselectedRole,
  onSuccess,
  onBack,
}) => {
  const { login, isLoading } = useAuth();
  const { t } = useTranslation();

  const ROLE_OPTIONS = [
    {
      role: 'PUBLIC_USER' as UserRole,
      title: t('auth.citizen'),
      devanagari: 'नागरिक लॉगिन',
      email: 'citizen@gmail.com',
      icon: Users,
      desc: 'Search records, track applications',
    },
    {
      role: 'LAND_RECORD_OFFICER' as UserRole,
      title: t('auth.landRecordOfficer'),
      devanagari: 'भू-अभिलेख अधिकारी',
      email: 'officer@dolr.gov.in',
      icon: FileText,
      desc: 'Digitize, verify and publish land records',
    },
    {
      role: 'ADMIN' as UserRole,
      title: t('auth.admin'),
      devanagari: 'व्यवस्थापक',
      email: 'admin@dolr.gov.in',
      icon: Settings,
      desc: 'System management and configuration',
    },
  ];

  const [selectedRole, setSelectedRole] = useState<UserRole>(preselectedRole ?? 'LAND_RECORD_OFFICER');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');

  // When preselectedRole changes, auto-fill the email for that role
  useEffect(() => {
    if (preselectedRole) {
      const opt = ROLE_OPTIONS.find(o => o.role === preselectedRole);
      if (opt) {
        setSelectedRole(preselectedRole);
        setIdentifier(opt.email);
        setPassword('demoPass2026!');
        setCaptchaInput('K8P4X');
      }
    }
  }, [preselectedRole]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const opt = ROLE_OPTIONS.find(o => o.role === role);
    if (opt) {
      setIdentifier(opt.email);
      setPassword('demoPass2026!');
      setCaptchaInput('K8P4X');
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim()) { setError('Please enter your registered email or username.'); return; }
    try {
      await login(identifier, selectedRole, rememberMe);
      onSuccess();
    } catch {
      setError('Authentication failed. Please verify your credentials and try again.');
    }
  };

  const selectedOpt = ROLE_OPTIONS.find(o => o.role === selectedRole) || ROLE_OPTIONS[1];

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col font-sans select-none" style={{ backgroundImage: "url('/login-bg.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>

      {/* ── Utility Bar ──────────────────────────────────────────── */}
      <div className="bg-[#064E3B] text-[11px] text-slate-100 border-b border-emerald-800">
        <div className="max-w-screen-xl mx-auto px-4 py-1 flex items-center justify-between">
          <span className="font-semibold">{t('gov.bharat')} &nbsp;|&nbsp; {t('gov.india')}</span>
          <div className="flex items-center gap-3">
            <LanguageSelector variant="compact" />
            <span className="text-emerald-500">|</span>
            <button onClick={onBack} className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-semibold">
              <Home className="w-3 h-3" /> {t('sidebar.portalHome')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EmblemLogo variant="header" />
            <div className="border-l border-slate-200 pl-3 hidden sm:block">
              <div className="text-[11px] font-bold text-[#064E3B] uppercase tracking-wide">{t('gov.bharat')} / {t('gov.india')}</div>
              <div className="text-[11px] text-slate-600">{t('gov.mord')} · {t('gov.dolr')}</div>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[13px] font-extrabold text-[#064E3B] uppercase tracking-wider">BhumiTrace</div>
            <div className="text-[11px] text-slate-500">{t('auth.title')}</div>
          </div>
        </div>
      </div>

      {/* ── Nav strip ─────────────────────────────────────────────── */}
      <div className="gov-tricolor-bar" />
      <div className="bg-[#081E34] border-b border-slate-800 px-4 py-2 flex items-center gap-4">
        <button onClick={onBack} className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1.5">
          ← {t('common.back')}
        </button>
        <span className="text-slate-600 text-xs">|</span>
        <span className="text-[11px] text-amber-300 font-semibold">
          <Lock className="w-3 h-3 inline mr-1" />{t('auth.title')}
        </span>
      </div>

      {/* ── Main login body ───────────────────────────────────────── */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-3xl space-y-5">

          {/* Role selector */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B] mb-2 pb-1.5 border-b border-slate-300">
              {t('auth.selectRole')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ROLE_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const active = selectedRole === opt.role;
                return (
                  <button
                    key={opt.role}
                    onClick={() => handleRoleSelect(opt.role)}
                    className={`text-left p-3 border rounded-sm transition-all ${
                      active
                        ? 'border-[#064E3B] bg-[#064E3B] text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-[#064E3B] hover:bg-emerald-50/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${active ? 'text-amber-300' : 'text-[#064E3B]'}`} />
                    <div className={`text-[11px] font-bold leading-tight ${active ? 'text-white' : 'text-[#064E3B]'}`}>{opt.title}</div>
                    <div className={`text-[10px] mt-0.5 ${active ? 'text-slate-300' : 'text-slate-400'}`}>{opt.devanagari}</div>
                    <div className={`text-[11px] mt-0.5 leading-tight ${active ? 'text-slate-300' : 'text-slate-400'}`}>{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login form */}
          <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
            {/* Form header */}
            <div className="bg-[#064E3B] text-white px-5 py-3 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <div>
                <div className="text-xs font-bold">{selectedOpt.title}</div>
                <div className="text-[10px] text-slate-200">Secure NIC-authenticated login · {selectedOpt.email}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                  {error}
                </div>
              )}

              {/* Demo notice */}
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-sm">
                <strong>{t('auth.presetDemo')}:</strong> {t('auth.quickFill')}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('auth.officerId')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={selectedOpt.email}
                    className="w-full border border-slate-300 bg-white text-xs px-3 py-2 rounded-sm focus:border-[#064E3B] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('auth.password')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-slate-300 bg-white text-xs px-3 py-2 pr-8 rounded-sm focus:border-[#064E3B] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Captcha Verification <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-100 border border-slate-300 px-3 py-2 rounded-sm font-mono font-bold text-sm text-slate-700 tracking-widest select-none" style={{ letterSpacing: '0.2em' }}>
                      K8P4X
                    </div>
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={e => setCaptchaInput(e.target.value)}
                      placeholder="Enter above code"
                      className="flex-1 border border-slate-300 bg-white text-xs px-3 py-2 rounded-sm focus:border-[#064E3B] focus:outline-none font-mono tracking-widest"
                    />
                  </div>
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="accent-[#064E3B]"
                    />
                    Keep me signed in for this session
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="gov-btn-primary py-2 px-6 text-xs flex items-center gap-2"
                >
                  {isLoading ? (
                    <><span className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" /> {t('common.loading')}</>
                  ) : (
                    <><ShieldCheck className="w-3.5 h-3.5" /> {t('auth.loginBtn')}</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="gov-btn-secondary py-2 px-4 text-xs"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>

            <div className="border-t border-slate-100 px-5 py-3 bg-slate-50 text-[10px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-green-600" />
              {t('auth.secNotice')}
            </div>
          </div>

        </div>
      </main>

      {/* ── Minimal footer ─────────────────────────────────────────── */}
      <footer className="bg-[#064E3B] text-slate-200 text-[10px] py-3 px-4 border-t-2 border-amber-500">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div>{t('footer.copyright')} · {t('gov.dolr')} · {t('gov.mord')}</div>
          <div className="font-mono text-amber-300">NIC Cloud Data Centre · DILRMP</div>
        </div>
      </footer>
    </div>
  );
};
