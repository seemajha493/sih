import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLandRecords } from '../../context/LandRecordContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { StatCard } from '../dashboard/StatCard';
import { QuickActions } from '../dashboard/QuickActions';
import { AnalyticsCharts } from '../dashboard/AnalyticsCharts';
import { ActivityFeed } from '../dashboard/ActivityFeed';
import { SystemStatus } from '../dashboard/SystemStatus';
import type { NavigationTab } from '../common/Sidebar';
import type { LandRecord, RecordStatus } from '../../types/landRecord';
import { 
  FileText, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Copy, 
  CheckCircle,
  Eye,
  Building,
  Check,
  X,
  Database,
  RefreshCw
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const {
    records,
    verifyRecord,
    rejectRecord,
    isDatabaseLoading,
    dbError,
    clearDbError
  } = useLandRecords();

  const [selectedRecord, setSelectedRecord] = useState<LandRecord | null>(null);
  const [rejectingRecord, setRejectingRecord] = useState<LandRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);
  const [isSubmittingId, setIsSubmittingId] = useState<string | null>(null);

  // Filter queries directly from IndexedDB source of truth
  const pendingRequests = records.filter(r =>
    r.status === 'PENDING_VERIFICATION' ||
    r.status === 'LOW_CONFIDENCE' ||
    r.status === 'DUPLICATE' ||
    r.status === 'ANOMALY_DETECTED' ||
    r.status === 'PROCESSING'
  );

  const approvedRecords = records.filter(r => r.status === 'VERIFIED');
  const rejectedRecords = records.filter(r => r.status === 'REJECTED');

  const stats = {
    total: records.length,
    digitized: records.filter(r => r.status !== 'PROCESSING').length,
    approved: approvedRecords.length,
    pending: pendingRequests.length,
    lowConfidence: records.filter(r => r.status === 'LOW_CONFIDENCE' || (r.riskScore ?? 0) > 50).length,
    rejected: rejectedRecords.length,
  };

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setActionErrorMsg(msg);
      setTimeout(() => setActionErrorMsg(null), 6000);
    } else {
      setActionSuccessMsg(msg);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    }
  };

  // Real Database Approval Workflow
  const handleApproveAndPublish = async (record: LandRecord) => {
    setIsSubmittingId(record.id);
    setActionErrorMsg(null);
    try {
      await verifyRecord(
        record.id,
        user?.name || 'Land Record Officer',
        user?.role || 'LAND_RECORD_OFFICER',
        'Approved & Published directly from Officer Dashboard.'
      );
      showToast(`Land record #${record.id} approved and published successfully.`);
    } catch (err: any) {
      showToast(`Database update failed for Record #${record.id}: ${err.message || 'Database error'}. Please retry.`, true);
    } finally {
      setIsSubmittingId(null);
    }
  };

  // Real Database Rejection Workflow
  const handleConfirmReject = async () => {
    if (!rejectingRecord) return;
    const recId = rejectingRecord.id;
    setIsSubmittingId(recId);
    setActionErrorMsg(null);
    try {
      await rejectRecord(
        recId,
        user?.name || 'Land Record Officer',
        user?.role || 'LAND_RECORD_OFFICER',
        rejectionReason || 'Rejected during officer dashboard review.'
      );
      showToast(`Land record #${recId} rejected successfully.`);
      setRejectingRecord(null);
      setRejectionReason('');
    } catch (err: any) {
      showToast(`Database rejection failed for Record #${recId}: ${err.message || 'Database error'}. Please retry.`, true);
    } finally {
      setIsSubmittingId(null);
    }
  };

  const getBadgeClass = (status: RecordStatus) => {
    switch (status) {
      case 'VERIFIED': return 'gov-badge-success';
      case 'PENDING_VERIFICATION': return 'gov-badge-warning';
      case 'LOW_CONFIDENCE': return 'gov-badge-danger';
      case 'DUPLICATE': return 'gov-badge-info';
      case 'REJECTED': return 'gov-badge-danger';
      default: return 'gov-badge-info';
    }
  };

  const getBadgeLabel = (status: RecordStatus) => {
    switch (status) {
      case 'VERIFIED': return 'PUBLISHED / VERIFIED';
      case 'PENDING_VERIFICATION': return 'PENDING VERIFICATION';
      case 'LOW_CONFIDENCE': return 'REQUIRES REVIEW';
      case 'DUPLICATE': return 'DUPLICATE MATCH';
      case 'REJECTED': return 'REJECTED';
      default: return 'PROCESSING';
    }
  };

  return (
    <div className="space-y-6 pb-8 select-none">
      
      {/* Top Dashboard Header */}
      <div className="gov-card p-4 rounded border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {t('common.dashboard')}
            <span className="gov-badge gov-badge-success text-[10px]">
              IndexedDB Storage Engine Active
            </span>
          </h1>
          <p className="text-xs font-semibold text-[#064E3B] mt-0.5">
            {t('dashboard.welcome')}, {user?.name || 'Officer'} ({user?.department || t('gov.dolr')})
          </p>
        </div>

        <div className="text-right text-xs bg-slate-50 border border-slate-200 p-2 rounded flex items-center gap-3">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Database Source of Truth</div>
            <div className="font-mono font-bold text-[#064E3B]">
              BhumiTraceDB (IndexedDB Table: land_records)
            </div>
          </div>
          <Database className="w-4 h-4 text-[#064E3B]" />
        </div>
      </div>

      {/* Global Success / Database Error Alerts */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 text-xs font-bold flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {(actionErrorMsg || dbError) && (
        <div className="p-3 bg-red-50 border border-red-300 rounded text-red-900 text-xs font-bold flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{actionErrorMsg || dbError}</span>
          </div>
          <button onClick={() => { setActionErrorMsg(null); clearDbError(); }}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Statistic Boxes Grid */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#064E3B]" />
            Real-Time Land Record Database Metrics
          </h2>
          <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
            {isDatabaseLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : '● IndexedDB Synced'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <StatCard
            title={t('dashboard.kpiTotal')}
            value={stats.total}
            subtitle="Ingested Database Records"
            icon={FileText}
            onClick={() => onNavigate('records')}
          />

          <StatCard
            title={t('common.digitized')}
            value={stats.digitized}
            subtitle="AI OCR Parsed"
            icon={CheckCircle}
            onClick={() => onNavigate('records')}
          />

          <StatCard
            title={t('dashboard.kpiVerified')}
            value={stats.approved}
            subtitle="Tehsildar Approved"
            icon={CheckSquare}
            onClick={() => onNavigate('records')}
          />

          <StatCard
            title={t('dashboard.kpiPending')}
            value={stats.pending}
            subtitle="Awaiting Approval Action"
            icon={Clock}
            onClick={() => {
              const el = document.getElementById('pending-requests-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <StatCard
            title={t('dashboard.kpiFlagged')}
            value={stats.lowConfidence}
            subtitle="OCR Score < 75%"
            icon={AlertTriangle}
            onClick={() => onNavigate('verification')}
          />

          <StatCard
            title={t('common.rejected')}
            value={stats.rejected}
            subtitle="Flagged / Rejected"
            icon={Copy}
            onClick={() => onNavigate('records')}
          />
        </div>
      </div>

      {/* Quick Actions Component */}
      <QuickActions onNavigate={onNavigate} />

      {/* ══════════════════════════════════════════════════════════════
          REAL DATABASE PENDING REQUESTS APPROVAL & REJECTION WORKFLOW
         ══════════════════════════════════════════════════════════════ */}
      <div id="pending-requests-section" className="gov-card rounded border border-amber-300 bg-amber-50/20 overflow-hidden shadow-sm">
        <div className="p-3.5 bg-amber-100/90 border-b border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-700" />
              Pending Requests Queue (Database Query: {pendingRequests.length} Pending)
            </h2>
            <p className="text-[11px] text-amber-900 mt-0.5">
              Approve & Publish or Reject land record requests. All actions execute transactional IndexedDB database updates.
            </p>
          </div>
          <button
            onClick={() => onNavigate('verification')}
            className="gov-btn-secondary py-1 px-3 text-xs bg-white border-amber-300 font-bold self-start sm:self-auto"
          >
            Open Verification Desk →
          </button>
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Landowner Name</th>
                <th>Khasra No.</th>
                <th>Village / Mauza</th>
                <th>Tehsil & District</th>
                <th>Land Area</th>
                <th>Status</th>
                <th className="text-center">Database Approval Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.length > 0 ? (
                pendingRequests.map((rec) => {
                  const isSubmitting = isSubmittingId === rec.id;
                  return (
                    <tr key={rec.id} className="hover:bg-amber-50/30 transition">
                      <td className="font-mono font-bold text-[#064E3B]">{rec.id}</td>
                      <td className="font-semibold text-slate-900">{rec.ownerName}</td>
                      <td className="font-mono font-bold text-slate-800">{rec.khasraNo}</td>
                      <td>{rec.villageMauza}</td>
                      <td>{rec.tehsil}, {rec.district}</td>
                      <td className="font-mono">{rec.areaAcres} Acres</td>
                      <td>
                        <span className={`gov-badge ${getBadgeClass(rec.status)} text-[10px]`}>
                          {getBadgeLabel(rec.status)}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Approve & Publish Button */}
                          <button
                            onClick={() => handleApproveAndPublish(rec)}
                            disabled={isSubmitting}
                            className="bg-[#064E3B] hover:bg-[#043D2E] text-white text-[11px] font-bold px-3 py-1.5 rounded transition inline-flex items-center gap-1 disabled:opacity-50 shadow-sm"
                            title="Approve land record and publish to central database registry"
                          >
                            {isSubmitting ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-amber-300" />
                            )}
                            <span>Approve & Publish</span>
                          </button>

                          {/* Reject Button */}
                          <button
                            onClick={() => setRejectingRecord(rec)}
                            disabled={isSubmitting}
                            className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-[11px] font-bold px-3 py-1.5 rounded transition inline-flex items-center gap-1 disabled:opacity-50"
                            title="Reject land record request"
                          >
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            <span>Reject</span>
                          </button>

                          {/* View Modal */}
                          <button
                            onClick={() => setSelectedRecord(rec)}
                            className="gov-btn-secondary py-1 px-2 text-[11px] inline-flex items-center gap-1"
                            title="Inspect document fields"
                          >
                            <Eye className="w-3 h-3" /> Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs italic">
                    ✓ All pending requests processed! No pending requests awaiting approval in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          PUBLISHED / APPROVED LAND RECORDS REGISTRY
         ══════════════════════════════════════════════════════════════ */}
      <div className="gov-card rounded border border-slate-300 overflow-hidden bg-white">
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
              Approved & Published Land Records ({approvedRecords.length} Published)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('records')}
            className="text-xs font-bold text-[#064E3B] hover:underline"
          >
            View All Land Records Directory →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Landowner Name</th>
                <th>Khasra No.</th>
                <th>Village / Mauza</th>
                <th>Tehsil / District</th>
                <th>Land Area</th>
                <th>Status</th>
                <th>Approved By</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedRecords.slice(0, 5).map((rec) => (
                <tr key={rec.id}>
                  <td className="font-mono font-bold text-[#064E3B]">{rec.id}</td>
                  <td className="font-semibold text-slate-900">{rec.ownerName}</td>
                  <td className="font-mono font-bold text-slate-800">{rec.khasraNo}</td>
                  <td>{rec.villageMauza}</td>
                  <td>{rec.tehsil}, {rec.district}</td>
                  <td className="font-mono">{rec.areaAcres} Acres</td>
                  <td>
                    <span className="gov-badge gov-badge-success text-[10px]">
                      PUBLISHED
                    </span>
                  </td>
                  <td className="text-[11px] text-slate-600 font-medium">
                    {rec.verifiedBy || 'Tehsildar Office'}
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => setSelectedRecord(rec)}
                      className="gov-btn-secondary py-1 px-2.5 text-[11px] inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics & Activity Row */}
      <AnalyticsCharts />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <ActivityFeed />
        </div>
        <div className="lg:col-span-5">
          <SystemStatus />
        </div>
      </div>

      {/* Rejection Modal Prompt */}
      {rejectingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-rose-300 rounded max-w-md w-full p-5 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-rose-200 text-rose-900">
              <div className="font-bold text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Reject Land Record #{rejectingRecord.id}
              </div>
              <button onClick={() => setRejectingRecord(null)} className="font-bold text-slate-500">✕</button>
            </div>

            <div className="space-y-2 text-slate-700">
              <p>
                Are you sure you want to reject Record <strong>#{rejectingRecord.id}</strong> (Landowner: <strong>{rejectingRecord.ownerName}</strong>, Khasra <strong>{rejectingRecord.khasraNo}</strong>)?
              </p>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Rejection Reason / Remarks:</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter specific reason (e.g. Invalid Khatoni document, area mismatch, unreadable scan)…"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-rose-500 h-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setRejectingRecord(null)}
                className="gov-btn-secondary py-1.5 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isSubmittingId === rejectingRecord.id}
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-4 py-1.5 rounded transition flex items-center gap-1.5"
              >
                {isSubmittingId === rejectingRecord.id ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
                Confirm Database Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Inspector Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded max-w-lg w-full p-5 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
              <div className="font-bold text-slate-900 text-sm">
                Record Inspector: #{selectedRecord.id}
              </div>
              <button onClick={() => setSelectedRecord(null)} className="font-bold text-slate-500">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 border border-slate-200 rounded">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Landowner Name</span>
                  <div className="font-bold text-slate-900">{selectedRecord.ownerName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Khasra Number</span>
                  <div className="font-mono font-bold text-slate-900">{selectedRecord.khasraNo}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Village Mauza</span>
                  <div className="font-medium text-slate-900">{selectedRecord.villageMauza}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Tehsil & District</span>
                  <div className="font-medium text-slate-900">{selectedRecord.tehsil}, {selectedRecord.district}</div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded border border-slate-200">
                <span className="font-bold text-slate-700">Database Status:</span>
                <span className={`gov-badge ${getBadgeClass(selectedRecord.status)}`}>
                  {getBadgeLabel(selectedRecord.status)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-right mt-4">
              <button onClick={() => setSelectedRecord(null)} className="gov-btn-secondary py-1 px-4">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
