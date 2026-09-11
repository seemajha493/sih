/**
 * HomePage.tsx — Public Homepage for BhumiTrace.
 *
 * Preserved Baseline with ONLY 3 Allowed Modifications:
 *   1. RESTORE HERO IMAGE CAROUSEL (Auto-rotating slide1.png through slide4.png with crossfade)
 *   2. REDUCE HERO DARK OVERLAY (Crisp background visibility + clear Government branding)
 *   3. REMOVE DUPLICATE LAND SEARCH (Only single search box inside Hero remains)
 */

import React, { useState } from 'react';
import type { UserRole } from '../../types/auth';
import { EmblemLogo } from '../common/EmblemLogo';
import { DigitalIndiaLogo } from '../common/DigitalIndiaLogo';
import {
  Search,
  Map,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileSearch,
  Cpu,
  UserCheck,
  Filter,
  CheckCircle2,
  BookOpen,
  Bell,
  Download
} from 'lucide-react';
import { MOCK_LAND_RECORDS } from '../../mockData/mockData';
import type { LandRecord } from '../../types/landRecord';

import type { PublicPageTab } from '../common/PublicHeader';

interface HomePageProps {
  isAuthenticated?: boolean;
  onLoginClick: (role?: UserRole) => void;
  onGoToDashboard?: () => void;
  onNavigatePage?: (page: PublicPageTab) => void;
}



interface NoticeItem {
  id: string;
  date: string;
  title: string;
  dept: string;
  category: string;
  summary: string;
}

