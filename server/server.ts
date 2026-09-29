import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  initDatabase,
  getAllRecordsFromDb,
  getRecordByIdFromDb,
  saveRecordToDb,
  getAllDocumentsFromDb,
  saveDocumentToDb,
  getAllAuditLogsFromDb,
  addAuditLogToDb
} from './db';
import type { LandRecord, AuditLogEntry, DocumentRecord } from '../src/types/landRecord';
import { OcrService, type DocumentMetadata } from '../src/services/ocrService';
import { ValidationEngine } from '../src/services/validationEngine';
import { RoutingEngine } from '../src/services/routingEngine';
import {
  loadBhashiniCredentials,
  performBhashiniOcr,
  toBhashiniLangCode,
  BhashiniApiError,
  type BhashiniCredentials,
} from './bhashiniService';
import Tesseract from 'tesseract.js';
const recognize = Tesseract.recognize || (Tesseract as any).default?.recognize;

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Multer storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// Initialize SQLite Database
initDatabase();

// ─── BHASHINI Credential Validation ─────────────────────────────────────────
const bhashiniCredentials: BhashiniCredentials | null = loadBhashiniCredentials();
if (bhashiniCredentials) {
  console.log('[BHASHINI] ✅ API credentials loaded successfully. BHASHINI OCR is ACTIVE.');
} else {
  console.warn('[BHASHINI] ⚠️  No valid credentials found. Falling back to Tesseract.js OCR.');
  console.warn('[BHASHINI]    Copy .env.example → .env and fill in your BHASHINI API keys.');
}

// ─── API ROUTES ─────────────────────────────────────────────────────────────

