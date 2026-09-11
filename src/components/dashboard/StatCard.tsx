import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  onClick?: () => void;
  statusBadge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  onClick,
  statusBadge
}) => {
  return (
    <div
      onClick={onClick}
      className={`gov-card p-4 rounded border border-slate-300 transition-colors ${
        onClick ? 'cursor-pointer hover:border-slate-400 hover:bg-slate-50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</span>
        </div>

        {statusBadge && (
          <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {statusBadge}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
