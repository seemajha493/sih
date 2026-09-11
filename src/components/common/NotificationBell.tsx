import React, { useState } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import type { Notification } from '../../types/landRecord';

interface NotificationBellProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkAllRead }) => {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;


  const typeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'duplicate':    return '⊗';
      case 'anomaly':      return '⚠';
      case 'verification': return '◎';
      case 'processing':   return '✓';
      default:             return '●';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded hover:bg-slate-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 w-80 bg-white border border-slate-200 rounded shadow-xl z-50 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 bg-slate-50">
              <div className="font-bold text-slate-900">Notifications</div>
              <div className="flex items-center gap-2">
                <button onClick={onMarkAllRead} className="text-[11px] text-[#1B365D] font-semibold hover:underline flex items-center gap-0.5">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
                <button onClick={() => setOpen(false)}><X className="w-3.5 h-3.5 text-slate-500" /></button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400">No notifications</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`px-3 py-2.5 flex items-start gap-2 ${!n.isRead ? 'bg-blue-50/40' : ''}`}>
                    <span className={`text-sm font-bold mt-0.5 ${
                      n.severity === 'danger' ? 'text-red-600' :
                      n.severity === 'warning' ? 'text-amber-600' :
                      n.severity === 'success' ? 'text-emerald-600' : 'text-blue-600'
                    }`}>{typeIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium leading-snug ${!n.isRead ? 'text-slate-900' : 'text-slate-600'}`}>{n.message}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{n.timestamp}</div>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
