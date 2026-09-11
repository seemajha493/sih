import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LandRecord, AuditLogEntry, DocumentRecord, ExtractedField } from '../types/landRecord';
import { MOCK_LAND_RECORDS, MOCK_AUDIT_LOGS } from '../mockData/mockData';
import { OcrService, type DocumentMetadata, type OcrProcessingResult } from '../services/ocrService';
import { ValidationEngine } from '../services/validationEngine';
import { RoutingEngine } from '../services/routingEngine';
import { DatabaseService } from '../services/databaseService';

interface LandRecordContextType {
  records: LandRecord[];
  auditLogs: AuditLogEntry[];
  documentRecords: DocumentRecord[];
  isProcessingUpload: boolean;
  isDatabaseLoading: boolean;
  dbError: string | null;
  latestProcessedResult: OcrProcessingResult | null;
  activeVerificationRecordId: string | null;
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

  // Initialize data source directly from IndexedDB database (`BhumiTraceDB`)
  useEffect(() => {
    let isMounted = true;
    const loadFromDatabase = async () => {
      try {
        setIsDatabaseLoading(true);
        const dbRecords = await DatabaseService.getAllLandRecords();
        const dbLogs = await DatabaseService.getAllAuditLogs();

        if (isMounted) {
          setRecords(dbRecords.length > 0 ? dbRecords : MOCK_LAND_RECORDS);
          setAuditLogs(dbLogs.length > 0 ? dbLogs : MOCK_AUDIT_LOGS);
          setDbError(null);
        }
      } catch (err: any) {
        console.error('Database connection error:', err);
        if (isMounted) {
          setDbError(err?.message || 'Database initialization error');
        }
      } finally {
        if (isMounted) {
          setIsDatabaseLoading(false);
        }
      }
    };

    loadFromDatabase();
    return () => { isMounted = false; };
  }, []);

