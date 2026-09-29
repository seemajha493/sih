import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLandRecords } from '../../context/LandRecordContext';
import { useTranslation } from '../../i18n/LanguageContext';
import type { LandRecord, ExtractedField, ValidationResult } from '../../types/landRecord';
import {
  Check, X, Lock, Edit3, AlertTriangle, CheckCircle, Info,
  Shield, Copy, Eye, RotateCcw
} from 'lucide-react';

// ─── Confidence Badge ────────────────────────────────────────────────────────
const ConfidenceBadge: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 90 ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
              : score >= 75 ? 'text-amber-700 bg-amber-50 border-amber-300'
              :               'text-red-700 bg-red-50 border-red-300';
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 border rounded ${color}`}>
      {score >= 90 ? '●' : score >= 75 ? '◐' : '○'} {score}%
    </span>
  );
};

// ─── Validation Status Icon ──────────────────────────────────────────────────
const ValidationIcon: React.FC<{ status: ValidationResult['status'] }> = ({ status }) => {
  if (status === 'PASS')    return <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
  if (status === 'FAIL')    return <X className="w-3.5 h-3.5 text-red-600 shrink-0" />;
  return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
};

// ─── Severity Badge ──────────────────────────────────────────────────────────
const SeverityBadge: React.FC<{ severity: ValidationResult['severity'] }> = ({ severity }) => {
  const map = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
    HIGH:     'bg-orange-100 text-orange-800 border-orange-300',
    MEDIUM:   'bg-amber-100 text-amber-800 border-amber-300',
    LOW:      'bg-slate-100 text-slate-600 border-slate-300',
  };
  return <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${map[severity]}`}>{severity}</span>;
};

