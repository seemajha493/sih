import React from 'react';
import type { PublicPageTab } from '../common/PublicHeader';
import { PublicHeader } from '../common/PublicHeader';
import { PublicFooter } from '../common/PublicFooter';
import type { UserRole } from '../../types/auth';
import {
  FileText,
  Map,
  CheckSquare,
  FileSearch,
  HelpCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ServicesPageProps {
  onNavigatePage: (page: PublicPageTab) => void;
  isAuthenticated?: boolean;
  onLoginClick: (role?: UserRole) => void;
  onGoToDashboard?: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  onNavigatePage,
  isAuthenticated,
  onLoginClick,
  onGoToDashboard,
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none text-[#1F2937]">
      <PublicHeader
        activePage="services"
        onNavigatePage={onNavigatePage}
        isAuthenticated={isAuthenticated}
        onLoginClick={onLoginClick}
        onGoToDashboard={onGoToDashboard}
      />

      {/* Main Page Title Banner */}
      <div className="bg-[#064E3B] text-white py-8 px-4 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded bg-[#043D2E] border border-amber-400/50 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            DEPARTMENT OF LAND RESOURCES • E-SERVICES PORTAL
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Digital Land Services & Citizen Facilities
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
            Access certified Record of Rights (RoR), spatial cadastral GIS maps, document verification, mutation tracking, and public grievance resolution from one secure government portal.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* 5 Core BhumiTrace Services */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#064E3B]">
              Essential Digital Land Services
            </h2>
            <p className="text-xs text-slate-500">
              Select a service below to access verified land records, maps, and departmental tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Search Land Records */}
            <div className="p-5 bg-white border border-slate-300 rounded flex flex-col justify-between space-y-4 hover:border-[#064E3B] transition group shadow-sm">
              <div className="space-y-2">
                <div className="p-2 bg-slate-100 border border-slate-300 text-[#064E3B] w-fit rounded group-hover:bg-[#064E3B] group-hover:text-white transition">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">1. Search Land Records</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Query verified RoR titles, Jamabandi registers, Khatoni details, Khewat numbers, and owner names across all pilot tehsils.
                </p>
              </div>

              <div>
                <button
                  onClick={() => onNavigatePage('land-records')}
                  className="bg-[#064E3B] hover:bg-[#043D2E] text-white text-xs font-bold py-2 px-4 rounded transition flex items-center justify-between w-full"
                >
                  <span>Open Land Records Directory</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. View GIS Map */}
            <div className="p-5 bg-white border border-slate-300 rounded flex flex-col justify-between space-y-4 hover:border-[#064E3B] transition group shadow-sm">
              <div className="space-y-2">
                <div className="p-2 bg-slate-100 border border-slate-300 text-[#064E3B] w-fit rounded group-hover:bg-[#064E3B] group-hover:text-white transition">
                  <Map className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">2. View GIS Map</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Explore geo-referenced cadastral parcel boundaries, satellite overlays, and spatial polygon mapping synchronized with textual titles.
                </p>
              </div>

              <div>
                <button
                  onClick={() => onNavigatePage('gis')}
                  className="bg-[#064E3B] hover:bg-[#043D2E] text-white text-xs font-bold py-2 px-4 rounded transition flex items-center justify-between w-full"
                >
                  <span>Open Spatial GIS Viewer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3. Verify Document */}
            <div className="p-5 bg-white border border-slate-300 rounded flex flex-col justify-between space-y-4 hover:border-[#064E3B] transition group shadow-sm">
              <div className="space-y-2">
                <div className="p-2 bg-slate-100 border border-slate-300 text-[#064E3B] w-fit rounded group-hover:bg-[#064E3B] group-hover:text-white transition">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">3. Verify Document</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Validate official authenticity and tamper-proof digital seals on scanned land title copies authorized by Revenue Officers.
                </p>
              </div>

              <div>
                <button
                  onClick={() => onLoginClick()}
                  className="bg-amber-500 hover:bg-amber-600 text-[#064E3B] text-xs font-extrabold py-2 px-4 rounded transition flex items-center justify-between w-full"
                >
                  <span>Access Verification Desk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 4. Track Mutation */}
            <div className="p-5 bg-white border border-slate-300 rounded flex flex-col justify-between space-y-4 hover:border-[#064E3B] transition group shadow-sm">
              <div className="space-y-2">
                <div className="p-2 bg-slate-100 border border-slate-300 text-[#064E3B] w-fit rounded group-hover:bg-[#064E3B] group-hover:text-white transition">
                  <FileSearch className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">4. Track Mutation Status</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Monitor live audit progression and Tehsil approval stages for land ownership transfer and mutation applications.
                </p>
              </div>

              <div>
                <button
                  onClick={() => onLoginClick()}
                  className="bg-[#064E3B] hover:bg-[#043D2E] text-white text-xs font-bold py-2 px-4 rounded transition flex items-center justify-between w-full"
                >
                  <span>Track Mutation Progress</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 5. Report an Issue */}
            <div className="p-5 bg-white border border-slate-300 rounded flex flex-col justify-between space-y-4 hover:border-[#064E3B] transition group shadow-sm">
              <div className="space-y-2">
                <div className="p-2 bg-slate-100 border border-slate-300 text-[#064E3B] w-fit rounded group-hover:bg-[#064E3B] group-hover:text-white transition">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">5. Report an Issue / Discrepancy</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Submit record discrepancy claims, spelling corrections, or survey polygon boundary alignment grievances to Tehsil officers.
                </p>
              </div>

              <div>
                <button
                  onClick={() => onNavigatePage('help')}
                  className="bg-[#064E3B] hover:bg-[#043D2E] text-white text-xs font-bold py-2 px-4 rounded transition flex items-center justify-between w-full"
                >
                  <span>Submit Grievance Form</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </section>

      </main>

      <PublicFooter onNavigatePage={onNavigatePage} />
    </div>
  );
};
