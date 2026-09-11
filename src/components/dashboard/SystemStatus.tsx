import React from 'react';
import { MOCK_SYSTEM_STATUS } from '../../mockData/mockData';

export const SystemStatus: React.FC = () => {
  return (
    <div className="gov-card p-4 rounded border border-slate-300 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            System Infrastructure Status
          </h3>
          <span className="gov-badge gov-badge-success">Operational</span>
        </div>

        <div className="space-y-2.5">
          {MOCK_SYSTEM_STATUS.map((service) => (
            <div
              key={service.name}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-slate-900">{service.name}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Latency: {service.latency} • Uptime: {service.uptime}
                </div>
              </div>
              <span className="gov-badge gov-badge-success">
                ● {service.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono flex justify-between mt-3">
        <span>Node: NIC Cloud Service #04</span>
        <span>Auto-sync: Active</span>
      </div>
    </div>
  );
};
