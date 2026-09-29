export type RecordStatus = 
  | 'VERIFIED'
  | 'PENDING_VERIFICATION'
  | 'LOW_CONFIDENCE'
  | 'DUPLICATE'
  | 'PROCESSING'
  | 'REJECTED'
  | 'ANOMALY_DETECTED';

export type ValidationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ValidationResultStatus = 'PASS' | 'FAIL' | 'WARNING';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedField {
  fieldName: string;
  fieldLabel: string;
  value: string;
  confidence: number; // 0–100 overall field confidence
  extractionConfidence?: number; // field pattern / extraction score
  isEdited?: boolean;
  isApproved?: boolean;
  isRejected?: boolean;
  originalValue?: string; // native extracted script value
  transliteratedValue?: string; // optional English transliteration
  isRtl?: boolean; // true for Urdu / Arabic text
  language?: 'HINDI' | 'ENGLISH' | 'URDU' | 'BENGALI' | 'ASSAMESE' | 'MARATHI' | string;
  validationStatus?: 'VALID' | 'WARNING' | 'ANOMALY' | 'UNRESOLVED';
  evidence?: {
    pageNumber?: number;
    text?: string;
    boundingBox?: BoundingBox;
  };
}


export interface ValidationResult {
  ruleId: string;
  ruleName: string;
  status: ValidationResultStatus;
  severity: ValidationSeverity;
  description: string;
  suggestedAction: string;
  fieldName?: string;
}

export interface MutationRecord {
  id: string;
  year: string;
  date: string;
  event: string;
  ownerName: string;
  mutationNo?: string;
  remarks?: string;
  officerName?: string;
}

export interface DuplicateMatch {
  matchedRecordId: string;
  similarity: number; // 0–100
  matchedFields: string[];
  matchedOwner: string;
  matchedKhasra: string;
  matchedVillage: string;
}

export interface AnomalyFlag {
  type: string;
  description: string;
  confidence: number;
}

export interface LandRecord {
  id: string;
  khasraNo: string;
  surveyNo?: string;
  khewatNo: string;
  khataNo?: string;
  plotNo?: string;
  ownerName: string;
  coOwnerName?: string;
  previousOwner?: string;
  villageMauza: string;
  tehsil: string;
  district: string;
  state: string;
  areaAcres: number;
  areaUnit?: 'Acres' | 'Bigha' | 'Hectare' | 'Guntha';
  landCategory: 'Agricultural' | 'Residential' | 'Commercial' | 'Forest' | 'Government' | 'Wasteland';
  landUse?: string;
  status: RecordStatus;
  ocrConfidence: number;
  uploadedBy: string;
  uploadedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationRemarks?: string;
  documentUrl?: string;
  documentLanguage?: 'HINDI' | 'ENGLISH' | 'BENGALI' | 'ODIA' | 'URDU' | 'MARATHI' | 'PUNJABI' | 'GUJARATI' | 'TAMIL' | 'TELUGU' | 'KANNADA' | 'MALAYALAM' | 'ASSAMESE' | string;
  flagReason?: string;
  mutationNo?: string;
  mutationDate?: string;
  registrationNo?: string;
  documentDate?: string;
  recordYear?: string;
  riskScore?: number; // 0–100 anomaly risk
  anomalyFlags?: AnomalyFlag[];
  duplicateMatch?: DuplicateMatch;
  extractedFields?: ExtractedField[];
  validationResults?: ValidationResult[];
  mutations?: MutationRecord[];
  associatedUserId?: string;
  rawOcrText?: string;
  ocrBlocks?: {
    pageNumber: number;
    text: string;
    confidence: number;
    boundingBox?: BoundingBox;
  }[];
}

export interface DashboardStats {
  totalDocuments: number;
  processedDocuments: number;
  verifiedRecords: number;
  pendingVerification: number;
  lowConfidenceRecords: number;
  duplicateRecords: number;
  rejectedRecords?: number;
  anomalyRecords?: number;
  avgConfidence?: number;
}

export interface ActivityLog {
  id: string;
  type: 'process' | 'verify' | 'flag' | 'duplicate' | 'user' | 'system' | 'upload' | 'approve' | 'reject' | 'edit';
  message: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
  user?: string;
  recordId?: string;
}

export interface SystemServiceStatus {
  name: string;
  status: 'Online' | 'Degraded' | 'Offline';
  latency: string;
  uptime: string;
  lastCheck: string;
}

export interface Notification {
  id: string;
  type: 'verification' | 'duplicate' | 'processing' | 'system' | 'anomaly';
  message: string;
  timestamp: string;
  isRead: boolean;
  severity: 'info' | 'warning' | 'danger' | 'success';
  recordId?: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  recordId?: string;
  timestamp: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FLAGGED' | 'FAILED';
  previousValue?: string;
  newValue?: string;
  details?: string;
}

export interface DocumentRecord {
  id: string;
  originalFileName: string;
  fileType: 'PDF' | 'JPG' | 'PNG' | 'TIFF';
  fileSize: string;
  documentType: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  recordYear: string;
  language: string;
  uploadedBy: string;
  uploadedAt: string;
  processingStatus: 'UPLOADED' | 'PROCESSING' | 'EXTRACTED' | 'FAILED';
  linkedRecordId?: string;
}
