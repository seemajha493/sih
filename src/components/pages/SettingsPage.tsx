import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Save,
  Info,
  Shield,
  Cpu,
  Database,
  Bell,
  Sliders,
  ShieldAlert,
  Lock,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { CitizenProfilePage } from './CitizenProfilePage';

interface SettingsPageProps {
  onNavigateToDashboard?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateToDashboard }) => {
  const { user } = useAuth();

  // OCR & AI Thresholds
  const [ocrThreshold, setOcrThreshold] = useState(75);
  const [dupSimilarity, setDupSimilarity] = useState(85);
  const [anomalyRisk, setAnomalyRisk] = useState(60);

  // Validation & Workflow Rules
  const [autoRoute, setAutoRoute] = useState(true);
  const [mandatoryAnomalyReview, setMandatoryAnomalyReview] = useState(true);
  const [enableDuplicateMerging, setEnableDuplicateMerging] = useState(false);
  const [requireDualOfficerSignOff, setRequireDualOfficerSignOff] = useState(true);

  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [realtimeBadges, setRealtimeBadges] = useState(true);

  const [saved, setSaved] = useState(false);

  // Access check: System Administrator only
  if (user?.role === 'PUBLIC_USER') {
    return <CitizenProfilePage />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-white rounded border border-red-200 shadow-sm space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Access Denied: Restricted Administrative Area</h2>
          <p className="text-xs text-slate-600 mt-1">
            System Configuration is restricted to System Administrators only. Land Record Officers do not have permission to modify system-level AI pipelines or validation rules.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => onNavigateToDashboard && onNavigateToDashboard()}
            className="gov-btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Officer Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const ToggleSwitch: React.FC<{ on: boolean; onChange: (v: boolean) => void; disabled?: boolean }> = ({
    on,
    onChange,
    disabled = false
  }) => (
    <button
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      className={`w-10 h-5 rounded-full transition-colors relative ${
        on ? 'bg-[#064E3B]' : 'bg-slate-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          on ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  const SliderRow: React.FC<{
    label: string;
    description?: string;
    value: number;
    onChange: (v: number) => void;
    suffix?: string;
    color: string;
  }> = ({ label, description, value, onChange, suffix = '%', color }) => (
    <div className="space-y-1.5 p-3 bg-slate-50 rounded border border-slate-200">
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-slate-800 block">{label}</span>
          {description && <span className="text-[10px] text-slate-500">{description}</span>}
        </div>
        <span className={`font-mono font-bold text-sm ${color}`}>
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={30}
        max={99}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-[#064E3B] cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
        <span>30% (Permissive)</span>
        <span>99% (Strict)</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 pb-8 select-none max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="gov-card p-4 rounded border border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#064E3B] text-white flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                System Configuration & AI Rules
              </h1>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded border border-purple-300">
                ADMIN ONLY
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Department of Land Resources AI pipeline thresholds · System validation rules · Server parameters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="gov-btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? '✓ Changes Saved' : 'Save System Settings'}
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          System configuration successfully updated. Settings propagated to all active processing nodes and logged to audit trail.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. OCR & AI Thresholds */}
        <div className="gov-card p-5 rounded border border-slate-300 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#064E3B]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                AI / OCR Engine Thresholds
              </h2>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">BHASHINI AI v2.4</span>
          </div>

          <SliderRow
            label="Minimum OCR Confidence"
            description="Auto-approve digitized records when OCR confidence exceeds this value"
            value={ocrThreshold}
            onChange={setOcrThreshold}
            color={
              ocrThreshold >= 85
                ? 'text-emerald-700'
                : ocrThreshold >= 70
                ? 'text-amber-700'
                : 'text-red-700'
            }
          />

          <SliderRow
            label="Duplicate Detection Similarity Threshold"
            description="Flag potential duplicate Jamabandis/parcels with string similarity above threshold"
            value={dupSimilarity}
            onChange={setDupSimilarity}
            color={dupSimilarity >= 90 ? 'text-emerald-700' : 'text-amber-700'}
          />

          <SliderRow
            label="Anomaly Risk Score Threshold"
            description="Flag records for mandatory officer review when risk score exceeds limit"
            value={anomalyRisk}
            onChange={setAnomalyRisk}
            color={anomalyRisk <= 50 ? 'text-amber-700' : 'text-emerald-700'}
          />

          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-700" />
            <span>
              Records falling below <strong>{ocrThreshold}%</strong> confidence are automatically routed to the Land Record Officer verification queue.
            </span>
          </div>
        </div>

        {/* 2. Validation & Workflow Rules */}
        <div className="gov-card p-5 rounded border border-slate-300 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#064E3B]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Validation & Workflow Rules
              </h2>
            </div>
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Auto-route Low-Confidence Records',
                desc: 'Send documents under threshold directly to human verification queue',
                value: autoRoute,
                onChange: setAutoRoute
              },
              {
                title: 'Mandatory Anomaly Review',
                desc: 'Require officer manual sign-off before publishing anomaly-flagged Jamabandis',
                value: mandatoryAnomalyReview,
                onChange: setMandatoryAnomalyReview
              },
              {
                title: 'Duplicate Merging Configuration',
                desc: 'Allow Land Record Officers to merge verified duplicate entries',
                value: enableDuplicateMerging,
                onChange: setEnableDuplicateMerging
              },
              {
                title: 'Dual-Officer Sign-Off for Critical Failures',
                desc: 'Require two officer credentials for records with high-severity title conflicts',
                value: requireDualOfficerSignOff,
                onChange: setRequireDualOfficerSignOff
              }
            ].map((rule) => (
              <div
                key={rule.title}
                className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded border border-slate-200 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900 block">{rule.title}</span>
                  <span className="text-[10px] text-slate-500">{rule.desc}</span>
                </div>
                <ToggleSwitch on={rule.value} onChange={rule.onChange} />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Notification Preferences */}
        <div className="gov-card p-5 rounded border border-slate-300 bg-white space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Bell className="w-4 h-4 text-[#064E3B]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Notification & Dispatch Preferences
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block">Email Alerts for Verification Queue</span>
                <span className="text-[10px] text-slate-500">Notify assigned officers when new batches are ingested</span>
              </div>
              <ToggleSwitch on={emailAlerts} onChange={setEmailAlerts} />
            </div>

            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block">SMS Alerts for CRITICAL Forgery / Anomaly Flags</span>
                <span className="text-[10px] text-slate-500">Instant SMS broadcast to District Revenue Officer</span>
              </div>
              <ToggleSwitch on={smsAlerts} onChange={setSmsAlerts} />
            </div>

            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block">Daily Summary Digest to State DoLR Head</span>
                <span className="text-[10px] text-slate-500">Automated 18:00 IST daily reconciliation summary</span>
              </div>
              <ToggleSwitch on={dailyDigest} onChange={setDailyDigest} />
            </div>

            <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block">Real-Time In-Portal Notification Badges</span>
                <span className="text-[10px] text-slate-500">WebSocket / Polling badge counts in top navigation bar</span>
              </div>
              <ToggleSwitch on={realtimeBadges} onChange={setRealtimeBadges} />
            </div>
          </div>
        </div>

        {/* 4. System Information & Node Telemetry */}
        <div className="gov-card p-5 rounded border border-slate-300 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#064E3B]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                System Information & Node Telemetry
              </h2>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {[
              ['Portal Version', 'v1.0.4-prod (Build 2026.09.28)'],
              ['AI / OCR Engine', 'BHASHINI AI Indic OCR + PostGIS Geo Engine'],
              ['Primary Database', 'PostgreSQL 15.4 (Enterprise Enterprise-Grade PostGIS 3.3)'],
              ['Cloud Data Centre', 'National Informatics Centre (NIC Cloud, Delhi)'],
              ['Statutory Compliance', 'IT Act 2000 · Digital India Land Records Modernization'],
              ['Authenticated Admin', user?.name || 'Administrator'],
              ['Assigned Role', 'System Administrator (Full Privileges)'],
              ['Server Session', 'TLS 1.3 · IPsec Secured'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5 last:border-0 last:pb-0"
              >
                <span className="text-slate-500 font-semibold">{label}</span>
                <span className="font-mono text-slate-800 font-bold">{value}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                All parameter modifications are recorded in the immutable audit log under Administrator UID:{' '}
                <strong>{user?.id || 'ADM-001'}</strong>.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

