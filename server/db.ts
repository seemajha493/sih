import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { LandRecord, AuditLogEntry, DocumentRecord } from '../src/types/landRecord';
import { MOCK_LAND_RECORDS, MOCK_AUDIT_LOGS } from '../src/mockData/mockData';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'bhoomitrace.db');
export const db = new Database(dbPath);

// Enable WAL mode for high performance concurrent access
db.pragma('journal_mode = WAL');

export function initDatabase() {
  // 1. Create land_records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS land_records (
      id TEXT PRIMARY KEY,
      khasra_no TEXT,
      khewat_no TEXT,
      khata_no TEXT,
      survey_no TEXT,
      plot_no TEXT,
      owner_name TEXT,
      co_owner_name TEXT,
      village_mauza TEXT,
      tehsil TEXT,
      district TEXT,
      state TEXT,
      area_acres REAL,
      area_unit TEXT,
      land_category TEXT,
      land_use TEXT,
      status TEXT,
      ocr_confidence REAL,
      uploaded_by TEXT,
      uploaded_at TEXT,
      verified_by TEXT,
      verified_at TEXT,
      verification_remarks TEXT,
      document_url TEXT,
      document_language TEXT,
      flag_reason TEXT,
      mutation_no TEXT,
      registration_no TEXT,
      record_year TEXT,
      risk_score REAL,
      data_json TEXT
    );
  `);

  // 2. Create document_records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS document_records (
      id TEXT PRIMARY KEY,
      original_filename TEXT,
      file_type TEXT,
      file_size TEXT,
      document_type TEXT,
      state TEXT,
      district TEXT,
      tehsil TEXT,
      village TEXT,
      record_year TEXT,
      language TEXT,
      uploaded_by TEXT,
      uploaded_at TEXT,
      processing_status TEXT,
      linked_record_id TEXT,
      file_path TEXT
    );
  `);

  // 3. Create audit_logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT,
      actor_role TEXT,
      action TEXT,
      target TEXT,
      record_id TEXT,
      timestamp TEXT,
      ip_address TEXT,
      status TEXT,
      previous_value TEXT,
      new_value TEXT,
      details TEXT
    );
  `);

  // Seed initial records if land_records is empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM land_records').get() as { count: number };
  if (countRow.count === 0) {
    console.log('[SQLite DB] Seeding initial land records & audit logs...');

    const insertRecord = db.prepare(`
      INSERT INTO land_records (
        id, khasra_no, khewat_no, khata_no, survey_no, plot_no,
        owner_name, co_owner_name, village_mauza, tehsil, district, state,
        area_acres, area_unit, land_category, land_use, status, ocr_confidence,
        uploaded_by, uploaded_at, verified_by, verified_at, verification_remarks,
        document_url, document_language, flag_reason, mutation_no, registration_no,
        record_year, risk_score, data_json
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?
      )
    `);

    const insertTx = db.transaction((records: LandRecord[]) => {
      for (const rec of records) {
        insertRecord.run(
          rec.id, rec.khasraNo, rec.khewatNo, rec.khataNo || null, rec.surveyNo || null, rec.plotNo || null,
          rec.ownerName, rec.coOwnerName || null, rec.villageMauza, rec.tehsil, rec.district, rec.state,
          rec.areaAcres, rec.areaUnit || 'Acres', rec.landCategory, rec.landUse || null, rec.status, rec.ocrConfidence,
          rec.uploadedBy, rec.uploadedAt, rec.verifiedBy || null, rec.verifiedAt || null, rec.verificationRemarks || null,
          rec.documentUrl || null, rec.documentLanguage || null, rec.flagReason || null, rec.mutationNo || null, rec.registrationNo || null,
          rec.recordYear || null, rec.riskScore || 0, JSON.stringify(rec)
        );
      }
    });

    insertTx(MOCK_LAND_RECORDS);

    // Seed audit logs
    const insertLog = db.prepare(`
      INSERT INTO audit_logs (id, actor, actor_role, action, target, record_id, timestamp, ip_address, status, previous_value, new_value, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertLogsTx = db.transaction((logs: AuditLogEntry[]) => {
      for (const log of logs) {
        insertLog.run(
          log.id, log.actor, log.actorRole, log.action, log.target, log.recordId || null,
          log.timestamp, log.ipAddress, log.status, log.previousValue || null, log.newValue || null, log.details || null
        );
      }
    });

    insertLogsTx(MOCK_AUDIT_LOGS);
    console.log('[SQLite DB] Seed complete: inserted 25+ land records.');
  }
}

export function getAllRecordsFromDb(): LandRecord[] {
  const rows = db.prepare('SELECT data_json FROM land_records').all() as { data_json: string }[];
  return rows.map(r => JSON.parse(r.data_json));
}

export function getRecordByIdFromDb(id: string): LandRecord | null {
  const row = db.prepare('SELECT data_json FROM land_records WHERE id = ?').get(id) as { data_json: string } | undefined;
  return row ? JSON.parse(row.data_json) : null;
}

