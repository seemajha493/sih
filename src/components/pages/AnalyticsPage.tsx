import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import {
  CHART_DOCUMENTS_OVER_TIME, CHART_VERIFICATION_STATUS,
  CHART_DISTRICT_DIGITIZATION, CHART_CONFIDENCE_DISTRIBUTION,
  CHART_ERROR_CATEGORIES
} from '../../mockData/mockData';
import { BarChart3, Download, TrendingUp, Lock, Filter } from 'lucide-react';

const KPI_DATA = [
  { label: 'Total Records',      value: '1,48,250', sub: 'All ingested documents',     color: 'text-[#1B365D]' },
  { label: 'Verified',           value: '1,18,400', sub: '79.9% of total',             color: 'text-emerald-700' },
  { label: 'Pending Review',     value: '14,510',   sub: 'Awaiting officer action',    color: 'text-amber-700'  },
  { label: 'Low Confidence',     value: '842',      sub: 'AI score < 75%',             color: 'text-red-700'    },
  { label: 'Duplicates Found',   value: '318',      sub: 'Deduplication engine',       color: 'text-indigo-700' },
  { label: 'Anomalies Flagged',  value: '97',       sub: 'Risk score > 60%',           color: 'text-red-800'    },
  { label: 'Avg AI Confidence',  value: '91.4%',    sub: 'Across verified records',    color: 'text-[#1B365D]'  },
  { label: 'Processing Success', value: '98.7%',    sub: 'OCR parse success rate',     color: 'text-emerald-700'},
];

const DISTRICTS = ['All Districts', 'Jaipur Rural', 'Patna', 'Lucknow', 'South 24 Parganas', 'Varanasi'];

export const AnalyticsPage: React.FC = () => {
  const { permissions } = useAuth();
  const [dateFilter, setDateFilter] = useState('2026');
  const [districtFilter, setDistrictFilter] = useState('All Districts');

  if (!permissions.canViewAnalytics) {
    return (
      <div className="gov-card p-8 text-center max-w-md mx-auto my-12 rounded border border-slate-300">
        <Lock className="w-10 h-10 text-rose-700 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600 mt-1">Permission required: Officer or Administrator role.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* Header */}
      <div className="gov-card p-4 rounded border border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#1B365D]" /> Reports & Analytics
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">Ministry of Rural Development — State & Tehsil digitization progress dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none">
              {['2026', '2025', '2024', '2023'].map(y => <option key={y}>{y}</option>)}
            </select>
            <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none">
              {DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button className="gov-btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export PDF Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {KPI_DATA.map(kpi => (
          <div key={kpi.label} className="gov-card p-3 rounded border border-slate-300 bg-white text-center">
            <div className={`text-lg font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] font-bold text-slate-700 mt-0.5 leading-tight">{kpi.label}</div>
            <div className="text-[9px] text-slate-400 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Processing over time + Verification status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Area chart: processing over time */}
        <div className="lg:col-span-8 gov-card p-4 rounded border border-slate-300">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#1B365D]" /> Digitization Progress (FY {dateFilter})
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Monthly — Ingested / Processed / Verified</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={CHART_DOCUMENTS_OVER_TIME} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gIngested"  x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#1B365D" stopOpacity={0.3}/><stop offset="95%" stopColor="#1B365D" stopOpacity={0}/></linearGradient>
                <linearGradient id="gProcessed" x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#2563EB" stopOpacity={0.25}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient>
                <linearGradient id="gVerified"  x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#15803D" stopOpacity={0.25}/><stop offset="95%" stopColor="#15803D" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: any) => String(v ? v.toLocaleString() : 0)} contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Ingested"  stroke="#1B365D" fill="url(#gIngested)"  strokeWidth={2} />
              <Area type="monotone" dataKey="Processed" stroke="#2563EB" fill="url(#gProcessed)" strokeWidth={2} />
              <Area type="monotone" dataKey="Verified"  stroke="#15803D" fill="url(#gVerified)"  strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut: Verification status */}
        <div className="lg:col-span-4 gov-card p-4 rounded border border-slate-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 pb-2 border-b border-slate-200">
            Record Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={CHART_VERIFICATION_STATUS} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                {CHART_VERIFICATION_STATUS.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => String(v ? v.toLocaleString() : 0)} contentStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-1">
            {CHART_VERIFICATION_STATUS.map(d => (
              <div key={d.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-700">{d.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-800">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: District bar + Confidence distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* District-wise digitization */}
        <div className="lg:col-span-7 gov-card p-4 rounded border border-slate-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 pb-2 border-b border-slate-200">
            District-wise Digitization Progress
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_DISTRICT_DIGITIZATION} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="district" tick={{ fontSize: 10 }} width={80} />
              <Tooltip formatter={(v: any) => String(v ? v.toLocaleString() : 0)} contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="total"     name="Total Records"    fill="#CBD5E1" radius={[0, 2, 2, 0]} />
              <Bar dataKey="digitized" name="Digitized"        fill="#1B365D" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence distribution histogram */}
        <div className="lg:col-span-5 gov-card p-4 rounded border border-slate-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 pb-2 border-b border-slate-200">
            AI Confidence Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_CONFIDENCE_DISTRIBUTION} margin={{ top: 0, right: 4, left: -15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="range" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="count" name="Records" radius={[2, 2, 0, 0]}>
                {CHART_CONFIDENCE_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={
                    entry.range.startsWith('9') ? '#15803D' :
                    entry.range.startsWith('8') ? '#2563EB' :
                    entry.range.startsWith('7') ? '#B45309' : '#B91C1C'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3: Error categories */}
      <div className="gov-card p-4 rounded border border-slate-300">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 pb-2 border-b border-slate-200">
          Validation Error Categories
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={CHART_ERROR_CATEGORIES} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="category" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Bar dataKey="count" name="Error Count" fill="#B45309" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