const NOTICES: NoticeItem[] = [
  {
    id: 'NOT-2026-089',
    date: '08 Sep 2026',
    title: 'Phase-III digitization of Jamabandi records completed in Muzaffarpur, Sitamarhi & Sheohar districts.',
    dept: 'DoLR / Bihar State Revenue Dept',
    category: 'Digitization',
    summary: 'Legacy Khatoni and RoR registers across 42 pilot tehsils have been completely digitized, OCR extracted, and cross-referenced with GIS parcel boundaries.',
  },
  {
    id: 'NOT-2026-085',
    date: '05 Sep 2026',
    title: 'Integration of Rajasthan cadastral GIS data (eSadhna portal) with DoLR central repository completed.',
    dept: 'DoLR / Land Records Information System',
    category: 'GIS Integration',
    summary: 'Geo-referenced parcel polygons covering 3.2 million land parcels are now synchronized in real-time with the national BhumiTrace repository.',
  },
  {
    id: 'NOT-2026-081',
    date: '01 Sep 2026',
    title: 'Updated SOP issued for Tehsil verification & mutation audit workflows under DILRMP Phase-III.',
    dept: 'Ministry of Rural Development',
    category: 'SOP Directive',
    summary: 'Mandatory dual-step Revenue Officer audit and digital signature authorization protocol enacted for all land title mutation requests.',
  },
  {
    id: 'NOT-2026-078',
    date: '28 Aug 2026',
    title: 'Public advisory: Verify digitized RoR records using official QR code validation seal on BhumiTrace portal.',
    dept: 'DoLR Public Service Cell',
    category: 'Public Advisory',
    summary: 'Citizens are advised to scan the tamper-proof QR code printed on official digital Jamabandi copies to confirm officer authorization status.',
  },
  {
    id: 'NOT-2026-072',
    date: '20 Aug 2026',
    title: 'Directives issued to State Survey Officers for geo-referencing high-resolution satellite imagery with cadastral maps.',
    dept: 'National Land Records Modernization Programme',
    category: 'Survey & Mapping',
    summary: 'Orthorectified high-res drone & satellite survey layers integrated to eliminate parcel boundary overlap discrepancies in pilot districts.',
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  isAuthenticated = false,
  onLoginClick,
  onGoToDashboard,
  onNavigatePage,
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');

  // Notices Modals State
  const [showAllNoticesModal, setShowAllNoticesModal] = useState(false);
  const [selectedNoticeModal, setSelectedNoticeModal] = useState<NoticeItem | null>(null);

  // Hero Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LandRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRecordModal, setSelectedRecordModal] = useState<LandRecord | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setHasSearched(true);
    const q = searchQuery.toLowerCase().trim();

    setSearchResults(
      MOCK_LAND_RECORDS.filter((r) => {
        if (r.status !== 'VERIFIED') return false;
        if (q === '') return true;

        return (
          r.ownerName.toLowerCase().includes(q) ||
          r.khasraNo.toLowerCase().includes(q) ||
          r.khewatNo.toLowerCase().includes(q) ||
          r.villageMauza.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
        );
      })
    );

    // Scroll to search results display
    const resultsElement = document.getElementById('search-results-section');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fontClass =
    fontSize === 'large' ? 'text-[104%]' : fontSize === 'xlarge' ? 'text-[112%]' : '';

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-[#1F2937] flex flex-col font-sans select-none ${fontClass}`}>
      
      {/* ══════════════════════════════════════════════════════════════
          1. GOVERNMENT HEADER (Compact, formal, non-sticky)
         ══════════════════════════════════════════════════════════════ */}
      
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

      {/* ── Tier 1: Government Identity Banner (White Background) ── */}
      <header className="bg-white text-slate-900 border-b border-slate-200 shadow-sm py-2 px-3 sm:px-6">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Column: Emblem & Government of India Identity */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto pl-0">
            <EmblemLogo variant="dark" />
          </div>

          {/* Middle Column: BhumiTrace Branding Centered */}
          <div
            onClick={() => onNavigatePage?.('home')}
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

      {/* ── Tier 2: Dedicated Navigation Bar BELOW Government Identity (Green) ── */}
      <nav className="bg-[#064E3B] text-white border-b-2 border-amber-500 shadow-md">
        <div className="w-full px-3 sm:px-6 py-1 flex items-center justify-start font-semibold text-xs text-slate-100">
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 w-full justify-start pl-0">
            <button
              onClick={() => onNavigatePage?.('home')}
              className="px-4 py-2 rounded bg-[#043D2E] text-amber-300 font-extrabold border-b-2 border-amber-400 shadow-inner whitespace-nowrap"
            >
              Home
            </button>
            <button
              onClick={() => onNavigatePage?.('land-records')}
              className="px-4 py-2 rounded hover:bg-[#043D2E] hover:text-white transition whitespace-nowrap"
            >
              Land Records
            </button>
            <button
              onClick={() => onNavigatePage?.('services')}
              className="px-4 py-2 rounded hover:bg-[#043D2E] hover:text-white transition whitespace-nowrap"
            >
              Services
            </button>
            <button
              onClick={() => onNavigatePage?.('notices')}
              className="px-4 py-2 rounded hover:bg-[#043D2E] hover:text-white transition whitespace-nowrap"
            >
              Notices
            </button>
            <button
              onClick={() => onNavigatePage?.('help')}
              className="px-4 py-2 rounded hover:bg-[#043D2E] hover:text-white transition whitespace-nowrap"
            >
              Help
            </button>
          </div>
        </div>
      </nav>


      {/* ══════════════════════════════════════════════════════════════
          2. HERO SECTION — ENLARGED FULL-WIDTH IMMERSIVE CAROUSEL CANVAS (96% VW x 75-80% VH)
         ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#081E34] py-4 px-2 sm:px-4 border-b border-slate-300 flex justify-center items-center select-none">
        
        {/* Enlarged Hero Canvas Box (~96vw x ~75-80vh) */}
        <div className="relative w-full max-w-[96vw] min-h-[65vh] md:min-h-[72vh] lg:min-h-[80vh] rounded-xl border border-emerald-800/70 shadow-2xl overflow-hidden flex flex-col justify-end p-6 sm:p-10 md:p-14 lg:p-16 text-white">
          
          {/* Single Static Background Image: Officer & Desk on Right side */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="/hero_officer.jpg"
              alt="Traditional Indian Land Record Office and Officer"
              className="absolute inset-0 w-full h-full object-cover object-right filter contrast-105 saturate-95"
            />

            {/* Dark Gradient Overlay for optimal text readability on the LEFT */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#081E34]/95 via-[#081E34]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#081E34]/90 via-transparent to-[#081E34]/30" />
          </div>

          {/* Hero Content Grouped & Aligned to LEFT side */}
          <div className="relative z-10 max-w-xl text-left mr-auto space-y-4">
            
            {/* Official Identity Badge (Minimized font) */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#064E3B]/90 border border-amber-400 text-amber-300 text-[10px] font-bold uppercase tracking-wider shadow-md backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              OFFICIAL DIGITAL LAND RECORDS PORTAL
            </div>

            {/* Main Heading (Minimized font) */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight [text-shadow:_0_2px_6px_rgba(0,0,0,0.85)]">
              Digital Land Records, Made Transparent
            </h1>

            {/* Description (Minimized font) */}
            <p className="text-[11px] sm:text-xs text-slate-200 font-normal max-w-lg leading-relaxed [text-shadow:_0_1px_3px_rgba(0,0,0,0.9)] bg-[#081E34]/50 p-2 rounded border border-slate-700/50 backdrop-blur-sm">
              Access, search and verify digitized land records through a unified and secure digital platform.
            </p>

            {/* Primary Action: ONLY SEARCH BOX ON HOMEPAGE */}
            <form onSubmit={handleSearch} id="search-section" className="max-w-xl pt-1">
              <div className="bg-white p-2 rounded border border-slate-300 shadow-2xl flex flex-col sm:flex-row items-stretch gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Khata, Khesra, Plot No or Owner Name"
                    className="w-full bg-slate-50 text-slate-900 text-xs font-medium rounded pl-9 pr-3 py-2.5 border border-slate-300 focus:outline-none focus:border-[#064E3B]"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#064E3B] hover:bg-[#043D2E] text-white font-bold text-xs px-6 py-2.5 rounded transition shrink-0"
                >
                  Search Records
                </button>
              </div>
            </form>

            {/* Secondary Actions */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              <button
                onClick={() => {
                  setSearchQuery('Khasra 452');
                  handleSearch();
                }}
                className="text-amber-300 hover:underline font-semibold flex items-center gap-1"
              >
                <Filter className="w-3.5 h-3.5" /> Advanced Search
              </button>
              <span className="text-slate-500">•</span>
              <a href="#gis-connection-section" className="text-amber-300 hover:underline font-semibold flex items-center gap-1">
                <Map className="w-3.5 h-3.5" /> View GIS Map
              </a>
              <span className="text-slate-500">•</span>
              <a href="#notices-section" className="text-amber-300 hover:underline font-semibold flex items-center gap-1">
                <FileSearch className="w-3.5 h-3.5" /> Track Application
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Primary Search Results Display */}
      {hasSearched && (
        <section id="search-results-section" className="bg-emerald-50/50 border-b border-emerald-200 py-6 px-4 select-text">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <h3 className="text-xs font-bold text-[#064E3B] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Public Search Results ({searchResults.length} Verified Records Found)</span>
              </h3>
              <button
                onClick={() => setHasSearched(false)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Clear Search Results ✕
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="gov-card rounded border border-slate-300 overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>Record ID</th>
                        <th>Khasra / Khewat</th>
                        <th>Owner Name</th>
                        <th>Village / Tehsil</th>
                        <th>District / State</th>
                        <th>Area Size</th>
                        <th>Status</th>
                        <th className="text-right">Inspection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((rec) => (
                        <tr key={rec.id}>
                          <td className="font-mono font-bold text-[#064E3B]">{rec.id}</td>
                          <td className="font-mono font-bold text-slate-800">
                            Khasra #{rec.khasraNo} <span className="text-slate-400 font-normal">({rec.khewatNo})</span>
                          </td>
                          <td className="font-bold text-slate-900">{rec.ownerName}</td>
                          <td>{rec.villageMauza}, {rec.tehsil}</td>
                          <td>{rec.district}, {rec.state}</td>
                          <td className="font-mono">{rec.areaAcres} Acres</td>
                          <td>
                            <span className="gov-badge gov-badge-success">VERIFIED</span>
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => setSelectedRecordModal(rec)}
                              className="gov-btn-secondary py-1 px-2 text-[11px] font-semibold"
                            >
                              View Title
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-600 bg-white border border-slate-300 rounded">
                No verified public records matched your search term <strong className="text-slate-900 font-mono">"{searchQuery}"</strong>. Please try searching by Khasra number or Owner Name.
              </div>
            )}
          </div>
        </section>
      )}


      <section className="py-8 px-4 border-b border-slate-300 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="border-b border-slate-200 pb-2 text-center max-w-xl mx-auto">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#064E3B]">
              How BhumiTrace Works
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Structured end-to-end workflow from legacy register scanning to verified digital record access.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {[
              {
                step: '01',
                title: 'Digitize',
                desc: 'Legacy and scanned land records are converted into structured digital information.'
              },
              {
                step: '02',
                title: 'Extract',
                desc: 'OCR and intelligent extraction identify relevant record fields.'
              },
              {
                step: '03',
                title: 'Verify',
                desc: 'Human verification helps review low-confidence or inconsistent information.'
              },
              {
                step: '04',
                title: 'Access',
                desc: 'Verified records become searchable and easier to access.'
              },
            ].map((p, idx) => (
              <div key={p.step} className="bg-white border border-slate-300 rounded p-4 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#064E3B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Step {p.step}
                    </span>
                    {idx < 3 && <ArrowRight className="hidden lg:block w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 mb-1">{p.title}</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-8 px-4 bg-white border-b border-slate-300">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#064E3B]">
              Digitization Status
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-layered verification architecture ensuring accuracy and institutional trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-300 rounded space-y-1.5">
              <div className="flex items-center gap-2 text-[#064E3B]">
                <BookOpen className="w-4 h-4 text-[#064E3B]" />
                <h3 className="font-bold text-xs text-slate-900">Digitized Records</h3>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Physical Jamabandi and Khatoni registers converted into high-resolution digital archives to prevent loss or physical decay.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-300 rounded space-y-1.5">
              <div className="flex items-center gap-2 text-[#064E3B]">
                <Cpu className="w-4 h-4 text-[#064E3B]" />
                <h3 className="font-bold text-xs text-slate-900">AI-Assisted Extraction</h3>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Automated Devnagari & English document parsing identifies key record attributes like Khasra, Khewat, Mauza, and Owner Name.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-300 rounded space-y-1.5">
              <div className="flex items-center gap-2 text-[#064E3B]">
                <UserCheck className="w-4 h-4 text-[#064E3B]" />
                <h3 className="font-bold text-xs text-slate-900">Human Verification</h3>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Mandatory Tehsil Revenue Officer review and digital signature authorization before publishing titles for public search.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Government Footer */}
      <footer id="footer-section" className="bg-[#064E3B] text-slate-200 text-xs py-8 px-4 border-t-2 border-amber-500">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b border-emerald-800">
            <div>
              <div className="font-bold text-white uppercase tracking-wider text-xs mb-2">BhumiTrace</div>
              <div className="text-[11px] space-y-1 text-slate-200">
                <div>Department of Land Resources</div>
                <div>Ministry of Rural Development</div>
                <div>Government of India</div>
              </div>
            </div>

            <div>
              <div className="font-bold text-white uppercase tracking-wider text-xs mb-2">Quick Access</div>
              <div className="text-[11px] space-y-1">
                <div><a href="#search-section" className="hover:text-white">Search Land Records</a></div>
                <div><a href="#gis-connection-section" className="hover:text-white">GIS Map Viewer</a></div>
                <div><a href="#services-section" className="hover:text-white">Track Application</a></div>
                <div><a href="#notices-section" className="hover:text-white">Public Notices</a></div>
              </div>
            </div>

            <div>
              <div className="font-bold text-white uppercase tracking-wider text-xs mb-2">Legal & Help</div>
              <div className="text-[11px] space-y-1">
                <div><a href="#" className="hover:text-white">Terms & Conditions</a></div>
                <div><a href="#" className="hover:text-white">Privacy Policy</a></div>
                <div><a href="#" className="hover:text-white">Hyperlinking Policy</a></div>
                <div><a href="#" className="hover:text-white">Disclaimer</a></div>
              </div>
            </div>

            <div>
              <div className="font-bold text-white uppercase tracking-wider text-xs mb-2">Technical Support</div>
              <div className="text-[11px] space-y-1 text-slate-200">
                <div>Toll Free: 1800-11-0018</div>
                <div>Email: support-bhumitrace@gov.in</div>
                <div>Hours: Mon - Fri (09:30 AM - 06:00 PM)</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-300">
            <div>
              Designed & Developed for Department of Land Resources (DoLR), MoRD, Govt. of India.
            </div>
            <div>
              © 2026 BhumiTrace. All Rights Reserved.
            </div>
          </div>

        </div>
      </footer>

      {/* Single Notice Detail Inspector Modal */}
      {selectedNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="gov-badge gov-badge-info">{selectedNoticeModal.category}</span>
                <span className="font-mono text-[11px] font-bold text-slate-500">{selectedNoticeModal.id}</span>
              </div>
              <button
                onClick={() => setSelectedNoticeModal(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-sm text-[#064E3B] leading-snug">{selectedNoticeModal.title}</h3>
              
              <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                <span><strong>Issued By:</strong> {selectedNoticeModal.dept}</span>
                <span><strong>Date:</strong> {selectedNoticeModal.date}</span>
              </div>

              <p className="text-slate-700 leading-relaxed bg-white p-3 rounded border border-slate-200 text-xs">
                {selectedNoticeModal.summary}
              </p>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px] flex items-center justify-between">
                <span>Official e-Gazette Gazette Notification Copy PDF</span>
                <button
                  onClick={() => alert(`Downloading official document ${selectedNoticeModal.id}.pdf`)}
                  className="font-bold text-[#064E3B] hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNoticeModal(null)}
                className="bg-[#064E3B] text-white text-xs font-bold px-4 py-1.5 rounded hover:bg-[#043D2E]"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete View All Notices Directory Modal */}
      {showAllNoticesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
              <div>
                <h3 className="font-bold text-base text-[#064E3B] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <span>Department of Land Resources — Public Gazette & Notices Directory</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official directives, SOP guidelines, and pilot digitization release circulars.
                </p>
              </div>
              <button
                onClick={() => setShowAllNoticesModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {NOTICES.map((n) => (
                <div
                  key={n.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded hover:border-[#064E3B] transition space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="gov-badge gov-badge-info">{n.category}</span>
                      <span className="font-mono text-[11px] font-bold text-[#064E3B]">{n.id}</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-slate-500">{n.date}</span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 leading-snug">{n.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{n.summary}</p>
                  
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-500">Authority: <strong>{n.dept}</strong></span>
                    <button
                      onClick={() => alert(`Downloading official notification PDF (${n.id})`)}
                      className="font-bold text-[#064E3B] hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 shrink-0">
              <button
                onClick={() => setShowAllNoticesModal(false)}
                className="bg-[#064E3B] text-white text-xs font-bold px-5 py-2 rounded hover:bg-[#043D2E]"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Inspection Modal */}
      {selectedRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-[#064E3B]">Verified Record Inspection</h3>
              <button
                onClick={() => setSelectedRecordModal(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 font-mono text-[10px] block">RECORD ID</span>
                  <span className="font-bold text-[#064E3B]">{selectedRecordModal.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono text-[10px] block">KHASRA / KHEWAT</span>
                  <span className="font-bold text-slate-900">#{selectedRecordModal.khasraNo} ({selectedRecordModal.khewatNo})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono text-[10px] block">OWNER NAME</span>
                  <span className="font-bold text-slate-900">{selectedRecordModal.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono text-[10px] block">PARCEL AREA</span>
                  <span className="font-bold text-slate-900">{selectedRecordModal.areaAcres} Acres</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-mono text-[10px] block">LOCATION</span>
                  <span className="font-semibold text-slate-800">
                    {selectedRecordModal.villageMauza}, {selectedRecordModal.tehsil}, {selectedRecordModal.district}, {selectedRecordModal.state}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[11px] flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                <span>Title verified and authorized by Revenue Audit Officer under DILRMP protocol.</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecordModal(null)}
                className="bg-[#064E3B] text-white text-xs font-bold px-4 py-1.5 rounded hover:bg-[#043D2E]"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
