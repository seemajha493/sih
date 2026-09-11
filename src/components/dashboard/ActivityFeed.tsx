import React from 'react';
import { MOCK_ACTIVITIES } from '../../mockData/mockData';

export const ActivityFeed: React.FC = () => {
  const getBadgeClass = (severity: string) => {
    switch (severity) {
      case 'success': return 'gov-badge-success';
      case 'warning': return 'gov-badge-warning';
      case 'danger': return 'gov-badge-danger';
      case 'info':
      default: return 'gov-badge-info';
    }
  };

  return (
    <div className="gov-card p-4 rounded border border-slate-300 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Recent System Activity
          </h3>
          <span className="text-[10px] font-mono text-slate-500">Live Audit Trail</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
          {MOCK_ACTIVITIES.map((act) => (
            <div key={act.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-slate-900 leading-snug">{act.message}</p>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  {act.user} • {act.timestamp}
                </div>
              </div>
              <span className={`gov-badge shrink-0 ${getBadgeClass(act.severity)}`}>
                {act.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200 text-right mt-3">
        <button className="text-xs font-bold text-[#1B365D] hover:underline">
          View Complete Audit Log →
        </button>
      </div>
    </div>
  );
};
