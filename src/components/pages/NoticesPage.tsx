import React, { useState } from 'react';
import type { PublicPageTab } from '../common/PublicHeader';
import { PublicHeader } from '../common/PublicHeader';
import { PublicFooter } from '../common/PublicFooter';
import type { UserRole } from '../../types/auth';
import {
  Bell,
  Search,
  Download,
  Filter,
  ShieldCheck
} from 'lucide-react';

interface NoticesPageProps {
  onNavigatePage: (page: PublicPageTab) => void;
  isAuthenticated?: boolean;
  onLoginClick: (role?: UserRole) => void;
  onGoToDashboard?: () => void;
}

interface NoticeItem {
  id: string;
  date: string;
  title: string;
  dept: string;
  category: string;
  summary: string;
}

const ALL_NOTICES: NoticeItem[] = [
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
  {
    id: 'NOT-2026-065',
    date: '15 Aug 2026',
    title: 'DILRMP Central Monitoring Unit announces 98.4% completion rate for RoR digitization across pilot tehsils.',
    dept: 'Department of Land Resources',
    category: 'Progress Report',
    summary: 'Central audit reveals 1.48 million land records digitized with AI OCR parsing and Revenue Officer signature validation.',
  },
];

export const NoticesPage: React.FC<NoticesPageProps> = ({
  onNavigatePage,
  isAuthenticated,
  onLoginClick,
  onGoToDashboard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedNoticeModal, setSelectedNoticeModal] = useState<NoticeItem | null>(null);

  const categories = ['ALL', ...Array.from(new Set(ALL_NOTICES.map((n) => n.category)))];

  const filteredNotices = ALL_NOTICES.filter((n) => {
    if (selectedCategory !== 'ALL' && n.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.dept.toLowerCase().includes(q) ||
        n.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none text-[#1F2937]">
      <PublicHeader
        activePage="notices"
        onNavigatePage={onNavigatePage}
        isAuthenticated={isAuthenticated}
        onLoginClick={onLoginClick}
        onGoToDashboard={onGoToDashboard}
      />

      {/* Title Banner */}
      <div className="bg-[#064E3B] text-white py-8 px-4 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded bg-[#043D2E] border border-amber-400/50 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            DEPARTMENT OF LAND RESOURCES • OFFICIAL GAZETTE & NOTICES DIRECTORY
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Public Department Notices & Advisory Circulars
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
            Browse complete official notifications, policy directives, DILRMP Phase-III SOP guidelines, and pilot tehsil release announcements.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
        
        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-300 rounded p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter notices by keyword, notice ID or department..."
                className="w-full bg-slate-50 text-slate-900 text-xs rounded pl-9 pr-3 py-2 border border-slate-300 focus:outline-none focus:border-[#064E3B]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-slate-600 font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 text-slate-900 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notices Directory List */}
        <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-[#064E3B] uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#064E3B]" />
              <span>Official Department Circulars ({filteredNotices.length} Items)</span>
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredNotices.map((n) => (
              <div key={n.id} className="p-5 hover:bg-slate-50 transition space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="gov-badge gov-badge-info">{n.category}</span>
                    <span className="font-mono text-xs font-bold text-[#064E3B]">{n.id}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-600">{n.date}</span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">{n.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{n.summary}</p>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs gap-2">
                  <span className="text-slate-500">Authority: <strong>{n.dept}</strong></span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedNoticeModal(n)}
                      className="text-[#064E3B] font-bold hover:underline"
                    >
                      Read Full Notice
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={() => alert(`Downloading official PDF (${n.id}.pdf)`)}
                      className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Single Notice Inspector Modal */}
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
                <span>Official e-Gazette Copy PDF</span>
                <button
                  onClick={() => alert(`Downloading official document ${selectedNoticeModal.id}.pdf`)}
                  className="font-bold text-[#064E3B] hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
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

      <PublicFooter onNavigatePage={onNavigatePage} />
    </div>
  );
};