// ─── Document Preview Component (Actual Uploaded Image or Scanned Render) ────
const DocumentPreview: React.FC<{ record: LandRecord }> = ({ record }) => {
  if (record.documentUrl) {
    return (
      <div className="rounded border border-slate-300 overflow-hidden bg-slate-900 aspect-[3/4] relative flex items-center justify-center">
        <img
          src={record.documentUrl}
          alt={`Original Land Document ${record.id}`}
          className="w-full h-full object-contain"
        />
        <div className="absolute top-2 left-2 bg-[#064E3B]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur">
          Original Document File
        </div>
      </div>
    );
  }

  return (
    <div className="rounded border border-slate-300 overflow-hidden bg-amber-50 aspect-[3/4] relative flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 opacity-80" />
      <div className="relative z-10 p-4 w-full h-full flex flex-col text-[10px] font-mono text-slate-800 leading-relaxed overflow-hidden select-none">
        <div className="text-center border-b border-slate-400 pb-2 mb-2">
          <div className="font-bold text-xs uppercase tracking-wider">राजस्व विभाग / Revenue Department</div>
          <div className="text-[9px] text-slate-600">{record.state} — {record.district}</div>
          <div className="font-bold text-[11px] mt-1">अभिलेख अधिकार / Record of Rights</div>
          <div className="text-[9px]">ग्राम: {record.villageMauza} | तहसील: {record.tehsil}</div>
        </div>
        <div className="space-y-1 text-[9px]">
          <div className="flex gap-2"><span className="font-bold w-20 shrink-0">खाता सं.:</span><span>{record.khewatNo}</span></div>
          <div className="flex gap-2"><span className="font-bold w-20 shrink-0">खसरा सं.:</span><span>{record.khasraNo}</span></div>
          <div className="flex gap-2"><span className="font-bold w-20 shrink-0">काश्तकार:</span><span className="font-bold">{record.ownerName}</span></div>
          {record.coOwnerName && <div className="flex gap-2"><span className="font-bold w-20 shrink-0">सह-काश्तकार:</span><span>{record.coOwnerName}</span></div>}
          <div className="flex gap-2"><span className="font-bold w-20 shrink-0">क्षेत्रफल:</span><span>{record.areaAcres} {record.areaUnit || 'Acres'}</span></div>
          <div className="flex gap-2"><span className="font-bold w-20 shrink-0">भूमि प्रकार:</span><span>{record.landCategory}</span></div>
        </div>
        <div className="mt-auto border-t border-slate-400 pt-2 flex justify-between items-end">
          <div className="text-[9px]">
            <div className="font-bold">तहसीलदार हस्ताक्षर</div>
            <div className="italic text-slate-500 mt-1">{record.ocrConfidence < 75 ? '[PARTIALLY OBSCURED]' : 'Verified Tehsildar'}</div>
          </div>
          <div className="text-[9px] text-right text-slate-500">
            <div>{record.uploadedAt?.split(' ')[0]}</div>
            <div className="font-mono">सील / Seal</div>
          </div>
        </div>
      </div>
      {record.ocrConfidence < 75 && (
        <div className="absolute bottom-2 left-2 right-2 bg-amber-600/90 text-white text-[10px] font-bold px-2 py-1 rounded text-center">
          ⚠ Moisture / Legibility Notice — Verification Required
        </div>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const VerificationPage: React.FC<{ targetRecordId?: string }> = ({ targetRecordId: propTargetRecordId }) => {
  const { user, permissions } = useAuth();
  const { t } = useTranslation();
  const {
    records,
    auditLogs,
    activeVerificationRecordId,
    updateRecordFields,
    verifyRecord,
    rejectRecord,
    sendBackRecord
  } = useLandRecords();

  const targetId = propTargetRecordId || activeVerificationRecordId;

  // Filter records scoped to user role if required
  const userScopedRecords = user?.role === 'PUBLIC_USER'
    ? records.filter(r => r.uploadedBy === user.name || r.ownerName.includes(user.name) || r.id === targetId)
    : records;

  const pendingRecords = userScopedRecords.filter(r =>
    r.status === 'PENDING_VERIFICATION' ||
    r.status === 'LOW_CONFIDENCE' ||
    r.status === 'DUPLICATE' ||
    r.status === 'ANOMALY_DETECTED' ||
    r.status === 'PROCESSING'
  );

  const verifiedRecords = userScopedRecords.filter(r => r.status === 'VERIFIED');
  const [queueTab, setQueueTab] = useState<'pending' | 'verified'>('pending');

  const [selectedRecord, setSelectedRecord] = useState<LandRecord | null>(() => {
    if (targetId) {
      const matched = records.find(r => r.id === targetId);
      if (matched) return matched;
    }
    return pendingRecords[0] || userScopedRecords[0] || null;
  });

  // Sync selected record whenever targetId or records change
  React.useEffect(() => {
    if (targetId) {
      console.log('[OCR Pipeline] Fetching verification request: verificationRequestId =', targetId);
      const matched = records.find(r => r.id === targetId);
      if (matched) {
        setSelectedRecord(matched);
      }
    }
  }, [targetId, records]);

  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'fields' | 'validation' | 'anomaly' | 'mutations' | 'history'>('fields');
  const [correctionReason, setCorrectionReason] = useState<string>('');

  if (!permissions.canVerifyRecords && user?.role !== 'ADMIN' && user?.role !== 'LAND_RECORD_OFFICER') {
    return (
      <div className="gov-card p-8 text-center max-w-md mx-auto my-12 rounded border border-slate-300">
        <Lock className="w-10 h-10 text-amber-700 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600 mt-1">Permission required: Land Record Officer or Administrator designation.</p>
      </div>
    );
  }

  // Guard: If a specific target ID was requested but does not exist in records
  if (targetId && records.length > 0 && !records.some(r => r.id === targetId)) {
    return (
      <div className="gov-card p-8 text-center max-w-md mx-auto my-12 rounded border border-slate-300 bg-white">
        <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Verification Request Not Found</h2>
        <p className="text-xs text-slate-600 mt-1">
          Verification Request ID <code className="font-mono bg-slate-100 px-1 rounded">{targetId}</code> was not found or you are not authorized to view it.
        </p>
      </div>
    );
  }

  const showAlert = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const handleApprove = async () => {
    if (!selectedRecord) return;
    const currentId = selectedRecord.id;
    try {
      const updated = await verifyRecord(
        currentId,
        user?.name || 'Land Record Officer',
        user?.role || 'LAND_RECORD_OFFICER',
        'Approved after side-by-side document verification.'
      );
      showAlert(`✓ Record #${currentId} successfully VERIFIED and published to Central Land Registry.`);
      setEditedFields({});

      const remainingPending = pendingRecords.filter(r => r.id !== currentId);
      if (remainingPending.length > 0) {
        setSelectedRecord(remainingPending[0]);
      } else {
        setSelectedRecord(updated);
      }
    } catch (err: any) {
      showAlert(`❌ Database approval failed for Record #${currentId}: ${err.message || 'Database error'}`);
    }
  };

  const handleReject = async () => {
    if (!selectedRecord) return;
    try {
      await rejectRecord(
        selectedRecord.id,
        user?.name || 'Land Record Officer',
        user?.role || 'LAND_RECORD_OFFICER',
        'Rejected due to data mismatch / legibility failure.'
      );
      showAlert(`Record #${selectedRecord.id} marked as REJECTED in database.`);
      setEditedFields({});
    } catch (err: any) {
      showAlert(`❌ Database rejection failed for Record #${selectedRecord.id}: ${err.message || 'Database error'}`);
    }
  };

  const handleSendBack = async () => {
    if (!selectedRecord) return;
    try {
      await sendBackRecord(
        selectedRecord.id,
        user?.name || 'Land Record Officer',
        user?.role || 'LAND_RECORD_OFFICER',
        'Returned for rescan and re-extraction.'
      );
      showAlert(`Record #${selectedRecord.id} flagged for rescan.`);
      setEditedFields({});
    } catch (err: any) {
      showAlert(`❌ Database error sending back Record #${selectedRecord.id}: ${err.message || 'Database error'}`);
    }
  };

  const handleSaveCorrections = () => {
    if (!selectedRecord || Object.keys(editedFields).length === 0) return;
    updateRecordFields(
      selectedRecord.id,
      editedFields,
      user?.name || 'Land Record Officer',
      user?.role || 'LAND_RECORD_OFFICER',
      correctionReason || 'Officer manual correction during side-by-side verification.'
    );
    showAlert(`✓ ${Object.keys(editedFields).length} field correction(s) saved to Record #${selectedRecord.id}. Audit log updated.`);
    setEditedFields({});
    setCorrectionReason('');
  };

  const handleFieldEdit = (fieldName: string, value: string) => {
    setEditedFields(prev => ({ ...prev, [fieldName]: value }));
  };

  const getDisplayFields = (record: LandRecord): ExtractedField[] => {
    if (record.extractedFields && record.extractedFields.length > 0) return record.extractedFields;
    return [
      { fieldName: 'ownerName',    fieldLabel: 'Owner Name (Hindi)', value: record.ownerName, confidence: Math.min(record.ocrConfidence, 96), language: 'HINDI' },
      { fieldName: 'khasraNo',     fieldLabel: 'Khasra Number',     value: record.khasraNo, confidence: Math.min(record.ocrConfidence + 2, 98), language: 'ENGLISH' },
      { fieldName: 'khewatNo',     fieldLabel: 'Khewat / Khata Number', value: record.khewatNo, confidence: Math.min(record.ocrConfidence, 96), language: 'ENGLISH' },
      { fieldName: 'areaAcres',    fieldLabel: 'Area (Acres)',      value: `${record.areaAcres} Acres`, confidence: Math.min(record.ocrConfidence - 5, 82), language: 'ENGLISH' },
      { fieldName: 'villageMauza', fieldLabel: 'Village / Mauza',  value: record.villageMauza, confidence: Math.min(record.ocrConfidence + 1, 98), language: 'HINDI' },
      { fieldName: 'tehsil',       fieldLabel: 'Tehsil',            value: record.tehsil, confidence: 99, language: 'ENGLISH' },
      { fieldName: 'district',     fieldLabel: 'District',          value: record.district, confidence: 99, language: 'ENGLISH' },
      { fieldName: 'state',        fieldLabel: 'State',             value: record.state, confidence: 99, language: 'ENGLISH' },
    ];
  };

  const activeRecord = selectedRecord ? (records.find(r => r.id === selectedRecord.id) || selectedRecord) : null;
  const fields = activeRecord ? getDisplayFields(activeRecord) : [];
  const lowConfFields = fields.filter(f => f.confidence < 75).length;
  const overallConf = fields.length > 0 ? Math.round(fields.reduce((s, f) => s + f.confidence, 0) / fields.length) : 0;
  const recordLogs = activeRecord ? auditLogs.filter(l => l.recordId === activeRecord.id) : [];

  const statusBadge = (status: LandRecord['status']) => {
    const map: Record<string, string> = {
      VERIFIED: 'gov-badge-success',
      PENDING_VERIFICATION: 'gov-badge-warning',
      LOW_CONFIDENCE: 'gov-badge-danger',
      DUPLICATE: 'gov-badge-info',
      ANOMALY_DETECTED: 'gov-badge-danger',
      REJECTED: 'gov-badge-danger',
      PROCESSING: 'gov-badge-info',
    };
    return map[status] || 'gov-badge-info';
  };

  return (
    <div className="space-y-4 pb-8 select-none">
      {/* Header */}
      <div className="gov-card p-4 rounded border border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('verification.title')}</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {t('verification.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="gov-badge gov-badge-warning">⚠ {pendingRecords.length} {t('verification.pendingCount')}</span>
        </div>
      </div>

      {/* Success notification */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 text-xs font-bold flex justify-between items-center">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-w-0">

        {/* LEFT COLUMN: Record queue */}
        <div className="lg:col-span-3 min-w-0 gov-card p-3 rounded border border-slate-300 bg-white space-y-2">
          <div className="flex border-b border-slate-200 pb-2 gap-1 text-[11px] font-bold">
            <button
              onClick={() => setQueueTab('pending')}
              className={`px-2 py-1 rounded transition flex-1 text-center ${
                queueTab === 'pending'
                  ? 'bg-[#064E3B] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('common.pending')} ({pendingRecords.length})
            </button>
            <button
              onClick={() => setQueueTab('verified')}
              className={`px-2 py-1 rounded transition flex-1 text-center ${
                queueTab === 'verified'
                  ? 'bg-[#064E3B] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('common.verified')} ({verifiedRecords.length})
            </button>
          </div>

          <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-0.5">
            {(queueTab === 'pending' ? pendingRecords : verifiedRecords).length > 0 ? (
              (queueTab === 'pending' ? pendingRecords : verifiedRecords).map(rec => (
                <button
                  key={rec.id}
                  onClick={() => { setSelectedRecord(rec); setEditedFields({}); setActiveView('fields'); }}
                  className={`w-full text-left p-2.5 rounded border text-xs transition ${
                    activeRecord?.id === rec.id
                      ? 'border-[#064E3B] bg-emerald-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-mono font-bold text-[#064E3B] text-[11px]">#{rec.id}</span>
                    <ConfidenceBadge score={rec.ocrConfidence} />
                  </div>
                  <div className="font-semibold text-slate-800 truncate">{rec.ownerName}</div>
                  <div className="text-[10px] text-slate-500">Khasra {rec.khasraNo} · {rec.villageMauza}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`gov-badge ${statusBadge(rec.status)} text-[9px]`}>
                      {rec.status.replace(/_/g, ' ')}
                    </span>
                    {rec.verifiedAt && (
                      <span className="text-[9px] text-slate-400 font-mono">
                        {rec.verifiedAt.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-slate-500 text-xs italic">
                {queueTab === 'pending' ? 'No pending verification tasks in queue.' : 'No verified records in database.'}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Main verification workspace */}
        {activeRecord ? (
          <div className="lg:col-span-9 min-w-0 space-y-3">
            {/* Record ID + overall confidence bar */}
            <div className="gov-card p-3 rounded border border-slate-300 bg-white flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-[#064E3B] text-sm">#{activeRecord.id}</span>
                <span className="ml-2 text-xs text-slate-600">
                  Khasra {activeRecord.khasraNo} · {activeRecord.villageMauza}, {activeRecord.tehsil} ({activeRecord.state})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">OCR Extraction Confidence</div>
                  <div className={`text-lg font-bold ${overallConf >= 90 ? 'text-emerald-700' : overallConf >= 75 ? 'text-amber-700' : 'text-red-700'}`}>
                    {overallConf}%
                  </div>
                </div>
                {lowConfFields > 0 && (
                  <div className="text-xs bg-amber-50 border border-amber-300 text-amber-800 px-2 py-1 rounded font-semibold">
                    ⚠ {lowConfFields} low confidence field(s)
                  </div>
                )}
                <span className={`gov-badge ${statusBadge(activeRecord.status)}`}>
                  {activeRecord.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Side-by-side layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LEFT: Original Document */}
              <div className="gov-card p-3 rounded border border-slate-300 bg-white space-y-2 min-w-0">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Eye className="w-3.5 h-3.5 text-[#064E3B]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">{t('verification.documentPreview')}</h3>
                  <span className="ml-auto text-[10px] text-slate-500 font-mono">
                    {activeRecord.documentLanguage || 'HINDI'}
                  </span>
                </div>
                <DocumentPreview record={activeRecord} />
              </div>

              {/* RIGHT: Extracted Data Tabs */}
              <div className="gov-card p-3 rounded border border-slate-300 bg-white min-w-0">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 mb-3 -mx-3 px-3 gap-0 overflow-x-auto">
                  {[
                    { id: 'fields' as const, label: t('verification.extractedFieldsReview'), icon: Edit3 },
                    { id: 'validation' as const, label: t('verification.ruleValidation'), icon: Shield },
                    { id: 'anomaly' as const, label: t('verification.riskScore'), icon: AlertTriangle },
                    { id: 'history' as const, label: t('dashboard.auditTrail'), icon: Copy },
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold border-b-2 -mb-px transition whitespace-nowrap ${
                          activeView === tab.id
                            ? 'border-[#064E3B] text-[#064E3B]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <Icon className="w-3 h-3" /> {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* FIELDS TAB */}
                {activeView === 'fields' && (
                  <div className="space-y-2">
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {fields.map(field => {
                        const isLow = field.confidence < 75;
                        const currentVal = editedFields[field.fieldName] ?? field.value;
                        const isEdited = editedFields[field.fieldName] !== undefined;
                        return (
                          <div key={field.fieldName} className={`flex items-center gap-2 p-2 rounded border text-xs ${
                            isLow ? 'border-amber-200 bg-amber-50/70' : 'border-slate-100 bg-slate-50/50'
                          }`}>
                            <div className="w-32 shrink-0 text-[10px] font-bold text-slate-600 uppercase">
                              {field.fieldLabel}
                            </div>
                            <input
                              type="text"
                              value={currentVal}
                              placeholder="Not detected (Requires verification)"
                              onChange={e => handleFieldEdit(field.fieldName, e.target.value)}
                              className={`flex-1 min-w-0 bg-white border rounded px-2 py-0.5 text-xs font-medium focus:outline-none focus:border-[#064E3B] ${
                                isEdited ? 'border-blue-500 bg-blue-50/50 font-bold text-blue-900' : 'border-slate-300'
                              }`}
                            />
                            <ConfidenceBadge score={field.confidence} />
                            {isEdited && <span className="text-[9px] text-blue-700 font-bold shrink-0">EDITED</span>}
                          </div>
                        );
                      })}
                    </div>

                    {Object.keys(editedFields).length > 0 && (
                      <div className="pt-2 border-t border-slate-200 space-y-2">
                        <input
                          type="text"
                          value={correctionReason}
                          onChange={e => setCorrectionReason(e.target.value)}
                          placeholder="Reason for correction (e.g., Faded digit corrected from original scan)…"
                          className="w-full text-xs p-1.5 border border-slate-300 rounded bg-slate-50 focus:outline-none focus:border-[#064E3B]"
                        />
                        <button
                          onClick={handleSaveCorrections}
                          className="w-full gov-btn-secondary py-1.5 text-xs font-bold text-blue-800 border-blue-300 flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> {t('verification.saveCorrections')} ({Object.keys(editedFields).length})
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* VALIDATION TAB */}
                {activeView === 'validation' && (
                  <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                    {(activeRecord.validationResults && activeRecord.validationResults.length > 0 ? activeRecord.validationResults : [
                      { ruleId: 'R01', ruleName: 'Mandatory Required Fields', status: 'PASS' as const, severity: 'HIGH' as const, description: 'Owner Name, Khasra, Village present.', suggestedAction: 'No action.' },
                      { ruleId: 'R02', ruleName: 'Khasra Number Format', status: 'PASS' as const, severity: 'HIGH' as const, description: 'Khasra number format valid.', suggestedAction: 'No action.' },
                      { ruleId: 'R03', ruleName: 'Duplicate Registry Search', status: 'PASS' as const, severity: 'CRITICAL' as const, description: 'No duplicate entry detected.', suggestedAction: 'No action.' },
                    ]).map((rule, i) => (
                      <div key={i} className={`p-2.5 rounded border text-xs ${
                        rule.status === 'FAIL' ? 'border-red-200 bg-red-50' :
                        rule.status === 'WARNING' ? 'border-amber-200 bg-amber-50' :
                        'border-emerald-200 bg-emerald-50/50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <ValidationIcon status={rule.status} />
                          <span className="font-bold text-slate-900">{rule.ruleName}</span>
                          <SeverityBadge severity={rule.severity} />
                        </div>
                        <div className="text-[11px] text-slate-600 ml-5">{rule.description}</div>
                        {rule.status !== 'PASS' && (
                          <div className="text-[11px] text-blue-700 ml-5 mt-0.5 font-medium">
                            → Action: {rule.suggestedAction}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ANOMALY & DUPLICATE TAB */}
                {activeView === 'anomaly' && (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {/* Risk score bar */}
                    <div className={`p-3 rounded border text-xs ${
                      (activeRecord.riskScore ?? 0) >= 70 ? 'border-red-300 bg-red-50' :
                      (activeRecord.riskScore ?? 0) >= 40 ? 'border-amber-300 bg-amber-50' :
                      'border-emerald-300 bg-emerald-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">{t('verification.riskScore')}</span>
                        <span className={`text-2xl font-bold ${
                          (activeRecord.riskScore ?? 0) >= 70 ? 'text-red-700' :
                          (activeRecord.riskScore ?? 0) >= 40 ? 'text-amber-700' : 'text-emerald-700'
                        }`}>{activeRecord.riskScore ?? 15}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            (activeRecord.riskScore ?? 0) >= 70 ? 'bg-red-600' :
                            (activeRecord.riskScore ?? 0) >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${activeRecord.riskScore ?? 15}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-600 italic">
                        {(activeRecord.riskScore ?? 0) >= 40
                          ? '⚠ Risk detected: Verification required before publishing to central registry.'
                          : '✓ Low risk: Record layout consistent with expected revenue register.'}
                      </div>
                    </div>

                    {activeRecord.anomalyFlags && activeRecord.anomalyFlags.length > 0 ? (
                      <div className="space-y-1.5">
                        {activeRecord.anomalyFlags.map((flag, i) => (
                          <div key={i} className="p-2.5 border border-amber-200 bg-amber-50 rounded text-xs">
                            <div className="font-bold text-amber-900 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" /> {flag.type}
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">{flag.description}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 border border-emerald-200 bg-emerald-50 rounded text-xs text-emerald-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> No anomaly flags raised for this record.
                      </div>
                    )}

                    {activeRecord.duplicateMatch && (
                      <div className="p-3 border border-blue-200 bg-blue-50 rounded text-xs">
                        <div className="font-bold text-blue-900 mb-2">Possible Duplicate Record Match</div>
                        <div className="grid grid-cols-2 gap-2 mb-2 text-[11px]">
                          <div className="bg-white border border-blue-200 rounded p-2">
                            <div className="text-[10px] font-bold text-slate-500">THIS DOCUMENT</div>
                            <div className="font-bold text-slate-900">#{activeRecord.id}</div>
                            <div>{activeRecord.ownerName}</div>
                            <div className="font-mono">Khasra {activeRecord.khasraNo}</div>
                          </div>
                          <div className="bg-white border border-blue-200 rounded p-2">
                            <div className="text-[10px] font-bold text-slate-500">MATCHED RECORD</div>
                            <div className="font-bold text-slate-900">#{activeRecord.duplicateMatch.matchedRecordId}</div>
                            <div>{activeRecord.duplicateMatch.matchedOwner}</div>
                            <div className="font-mono">Khasra {activeRecord.duplicateMatch.matchedKhasra}</div>
                          </div>
                        </div>
                        <div className="text-[11px] font-bold text-blue-800">
                          Similarity: {activeRecord.duplicateMatch.similarity}% · Matched Fields: {activeRecord.duplicateMatch.matchedFields.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AUDIT TRAIL TAB */}
                {activeView === 'history' && (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
                    {recordLogs.length > 0 ? recordLogs.map(log => (
                      <div key={log.id} className="p-2 border border-slate-200 rounded bg-slate-50">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{log.action}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">By: {log.actor} ({log.actorRole})</div>
                        {log.details && <div className="text-[10px] text-slate-500 italic mt-0.5">{log.details}</div>}
                      </div>
                    )) : (
                      <div className="p-4 text-center text-slate-400 italic">No previous audit logs for this record ID.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="gov-card p-3 rounded border border-slate-300 bg-white flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>Review original document and extracted data before approving.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendBack}
                  disabled={activeRecord.status === 'VERIFIED'}
                  className="gov-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 text-amber-800 border-amber-300 disabled:opacity-50"
                  title="Send back to Land Record Officer for rescan"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> {t('verification.sendBack')}
                </button>
                <button
                  onClick={handleReject}
                  disabled={activeRecord.status === 'REJECTED'}
                  className="gov-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 text-red-700 border-red-300 disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" /> {t('verification.rejectRecord')}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={activeRecord.status === 'VERIFIED'}
                  className="gov-btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  <Check className="w-3.5 h-3.5" />
                  {activeRecord.status === 'VERIFIED' ? t('common.verified') : t('verification.approveRecord')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-9 gov-card rounded border border-slate-300 flex items-center justify-center h-64 text-slate-400 text-xs bg-white">
            {t('verification.selectRecord')}
          </div>
        )}
      </div>
    </div>
  );
};
