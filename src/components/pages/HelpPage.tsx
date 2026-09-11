import React, { useState } from 'react';
import type { PublicPageTab } from '../common/PublicHeader';
import { PublicHeader } from '../common/PublicHeader';
import { PublicFooter } from '../common/PublicFooter';
import type { UserRole } from '../../types/auth';
import {
  HelpCircle,
  BookOpen,
  PhoneCall,
  Mail,
  Search,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';

interface HelpPageProps {
  onNavigatePage: (page: PublicPageTab) => void;
  isAuthenticated?: boolean;
  onLoginClick: (role?: UserRole) => void;
  onGoToDashboard?: () => void;
}

const FAQS = [
  {
    q: 'How do I search for my land record (Jamabandi / RoR) on BhumiTrace?',
    a: 'You can search by entering your Khasra Number, Khewat / Khatauni Number, Plot Number, or Raiyat / Owner Name in the primary search bar. Navigate to the Land Records page from the navbar for advanced filtering by State, District, Tehsil, and Village Mauza.',
  },
  {
    q: 'How do I view cadastral boundary maps on the GIS Map viewer?',
    a: 'Click on "GIS Map" in the top navigation bar. The interactive spatial map allows you to click on any survey plot parcel polygon to inspect owner names, acreage size, status, and linked textual Jamabandi titles.',
  },
  {
    q: 'How can I verify the digital authenticity of a land document?',
    a: 'All digitized land records issued by BhumiTrace carry an official Revenue Audit Officer digital signature seal and QR code. Scan the QR code or use the "Verify Document" tool to validate title authenticity against the central DoLR repository.',
  },
  {
    q: 'How do I track the status of my land mutation application?',
    a: 'Select "Track Mutation" under Services or log in with your citizen credentials to view live approval stages, Tehsil audit logs, and officer verification sign-offs.',
  },
  {
    q: 'What should I do if there is a spelling mistake or boundary anomaly in my record?',
    a: 'You can submit a discrepancy report using the Helpdesk support form below or contact your local Revenue Tehsil Officer along with legacy paper Khatoni registers for audit correction.',
  },
];

export const HelpPage: React.FC<HelpPageProps> = ({
  onNavigatePage,
  isAuthenticated,
  onLoginClick,
  onGoToDashboard,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setContactName('');
    setContactEmail('');
    setContactMsg('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none text-[#1F2937]">
      <PublicHeader
        activePage="help"
        onNavigatePage={onNavigatePage}
        isAuthenticated={isAuthenticated}
        onLoginClick={onLoginClick}
        onGoToDashboard={onGoToDashboard}
      />

      {/* Banner */}
      <div className="bg-[#064E3B] text-white py-8 px-4 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded bg-[#043D2E] border border-amber-400/50 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            CITIZEN HELPDESK & SUPPORT CENTER • DOLR / MORD
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Help Center, FAQs & Citizen Assistance
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
            Find answers to common questions about land record searches, GIS cadastral maps, title verification, mutation tracking, and technical support.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Quick User Guides */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigatePage('land-records')}
            className="p-4 bg-white border border-slate-300 rounded hover:border-[#064E3B] transition cursor-pointer space-y-2 shadow-sm group"
          >
            <div className="p-2 bg-slate-100 border border-slate-300 text-[#064E3B] w-fit rounded group-hover:bg-[#064E3B] group-hover:text-white transition">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-slate-900">How to Search Records</h3>
            <p className="text-[11px] text-slate-600">Enter Khasra, Khewat or Owner Name in the search directory.</p>
          </div>

          <div
            onClick={() => onNavigatePage('gis')}
            className="p-4 bg-white border border-slate-300 rounded hover:border-[#064E3B] transition cursor-pointer space-y-2 shadow-sm group"
          >
            <div className="p-2 bg-slate-100 border border-slate-300 text-[#064E3B] w-fit rounded group-hover:bg-[#064E3B] group-hover:text-white transition">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-slate-900">How to Use GIS Map</h3>
            <p className="text-[11px] text-slate-600">Click on any plot polygon to inspect spatial boundary details.</p>
          </div>

          <div
            onClick={() => onNavigatePage('services')}
            className="p-4 bg-white border border-slate-300 rounded hover:border-[#064E3B] transition cursor-pointer space-y-2 shadow-sm group"
          >
            <div className="p-2 bg-slate-100 border border-slate-300 text-[#064E3B] w-fit rounded group-hover:bg-[#064E3B] group-hover:text-white transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-slate-900">Document Verification</h3>
            <p className="text-[11px] text-slate-600">Validate QR seals and officer digital signatures online.</p>
          </div>

          <div
            onClick={() => onNavigatePage('services')}
            className="p-4 bg-white border border-slate-300 rounded hover:border-[#064E3B] transition cursor-pointer space-y-2 shadow-sm group"
          >
            <div className="p-2 bg-slate-100 border border-slate-300 text-[#064E3B] w-fit rounded group-hover:bg-[#064E3B] group-hover:text-white transition">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-slate-900">Track Applications</h3>
            <p className="text-[11px] text-slate-600">Check live progress of land ownership transfer requests.</p>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#064E3B]">
              Frequently Asked Questions (FAQs)
            </h2>
            <p className="text-xs text-slate-500">
              Clear answers to common questions regarding digitized land records.
            </p>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-300 rounded overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 font-bold text-xs text-slate-900 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                {openFaq === idx && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact & Support Form */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          
          {/* Left Helpline Details */}
          <div className="md:col-span-5 bg-[#064E3B] text-white p-6 rounded border border-emerald-800 space-y-4">
            <h3 className="font-bold text-sm text-amber-300 uppercase tracking-wider">
              Department Support Channels
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 bg-[#043D2E] rounded border border-emerald-700/60">
                <PhoneCall className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Toll-Free National Helpline</div>
                  <div className="text-amber-300 font-mono text-sm font-extrabold mt-0.5">1800-11-0018</div>
                  <div className="text-[11px] text-slate-200 mt-1">Monday - Friday (09:30 AM to 06:00 PM)</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#043D2E] rounded border border-emerald-700/60">
                <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Official Helpdesk Email</div>
                  <div className="text-amber-300 font-mono text-xs font-bold mt-0.5">support-bhumitrace@gov.in</div>
                  <div className="text-[11px] text-slate-200 mt-1">Response time: Within 24-48 working hours</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Support Grievance Form */}
          <div className="md:col-span-7 bg-white p-6 rounded border border-slate-300 space-y-4">
            <h3 className="font-bold text-sm text-[#064E3B] uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#064E3B]" />
              <span>Submit a Support Inquiry / Grievance</span>
            </h3>

            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded text-xs space-y-2">
                <div className="font-bold flex items-center gap-2 text-sm text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Support Ticket Submitted Successfully!</span>
                </div>
                <p>Your inquiry reference number is <strong className="font-mono">TKT-2026-9481</strong>. Department support staff will review and respond shortly.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-[#1B365D] text-white font-bold text-xs px-3 py-1.5 rounded mt-2"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitGrievance} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded border border-slate-300 p-2"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded border border-slate-300 p-2"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Inquiry / Discrepancy Description</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Describe your query, record ID, or discrepancy details..."
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded border border-slate-300 p-2"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#1B365D] hover:bg-[#001E36] text-white font-bold text-xs px-5 py-2 rounded transition"
                >
                  Submit Helpdesk Inquiry
                </button>
              </form>
            )}
          </div>

        </section>

      </main>

      <PublicFooter onNavigatePage={onNavigatePage} />
    </div>
  );
};
