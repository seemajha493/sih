import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Save, Info, Shield, Cpu, Database, Bell } from 'lucide-react';
import { CitizenProfilePage } from './CitizenProfilePage';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  const [ocrThreshold, setOcrThreshold] = useState(75);
  const [dupSimilarity, setDupSimilarity] = useState(85);
  const [anomalyRisk, setAnomalyRisk] = useState(60);
  const [autoRoute, setAutoRoute] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  if (user?.role === 'PUBLIC_USER') {
    return <CitizenProfilePage />;
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const ToggleSwitch: React.FC<{ on: boolean; onChange: (v: boolean) => void }> = ({ on, onChange }) => (
    <button
      onClick={() => onChange(!on)}
      className={`w-10 h-5 rounded-full transition-colors relative ${on ? 'bg-[#1B365D]' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );

  const SliderRow: React.FC<{ label: string; value: number; onChange: (v: number) => void; suffix?: string; color: string }> = ({ label, value, onChange, suffix = '%', color }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-800">{label}</span>
        <span className={`font-mono font-bold text-sm ${color}`}>{value}{suffix}</span>
      </div>
      <input type="range" min={30} max={99} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-[#1B365D]" />
      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
        <span>30% (Permissive)</span><span>99% (Strict)</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 pb-8 select-none">
      <div className="gov-card p-4 rounded border border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#1B365D]" /> System Configuration
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            DoLR AI pipeline thresholds · Validation rules · Notification preferences
          </p>
        </div>
        <button onClick={handleSave} className="gov-btn-primary py-2 px-4 text-xs flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" />
          {saved ? '✓ Saved' : 'Save Configuration'}
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-xs font-bold">
          ✓ Configuration saved. Changes logged to audit trail.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* AI / OCR Settings */}
        <div className="gov-card p-5 rounded border border-slate-300 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Cpu className="w-4 h-4 text-[#1B365D]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">AI / OCR Engine Thresholds</h2>
          </div>

          <SliderRow label="Minimum OCR Confidence (auto-approve threshold)"
            value={ocrThreshold} onChange={setOcrThreshold}
            color={ocrThreshold >= 85 ? 'text-emerald-700' : ocrThreshold >= 70 ? 'text-amber-700' : 'text-red-700'} />

          <SliderRow label="Duplicate Detection Similarity Threshold"
            value={dupSimilarity} onChange={setDupSimilarity}
            color={dupSimilarity >= 90 ? 'text-emerald-700' : 'text-amber-700'} />

          <SliderRow label="Anomaly Risk Score — Flag for Review (above threshold)"
            value={anomalyRisk} onChange={setAnomalyRisk}
            color={anomalyRisk <= 50 ? 'text-amber-700' : 'text-emerald-700'} />

          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-800 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Records below OCR threshold are automatically routed to human verification queue. Changes are effective immediately.
          </div>
        </div>

        {/* Validation & Routing */}
        <div className="gov-card p-5 rounded border border-slate-300 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Shield className="w-4 h-4 text-[#1B365D]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Validation & Workflow</h2>
          </div>

          {[
            { label: 'Auto-route low-confidence records to Verification Officer', value: autoRoute, onChange: setAutoRoute },
            { label: 'Mandatory anomaly review before publication', value: true, onChange: () => {} },
            { label: 'Enable duplicate merging by Land Record Officer', value: false, onChange: () => {} },
            { label: 'Require dual officer sign-off for CRITICAL validation failures', value: true, onChange: () => {} },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-slate-800 flex-1">{label}</span>
              <ToggleSwitch on={value} onChange={onChange} />
            </div>
          ))}
        </div>

        {/* Notification Settings */}
        <div className="gov-card p-5 rounded border border-slate-300 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Bell className="w-4 h-4 text-[#1B365D]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Notification Preferences</h2>
          </div>
          {[
            { label: 'Email alerts for new pending verifications', value: emailAlerts, onChange: setEmailAlerts },
            { label: 'SMS alerts for CRITICAL anomaly flags', value: smsAlerts, onChange: setSmsAlerts },
            { label: 'Daily summary digest to department head', value: true, onChange: () => {} },
            { label: 'Real-time in-portal notification badge', value: true, onChange: () => {} },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-slate-800 flex-1">{label}</span>
              <ToggleSwitch on={value} onChange={onChange} />
            </div>
          ))}
        </div>

        {/* Database & System */}
        <div className="gov-card p-5 rounded border border-slate-300 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Database className="w-4 h-4 text-[#1B365D]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">System Information</h2>
          </div>
          {[
            ['Portal Version',        '1.0.4'],
            ['AI Engine',             'OCR v2.4 + LLM Extraction'],
            ['Database',              'PostgreSQL 15 + PostGIS 3.3'],
            ['Hosting',               'NIC Cloud Data Centre'],
            ['Data Compliance',       'IT Act 2000 · Digital India'],
            ['Logged-in User',        user?.name || '—'],
            ['Role',                  user?.role || '—'],
            ['Session Started',       new Date().toLocaleTimeString('en-IN')],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
              <span className="text-slate-500 font-semibold">{label}</span>
              <span className="font-mono text-slate-800 font-bold">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
