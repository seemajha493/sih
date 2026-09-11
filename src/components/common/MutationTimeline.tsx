import React from 'react';
import type { MutationRecord } from '../../types/landRecord';
import { ArrowDown } from 'lucide-react';

interface MutationTimelineProps {
  mutations: MutationRecord[];
}

export const MutationTimeline: React.FC<MutationTimelineProps> = ({ mutations }) => {
  if (!mutations || mutations.length === 0) {
    return (
      <div className="text-xs text-slate-500 text-center py-4">No mutation history available.</div>
    );
  }

  return (
    <div className="space-y-0">
      {mutations.map((mut, idx) => (
        <div key={mut.id} className="relative">
          {/* Timeline node */}
          <div className="flex items-start gap-3">
            {/* Left: year + connector */}
            <div className="flex flex-col items-center w-16 shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#1B365D] text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow">
                {mut.year.slice(-2)}
              </div>
              {idx < mutations.length - 1 && (
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-6 bg-slate-300" />
                  <ArrowDown className="w-3 h-3 text-slate-400" />
                  <div className="w-0.5 h-2 bg-slate-300" />
                </div>
              )}
            </div>

            {/* Right: content */}
            <div className={`flex-1 pb-4 ${idx < mutations.length - 1 ? '' : ''}`}>
              <div className="bg-white border border-slate-200 rounded p-3 text-xs shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#1B365D] text-[11px] uppercase tracking-wider">{mut.event}</span>
                  <span className="text-[10px] font-mono text-slate-500">{mut.date}</span>
                </div>
                <div className="font-semibold text-slate-900 mb-1">{mut.ownerName}</div>
                {mut.mutationNo && (
                  <div className="text-[11px] text-slate-500 font-mono">Mutation: {mut.mutationNo}</div>
                )}
                {mut.officerName && (
                  <div className="text-[11px] text-slate-500">Officer: {mut.officerName}</div>
                )}
                {mut.remarks && (
                  <div className="mt-1.5 text-[11px] text-slate-600 italic border-t border-slate-100 pt-1.5">
                    {mut.remarks}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
