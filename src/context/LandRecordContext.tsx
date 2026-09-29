import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LandRecord, AuditLogEntry, DocumentRecord, ExtractedField } from '../types/landRecord';
import { MOCK_LAND_RECORDS, MOCK_AUDIT_LOGS } from '../mockData/mockData';
import { type DocumentMetadata, type OcrProcessingResult } from '../services/ocrService';
import { OcrService } from '../services/ocrService';
import { ValidationEngine } from '../services/validationEngine';
import { RoutingEngine } from '../services/routingEngine';
import { DatabaseService } from '../services/databaseService';
import * as api from '../services/apiService';

interface LandRecordContextType {
  records: LandRecord[];
  auditLogs: AuditLogEntry[];
  documentRecords: DocumentRecord[];
  isProcessingUpload: boolean;
  isDatabaseLoading: boolean;
  dbError: string | null;
  latestProcessedResult: OcrProcessingResult | null;
  activeVerificationRecordId: string | null;
  isBackendOnline: boolean;
  setActiveVerificationRecordId: (id: string | null) => void;
  processDocumentUpload: (
    file: File,
    metadata: DocumentMetadata,
    officerName: string,
    officerRole: string
  ) => Promise<{ record: LandRecord; ocrResult: OcrProcessingResult }>;
  updateRecordFields: (
    recordId: string,
    correctedFields: Record<string, string>,
    officerName: string,
    officerRole: string,
    reason?: string
  ) => Promise<void>;
  verifyRecord: (
    recordId: string,
    officerName: string,
    officerRole: string,
    remarks?: string
  ) => Promise<LandRecord>;
  rejectRecord: (
    recordId: string,
    officerName: string,
    officerRole: string,
    reason?: string
  ) => Promise<LandRecord>;
  sendBackRecord: (
    recordId: string,
    officerName: string,
    officerRole: string,
    instructions?: string
  ) => Promise<void>;
  addAuditLogEntry: (
    actor: string,
    actorRole: string,
    action: string,
    target: string,
    recordId?: string,
    status?: 'SUCCESS' | 'FLAGGED' | 'FAILED',
    previousValue?: string,
    newValue?: string,
    details?: string
  ) => Promise<void>;
  clearDbError: () => void;
}

const LandRecordContext = createContext<LandRecordContextType | undefined>(undefined);

