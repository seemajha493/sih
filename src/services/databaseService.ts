import type { LandRecord, AuditLogEntry } from '../types/landRecord';
import { MOCK_LAND_RECORDS, MOCK_AUDIT_LOGS } from '../mockData/mockData';

const DB_NAME = 'BhumiTraceDB';
const DB_VERSION = 1;
const STORE_LAND_RECORDS = 'land_records';
const STORE_AUDIT_LOGS = 'audit_logs';
const STORE_DOCUMENTS = 'document_records';

/**
 * Native IndexedDB Browser Database Engine Connection Helper
 */
export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Land Records Table
      if (!db.objectStoreNames.contains(STORE_LAND_RECORDS)) {
        const recordsStore = db.createObjectStore(STORE_LAND_RECORDS, { keyPath: 'id' });
        recordsStore.createIndex('status', 'status', { unique: false });
        recordsStore.createIndex('district', 'district', { unique: false });
        recordsStore.createIndex('khasraNo', 'khasraNo', { unique: false });
      }

      // 2. Audit Logs Table
      if (!db.objectStoreNames.contains(STORE_AUDIT_LOGS)) {
        const logsStore = db.createObjectStore(STORE_AUDIT_LOGS, { keyPath: 'id' });
        logsStore.createIndex('recordId', 'recordId', { unique: false });
        logsStore.createIndex('actorRole', 'actorRole', { unique: false });
      }

      // 3. Documents Table
      if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {
        db.createObjectStore(STORE_DOCUMENTS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB database'));
  });
};

/**
 * Seed initial records into IndexedDB database on first run
 */