// 1. Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'BhoomiTrace Land Records Express Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 2. GET all land records
app.get('/api/records', (req, res) => {
  try {
    let records = getAllRecordsFromDb();
    const { status, district, village } = req.query;

    if (status) {
      records = records.filter(r => r.status === status);
    }
    if (district) {
      records = records.filter(r => r.district.toLowerCase().includes((district as string).toLowerCase()));
    }
    if (village) {
      records = records.filter(r => r.villageMauza.toLowerCase().includes((village as string).toLowerCase()));
    }

    res.json({ success: true, count: records.length, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Database fetch error' });
  }
});

// 3. GET single land record by ID
app.get('/api/records/:id', (req, res) => {
  try {
    const record = getRecordByIdFromDb(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: `Record #${req.params.id} not found` });
    }
    res.json({ success: true, record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 4. POST create or update land record
app.post('/api/records', (req, res) => {
  try {
    const record: LandRecord = req.body;
    if (!record.id || !record.khasraNo || !record.ownerName) {
      return res.status(400).json({ success: false, error: 'Missing mandatory land record parameters.' });
    }
    saveRecordToDb(record);
    res.json({ success: true, message: 'Land record saved successfully', record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 5. POST approve land record
app.post('/api/records/:id/approve', (req, res) => {
  try {
    const { officerName, officerRole, remarks } = req.body;
    if (officerRole === 'PUBLIC_USER') {
      return res.status(403).json({ success: false, error: 'Unauthorized: Public users cannot approve land records.' });
    }

    const record = getRecordByIdFromDb(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: `Record #${req.params.id} not found` });
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedRecord: LandRecord = {
      ...record,
      status: 'VERIFIED',
      verifiedBy: officerName || 'Land Record Officer',
      verifiedAt: timestamp,
      verificationRemarks: remarks || `Approved and verified by Officer ${officerName || 'Land Record Officer'}.`
    };

    saveRecordToDb(updatedRecord);

    const auditLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      actor: officerName || 'Land Record Officer',
      actorRole: officerRole || 'LAND_RECORD_OFFICER',
      action: 'LAND_RECORD_APPROVED',
      target: `Record #${record.id} (Khasra ${record.khasraNo})`,
      recordId: record.id,
      timestamp,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      previousValue: record.status,
      newValue: 'VERIFIED',
      details: remarks || 'Approved by officer via Express REST API.'
    };
    addAuditLogToDb(auditLog);

    res.json({ success: true, message: 'Land record verified & published', record: updatedRecord });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 6. POST reject land record
app.post('/api/records/:id/reject', (req, res) => {
  try {
    const { officerName, officerRole, reason } = req.body;
    if (officerRole === 'PUBLIC_USER') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const record = getRecordByIdFromDb(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: `Record #${req.params.id} not found` });
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedRecord: LandRecord = {
      ...record,
      status: 'REJECTED',
      verificationRemarks: reason || 'Rejected during officer review.',
      flagReason: reason || 'Rejected'
    };

    saveRecordToDb(updatedRecord);

    const auditLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      actor: officerName || 'Land Record Officer',
      actorRole: officerRole || 'LAND_RECORD_OFFICER',
      action: 'LAND_RECORD_REJECTED',
      target: `Record #${record.id}`,
      recordId: record.id,
      timestamp,
      ipAddress: req.ip || '127.0.0.1',
      status: 'FLAGGED',
      previousValue: record.status,
      newValue: 'REJECTED',
      details: reason
    };
    addAuditLogToDb(auditLog);

    res.json({ success: true, message: 'Land record rejected', record: updatedRecord });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 7. GET document records
app.get('/api/documents', (_req, res) => {
  try {
    const docs = getAllDocumentsFromDb();
    res.json({ success: true, count: docs.length, documents: docs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 8. GET audit logs
app.get('/api/audit-logs', (_req, res) => {
  try {
    const logs = getAllAuditLogsFromDb();
    res.json({ success: true, count: logs.length, auditLogs: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 9. POST document upload & OCR processing endpoint
app.post('/api/ocr/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    // Validate file type
    const supportedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/tiff'];
    const isSupportedType = supportedMimes.includes(req.file.mimetype) ||
      /\.(pdf|jpg|jpeg|png|tiff)$/i.test(req.file.originalname);
    if (!isSupportedType) {
      return res.status(400).json({
        success: false,
        error: `Unsupported file type: "${req.file.mimetype}". Please upload PDF, JPG, PNG, or TIFF documents only.`
      });
    }

    const metadata: DocumentMetadata = req.body.metadata ? JSON.parse(req.body.metadata) : {
      state: '',
      district: '',
      tehsil: '',
      village: '',
      recordYear: '',
      language: 'AUTO',
      docType: 'Jamabandi (Record of Rights)'
    };

    const officerName = req.body.officerName || 'Land Record Officer';
    const officerRole = req.body.officerRole || 'LAND_RECORD_OFFICER';

    const fileBuffer = fs.readFileSync(req.file.path);
    const fileUrl = `/uploads/${req.file.filename}`;

    // ─── OCR Engine Selection: BHASHINI (primary) → Tesseract (fallback) ───
    // Determine multilingual OCR language hint
    let langHint = 'urd+hin+ben+asm+mar+eng';
    if (metadata.language && metadata.language !== 'AUTO') {
      const codeMap: Record<string, string> = {
        BENGALI: 'ben+eng',
        HINDI: 'hin+eng',
        ENGLISH: 'eng',
        URDU: 'urd+eng',
        TAMIL: 'tam+eng',
        TELUGU: 'tel+eng',
        MARATHI: 'mar+eng',
        GUJARATI: 'guj+eng',
        PUNJABI: 'pan+eng',
        KANNADA: 'kan+eng',
        MALAYALAM: 'mal+eng',
        ODIA: 'ori+eng',
        ASSAMESE: 'asm+eng'
      };
      langHint = codeMap[metadata.language.toUpperCase()] || 'urd+hin+ben+asm+mar+eng';
    }

    console.log(`\n================= [MULTILINGUAL OCR PIPELINE] =================`);
    console.log(`[Upload Request] Filename: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`);
    console.log(`[Upload Request] Language Hint: ${metadata.language || 'AUTO'} (Tesseract: ${langHint})`);

    // ─── OCR Engine Selection: BHASHINI (primary) → Advanced Python EasyOCR → Tesseract (fallback) ───
    let ocrResult: any;
    let ocrEngineUsed = 'BhumiTrace Advanced EasyOCR Pipeline';
    let rawOcrTextExtracted = '';

    if (bhashiniCredentials) {
      // ── PRIMARY: BHASHINI Udyat OCR ──
      try {
        console.log(`[BHASHINI OCR] Sending request to BHASHINI API...`);
        const base64Image = fileBuffer.toString('base64');
        const sourceLanguage = toBhashiniLangCode(metadata.language);
        console.log(`[BHASHINI OCR] Language code sent to Bhashini: "${sourceLanguage}"`);

        const bhashiniResult = await performBhashiniOcr(
          bhashiniCredentials,
          base64Image,
          sourceLanguage
        );

        rawOcrTextExtracted = bhashiniResult.extractedText;
        console.log(`[BHASHINI OCR] ✅ Bhashini Text Extracted (${rawOcrTextExtracted.length} chars, serviceId: ${bhashiniResult.serviceId})`);

        const mimeForDataUrl = req.file.mimetype || 'image/jpeg';
        const dataUrl = `data:${mimeForDataUrl};base64,${base64Image}`;

        ocrResult = OcrService.processDocumentWithBhashini(
          {
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            sizeBytes: req.file.size,
            dataUrl,
          },
          metadata,
          rawOcrTextExtracted,
          bhashiniResult.serviceId
        );

        ocrEngineUsed = `BHASHINI Udyat (Service: ${bhashiniResult.serviceId})`;
      } catch (bhashiniErr: any) {
        const isBhashiniApiError = bhashiniErr instanceof BhashiniApiError;
        console.error(
          `[BHASHINI OCR] ❌ ${isBhashiniApiError ? 'API Error' : 'Error'}:`,
          bhashiniErr?.message || bhashiniErr
        );

        if (isBhashiniApiError && (bhashiniErr.httpStatus === 401 || bhashiniErr.httpStatus === 403 || bhashiniErr.httpStatus === 429)) {
          return res.status(bhashiniErr.httpStatus).json({
            success: false,
            error: bhashiniErr.message,
          });
        }
      }
    }

    if (!ocrResult) {
      // ── HIGH PERFORMANCE: Advanced Python Multilingual & Urdu EasyOCR Engine ──
      try {
        const pythonLang = metadata.language ? metadata.language.toLowerCase() : 'ur';
        console.log(`[Python OCR Pipeline] Running advanced EasyOCR + Nastaliq extraction (lang: ${pythonLang})...`);
        const pyBin = fs.existsSync(path.join(process.cwd(), '.venv', 'bin', 'python3'))
          ? path.join(process.cwd(), '.venv', 'bin', 'python3')
          : 'python3';
        const scriptPath = path.join(process.cwd(), 'server', 'ocr_engine.py');

        const { execFile } = await import('child_process');
        const { promisify } = await import('util');
        const execFileAsync = promisify(execFile);

        const { stdout } = await execFileAsync(pyBin, [scriptPath, req.file.path, pythonLang], {
          maxBuffer: 25 * 1024 * 1024
        });

        const pyResult = JSON.parse(stdout);
        if (pyResult.error) {
          throw new Error(pyResult.error);
        }

        rawOcrTextExtracted = pyResult.rawExtractedText || '';
        const mimeForDataUrl = req.file.mimetype || 'image/jpeg';
        const dataUrl = `data:${mimeForDataUrl};base64,${fileBuffer.toString('base64')}`;

        const fileHash = Math.abs(
          Array.from(`${req.file.originalname}_${req.file.size}_${Date.now()}`).reduce(
            (h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0,
            0
          )
        );
        const documentId = `DOC-${new Date().getFullYear()}-${(fileHash % 90000) + 10000}`;
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

        ocrResult = {
          documentId,
          originalFileName: req.file.originalname,
          fileType: req.file.mimetype || 'image/jpeg',
          fileSize: `${(req.file.size / 1024).toFixed(1)} KB`,
          fileDataUrl: dataUrl,
          uploadTimestamp: timestamp,
          detectedLanguages: pyResult.detectedLanguages || ['Urdu (Arabic script)', 'English (Latin)'],
          languageConfidence: pyResult.languageConfidence || 98,
          isLanguageUncertain: false,
          preprocessingMetrics: pyResult.preprocessingMetrics,
          extractedFields: pyResult.extractedFields,
          textBlocks: pyResult.textBlocks,
          overallOcrConfidence: pyResult.overallOcrConfidence,
          ocrCharConfidence: pyResult.ocrCharConfidence,
          fieldCompletenessCount: pyResult.extractedFields.filter((f: any) => f.value && f.value.length > 0).length,
          totalMandatoryFields: 17,
          engineName: pyResult.engineName || 'BhumiTrace Advanced Multilingual EasyOCR Pipeline',
          isDemoFallback: false,
          rawExtractedText: rawOcrTextExtracted,
        };

        ocrEngineUsed = pyResult.engineName || 'BhumiTrace Advanced Multilingual EasyOCR Pipeline';
        console.log(`[Python OCR Pipeline] ✅ Extraction successful (${ocrResult.extractedFields.filter((f: any) => f.value).length} fields, Confidence: ${ocrResult.overallOcrConfidence}%)`);
      } catch (pyErr: any) {
        console.warn('[Python OCR Pipeline] Python engine error, falling back to Tesseract.js:', pyErr?.message || pyErr);
        
        // ── FALLBACK: Tesseract.js ──
        console.log(`[Tesseract OCR] Running multi-script OCR with models: "${langHint}"`);
        const tesseractResult = await recognize(req.file.path, langHint, { logger: () => {} });
        rawOcrTextExtracted = tesseractResult?.data?.text || '';

        if (!rawOcrTextExtracted || rawOcrTextExtracted.trim().length === 0) {
          throw new Error('OCR Failure: No readable text could be identified in the uploaded document. Please upload a clear document image.');
        }

        const fallbackDataUrl = `data:${req.file.mimetype || 'image/jpeg'};base64,${fileBuffer.toString('base64')}`;
        ocrResult = OcrService.processDocumentWithBhashini(
          {
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            sizeBytes: req.file.size,
            dataUrl: fallbackDataUrl,
          },
          metadata,
          rawOcrTextExtracted,
          'tesseract-local'
        );
        ocrResult.engineName = `Tesseract.js OCR Engine (${langHint})`;
        ocrEngineUsed = `Tesseract.js (${langHint})`;
      }
    }

    // Explicit Multilingual Debugging Logging per Requirement 5
    console.log(`---------------------------------------------------------------`);
    console.log(`Detected Script:      ${ocrResult.detectedLanguages[0] || 'Unknown'}`);
    console.log(`Detected Language:    ${ocrResult.detectedLanguages.join(', ')}`);
    console.log(`Language Code:        ${toBhashiniLangCode(metadata.language)}`);
    console.log(`OCR Provider:         ${ocrEngineUsed.includes('BHASHINI') ? 'BHASHINI' : 'Tesseract.js'}`);
    console.log(`OCR Model/Pipeline:   ${ocrEngineUsed}`);
    console.log(`Raw OCR Text:\n${rawOcrTextExtracted.substring(0, 300)}${rawOcrTextExtracted.length > 300 ? '...' : ''}`);
    console.log(`OCR Confidence:       ${ocrResult.overallOcrConfidence}%`);
    console.log(`Extracted Fields:\n`, JSON.stringify(ocrResult.extractedFields.filter(f => f.value && f.value.length > 0).map(f => ({
      fieldName: f.fieldName,
      fieldLabel: f.fieldLabel,
      value: f.value,
      confidence: `${f.confidence}%`
    })), null, 2));
    console.log(`---------------------------------------------------------------`);

    // 2. Validation & Anomaly Engine
    const existingRecords = getAllRecordsFromDb();
    const validationOutput = ValidationEngine.validate(ocrResult, existingRecords);

    // 3. Routing Engine
    const { record: newRecord } = RoutingEngine.routeDocument(
      ocrResult,
      validationOutput,
      officerName
    );

    // Serve uploaded file path
    newRecord.documentUrl = fileUrl;

    console.log(`[OCR Pipeline] 8. Final Structured Land Record:`, {
      id: newRecord.id,
      ownerName: newRecord.ownerName,
      khasraNo: newRecord.khasraNo,
      khataNo: newRecord.khataNo,
      villageMauza: newRecord.villageMauza,
      tehsil: newRecord.tehsil,
      district: newRecord.district,
      state: newRecord.state,
      areaAcres: newRecord.areaAcres,
      areaUnit: newRecord.areaUnit,
      landCategory: newRecord.landCategory,
      status: newRecord.status
    });
    console.log(`===============================================================\n`);

    // 4. Save to SQLite database
    saveRecordToDb(newRecord);

    const docRec: DocumentRecord = {
      id: ocrResult.documentId,
      originalFileName: req.file.originalname,
      fileType: req.file.mimetype.includes('pdf') ? 'PDF' : 'JPG',
      fileSize: `${(req.file.size / 1024).toFixed(1)} KB`,
      documentType: metadata.docType || 'Jamabandi (Record of Rights)',
      state: newRecord.state || metadata.state || '',
      district: newRecord.district || metadata.district || '',
      tehsil: newRecord.tehsil || metadata.tehsil || '',
      village: newRecord.villageMauza || metadata.village || '',
      recordYear: newRecord.recordYear || metadata.recordYear || '',
      language: ocrResult.detectedLanguages.join(', '),
      uploadedBy: officerName,
      uploadedAt: ocrResult.uploadTimestamp,
      processingStatus: 'EXTRACTED',
      linkedRecordId: newRecord.id
    };
    saveDocumentToDb(docRec);

    // Insert Audit Log
    const locationSummary = [metadata.village || newRecord.villageMauza, metadata.district || newRecord.district, metadata.state || newRecord.state].filter(Boolean).join(', ');
    const auditLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      actor: officerName,
      actorRole: officerRole,
      action: 'DOCUMENT_UPLOADED',
      target: `File: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`,
      recordId: newRecord.id,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      newValue: newRecord.status,
      details: `OCR Engine: ${ocrEngineUsed}${locationSummary ? ` | Location: ${locationSummary}` : ''}`
    };
    addAuditLogToDb(auditLog);

    res.json({
      success: true,
      record: newRecord,
      ocrResult,
      fileUrl
    });
  } catch (err: any) {
    console.error('Express OCR Upload Endpoint Error:', err);

    // Differentiate error types for appropriate HTTP status codes
    if (err instanceof BhashiniApiError) {
      const statusCode = err.httpStatus >= 400 ? err.httpStatus : 502;
      return res.status(statusCode).json({ success: false, error: err.message });
    }

    res.status(500).json({ success: false, error: err?.message || 'Failed to process document upload' });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 BhoomiTrace Express Backend Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