export const LandRecordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<LandRecord[]>(MOCK_LAND_RECORDS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [documentRecords, setDocumentRecords] = useState<DocumentRecord[]>([]);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [isDatabaseLoading, setIsDatabaseLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [latestProcessedResult, setLatestProcessedResult] = useState<OcrProcessingResult | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [activeVerificationRecordId, setActiveVerificationRecordIdState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('activeVerificationRecordId');
    } catch {
      return null;
    }
  });

  const setActiveVerificationRecordId = (id: string | null) => {
    setActiveVerificationRecordIdState(id);
    try {
      if (id) {
        sessionStorage.setItem('activeVerificationRecordId', id);
      } else {
        sessionStorage.removeItem('activeVerificationRecordId');
      }
    } catch (e) {
      console.warn('Session storage write warning:', e);
    }
  };

  // ─── Refresh helpers ────────────────────────────────────────────────────────

  const refreshRecords = async (online: boolean) => {
    try {
      if (online) {
        const recs = await api.fetchRecords();
        setRecords(recs.length > 0 ? recs : MOCK_LAND_RECORDS);
      } else {
        const recs = await DatabaseService.getAllLandRecords();
        setRecords(recs.length > 0 ? recs : MOCK_LAND_RECORDS);
      }
    } catch {
      /* keep current state */
    }
  };

  const refreshLogs = async (online: boolean) => {
    try {
      if (online) {
        const logs = await api.fetchAuditLogs();
        setAuditLogs(logs.length > 0 ? logs : MOCK_AUDIT_LOGS);
      } else {
        const logs = await DatabaseService.getAllAuditLogs();
        setAuditLogs(logs.length > 0 ? logs : MOCK_AUDIT_LOGS);
      }
    } catch {
      /* keep current state */
    }
  };

  const refreshDocs = async (online: boolean) => {
    try {
      if (online) {
        const docs = await api.fetchDocuments();
        setDocumentRecords(docs);
      } else {
        const docs = await DatabaseService.getAllDocumentRecords();
        setDocumentRecords(docs);
      }
    } catch {
      /* keep current state */
    }
  };

  // ─── Initial load — backend-first, IndexedDB fallback ──────────────────────

  useEffect(() => {
    let isMounted = true;
    const loadFromDatabase = async () => {
      try {
        setIsDatabaseLoading(true);

        const online = await api.checkBackendHealth();
        if (isMounted) setIsBackendOnline(online);

        if (online) {
          console.log('[DataLayer] Express backend online — loading from /api');
          const [recs, logs, docs] = await Promise.all([
            api.fetchRecords(),
            api.fetchAuditLogs(),
            api.fetchDocuments(),
          ]);
          if (isMounted) {
            setRecords(recs.length > 0 ? recs : MOCK_LAND_RECORDS);
            setAuditLogs(logs.length > 0 ? logs : MOCK_AUDIT_LOGS);
            setDocumentRecords(docs);
          }
        } else {
          console.log('[DataLayer] Backend offline — falling back to IndexedDB');
          const dbRecords = await DatabaseService.getAllLandRecords();
          const dbLogs = await DatabaseService.getAllAuditLogs();
          const dbDocs = await DatabaseService.getAllDocumentRecords();
          if (isMounted) {
            setRecords(dbRecords.length > 0 ? dbRecords : MOCK_LAND_RECORDS);
            setAuditLogs(dbLogs.length > 0 ? dbLogs : MOCK_AUDIT_LOGS);
            setDocumentRecords(dbDocs);
          }
        }
        if (isMounted) setDbError(null);
      } catch (err: any) {
        console.error('Database connection error:', err);
        if (isMounted) setDbError(err?.message || 'Database initialization error');
      } finally {
        if (isMounted) setIsDatabaseLoading(false);
      }
    };

    loadFromDatabase();
    return () => { isMounted = false; };
  }, []);

  const clearDbError = () => setDbError(null);

  // ─── Audit log ──────────────────────────────────────────────────────────────

  const addAuditLogEntry = async (
    actor: string,
    actorRole: string,
    action: string,
    target: string,
    recordId?: string,
    status: 'SUCCESS' | 'FLAGGED' | 'FAILED' = 'SUCCESS',
    previousValue?: string,
    newValue?: string,
    details?: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      actor,
      actorRole,
      action,
      target,
      recordId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '10.24.110.84',
      status,
      previousValue,
      newValue,
      details,
    };

    try {
      await DatabaseService.addAuditLog(newEntry);
      await refreshLogs(isBackendOnline);
    } catch (e) {
      console.error('Failed to write audit log to database', e);
      setAuditLogs(prev => [newEntry, ...prev]);
    }
  };

  // ─── Document Upload & Processing — backend-first ───────────────────────────

  const processDocumentUpload = async (
    file: File,
    metadata: DocumentMetadata,
    officerName: string,
    officerRole: string
  ): Promise<{ record: LandRecord; ocrResult: OcrProcessingResult }> => {
    setIsProcessingUpload(true);
    setDbError(null);

    try {
      let result: { record: LandRecord; ocrResult: OcrProcessingResult };

      if (isBackendOnline) {
        // ── Route through Express backend ──
        console.log('[Upload] Routing through Express backend /api/ocr/process');
        result = await api.uploadAndProcess(file, metadata, officerName, officerRole);
      } else {
        // ── Offline fallback: client-side OCR + IndexedDB ──
        console.log('[Upload] Backend offline — running client-side OCR');
        const ocrResult = await OcrService.processDocument(file, metadata);
        const validationOutput = ValidationEngine.validate(ocrResult, records);
        const { record: newRecord } = RoutingEngine.routeDocument(ocrResult, validationOutput, officerName);

        await DatabaseService.saveLandRecord(newRecord);

        const docRec: DocumentRecord = {
          id: ocrResult.documentId,
          originalFileName: file.name,
          fileType: file.type.includes('pdf') ? 'PDF' : 'JPG',
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          documentType: metadata.docType || 'Jamabandi',
          state: metadata.state || '',
          district: metadata.district || '',
          tehsil: metadata.tehsil || '',
          village: metadata.village || '',
          recordYear: metadata.recordYear || '',
          language: ocrResult.detectedLanguages.join(', '),
          uploadedBy: officerName,
          uploadedAt: ocrResult.uploadTimestamp,
          processingStatus: 'EXTRACTED',
          linkedRecordId: newRecord.id,
        };
        await DatabaseService.saveDocumentRecord(docRec);

        result = { record: newRecord, ocrResult };
      }

      setLatestProcessedResult(result.ocrResult);
      setActiveVerificationRecordId(result.record.id);
      console.log('[Upload] Record created:', result.record.id);

      // Refresh state from whichever source is active
      await refreshRecords(isBackendOnline);
      await refreshDocs(isBackendOnline);

      return result;
    } catch (err: any) {
      setDbError(err?.message || 'Failed to process document');
      throw err;
    } finally {
      setIsProcessingUpload(false);
    }
  };

  // ─── Field correction ───────────────────────────────────────────────────────

  const updateRecordFields = async (
    recordId: string,
    correctedFields: Record<string, string>,
    officerName: string,
    officerRole: string,
    reason?: string
  ) => {
    setDbError(null);
    try {
      const targetRecord = records.find(r => r.id === recordId);
      if (!targetRecord) throw new Error(`Record #${recordId} not found`);

      const updatedFields: ExtractedField[] = (targetRecord.extractedFields || []).map(f => {
        if (correctedFields[f.fieldName] !== undefined) {
          const newVal = correctedFields[f.fieldName];
          return {
            ...f,
            value: newVal,
            originalValue: f.originalValue || f.value,
            isEdited: true,
            confidence: 100,
          };
        }
        return f;
      });

      const updatedRecord: LandRecord = {
        ...targetRecord,
        ownerName: correctedFields['ownerName'] !== undefined ? correctedFields['ownerName'] : targetRecord.ownerName,
        coOwnerName: correctedFields['coOwnerName'] !== undefined ? correctedFields['coOwnerName'] : targetRecord.coOwnerName,
        khasraNo: correctedFields['khasraNo'] !== undefined ? correctedFields['khasraNo'] : targetRecord.khasraNo,
        khataNo: correctedFields['khataNo'] !== undefined ? correctedFields['khataNo'] : targetRecord.khataNo,
        khewatNo: correctedFields['khewatNo'] !== undefined ? correctedFields['khewatNo'] : targetRecord.khewatNo,
        surveyNo: correctedFields['surveyNo'] !== undefined ? correctedFields['surveyNo'] : targetRecord.surveyNo,
        plotNo: correctedFields['plotNo'] !== undefined ? correctedFields['plotNo'] : targetRecord.plotNo,
        villageMauza: correctedFields['villageMauza'] !== undefined ? correctedFields['villageMauza'] : targetRecord.villageMauza,
        tehsil: correctedFields['tehsil'] !== undefined ? correctedFields['tehsil'] : targetRecord.tehsil,
        district: correctedFields['district'] !== undefined ? correctedFields['district'] : targetRecord.district,
        state: correctedFields['state'] !== undefined ? correctedFields['state'] : targetRecord.state,
        areaAcres: correctedFields['areaAcres'] !== undefined
          ? (parseFloat(correctedFields['areaAcres'].replace(/[^0-9\.]/g, '')) || targetRecord.areaAcres)
          : targetRecord.areaAcres,
        landCategory: (correctedFields['landCategory'] as any) || targetRecord.landCategory,
        landUse: correctedFields['landUse'] !== undefined ? correctedFields['landUse'] : targetRecord.landUse,
        mutationNo: correctedFields['mutationNo'] !== undefined ? correctedFields['mutationNo'] : targetRecord.mutationNo,
        registrationNo: correctedFields['registrationNo'] !== undefined ? correctedFields['registrationNo'] : targetRecord.registrationNo,
        recordYear: correctedFields['recordYear'] !== undefined ? correctedFields['recordYear'] : targetRecord.recordYear,
        extractedFields: updatedFields,
      };

      if (isBackendOnline) {
        await api.saveRecord(updatedRecord);
      } else {
        await DatabaseService.saveLandRecord(updatedRecord);
      }

      await addAuditLogEntry(
        officerName,
        officerRole,
        'FIELD_CORRECTION',
        `Record #${recordId}`,
        recordId,
        'SUCCESS',
        undefined,
        undefined,
        reason || 'Officer corrected field during side-by-side verification.'
      );

      await refreshRecords(isBackendOnline);
    } catch (err: any) {
      setDbError(err?.message || 'Database error during field correction');
      throw err;
    }
  };

  // ─── Approve (verify) ──────────────────────────────────────────────────────

  const verifyRecord = async (
    recordId: string,
    officerName: string,
    officerRole: string,
    remarks?: string
  ): Promise<LandRecord> => {
    setDbError(null);
    try {
      let updatedRecord: LandRecord;

      if (isBackendOnline) {
        updatedRecord = await api.approveRecord(recordId, officerName, officerRole, remarks);
      } else {
        const existingRecord = records.find(r => r.id === recordId);
        updatedRecord = await DatabaseService.approveLandRecord(
          recordId,
          userOfficerId(officerName),
          officerName,
          officerRole,
          remarks,
          existingRecord
        );
      }

      console.log('[Verification] Record verified:', recordId);
      await refreshRecords(isBackendOnline);
      await refreshLogs(isBackendOnline);
      return updatedRecord;
    } catch (err: any) {
      const msg = err?.message || 'Failed to approve land record';
      setDbError(msg);
      throw new Error(msg);
    }
  };

  // ─── Reject ────────────────────────────────────────────────────────────────

  const rejectRecord = async (
    recordId: string,
    officerName: string,
    officerRole: string,
    reason: string = 'Rejected during officer review.'
  ): Promise<LandRecord> => {
    setDbError(null);
    try {
      let updatedRecord: LandRecord;

      if (isBackendOnline) {
        updatedRecord = await api.rejectRecord(recordId, officerName, officerRole, reason);
      } else {
        const existingRecord = records.find(r => r.id === recordId);
        updatedRecord = await DatabaseService.rejectLandRecord(
          recordId,
          userOfficerId(officerName),
          officerName,
          officerRole,
          reason,
          existingRecord
        );
      }

      console.log('[Verification] Record rejected:', recordId);
      await refreshRecords(isBackendOnline);
      await refreshLogs(isBackendOnline);
      return updatedRecord;
    } catch (err: any) {
      const msg = err?.message || 'Failed to reject land record';
      setDbError(msg);
      throw new Error(msg);
    }
  };

  // ─── Send back ──────────────────────────────────────────────────────────────

  const sendBackRecord = async (
    recordId: string,
    officerName: string,
    officerRole: string,
    instructions?: string
  ) => {
    setDbError(null);
    try {
      const targetRecord = records.find(r => r.id === recordId);
      if (!targetRecord) throw new Error(`Record #${recordId} not found`);

      const updatedRecord: LandRecord = {
        ...targetRecord,
        status: 'PROCESSING',
        verificationRemarks: instructions || 'Returned for rescan and re-extraction.',
      };

      if (isBackendOnline) {
        await api.saveRecord(updatedRecord);
      } else {
        await DatabaseService.saveLandRecord(updatedRecord);
      }

      await addAuditLogEntry(
        officerName,
        officerRole,
        'SENT_BACK_FOR_REPROCESSING',
        `Record #${recordId}`,
        recordId,
        'FLAGGED',
        'PENDING_VERIFICATION',
        'PROCESSING',
        instructions || 'Returned to scan desk.'
      );

      await refreshRecords(isBackendOnline);
    } catch (err: any) {
      setDbError(err?.message || 'Failed to send back record');
      throw err;
    }
  };

  // Utility officer ID lookup
  const userOfficerId = (name: string) => {
    if (name.includes('Tehsildar') || name.includes('Sharma')) return 'OFF-4092';
    if (name.includes('Verma') || name.includes('Verification')) return 'OFF-5012';
    return 'OFF-1001';
  };

  return (
    <LandRecordContext.Provider
      value={{
        records,
        auditLogs,
        documentRecords,
        isProcessingUpload,
        isDatabaseLoading,
        dbError,
        latestProcessedResult,
        activeVerificationRecordId,
        isBackendOnline,
        setActiveVerificationRecordId,
        processDocumentUpload,
        updateRecordFields,
        verifyRecord,
        rejectRecord,
        sendBackRecord,
        addAuditLogEntry,
        clearDbError,
      }}
    >
      {children}
    </LandRecordContext.Provider>
  );
};

export const useLandRecords = () => {
  const context = useContext(LandRecordContext);
  if (!context) {
    throw new Error('useLandRecords must be used within a LandRecordProvider');
  }
  return context;
};
