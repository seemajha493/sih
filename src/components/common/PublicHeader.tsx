import React, { useState } from 'react';
import type { UserRole } from '../../types/auth';
import { EmblemLogo } from './EmblemLogo';
import { Building2, Bell } from 'lucide-react';
import { DigitalIndiaLogo } from './DigitalIndiaLogo';

export type PublicPageTab = 'home' | 'land-records' | 'gis' | 'services' | 'notices' | 'help';

interface PublicHeaderProps {
  activePage: PublicPageTab;
  onNavigatePage: (page: PublicPageTab) => void;
  isAuthenticated?: boolean;
  onLoginClick: (role?: UserRole) => void;
  onGoToDashboard?: () => void;
  showTicker?: boolean;
}

const NOTICES_TICKER = [
  'Phase-III digitization of Jamabandi records completed in Muzaffarpur, Sitamarhi & Sheohar districts. (08 Sep 2026)',
  'Integration of Rajasthan cadastral GIS data (eSadhna portal) with DoLR central repository completed. (05 Sep 2026)',
  'Updated SOP issued for Tehsil verification & mutation audit workflows under DILRMP Phase-III. (01 Sep 2026)',
  'Public advisory: Verify digitized RoR records using official QR code validation seal on BhumiTrace portal. (28 Aug 2026)',
];

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  activePage,
  onNavigatePage,
  isAuthenticated = false,
  onLoginClick,
  onGoToDashboard,
  showTicker = true,
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');

  const fontClass =
    fontSize === 'large' ? 'text-[104%]' : fontSize === 'xlarge' ? 'text-[112%]' : '';

  return (
    <div className={`w-full font-sans select-none ${fontClass}`}>
      {/* Top Accessibility & Language Margin Strip (Deep Green) */}
      <div className="bg-[#064E3B] text-slate-100 text-xs border-b border-emerald-800">
        <div className="w-full px-3 sm:px-6 py-1 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-[11px] text-white">
            <span>भारत सरकार</span>
            <span className="text-emerald-400">|</span>
            <span>Government of India</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {/* Font Resize */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-200 font-mono mr-0.5">Text Size:</span>
              <button
                onClick={() => setFontSize('normal')}
                className={`px-1.5 py-0.5 rounded ${fontSize === 'normal' ? 'bg-[#043D2E] text-white font-bold' : 'hover:text-white'}`}
                title="Normal Text Size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-1.5 py-0.5 rounded ${fontSize === 'large' ? 'bg-[#043D2E] text-white font-bold' : 'hover:text-white'}`}
                title="Large Text Size"
              >
                A+
              </button>
            </div>

            <span className="text-emerald-400">|</span>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 font-semibold">
              <button
                onClick={() => setLanguage('HI')}
                className={`hover:text-white ${language === 'HI' ? 'text-amber-300 font-bold' : ''}`}
              >
                हिन्दी
              </button>
              <span className="text-emerald-400">/</span>
              <button
                onClick={() => setLanguage('EN')}
                className={`hover:text-white ${language === 'EN' ? 'text-amber-300 font-bold' : ''}`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tier 1: Government Identity Banner (White Background - Flush Left Alignment) ── */}
      <header className="bg-white text-slate-900 border-b border-slate-200 shadow-sm py-2 px-3 sm:px-6">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Column: Emblem & Government of India Identity (Flush Left) */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto pl-0">
            <EmblemLogo variant="dark" />
          </div>

          {/* Middle Column: BhumiTrace Branding Centered */}
          <div
            onClick={() => onNavigatePage('home')}
            className="text-center cursor-pointer select-none"
          >
            <div className="text-2xl sm:text-3xl font-black tracking-wide text-[#064E3B] leading-tight font-mono drop-shadow-sm">
              BhumiTrace
            </div>
            <div className="text-[11px] text-amber-700 font-extrabold leading-tight tracking-tight">
              भूमि-ट्रेस • Digital Land Records Portal
            </div>
          </div>

          {/* Right Column: Digital India Tricolor Logo + Portal Login Button */}
          <div className="flex items-center gap-4 shrink-0 self-end md:self-auto">
            <DigitalIndiaLogo />
            <span className="hidden sm:inline text-slate-300">|</span>
            {isAuthenticated && onGoToDashboard ? (
              <button
                onClick={onGoToDashboard}
                className="bg-[#064E3B] hover:bg-[#043D2E] text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 shadow-sm transition"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Officer Desk</span>
              </button>
            ) : (
              <button
                onClick={() => onLoginClick()}
                className="bg-[#064E3B] hover:bg-[#043D2E] text-white text-xs font-extrabold px-4 py-2 rounded shadow-md transition"
              >
                Portal Login
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ── Tier 2: Dedicated Navigation Bar BELOW Government Identity (Flush Left Nav Options) ── */}
      <nav className="bg-[#064E3B] text-white border-b-2 border-amber-500 shadow-md">
        <div className="w-full px-3 sm:px-6 py-1 flex items-center justify-start font-semibold text-xs text-slate-100">
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 w-full justify-start pl-0">
            <button
              onClick={() => onNavigatePage('home')}
              className={`px-4 py-2 rounded transition whitespace-nowrap ${
                activePage === 'home'
                  ? 'bg-[#043D2E] text-amber-300 font-extrabold border-b-2 border-amber-400 shadow-inner'
                  : 'hover:bg-[#043D2E] hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigatePage('land-records')}
              className={`px-4 py-2 rounded transition whitespace-nowrap ${
                activePage === 'land-records'
                  ? 'bg-[#064E3B] text-amber-300 font-extrabold border-b-2 border-amber-400 shadow-inner'
                  : 'hover:bg-[#064E3B] hover:text-white'
              }`}
            >
              Land Records
            </button>
            <button
              onClick={() => onNavigatePage('gis')}
              className={`px-4 py-2 rounded transition whitespace-nowrap ${
                activePage === 'gis'
                  ? 'bg-[#064E3B] text-amber-300 font-extrabold border-b-2 border-amber-400 shadow-inner'
                  : 'hover:bg-[#064E3B] hover:text-white'
              }`}
            >
              GIS Map
            </button>
            <button
              onClick={() => onNavigatePage('services')}
              className={`px-4 py-2 rounded transition whitespace-nowrap ${
                activePage === 'services'
                  ? 'bg-[#064E3B] text-amber-300 font-extrabold border-b-2 border-amber-400 shadow-inner'
                  : 'hover:bg-[#064E3B] hover:text-white'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => onNavigatePage('notices')}
              className={`px-4 py-2 rounded transition whitespace-nowrap ${
                activePage === 'notices'
                  ? 'bg-[#064E3B] text-amber-300 font-extrabold border-b-2 border-amber-400 shadow-inner'
                  : 'hover:bg-[#064E3B] hover:text-white'
              }`}
            >
              Notices
            </button>
            <button
              onClick={() => onNavigatePage('help')}
              className={`px-4 py-2 rounded transition whitespace-nowrap ${
                activePage === 'help'
                  ? 'bg-[#064E3B] text-amber-300 font-extrabold border-b-2 border-amber-400 shadow-inner'
                  : 'hover:bg-[#064E3B] hover:text-white'
              }`}
            >
              Help
            </button>
          </div>
        </div>
      </nav>

      {/* Continuous Running Notice Ticker Banner */}
      {showTicker && (
        <div className="bg-[#081E34] text-white text-xs border-b border-amber-500/40 flex items-center overflow-hidden h-9 shadow-inner select-none">
          <div className="bg-[#064E3B] text-amber-300 font-extrabold px-3 py-2 flex items-center gap-1.5 shrink-0 z-10 border-r border-emerald-800 text-[11px] uppercase tracking-wider shadow-sm">
            <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>LATEST NOTICES</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap flex-1 relative flex items-center">
            <div className="animate-marquee pl-4">
              {NOTICES_TICKER.concat(NOTICES_TICKER).map((item, i) => (
                <span
                  key={i}
                  onClick={() => onNavigatePage('notices')}
                  className="inline-flex items-center gap-2 mr-10 cursor-pointer hover:underline"
                >
                  <span className="text-slate-100 font-medium text-[11px]">{item}</span>
                  <span className="text-amber-400 font-bold ml-2">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