export const seedDatabaseIfEmpty = async (db: IDBDatabase): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_LAND_RECORDS, STORE_AUDIT_LOGS], 'readwrite');
    const recordsStore = tx.objectStore(STORE_LAND_RECORDS);
    const logsStore = tx.objectStore(STORE_AUDIT_LOGS);

    const countReq = recordsStore.count();
    countReq.onsuccess = () => {
      if (countReq.result === 0) {
        // Seed land records
        MOCK_LAND_RECORDS.forEach((rec) => recordsStore.put(rec));
        // Seed audit logs
        MOCK_AUDIT_LOGS.forEach((log) => logsStore.put(log));
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export class DatabaseService {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDatabase().then(async (db) => {
        await seedDatabaseIfEmpty(db);
        return db;
      });
    }
    return this.dbPromise;
  }

  /**
   * Fetch all land records from IndexedDB database table
   */
  static async getAllLandRecords(): Promise<LandRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_LAND_RECORDS, 'readonly');
      const store = tx.objectStore(STORE_LAND_RECORDS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Fetch pending verification requests directly from IndexedDB database using status filter
   */
  static async getPendingRequests(): Promise<LandRecord[]> {
    const all = await this.getAllLandRecords();
    return all.filter(
      (r) =>
        r.status === 'PENDING_VERIFICATION' ||
        r.status === 'LOW_CONFIDENCE' ||
        r.status === 'DUPLICATE' ||
        r.status === 'ANOMALY_DETECTED' ||
        r.status === 'PROCESSING'
    );
  }

  /**
   * Fetch approved/published records from IndexedDB database
   */
  static async getApprovedRecords(): Promise<LandRecord[]> {
    const all = await this.getAllLandRecords();
    return all.filter((r) => r.status === 'VERIFIED');
  }

  /**
   * Fetch rejected records from IndexedDB database
   */
  static async getRejectedRecords(): Promise<LandRecord[]> {
    const all = await this.getAllLandRecords();
    return all.filter((r) => r.status === 'REJECTED');
  }

  /**
   * Save or insert a land record into IndexedDB `land_records` table
   */
  static async saveLandRecord(record: LandRecord): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_LAND_RECORDS, 'readwrite');
      const store = tx.objectStore(STORE_LAND_RECORDS);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Database Operation: APPROVE & PUBLISH LAND RECORD
   * Updates `land_records` table: status -> 'VERIFIED', approved_by, approved_at
   * Inserts audit entry in `audit_logs` table: 'LAND_RECORD_APPROVED'
   */
  static async approveLandRecord(
    recordId: string,
    officerId: string,
    officerName: string,
    officerRole: string,
    remarks?: string
  ): Promise<LandRecord> {
    // Security check: Only officers or admins can execute database approvals
    if (officerRole === 'PUBLIC_USER') {
      throw new Error('Security Exception: Public users are unauthorized to approve land records.');
    }

    const db = await this.getDB();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_LAND_RECORDS, STORE_AUDIT_LOGS], 'readwrite');
      const recordsStore = tx.objectStore(STORE_LAND_RECORDS);
      const logsStore = tx.objectStore(STORE_AUDIT_LOGS);

      const getReq = recordsStore.get(recordId);

      getReq.onsuccess = () => {
        const record: LandRecord = getReq.result;
        if (!record) {
          reject(new Error(`Land Record #${recordId} not found in database.`));
          return;
        }

        const prevStatus = record.status;

        // 1. Update database fields
        const updatedRecord: LandRecord = {
          ...record,
          status: 'VERIFIED',
          verifiedBy: `${officerName} (${officerId})`,
          verifiedAt: timestamp,
          verificationRemarks: remarks || `Approved and published by Officer ${officerName} (${officerId}).`,
        };

        recordsStore.put(updatedRecord);

        // 2. Insert audit entry in audit_logs table
        const auditLog: AuditLogEntry = {
          id: `LOG-${Date.now().toString().slice(-6)}`,
          actor: officerName,
          actorRole: officerRole,
          action: 'LAND_RECORD_APPROVED',
          target: `Record #${recordId} (Khasra ${record.khasraNo})`,
          recordId: recordId,
          timestamp: timestamp,
          ipAddress: '10.24.110.84',
          status: 'SUCCESS',
          previousValue: prevStatus,
          newValue: 'VERIFIED',
          details: `Land record approved and published by ${officerName} (${officerId}). Remarks: ${remarks || 'None'}`,
        };

        logsStore.put(auditLog);

        tx.oncomplete = () => resolve(updatedRecord);
        tx.onerror = () => reject(tx.error || new Error('Database transaction failed'));
      };

      getReq.onerror = () => reject(getReq.error);
    });
  }

  /**
   * Database Operation: REJECT LAND RECORD
   * Updates `land_records` table: status -> 'REJECTED', rejected_by, rejected_at, rejection_reason
   * Inserts audit entry in `audit_logs` table: 'LAND_RECORD_REJECTED'
   */
  static async rejectLandRecord(
    recordId: string,
    officerId: string,
    officerName: string,
    officerRole: string,
    rejectionReason: string = 'Rejected during officer verification review.'
  ): Promise<LandRecord> {
    // Security check: Only officers or admins can execute database rejections
    if (officerRole === 'PUBLIC_USER') {
      throw new Error('Security Exception: Public users are unauthorized to reject land records.');
    }

    const db = await this.getDB();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_LAND_RECORDS, STORE_AUDIT_LOGS], 'readwrite');
      const recordsStore = tx.objectStore(STORE_LAND_RECORDS);
      const logsStore = tx.objectStore(STORE_AUDIT_LOGS);

      const getReq = recordsStore.get(recordId);

      getReq.onsuccess = () => {
        const record: LandRecord = getReq.result;
        if (!record) {
          reject(new Error(`Land Record #${recordId} not found in database.`));
          return;
        }

        const prevStatus = record.status;

        // 1. Update database fields
        const updatedRecord: LandRecord = {
          ...record,
          status: 'REJECTED',
          verificationRemarks: `Rejected by Officer ${officerName} (${officerId}): ${rejectionReason}`,
          flagReason: rejectionReason,
        };

        recordsStore.put(updatedRecord);

        // 2. Insert audit entry in audit_logs table
        const auditLog: AuditLogEntry = {
          id: `LOG-${Date.now().toString().slice(-6)}`,
          actor: `${officerName} (${officerId})`,
          actorRole: officerRole,
          action: 'LAND_RECORD_REJECTED',
          target: `Record #${recordId} (Khasra ${record.khasraNo})`,
          recordId: recordId,
          timestamp: timestamp,
          ipAddress: '10.24.110.84',
          status: 'FLAGGED',
          previousValue: prevStatus,
          newValue: 'REJECTED',
          details: `Reason: ${rejectionReason}`,
        };

        logsStore.put(auditLog);

        tx.oncomplete = () => resolve(updatedRecord);
        tx.onerror = () => reject(tx.error || new Error('Database transaction failed'));
      };

      getReq.onerror = () => reject(getReq.error);
    });
  }

  /**
   * Fetch all audit logs from IndexedDB `audit_logs` table
   */
  static async getAllAuditLogs(): Promise<AuditLogEntry[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIT_LOGS, 'readonly');
      const store = tx.objectStore(STORE_AUDIT_LOGS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Insert audit log entry directly into IndexedDB `audit_logs` table
   */
  static async addAuditLog(log: AuditLogEntry): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIT_LOGS, 'readwrite');
      const store = tx.objectStore(STORE_AUDIT_LOGS);
      const req = store.put(log);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}
