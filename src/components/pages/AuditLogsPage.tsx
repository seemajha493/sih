import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLandRecords } from '../../context/LandRecordContext';
import type { AuditLogEntry } from '../../types/landRecord';
import { ShieldAlert, Download, Lock, Search, Filter, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';

const ACTION_TYPES = [
  'All Actions',
  'Record Verified & Published',
  'Record Rejected',
  'Field Correction & Audit Edit',
  'Document Upload & Ingestion',
  'OCR & Field Extraction Executed',
  'Auto-Routed to Verification Queue',
  'Sent Back for Reprocessing',
  'Login',
  'User Role Modified'
];

const ROLE_TYPES = ['All Roles', 'ADMIN', 'LAND_RECORD_OFFICER', 'VERIFICATION_OFFICER', 'SYSTEM'];

export const AuditLogsPage: React.FC = () => {
  const { permissions } = useAuth();
  const { auditLogs } = useLandRecords();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  if (!permissions.canViewAuditLogs) {
    return (
      <div className="gov-card p-8 text-center max-w-md mx-auto my-12 rounded border border-slate-300 bg-white">
        <Lock className="w-10 h-10 text-rose-700 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600 mt-1">Permission required: Administrator or Officer designation.</p>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(log => {
    if (actionFilter !== 'All Actions' && !log.action.includes(actionFilter.replace('All Actions', ''))) {
      if (log.action !== actionFilter) return false;
    }
    if (roleFilter !== 'All Roles' && log.actorRole !== roleFilter) return false;
    if (statusFilter !== 'All' && log.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.actor.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        (log.recordId?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const statusBadge = (st: AuditLogEntry['status']) => {
    if (st === 'SUCCESS') return 'gov-badge-success';
    if (st === 'FLAGGED') return 'gov-badge-warning';
    return 'gov-badge-danger';
  };

  const roleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'LAND_RECORD_OFFICER': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'VERIFICATION_OFFICER': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* Header */}
      <div className="gov-card p-4 rounded border border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#064E3B]" /> System Audit & Security Logs
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Immutable audit trail — document uploads, OCR events, officer field edits, and verifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">{filteredLogs.length} entries</span>
          <button className="gov-btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export CSV Audit Log
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="gov-card p-3 rounded border border-slate-300 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search actor, action, target, record ID…"
            className="w-full bg-slate-50 text-xs rounded pl-7 pr-3 py-1.5 border border-slate-300 focus:outline-none focus:border-[#064E3B]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="w-3 h-3 text-slate-500 shrink-0" />
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none text-xs">
            {ACTION_TYPES.map(a => <option key={a}>{a}</option>)}
          </select>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none text-xs">
            {ROLE_TYPES.map(r => <option key={r}>{r}</option>)}
          </select>
          {(['All', 'SUCCESS', 'FLAGGED', 'FAILED'] as const).map(st => (
            <button key={st} onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                statusFilter === st ? 'bg-[#064E3B] text-white border-[#043D2E]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}>{st}</button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="gov-card rounded border border-slate-300 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Actor</th>
                <th>Role</th>
                <th>Action</th>
                <th>Target</th>
                <th>Timestamp</th>
                <th>IP Address</th>
                <th>Status</th>
                <th className="text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? filteredLogs.map(log => (
                <React.Fragment key={log.id}>
                  <tr className={log.status === 'FLAGGED' ? 'bg-amber-50/60' : ''}>
                    <td className="font-mono font-bold text-[#064E3B]">{log.id}</td>
                    <td className="font-semibold text-slate-900">{log.actor}</td>
                    <td>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${roleColor(log.actorRole)}`}>
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="font-medium text-slate-800">{log.action}</td>
                    <td className="font-mono text-slate-600 text-[11px]">{log.target}</td>
                    <td className="font-mono text-slate-500 text-[11px]">{log.timestamp}</td>
                    <td className="font-mono text-slate-500 text-[11px]">{log.ipAddress}</td>
                    <td>
                      <span className={`gov-badge ${statusBadge(log.status)}`}>{log.status}</span>
                    </td>
                    <td className="text-center">
                      {(log.previousValue || log.newValue || log.details) && (
                        <button
                          onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                          className="gov-btn-secondary py-0.5 px-2 text-[11px] flex items-center gap-1 mx-auto"
                        >
                          {expandedLog === log.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          View
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expandedLog === log.id && (
                    <tr className="bg-slate-50">
                      <td colSpan={9} className="px-4 pb-3 pt-1">
                        <div className="space-y-2 text-xs border-l-4 border-[#064E3B] pl-3">
                          {log.previousValue && log.newValue && (
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Value Change</div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded font-mono text-[11px]">
                                  {log.previousValue}
                                </span>
                                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono text-[11px]">
                                  {log.newValue}
                                </span>
                              </div>
                            </div>
                          )}
                          {log.recordId && (
                            <div className="text-[11px] text-slate-600">
                              <span className="font-bold text-slate-700">Linked Record ID:</span> #{log.recordId}
                            </div>
                          )}
                          {log.details && (
                            <div className="text-[11px] text-slate-600">
                              <span className="font-bold text-slate-700">Details:</span> {log.details}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No audit log entries match the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutability notice */}
      <div className="text-xs text-slate-500 flex items-start gap-2 bg-slate-50 border border-slate-200 rounded p-3">
        <ShieldAlert className="w-3.5 h-3.5 text-[#064E3B] shrink-0 mt-0.5" />
        <span>
          <strong>Immutable Audit Trail:</strong> All log entries are cryptographically signed and stored in an append-only log. Records cannot be modified or deleted. Compliant with DoLR SOP and NIC data governance standards.
        </span>
      </div>
    </div>
  );
};
