/**
 * API Service — single gateway for all frontend ↔ Express backend communication.
 *
 * Every call hits /api/* which Vite proxies to Express in dev,
 * and in production the same origin serves both.
 */

import type { LandRecord, AuditLogEntry, DocumentRecord } from '../types/landRecord';
import type { DocumentMetadata, OcrProcessingResult } from './ocrService';

const API = '/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body?.error || `API ${res.status}`);
  }
  return res.json();
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Land Records ─────────────────────────────────────────────────────────────

export async function fetchRecords(filters?: {
  status?: string;
  district?: string;
  village?: string;
}): Promise<LandRecord[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.district) params.set('district', filters.district);
  if (filters?.village) params.set('village', filters.village);
  const qs = params.toString();
  const data = await json<{ records: LandRecord[] }>(
    await fetch(`${API}/records${qs ? `?${qs}` : ''}`)
  );
  return data.records;
}

export async function fetchRecordById(id: string): Promise<LandRecord> {
  const data = await json<{ record: LandRecord }>(
    await fetch(`${API}/records/${id}`)
  );
  return data.record;
}

export async function saveRecord(record: LandRecord): Promise<void> {
  await json(
    await fetch(`${API}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    })
  );
}

export async function approveRecord(
  recordId: string,
  officerName: string,
  officerRole: string,
  remarks?: string
): Promise<LandRecord> {
  const data = await json<{ record: LandRecord }>(
    await fetch(`${API}/records/${recordId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerName, officerRole, remarks }),
    })
  );
  return data.record;
}

export async function rejectRecord(
  recordId: string,
  officerName: string,
  officerRole: string,
  reason?: string
): Promise<LandRecord> {
  const data = await json<{ record: LandRecord }>(
    await fetch(`${API}/records/${recordId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerName, officerRole, reason }),
    })
  );
  return data.record;
}

// ─── Document Upload + OCR ────────────────────────────────────────────────────

export async function uploadAndProcess(
  file: File,
  metadata: DocumentMetadata,
  officerName: string,
  officerRole: string
): Promise<{ record: LandRecord; ocrResult: OcrProcessingResult }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));
  formData.append('officerName', officerName);
  formData.append('officerRole', officerRole);

  const data = await json<{ record: LandRecord; ocrResult: OcrProcessingResult }>(
    await fetch(`${API}/ocr/process`, {
      method: 'POST',
      body: formData,
    })
  );
  return data;
}

// ─── Documents ────────────────────────────────────────────────────────────────

export async function fetchDocuments(): Promise<DocumentRecord[]> {
  const data = await json<{ documents: DocumentRecord[] }>(
    await fetch(`${API}/documents`)
  );
  return data.documents;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const data = await json<{ auditLogs: AuditLogEntry[] }>(
    await fetch(`${API}/audit-logs`)
  );
  return data.auditLogs;
}