export function saveRecordToDb(record: LandRecord): void {
  const stmt = db.prepare(`
    INSERT INTO land_records (
      id, khasra_no, khewat_no, khata_no, survey_no, plot_no,
      owner_name, co_owner_name, village_mauza, tehsil, district, state,
      area_acres, area_unit, land_category, land_use, status, ocr_confidence,
      uploaded_by, uploaded_at, verified_by, verified_at, verification_remarks,
      document_url, document_language, flag_reason, mutation_no, registration_no,
      record_year, risk_score, data_json
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
    ON CONFLICT(id) DO UPDATE SET
      khasra_no=excluded.khasra_no,
      khewat_no=excluded.khewat_no,
      khata_no=excluded.khata_no,
      survey_no=excluded.survey_no,
      plot_no=excluded.plot_no,
      owner_name=excluded.owner_name,
      co_owner_name=excluded.co_owner_name,
      village_mauza=excluded.village_mauza,
      tehsil=excluded.tehsil,
      district=excluded.district,
      state=excluded.state,
      area_acres=excluded.area_acres,
      area_unit=excluded.area_unit,
      land_category=excluded.land_category,
      land_use=excluded.land_use,
      status=excluded.status,
      ocr_confidence=excluded.ocr_confidence,
      uploaded_by=excluded.uploaded_by,
      uploaded_at=excluded.uploaded_at,
      verified_by=excluded.verified_by,
      verified_at=excluded.verified_at,
      verification_remarks=excluded.verification_remarks,
      document_url=excluded.document_url,
      document_language=excluded.document_language,
      flag_reason=excluded.flag_reason,
      mutation_no=excluded.mutation_no,
      registration_no=excluded.registration_no,
      record_year=excluded.record_year,
      risk_score=excluded.risk_score,
      data_json=excluded.data_json
  `);

  stmt.run(
    record.id, record.khasraNo, record.khewatNo, record.khataNo || null, record.surveyNo || null, record.plotNo || null,
    record.ownerName, record.coOwnerName || null, record.villageMauza, record.tehsil, record.district, record.state,
    record.areaAcres, record.areaUnit || 'Acres', record.landCategory, record.landUse || null, record.status, record.ocrConfidence,
    record.uploadedBy, record.uploadedAt, record.verifiedBy || null, record.verifiedAt || null, record.verificationRemarks || null,
    record.documentUrl || null, record.documentLanguage || null, record.flagReason || null, record.mutationNo || null, record.registrationNo || null,
    record.recordYear || null, record.riskScore || 0, JSON.stringify(record)
  );
}

export function getAllDocumentsFromDb(): DocumentRecord[] {
  const rows = db.prepare('SELECT * FROM document_records').all() as any[];
  return rows.map(r => ({
    id: r.id,
    originalFileName: r.original_filename,
    fileType: r.file_type,
    fileSize: r.file_size,
    documentType: r.document_type,
    state: r.state,
    district: r.district,
    tehsil: r.tehsil,
    village: r.village,
    recordYear: r.record_year,
    language: r.language,
    uploadedBy: r.uploaded_by,
    uploadedAt: r.uploaded_at,
    processingStatus: r.processing_status,
    linkedRecordId: r.linked_record_id,
  }));
}

export function saveDocumentToDb(doc: DocumentRecord): void {
  const stmt = db.prepare(`
    INSERT INTO document_records (
      id, original_filename, file_type, file_size, document_type,
      state, district, tehsil, village, record_year, language,
      uploaded_by, uploaded_at, processing_status, linked_record_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      original_filename=excluded.original_filename,
      processing_status=excluded.processing_status,
      linked_record_id=excluded.linked_record_id
  `);

  stmt.run(
    doc.id, doc.originalFileName, doc.fileType, doc.fileSize, doc.documentType,
    doc.state, doc.district, doc.tehsil, doc.village, doc.recordYear, doc.language,
    doc.uploadedBy, doc.uploadedAt, doc.processingStatus, doc.linkedRecordId || null
  );
}

export function getAllAuditLogsFromDb(): AuditLogEntry[] {
  const rows = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC').all() as any[];
  return rows.map(r => ({
    id: r.id,
    actor: r.actor,
    actorRole: r.actor_role,
    action: r.action,
    target: r.target,
    recordId: r.record_id || undefined,
    timestamp: r.timestamp,
    ipAddress: r.ip_address,
    status: r.status,
    previousValue: r.previous_value || undefined,
    newValue: r.new_value || undefined,
    details: r.details || undefined,
  }));
}

export function addAuditLogToDb(log: AuditLogEntry): void {
  const stmt = db.prepare(`
    INSERT INTO audit_logs (id, actor, actor_role, action, target, record_id, timestamp, ip_address, status, previous_value, new_value, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `);

  stmt.run(
    log.id, log.actor, log.actorRole, log.action, log.target, log.recordId || null,
    log.timestamp, log.ipAddress, log.status, log.previousValue || null, log.newValue || null, log.details || null
  );
}
