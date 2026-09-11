import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLandRecords } from '../../context/LandRecordContext';
import { MOCK_MUTATIONS_LR1024 } from '../../mockData/mockData';
import type { LandRecord, RecordStatus } from '../../types/landRecord';
import {
  Search, Filter, Edit3, Eye, Download, Plus,
  X, AlertTriangle, FileText, Clock,
  Shield, Copy
} from 'lucide-react';
import { MutationTimeline } from '../common/MutationTimeline';

interface LandRecordsPageProps {
  onNavigateToUpload?: () => void;
}

const STATUS_CONFIG: Record<RecordStatus, { label: string; badge: string }> = {
  VERIFIED:             { label: 'Verified',         badge: 'gov-badge-success' },
  PENDING_VERIFICATION: { label: 'Pending',           badge: 'gov-badge-warning' },
  LOW_CONFIDENCE:       { label: 'Requires Review',   badge: 'gov-badge-danger'  },
  DUPLICATE:            { label: 'Duplicate',         badge: 'gov-badge-info'    },
  PROCESSING:           { label: 'Processing',        badge: 'gov-badge-info'    },
  REJECTED:             { label: 'Rejected',          badge: 'gov-badge-danger'  },
  ANOMALY_DETECTED:     { label: 'Anomaly',           badge: 'gov-badge-[#064E3B]'  },
};

type DetailTab = 'overview' | 'verification' | 'mutations' | 'audit';

