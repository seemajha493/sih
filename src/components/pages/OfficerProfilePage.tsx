import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  Key,
  BadgeCheck,
  Building2,
  FileCheck2,
  Lock,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const OfficerProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [anomalyAlerts, setAnomalyAlerts] = useState(true);

  const ToggleSwitch: React.FC<{ on: boolean; onChange: (v: boolean) => void }> = ({
    on,
    onChange
  }) => (
    <button
      onClick={() => onChange(!on)}
      className={`w-10 h-5 rounded-full transition-colors relative ${
        on ? 'bg-[#064E3B]' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          on ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-5 pb-8 select-none max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="gov-card p-5 rounded border border-slate-300 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#064E3B] text-white flex items-center justify-center font-bold text-xl border-2 border-emerald-700 shadow-sm shrink-0">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
              : 'RO'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {user?.name || 'Officer Profile'}
              </h1>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">
                <BadgeCheck className="w-3 h-3 text-emerald-700" />
                Active Land Record Officer
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {user?.department || 'Department of Land Resources'} · Govt. of India / State Revenue Cadre
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-1">
              <span>Employee ID: <strong className="text-slate-800">LRO-RJ-84920</strong></span>
              <span>•</span>
              <span>Cadre: <strong className="text-slate-800">Tehsildar / Revenue Inspector</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-right hidden sm:block">
            <div className="text-[10px] font-bold uppercase text-slate-400">Security Clearance</div>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 justify-end">
              <Shield className="w-3.5 h-3.5" /> Level 2 (Officer Sign-Off)
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Officer Official Information */}
        <div className="lg:col-span-2 space-y-5">
          {/* Official Information Card */}
          <div className="gov-card p-5 rounded border border-slate-300 bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Building2 className="w-4 h-4 text-[#064E3B]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Official Jurisdiction & Department Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Assigned Revenue Circle
                </span>
                <span className="font-bold text-slate-900">Rampur & Chaksu Tehsil Circles</span>
                <span className="text-[11px] text-slate-600 block">Sub-Division: Chaksu, Dist. Jaipur</span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  State Administrative Headquarters
                </span>
                <span className="font-bold text-slate-900">Revenue Board of Rajasthan</span>
                <span className="text-[11px] text-slate-600 block">State Code: RJ (Rajasthan)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Official Email Address
                </span>
                <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user?.email || 'officer.jaipur@bhumi.gov.in'}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">NIC GovMail Verified</span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Official Contact Phone
                </span>
                <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  +91 141 222 8490 (Ext. 204)
                </span>
                <span className="text-[10px] text-slate-500">Office Intercom / CUG</span>
              </div>

              <div className="sm:col-span-2 p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Posting Office Location
                </span>
                <div className="flex items-start gap-1.5 text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>Tehsil Revenue Complex, NH-12, Chaksu Rural, Jaipur District, Rajasthan — 303901</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Duties & Permissions */}
          <div className="gov-card p-5 rounded border border-slate-300 bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <FileCheck2 className="w-4 h-4 text-[#064E3B]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Statutory Delegated Powers
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { title: 'Cadastral Survey Digitization', desc: 'Scan, OCR extract, and digitize legacy Jamabandi sheets' },
                { title: 'Mutation & Title Verification', desc: 'Verify and approve ownership updates and inheritance transfers' },
                { title: 'Boundary Discrepancy Inquiries', desc: 'Investigate GIS overlap flags and cadastral vertex anomalies' },
                { title: 'Digital Land Record Sealing', desc: 'Apply digital signature certificates (DSC) to approved RoR records' },
              ].map((duty) => (
                <div key={duty.title} className="p-3 border border-slate-200 rounded bg-white space-y-1">
                  <div className="font-bold text-[#064E3B] flex items-center gap-1.5">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                    {duty.title}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">{duty.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Authentication Credentials */}
          <div className="gov-card p-5 rounded border border-slate-300 bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Key className="w-4 h-4 text-[#064E3B]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Authentication & Digital Credentials
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-[#064E3B]" />
                  <div>
                    <div className="font-bold text-slate-900">NIC Digital Signature Certificate (DSC)</div>
                    <div className="text-[11px] text-slate-500">Class 3 Government e-Sign Token · Valid till 15 Dec 2027</div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded border border-emerald-300">
                  TOKEN CONNECTED
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-[#064E3B]" />
                  <div>
                    <div className="font-bold text-slate-900">Two-Factor Authentication (Gov e-Pramaan)</div>
                    <div className="text-[11px] text-slate-500">Mandatory OTP via Aadhaar-linked mobile for every approval session</div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded border border-blue-300">
                  ENFORCED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Officer Work Summary & Alerts */}
        <div className="space-y-5">
          {/* Work Summary Widget */}
          <div className="gov-card p-5 rounded border border-slate-300 bg-[#064E3B] text-white space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-emerald-700/60 pb-2">
              <Cpu className="w-4 h-4 text-amber-300" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Assigned Desk Statistics
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-100">Total Digitize Batches</span>
                <span className="font-mono font-bold text-base">42</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-100">Records Verified & Sealed</span>
                <span className="font-mono font-bold text-base text-emerald-300">1,420</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-100">Pending Mutation Reviews</span>
                <span className="font-mono font-bold text-base text-amber-300">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-100">Boundary Queries Resolved</span>
                <span className="font-mono font-bold text-base">34</span>
              </div>
            </div>
          </div>

          {/* Officer Notification Preferences */}
          <div className="gov-card p-5 rounded border border-slate-300 bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Bell className="w-4 h-4 text-[#064E3B]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Departmental Alerts
              </h2>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-slate-800 block">Pending Queue Alerts</span>
                  <span className="text-[10px] text-slate-500">Daily summary of unverified Jamabandis</span>
                </div>
                <ToggleSwitch on={emailAlerts} onChange={setEmailAlerts} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-slate-800 block">High Anomaly SMS</span>
                  <span className="text-[10px] text-slate-500">Immediate SMS when AI detects forgery risk</span>
                </div>
                <ToggleSwitch on={smsAlerts} onChange={setSmsAlerts} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-slate-800 block">Cadastral Overlap Notices</span>
                  <span className="text-[10px] text-slate-500">GIS boundary conflict triggers</span>
                </div>
                <ToggleSwitch on={anomalyAlerts} onChange={setAnomalyAlerts} />
              </div>
            </div>
          </div>

          {/* Session Information */}
          <div className="p-4 bg-slate-100 rounded border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 uppercase text-[10px]">Secure NIC Session</div>
            <div>NIC VPN Gateway: <span className="font-mono font-semibold text-slate-800">10.142.64.12</span></div>
            <div>Access Protocol: <span className="font-mono font-semibold text-emerald-700">TLS 1.3 · IPsec</span></div>
            <div>Authorized Jurisdictions: <span className="font-semibold text-slate-800">Chaksu Tehsil (Villages 1-42)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
