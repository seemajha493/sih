import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  CHART_DOCUMENTS_OVER_TIME,
  CHART_VERIFICATION_STATUS,
  CHART_DISTRICT_DIGITIZATION
} from '../../mockData/mockData';

export const AnalyticsCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      
      {/* 1. Documents Processed Over Time (Line Chart - 7 cols) */}
      <div className="lg:col-span-7 gov-card p-4 rounded border border-slate-300">
        <div className="mb-3 pb-2 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Documents Processed Over Time
            </h3>
            <p className="text-[11px] text-slate-500">Monthly Ingestion vs OCR Processed & Verified Records</p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
            FY 2025-26
          </span>
        </div>

        <div className="h-56 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CHART_DOCUMENTS_OVER_TIME} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  borderRadius: '4px',
                  color: '#1E293B',
                  fontSize: '11px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                formatter={(val: any) => [val.toLocaleString('en-IN') + ' Docs', '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <Line type="monotone" dataKey="Ingested" stroke="#1B365D" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Processed" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Verified" stroke="#15803D" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Verification Status Breakdown (Pie/Donut Chart - 5 cols) */}
      <div className="lg:col-span-5 gov-card p-4 rounded border border-slate-300">
        <div className="mb-3 pb-2 border-b border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Verification Status
          </h3>
          <p className="text-[11px] text-slate-500">Distribution of Land Title Validation States</p>
        </div>

        <div className="h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CHART_VERIFICATION_STATUS}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {CHART_VERIFICATION_STATUS.map((_, index) => {
                  const colors = ['#15803D', '#B45309', '#B91C1C', '#1B365D'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  borderRadius: '4px',
                  color: '#1E293B',
                  fontSize: '11px'
                }}
                formatter={(val: any) => [val.toLocaleString('en-IN') + ' Records', '']}
              />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconType="square"
                wrapperStyle={{ fontSize: '11px', color: '#334155' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. District-Wise Digitization (Bar Chart - Full 12 cols) */}
      <div className="lg:col-span-12 gov-card p-4 rounded border border-slate-300">
        <div className="mb-3 pb-2 border-b border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            District-Wise Digitization Progress
          </h3>
          <p className="text-[11px] text-slate-500">Total Land Parcels vs Digitized & Verified Records</p>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHART_DISTRICT_DIGITIZATION} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  borderRadius: '4px',
                  color: '#1E293B',
                  fontSize: '11px'
                }}
                formatter={(val: any) => [val.toLocaleString('en-IN') + ' Parcels', '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <Bar dataKey="total" name="Total Land Parcels" fill="#94A3B8" radius={[2, 2, 0, 0]} />
              <Bar dataKey="digitized" name="AI Digitized & Validated" fill="#1B365D" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