  const clearDbError = () => setDbError(null);

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
      const updatedLogs = await DatabaseService.getAllAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (e) {
      console.error('Failed to write audit log to database', e);
      setAuditLogs(prev => [newEntry, ...prev]);
    }
  };

  /**
   * Document Upload & Processing Pipeline connected to Database
   */
  const processDocumentUpload = async (
    file: File,
    metadata: DocumentMetadata,
    officerName: string,
    officerRole: string
  ): Promise<{ record: LandRecord; ocrResult: OcrProcessingResult }> => {
    setIsProcessingUpload(true);
    setDbError(null);

    try {
      // 1. OCR Extraction
      const ocrResult = await OcrService.processDocument(file, metadata);
      setLatestProcessedResult(ocrResult);
      console.log('[OCR Pipeline] Document uploaded: documentId =', ocrResult.documentId);

      // 2. Validation & Anomaly Engine
      const validationOutput = ValidationEngine.validate(ocrResult, records);

      // 3. Routing Engine
      const { record: newRecord } = RoutingEngine.routeDocument(
        ocrResult,
        validationOutput,
        officerName
      );

      // 4. PERSIST TO INDEXEDDB DATABASE (`land_records` table)
      await DatabaseService.saveLandRecord(newRecord);
      setActiveVerificationRecordId(newRecord.id);

      console.log('[OCR Pipeline] Verification request created: verificationRequestId =', newRecord.id);

      // 5. Insert Audit Entry in `audit_logs` table
      await addAuditLogEntry(
        officerName,
        officerRole,
        'DOCUMENT_UPLOADED',
        `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        newRecord.id,
        'SUCCESS',
        undefined,
        newRecord.status,
        `State: ${metadata.state}, District: ${metadata.district}, Village: ${metadata.village}`
      );

      // Re-query database
      const updatedDbRecords = await DatabaseService.getAllLandRecords();
      setRecords(updatedDbRecords);

      const docRec: DocumentRecord = {
        id: ocrResult.documentId,
        originalFileName: file.name,
        fileType: file.type.includes('pdf') ? 'PDF' : 'JPG',
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        documentType: metadata.docType,
        state: metadata.state,
        district: metadata.district,
        tehsil: metadata.tehsil,
        village: metadata.village,
        recordYear: metadata.recordYear,
        language: ocrResult.detectedLanguages.join(', '),
        uploadedBy: officerName,
        uploadedAt: ocrResult.uploadTimestamp,
        processingStatus: 'EXTRACTED',
        linkedRecordId: newRecord.id,
      };

      setDocumentRecords(prev => [docRec, ...prev]);
      return { record: newRecord, ocrResult };
    } catch (err: any) {
      setDbError(err?.message || 'Failed to process document in database');
      throw err;
    } finally {
      setIsProcessingUpload(false);
    }
  };

  /**
   * Officer Field Edit / Correction Tracking in Database
   */
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

      const newOwner = correctedFields['ownerName'] || targetRecord.ownerName;
      const newKhasra = correctedFields['khasraNo'] || targetRecord.khasraNo;
      const newArea = correctedFields['areaAcres'] ? parseFloat(correctedFields['areaAcres']) : targetRecord.areaAcres;

      const updatedRecord: LandRecord = {
        ...targetRecord,
        ownerName: newOwner,
        khasraNo: newKhasra,
        areaAcres: isNaN(newArea) ? targetRecord.areaAcres : newArea,
        extractedFields: updatedFields,
      };

      // Persist edit to IndexedDB
      await DatabaseService.saveLandRecord(updatedRecord);

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

      const refreshed = await DatabaseService.getAllLandRecords();
      setRecords(refreshed);
    } catch (err: any) {
      setDbError(err?.message || 'Database error during field correction');
      throw err;
    }
  };

  /**
   * REAL DATABASE TRANSACTION: APPROVE & PUBLISH RECORD
   * Executes IndexedDB transaction modifying `land_records` table & `audit_logs` table
   */
  const verifyRecord = async (
    recordId: string,
    officerName: string,
    officerRole: string,
    remarks?: string
  ): Promise<LandRecord> => {
    setDbError(null);
    try {
      const existingRecord = records.find(r => r.id === recordId);
      const updatedRecord = await DatabaseService.approveLandRecord(
        recordId,
        userOfficerId(officerName),
        officerName,
        officerRole,
        remarks,
        existingRecord
      );

      console.log('[Verification Pipeline] Record verified & published: recordId =', recordId, 'status = VERIFIED');

      // Re-query database to update single source of truth
      const refreshedRecords = await DatabaseService.getAllLandRecords();
      const refreshedLogs = await DatabaseService.getAllAuditLogs();

      setRecords(refreshedRecords);
      setAuditLogs(refreshedLogs);

      return updatedRecord;
    } catch (err: any) {
      const msg = err?.message || 'Failed to approve land record in database';
      setDbError(msg);
      throw new Error(msg);
    }
  };

  /**
   * REAL DATABASE TRANSACTION: REJECT RECORD
   * Executes IndexedDB transaction modifying `land_records` table & `audit_logs` table
   */
  const rejectRecord = async (
    recordId: string,
    officerName: string,
    officerRole: string,
    reason: string = 'Rejected during officer review.'
  ): Promise<LandRecord> => {
    setDbError(null);
    try {
      const existingRecord = records.find(r => r.id === recordId);
      const updatedRecord = await DatabaseService.rejectLandRecord(
        recordId,
        userOfficerId(officerName),
        officerName,
        officerRole,
        reason,
        existingRecord
      );

      console.log('[Verification Pipeline] Record rejected: recordId =', recordId, 'status = REJECTED');

      // Re-query database
      const refreshedRecords = await DatabaseService.getAllLandRecords();
      const refreshedLogs = await DatabaseService.getAllAuditLogs();

      setRecords(refreshedRecords);
      setAuditLogs(refreshedLogs);

      return updatedRecord;
    } catch (err: any) {
      const msg = err?.message || 'Failed to reject land record in database';
      setDbError(msg);
      throw new Error(msg);
    }
  };

  /**
   * Send Back Record in Database
   */
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

      await DatabaseService.saveLandRecord(updatedRecord);
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

      const refreshed = await DatabaseService.getAllLandRecords();
      setRecords(refreshed);
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