export const LandRecordsPage: React.FC<LandRecordsPageProps> = ({ onNavigateToUpload }) => {
  const { user, permissions } = useAuth();
  const { records } = useLandRecords();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<LandRecord | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const isPublicUser = user?.role === 'PUBLIC_USER';
  const isLRO = user?.role === 'LAND_RECORD_OFFICER';
  
  if (isPublicUser) {
    return (
      <div className="gov-card p-8 text-center max-w-md mx-auto my-12 rounded border border-slate-300">
        <h2 className="text-base font-bold text-slate-900 text-red-600">Access Restricted</h2>
        <p className="text-xs text-slate-600 mt-1">This directory is for internal officer use only. Please use the Citizen Portal to find your authorized records.</p>
      </div>
    );
  }

  const states = ['ALL', ...Array.from(new Set(records.map(r => r.state))).sort()];

  const filteredRecords = records.filter(rec => {
    // RBAC: Jurisdiction Filtering for Land Record Officers
    if (isLRO && user?.district) {
      if (rec.district !== user.district) return false;
    }
    
    // UI Filters
    if (selectedStatus !== 'ALL' && rec.status !== selectedStatus) return false;
    if (selectedState !== 'ALL' && rec.state !== selectedState) return false;
    
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rec.khasraNo.toLowerCase().includes(q) ||
        rec.khewatNo.toLowerCase().includes(q) ||
        (rec.surveyNo?.toLowerCase().includes(q) ?? false) ||
        rec.ownerName.toLowerCase().includes(q) ||
        rec.villageMauza.toLowerCase().includes(q) ||
        rec.tehsil.toLowerCase().includes(q) ||
        rec.district.toLowerCase().includes(q) ||
        rec.state.toLowerCase().includes(q) ||
        rec.id.toLowerCase().includes(q) ||
        (rec.mutationNo?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const pagedRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openDetail = (rec: LandRecord) => {
    setSelectedRecord(rec);
    setDetailTab('overview');
  };

  const confColor = (c: number) => c >= 90 ? 'text-emerald-700' : c >= 75 ? 'text-amber-700' : 'text-red-700';

  // Summary counts
  const counts = {
    VERIFIED:             records.filter(r => r.status === 'VERIFIED').length,
    PENDING_VERIFICATION: records.filter(r => r.status === 'PENDING_VERIFICATION').length,
    LOW_CONFIDENCE:       records.filter(r => r.status === 'LOW_CONFIDENCE').length,
    DUPLICATE:            records.filter(r => r.status === 'DUPLICATE').length,
    ANOMALY_DETECTED:     records.filter(r => r.status === 'ANOMALY_DETECTED').length,
    REJECTED:             records.filter(r => r.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-4 pb-8 select-none">
      {/* Header */}
      <div className="gov-card p-4 rounded border border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Land Records Registry</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isPublicUser
              ? 'Public Portal: Displaying officially verified land titles only'
              : 'Departmental repository — Jamabandi, RoR, Khasra, Khatoni records'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="gov-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          {permissions.canUploadDocuments && (
            <button onClick={onNavigateToUpload} className="gov-btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Upload Document
            </button>
          )}
        </div>
      </div>

      {/* Status summary pills */}
      {!isPublicUser && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(counts).map(([st, cnt]) => {
            const cfg = STATUS_CONFIG[st as RecordStatus];
            return (
              <button
                key={st}
                onClick={() => { setSelectedStatus(st); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded border text-xs font-semibold transition flex items-center gap-1.5 ${
                  selectedStatus === st ? 'bg-[#1B365D] text-white border-[#002B49]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.badge.includes('success') ? 'bg-emerald-500' : cfg.badge.includes('warning') ? 'bg-amber-500' : cfg.badge.includes('info') ? 'bg-blue-500' : 'bg-red-500'}`} />
                {cfg.label} ({cnt})
              </button>
            );
          })}
          {selectedStatus !== 'ALL' && (
            <button onClick={() => { setSelectedStatus('ALL'); setCurrentPage(1); }} className="px-3 py-1.5 rounded border border-dashed border-slate-300 text-xs text-slate-500 hover:bg-slate-50 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Search + Filter */}
      <div className="gov-card p-3 rounded border border-slate-300 flex flex-col md:flex-row items-center gap-3 bg-white">
        <div className="relative w-full md:w-96">
          <input
            type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search: Khasra No, Owner Name, Village, Tehsil, District, Mutation No…"
            className="w-full bg-slate-50 text-slate-900 text-xs rounded pl-8 pr-3 py-1.5 border border-slate-300 focus:outline-none focus:border-[#1B365D]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> State:
          </span>
          {states.map(st => (
            <button key={st} onClick={() => { setSelectedState(st); setCurrentPage(1); }}
              className={`text-xs font-semibold px-2.5 py-1 rounded transition shrink-0 ${
                selectedState === st ? 'bg-[#1B365D] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >{st}</button>
          ))}
        </div>
        <div className="text-xs text-slate-500 ml-auto shrink-0 font-mono">
          {filteredRecords.length} records
        </div>
      </div>

      {/* Table */}
      <div className="gov-card rounded border border-slate-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Owner Name</th>
                <th>Khasra No.</th>
                <th>Khewat</th>
                <th>Village / Tehsil</th>
                <th>District / State</th>
                <th>Area</th>
                <th>Land Type</th>
                {!isPublicUser && <th>AI Confidence</th>}
                <th>Status</th>
                <th>Last Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedRecords.length > 0 ? pagedRecords.map(rec => (
                <tr key={rec.id}>
                  <td className="font-mono font-bold text-[#1B365D]">{rec.id}</td>
                  <td className="font-semibold text-slate-900">
                    {rec.ownerName}
                    {rec.coOwnerName && <div className="text-[10px] text-slate-500">+ {rec.coOwnerName}</div>}
                  </td>
                  <td className="font-mono font-bold text-slate-800">{rec.khasraNo}</td>
                  <td className="font-mono text-slate-600">{rec.khewatNo}</td>
                  <td><div>{rec.villageMauza}</div><div className="text-[10px] text-slate-500">{rec.tehsil}</div></td>
                  <td><div>{rec.district}</div><div className="text-[10px] text-slate-500">{rec.state}</div></td>
                  <td className="font-mono">{rec.areaAcres} {rec.areaUnit || 'Acres'}</td>
                  <td><span className="text-[11px]">{rec.landCategory}</span></td>
                  {!isPublicUser && (
                    <td>
                      <span className={`font-mono font-bold text-xs ${confColor(rec.ocrConfidence)}`}>
                        {rec.ocrConfidence}%
                      </span>
                    </td>
                  )}
                  <td>
                    <span className={`gov-badge ${STATUS_CONFIG[rec.status]?.badge}`}>
                      {STATUS_CONFIG[rec.status]?.label}
                    </span>
                  </td>
                  <td className="font-mono text-[10px] text-slate-500">
                    {(rec.verifiedAt || rec.uploadedAt)?.split(' ')[0] || '—'}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openDetail(rec)} className="gov-btn-secondary p-1 text-[11px]" title="View Details">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {permissions.canEditRecords && (
                        <button className="gov-btn-secondary p-1 text-[11px]" title="Edit">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button className="gov-btn-secondary p-1 text-[11px]" title="Download">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={isPublicUser ? 11 : 12} className="py-10 text-center text-slate-400 text-xs">
                    No records match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <div className="text-slate-500 font-mono">
              Page {currentPage} of {totalPages} · {filteredRecords.length} total records
            </div>
            <div className="flex items-center gap-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                className="gov-btn-secondary py-1 px-2.5 disabled:opacity-40">← Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`py-1 px-2.5 rounded border text-xs font-semibold ${p === currentPage ? 'bg-[#1B365D] text-white border-[#002B49]' : 'bg-white border-slate-300 hover:bg-slate-50'}`}>
                  {p}
                </button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                className="gov-btn-secondary py-1 px-2.5 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white border border-slate-300 rounded shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <div>
                <div className="font-bold text-slate-900 text-sm">Land Record: #{selectedRecord.id}</div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Khasra {selectedRecord.khasraNo} · {selectedRecord.villageMauza}, {selectedRecord.tehsil}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`gov-badge ${STATUS_CONFIG[selectedRecord.status]?.badge}`}>
                  {STATUS_CONFIG[selectedRecord.status]?.label}
                </span>
                <button onClick={() => setSelectedRecord(null)} className="p-1 hover:bg-slate-200 rounded">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-4 bg-white shrink-0">
              {([
                { id: 'overview',     label: 'Overview',      icon: FileText  },
                { id: 'verification', label: 'Verification',  icon: Shield    },
                { id: 'mutations',    label: 'Mutation History', icon: Clock  },
                { id: 'audit',        label: 'Audit Trail',   icon: Copy      },
              ] as { id: DetailTab; label: string; icon: React.ElementType }[]).map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setDetailTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 -mb-px transition ${
                      detailTab === tab.id ? 'border-[#1B365D] text-[#1B365D]' : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}>
                    <Icon className="w-3 h-3" />{tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="overflow-y-auto flex-1 p-4 text-xs">
              {detailTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Owner info */}
                  <section>
                    <div className="text-[10px] font-bold text-[#1B365D] uppercase tracking-wider mb-2 pb-1 border-b border-slate-200">Owner Information</div>
                    <div className="space-y-1.5">
                      {[
                        ['Owner Name', selectedRecord.ownerName],
                        ['Co-owner', selectedRecord.coOwnerName || '—'],
                        ['Previous Owner', selectedRecord.previousOwner || '—'],
                      ].map(([l, v]) => (
                        <div key={l}><div className="text-[10px] text-slate-500 font-bold">{l}</div><div className="font-semibold text-slate-900">{v}</div></div>
                      ))}
                    </div>
                  </section>
                  {/* Land info */}
                  <section>
                    <div className="text-[10px] font-bold text-[#1B365D] uppercase tracking-wider mb-2 pb-1 border-b border-slate-200">Land Information</div>
                    <div className="space-y-1.5">
                      {[
                        ['Khasra No.', selectedRecord.khasraNo],
                        ['Survey No.', selectedRecord.surveyNo || '—'],
                        ['Khewat No.', selectedRecord.khewatNo],
                        ['Khata No.', selectedRecord.khataNo || '—'],
                        ['Area', `${selectedRecord.areaAcres} ${selectedRecord.areaUnit || 'Acres'}`],
                        ['Land Type', selectedRecord.landCategory],
                        ['Land Use', selectedRecord.landUse || '—'],
                      ].map(([l, v]) => (
                        <div key={l}><div className="text-[10px] text-slate-500 font-bold">{l}</div><div className="font-semibold text-slate-900">{v}</div></div>
                      ))}
                    </div>
                  </section>
                  {/* Location + Registration */}
                  <section>
                    <div className="text-[10px] font-bold text-[#1B365D] uppercase tracking-wider mb-2 pb-1 border-b border-slate-200">Location & Registration</div>
                    <div className="space-y-1.5">
                      {[
                        ['State', selectedRecord.state],
                        ['District', selectedRecord.district],
                        ['Tehsil', selectedRecord.tehsil],
                        ['Village', selectedRecord.villageMauza],
                        ['Mutation No.', selectedRecord.mutationNo || '—'],
                        ['Mutation Date', selectedRecord.mutationDate || '—'],
                        ['Registration No.', selectedRecord.registrationNo || '—'],
                        ['Document Year', selectedRecord.recordYear || '—'],
                      ].map(([l, v]) => (
                        <div key={l}><div className="text-[10px] text-slate-500 font-bold">{l}</div><div className="font-semibold text-slate-900">{v}</div></div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {detailTab === 'verification' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['AI Confidence Score', `${selectedRecord.ocrConfidence}%`],
                      ['Verification Status', STATUS_CONFIG[selectedRecord.status]?.label],
                      ['Verified By', selectedRecord.verifiedBy || '—'],
                      ['Verified At', selectedRecord.verifiedAt || '—'],
                      ['Document Language', selectedRecord.documentLanguage || '—'],
                      ['Risk Score', selectedRecord.riskScore ? `${selectedRecord.riskScore}%` : 'Low (< 10%)'],
                    ].map(([l, v]) => (
                      <div key={l} className="bg-slate-50 p-2.5 rounded border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-bold">{l}</div>
                        <div className="font-semibold text-slate-900 mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                  {selectedRecord.verificationRemarks && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded">
                      <div className="text-[10px] font-bold text-blue-700">Verification Remarks</div>
                      <div className="mt-1 text-slate-700">{selectedRecord.verificationRemarks}</div>
                    </div>
                  )}
                  {selectedRecord.flagReason && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded">
                      <div className="text-[10px] font-bold text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Flag Details</div>
                      <div className="mt-1 text-slate-700">{selectedRecord.flagReason}</div>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'mutations' && (
                <MutationTimeline
                  mutations={
                    selectedRecord.mutations ??
                    (selectedRecord.id === 'LR-1024' ? MOCK_MUTATIONS_LR1024 : [])
                  }
                />
              )}

              {detailTab === 'audit' && (
                <div className="space-y-1.5">
                  {[
                    { time: selectedRecord.uploadedAt,   actor: selectedRecord.uploadedBy,  action: 'Document uploaded and queued for AI processing' },
                    { time: selectedRecord.uploadedAt,   actor: 'AI Engine v2.4',           action: `OCR completed — ${selectedRecord.ocrConfidence}% confidence score assigned` },
                    ...(selectedRecord.verifiedBy ? [{ time: selectedRecord.verifiedAt || '', actor: selectedRecord.verifiedBy, action: `Record ${selectedRecord.status === 'VERIFIED' ? 'approved and published' : 'reviewed'}` }] : []),
                  ].filter(e => e.time).map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded">
                      <div className="w-6 h-6 rounded-full bg-[#1B365D] text-white text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</div>
                      <div>
                        <div className="font-semibold text-slate-900">{entry.action}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{entry.actor} · {entry.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button className="gov-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Download Record
              </button>
              <button onClick={() => setSelectedRecord(null)} className="gov-btn-secondary py-1.5 px-4 text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
