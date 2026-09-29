import type { User } from '../types/auth';
import type {
  LandRecord,
  DashboardStats,
  ActivityLog,
  SystemServiceStatus,
  Notification,
  AuditLogEntry,
  ExtractedField,
  ValidationResult,
  MutationRecord,
} from '../types/landRecord';

// ─── MOCK USERS ────────────────────────────────────────────────────────────────
export const MOCK_USERS: Record<string, User> = {
  ADMIN: {
    id: 'USR-001',
    name: 'Rajesh V. Sharma',
    email: 'admin@dolr.gov.in',
    username: 'admin',
    role: 'ADMIN',
    department: 'Department of Land Resources (DoLR)',
    stateOffice: 'New Delhi HQ',
    district: 'Central HQ',
    lastLogin: '2026-09-06 15:30:00',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  LAND_RECORD_OFFICER: {
    id: 'USR-002',
    name: 'Priya S. Verma',
    email: 'officer@dolr.gov.in',
    username: 'lrofficer',
    role: 'LAND_RECORD_OFFICER',
    department: 'Tehsil Land Revenue Office',
    stateOffice: 'Rajasthan State Division',
    district: 'Jaipur Rural',
    lastLogin: '2026-09-06 14:15:00',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  PUBLIC_USER: {
    id: 'USR-004',
    name: 'Suresh Kumar',
    email: 'citizen@gmail.com',
    username: 'citizen',
    role: 'PUBLIC_USER',
    department: 'Public Citizen Portal',
    stateOffice: 'Bihar State Division',
    district: 'Patna',
    lastLogin: '2026-09-06 11:10:00',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
};

// ─── DASHBOARD STATS ───────────────────────────────────────────────────────────
export const INITIAL_STATS: DashboardStats = {
  totalDocuments: 148250,
  processedDocuments: 132910,
  verifiedRecords: 118400,
  pendingVerification: 14510,
  lowConfidenceRecords: 842,
  duplicateRecords: 318,
  rejectedRecords: 204,
  anomalyRecords: 97,
  avgConfidence: 91.4,
};

// ─── EXTRACTED FIELDS (for demo record LR-1026) ───────────────────────────────
export const MOCK_EXTRACTED_FIELDS_LR1026: ExtractedField[] = [
  { fieldName: 'ownerName',      fieldLabel: 'Owner Name',       value: 'Mahesh Singh & Bros',   confidence: 88, language: 'HINDI'   },
  { fieldName: 'coOwnerName',    fieldLabel: 'Co-owner Name',    value: 'Suresh Singh',          confidence: 74, language: 'HINDI'   },
  { fieldName: 'khasraNo',       fieldLabel: 'Khasra Number',    value: '77/3',                  confidence: 96, language: 'HINDI'   },
  { fieldName: 'khewatNo',       fieldLabel: 'Khewat Number',    value: '29',                    confidence: 95, language: 'HINDI'   },
  { fieldName: 'khataNo',        fieldLabel: 'Khata Number',     value: '141',                   confidence: 82, language: 'HINDI'   },
  { fieldName: 'areaAcres',      fieldLabel: 'Area',             value: '7.80 Acres',            confidence: 91, language: 'HINDI'   },
  { fieldName: 'villageMauza',   fieldLabel: 'Village / Mauza', value: 'Phagi Central',         confidence: 97, language: 'HINDI'   },
  { fieldName: 'tehsil',         fieldLabel: 'Tehsil',           value: 'Phagi',                 confidence: 97, language: 'HINDI'   },
  { fieldName: 'district',       fieldLabel: 'District',         value: 'Jaipur Rural',          confidence: 99, language: 'ENGLISH' },
  { fieldName: 'state',          fieldLabel: 'State',            value: 'Rajasthan',             confidence: 99, language: 'ENGLISH' },
  { fieldName: 'landCategory',   fieldLabel: 'Land Type',        value: 'Agricultural',          confidence: 93, language: 'HINDI'   },
  { fieldName: 'mutationNo',     fieldLabel: 'Mutation Number',  value: '8?14',                  confidence: 61, language: 'HINDI'   },
  { fieldName: 'mutationDate',   fieldLabel: 'Mutation Date',    value: '14/03/2022',            confidence: 78, language: 'HINDI'   },
  { fieldName: 'documentDate',   fieldLabel: 'Document Date',    value: '01/04/2022',            confidence: 83, language: 'HINDI'   },
];

// ─── VALIDATION RESULTS ────────────────────────────────────────────────────────
export const MOCK_VALIDATION_LR1026: ValidationResult[] = [
  { ruleId: 'R01', ruleName: 'Owner Name Present',     status: 'PASS',    severity: 'HIGH',     description: 'Owner name "Mahesh Singh & Bros" extracted successfully.',           suggestedAction: 'No action required.' },
  { ruleId: 'R02', ruleName: 'Khasra Number Format',   status: 'PASS',    severity: 'HIGH',     description: 'Khasra 77/3 matches valid number format.',                          suggestedAction: 'No action required.' },
  { ruleId: 'R03', ruleName: 'Area Consistency',       status: 'WARNING', severity: 'MEDIUM',   description: 'Area 7.80 acres is unusually large for residential zone mapping.',   suggestedAction: 'Cross-verify with tehsil land-use records.' },
  { ruleId: 'R04', ruleName: 'Village-Tehsil Match',   status: 'PASS',    severity: 'HIGH',     description: 'Phagi Central village is correctly mapped to Phagi Tehsil.',         suggestedAction: 'No action required.' },
  { ruleId: 'R05', ruleName: 'Mutation Number Valid',  status: 'FAIL',    severity: 'HIGH',     description: 'Mutation number "8?14" contains unrecognized character "?". Possible OCR misread of digit.',  suggestedAction: 'Manually verify mutation register for Phagi tehsil.' },
  { ruleId: 'R06', ruleName: 'Duplicate Check',        status: 'PASS',    severity: 'CRITICAL', description: 'No duplicate record found in central registry for Khasra 77/3, Phagi.', suggestedAction: 'No action required.' },
  { ruleId: 'R07', ruleName: 'Document Date Valid',    status: 'PASS',    severity: 'MEDIUM',   description: 'Document date 01/04/2022 is valid and within acceptable range.',      suggestedAction: 'No action required.' },
  { ruleId: 'R08', ruleName: 'Tehsildar Signature',    status: 'FAIL',    severity: 'CRITICAL', description: 'Tehsildar signature is partially obscured by moisture stain. Cannot confirm authenticity.',  suggestedAction: 'Request clean certified copy from tehsil office.' },
];

// ─── MUTATION HISTORY ─────────────────────────────────────────────────────────
export const MOCK_MUTATIONS_LR1024: MutationRecord[] = [
  { id: 'MUT-001', year: '2011', date: '12/03/2011', event: 'Original Registration',         ownerName: 'Ram Chand Sharma',      mutationNo: 'MTN-2011-0044', officerName: 'Tehsildar Ganesh Rao',   remarks: 'Initial land grant from revenue survey.' },
  { id: 'MUT-002', year: '2016', date: '08/07/2016', event: 'Partition Deed',               ownerName: 'Ram Chand & Sons',      mutationNo: 'MTN-2016-0218', officerName: 'Tehsildar K. Meena',    remarks: 'Partition among 2 legal heirs.' },
  { id: 'MUT-003', year: '2019', date: '22/11/2019', event: 'Mortgage Release',             ownerName: 'Ramesh Chand Sharma',   mutationNo: 'MTN-2019-0892', officerName: 'Tehsildar P. Gupta',    remarks: 'Bank mortgage cleared, title restored to owner.' },
  { id: 'MUT-004', year: '2023', date: '15/01/2023', event: 'Ownership Confirmed',          ownerName: 'Ramesh Chand Sharma',   mutationNo: 'MTN-2023-0014', officerName: 'Amitabh R. Roy',        remarks: 'Verified and digitized per DoLR land records digitization mandate.' },

];

// ─── LAND RECORDS (25+ records) ────────────────────────────────────────────────
export const MOCK_LAND_RECORDS: LandRecord[] = [
  // ── Rajasthan ──────────────────────────────────────────────────────────────
  {
    id: 'LR-1024', khasraNo: '452/1', surveyNo: 'S-884', khewatNo: '88', khataNo: '44', plotNo: 'P-12A',
    ownerName: 'Ramesh Chand Sharma', coOwnerName: 'Seema Sharma', previousOwner: 'Ram Chand Sharma',
    villageMauza: 'Rampur', tehsil: 'Sanganer', district: 'Jaipur Rural', state: 'Rajasthan',
    areaAcres: 3.45, areaUnit: 'Acres', landCategory: 'Agricultural', landUse: 'Crop Cultivation',
    status: 'VERIFIED', ocrConfidence: 98.4, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-01 10:30', verifiedBy: 'Amitabh R. Roy', verifiedAt: '2026-09-02 11:15',
    mutationNo: 'MTN-2023-0014', mutationDate: '15/01/2023', registrationNo: 'REG-RAJ-2023-5512',
    documentDate: '10/01/2023', recordYear: '2023', verificationRemarks: 'All fields verified. Document clear.',
    mutations: MOCK_MUTATIONS_LR1024,
    extractedFields: [
      { fieldName: 'ownerName', fieldLabel: 'Owner Name', value: 'Ramesh Chand Sharma', confidence: 98, language: 'HINDI' },
      { fieldName: 'khasraNo',  fieldLabel: 'Khasra No',  value: '452/1',               confidence: 99, language: 'HINDI' },
      { fieldName: 'areaAcres', fieldLabel: 'Area',        value: '3.45 Acres',          confidence: 97, language: 'HINDI' },
      { fieldName: 'district',  fieldLabel: 'District',    value: 'Jaipur Rural',        confidence: 99, language: 'ENGLISH' },
    ],
  },
  {
    id: 'LR-1025', khasraNo: '109/B', surveyNo: 'S-421', khewatNo: '142', khataNo: '87',
    ownerName: 'Suresh Kumar', previousOwner: 'Kamal Devi',
    villageMauza: 'Kishanpura', tehsil: 'Chaksu', district: 'Jaipur Rural', state: 'Rajasthan',
    areaAcres: 1.20, areaUnit: 'Acres', landCategory: 'Residential', landUse: 'House Plot',
    status: 'VERIFIED', ocrConfidence: 91.2, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-05 14:20',
    recordYear: '2024',
    associatedUserId: 'USR-004',
  },
   
  {
    id: 'LR-1026', khasraNo: '77/3', surveyNo: 'S-295', khewatNo: '29', khataNo: '141',
    ownerName: 'Mahesh Singh & Bros', coOwnerName: 'Suresh Singh',
    villageMauza: 'Phagi Central', tehsil: 'Phagi', district: 'Jaipur Rural', state: 'Rajasthan',
    areaAcres: 7.80, areaUnit: 'Acres', landCategory: 'Agricultural', landUse: 'Orchard',
    status: 'LOW_CONFIDENCE', ocrConfidence: 64.5, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-06 09:10',
    mutationNo: '8?14', recordYear: '2022',
    flagReason: 'Tehsildar signature partially obscured by moisture stain. Mutation number "8?14" contains unrecognized character.',
    riskScore: 34,
    extractedFields: MOCK_EXTRACTED_FIELDS_LR1026,
    validationResults: MOCK_VALIDATION_LR1026,
    anomalyFlags: [
      { type: 'Signature Anomaly', description: 'Tehsildar seal partially obscured', confidence: 71 },
      { type: 'OCR Uncertainty', description: 'Mutation number character ambiguous', confidence: 82 },
    ],
  },
  {
    id: 'LR-1027', khasraNo: '452/1', khewatNo: '88-A', ownerName: 'Ramesh C. Sharma',
    villageMauza: 'Rampur', tehsil: 'Sanganer', district: 'Jaipur Rural', state: 'Rajasthan',
    areaAcres: 3.45, landCategory: 'Agricultural',
    status: 'DUPLICATE', ocrConfidence: 95.8, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-06 11:45',
    flagReason: 'Exact match found with verified record #LR-1024 (Khasra 452/1, Sanganer).',
    duplicateMatch: { matchedRecordId: 'LR-1024', similarity: 94, matchedFields: ['Khasra No', 'Village', 'Area', 'Owner Name'], matchedOwner: 'Ramesh Chand Sharma', matchedKhasra: '452/1', matchedVillage: 'Rampur' },
  },
  {
    id: 'LR-1028', khasraNo: '312/8', khewatNo: '201', ownerName: 'Govt of Rajasthan (Panchayat)',
    villageMauza: 'Bagru', tehsil: 'Sanganer', district: 'Jaipur Rural', state: 'Rajasthan',
    areaAcres: 14.50, areaUnit: 'Acres', landCategory: 'Government', landUse: 'Gram Sabha Land',
    status: 'VERIFIED', ocrConfidence: 99.1, documentLanguage: 'HINDI',
    uploadedBy: 'Rajesh V. Sharma', uploadedAt: '2026-08-28 16:00', verifiedBy: 'Amitabh R. Roy', verifiedAt: '2026-08-29 10:00',
    mutationNo: 'MTN-2024-0001', recordYear: '2024',
  },
  {
    id: 'LR-1030', khasraNo: '55/2A', khewatNo: '18', ownerName: 'Ghanshyam Lal Meena',
    villageMauza: 'Nangal Jaisa', tehsil: 'Amber', district: 'Jaipur Rural', state: 'Rajasthan',
    areaAcres: 2.10, areaUnit: 'Acres', landCategory: 'Agricultural', landUse: 'Irrigated Farmland',
    status: 'VERIFIED', ocrConfidence: 96.3, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-08-25 09:45', verifiedBy: 'Amitabh R. Roy', verifiedAt: '2026-08-26 11:00',
    riskScore: 8,
  },
  {
    id: 'LR-1031', khasraNo: '188/4', khewatNo: '76', ownerName: 'Bajrangi Lal Soni',
    villageMauza: 'Chaksu Khurd', tehsil: 'Chaksu', district: 'Jaipur Rural', state: 'Rajasthan',
    areaAcres: 0.85, areaUnit: 'Acres', landCategory: 'Residential',
    status: 'ANOMALY_DETECTED', ocrConfidence: 89.2, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-07 10:00',
    flagReason: 'Potential text overwriting detected near ownership clause. Inconsistent ink density.',
    riskScore: 78,
    anomalyFlags: [
      { type: 'Text Alteration Suspected', description: 'Ink density inconsistency near owner name field', confidence: 78 },
      { type: 'Format Inconsistency', description: 'Date format mismatch with standard Rajasthan RoR format', confidence: 62 },
    ],
  },

  // ── Bihar ─────────────────────────────────────────────────────────────────
  {
    id: 'LR-1029', khasraNo: '89/1', surveyNo: 'S-214', khewatNo: '54', khataNo: '33',
    ownerName: 'Harish Chandra', coOwnerName: 'Rekha Devi',
    villageMauza: 'Danapur', tehsil: 'Patna Sadar', district: 'Patna', state: 'Bihar',
    areaAcres: 2.15, areaUnit: 'Acres', landCategory: 'Commercial', landUse: 'Market Complex',
    status: 'PENDING_VERIFICATION', ocrConfidence: 88.7, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-06 12:00',
    recordYear: '2023',
  },
  {
    id: 'LR-1032', khasraNo: '14/5B', surveyNo: 'S-88', khewatNo: '112', khataNo: '66',
    ownerName: 'Ramavatar Prasad Yadav', previousOwner: 'Kailash Yadav',
    villageMauza: 'Fatuha Khas', tehsil: 'Fatuha', district: 'Patna', state: 'Bihar',
    areaAcres: 4.30, areaUnit: 'Bigha', landCategory: 'Agricultural', landUse: 'Rice Cultivation',
    status: 'VERIFIED', ocrConfidence: 97.5, documentLanguage: 'HINDI',
    uploadedBy: 'Rajesh V. Sharma', uploadedAt: '2026-09-03 08:30', verifiedBy: 'Amitabh R. Roy', verifiedAt: '2026-09-04 10:20',
    mutationNo: 'MTN-BIH-2022-411', mutationDate: '04/08/2022',
    recordYear: '2022',
  },
  {
    id: 'LR-1033', khasraNo: '203/7', khewatNo: '88', ownerName: 'Brijlal Mahto',
    villageMauza: 'Bakhtiyarpur', tehsil: 'Bakhtiyarpur', district: 'Patna', state: 'Bihar',
    areaAcres: 1.60, areaUnit: 'Bigha', landCategory: 'Agricultural',
    status: 'VERIFIED', ocrConfidence: 94.1, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-01 11:00', verifiedBy: 'Amitabh R. Roy', verifiedAt: '2026-09-02 14:00',
    recordYear: '2021',
  },
  {
    id: 'LR-1034', khasraNo: '52/9', khewatNo: '31', ownerName: 'Savitri Kumari',
    villageMauza: 'Bihta Bazar', tehsil: 'Bihta', district: 'Patna', state: 'Bihar',
    areaAcres: 0.95, areaUnit: 'Guntha', landCategory: 'Residential',
    status: 'LOW_CONFIDENCE', ocrConfidence: 68.3, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-07 14:30',
    flagReason: 'Handwritten Khatian number partially illegible. Area unit unclear (Guntha vs Decimal).',
    riskScore: 22,
  },
  {
    id: 'LR-1035', khasraNo: '376/2', khewatNo: '189', ownerName: 'Deepak Kumar Singh',
    villageMauza: 'Maner Khas', tehsil: 'Maner', district: 'Patna', state: 'Bihar',
    areaAcres: 3.80, areaUnit: 'Bigha', landCategory: 'Agricultural',
    status: 'ANOMALY_DETECTED', ocrConfidence: 83.4, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-07 09:15',
    flagReason: 'Suspicious ownership change detected. Previous owner appears overwritten.',
    riskScore: 82,
    anomalyFlags: [
      { type: 'Overwriting Detected', description: 'Previous owner name field shows signs of correction fluid and rewriting', confidence: 82 },
      { type: 'Unusual Ownership Change', description: 'Ownership transfer happened within 30 days without registry record', confidence: 71 },
    ],
  },

  // ── Uttar Pradesh ─────────────────────────────────────────────────────────
  {
    id: 'LR-1036', khasraNo: '678/1', surveyNo: 'S-2004', khewatNo: '340', khataNo: '199',
    ownerName: 'Rambhajan Chaudhary', coOwnerName: 'Sita Chaudhary',
    villageMauza: 'Sisendi Khas', tehsil: 'Lucknow East', district: 'Lucknow', state: 'Uttar Pradesh',
    areaAcres: 5.40, areaUnit: 'Bigha', landCategory: 'Agricultural', landUse: 'Wheat Cultivation',
    status: 'VERIFIED', ocrConfidence: 95.8, documentLanguage: 'HINDI',
    uploadedBy: 'Rajesh V. Sharma', uploadedAt: '2026-08-30 13:00', verifiedBy: 'Amitabh R. Roy', verifiedAt: '2026-09-01 10:30',
    mutationNo: 'MTN-UP-2023-1122', recordYear: '2023',
  },
  {
    id: 'LR-1037', khasraNo: '1204/3', khewatNo: '512', ownerName: 'Mohammad Salim Khan',
    villageMauza: 'Kakori Mauza', tehsil: 'Kakori', district: 'Lucknow', state: 'Uttar Pradesh',
    areaAcres: 2.70, areaUnit: 'Bigha', landCategory: 'Agricultural',
    status: 'PENDING_VERIFICATION', ocrConfidence: 90.4, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-05 16:45',
    recordYear: '2024',
  },
  {
    id: 'LR-1038', khasraNo: '89/4C', khewatNo: '67', ownerName: 'Veena Kumari Bajpai',
    villageMauza: 'Amausi', tehsil: 'Lucknow West', district: 'Lucknow', state: 'Uttar Pradesh',
    areaAcres: 0.60, areaUnit: 'Acres', landCategory: 'Residential',
    status: 'VERIFIED', ocrConfidence: 97.8, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-02 10:00', verifiedBy: 'Amitabh R. Roy', verifiedAt: '2026-09-03 09:45',
    mutationNo: 'MTN-UP-2024-0044',
  },
  {
    id: 'LR-1039', khasraNo: '447/2', khewatNo: '228', ownerName: 'Hari Narayan Tripathi',
    villageMauza: 'Sarojini Nagar', tehsil: 'Lucknow East', district: 'Lucknow', state: 'Uttar Pradesh',
    areaAcres: 3.10, areaUnit: 'Bigha', landCategory: 'Agricultural',
    status: 'DUPLICATE', ocrConfidence: 92.7, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-06 15:00',
    flagReason: '91% similarity match with Record #LR-1036 (Sisendi Khas, Lucknow East). Same owner initial, same area.',
    duplicateMatch: { matchedRecordId: 'LR-1036', similarity: 91, matchedFields: ['Owner Name', 'Area', 'Tehsil'], matchedOwner: 'Rambhajan Chaudhary', matchedKhasra: '678/1', matchedVillage: 'Sisendi Khas' },
  },
  {
    id: 'LR-1040', khasraNo: '1842/6', khewatNo: '901', ownerName: 'Smt. Parvati Rai',
    villageMauza: 'Jankipuram', tehsil: 'Lucknow North', district: 'Lucknow', state: 'Uttar Pradesh',
    areaAcres: 1.25, areaUnit: 'Acres', landCategory: 'Residential',
    status: 'VERIFIED', ocrConfidence: 99.0, documentLanguage: 'HINDI',
    uploadedBy: 'Rajesh V. Sharma', uploadedAt: '2026-08-25 08:00', verifiedBy: 'Amitabh R. Roy', verifiedAt: '2026-08-26 10:00',
  },
  {
    id: 'LR-1041', khasraNo: '334/1', khewatNo: '155', ownerName: 'Shambhu Nath Verma',
    villageMauza: 'Malihabad Khas', tehsil: 'Malihabad', district: 'Lucknow', state: 'Uttar Pradesh',
    areaAcres: 8.90, areaUnit: 'Bigha', landCategory: 'Agricultural', landUse: 'Mango Orchard',
    status: 'VERIFIED', ocrConfidence: 93.5, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-08-28 14:00', verifiedBy: 'Amitabh R. Roy', verifiedAt: '2026-08-29 16:00',
  },

  // ── West Bengal ───────────────────────────────────────────────────────────
  {
    id: 'LR-1042', khasraNo: '824/3', surveyNo: 'S-1188', khewatNo: '411', khataNo: '290',
    ownerName: 'Subhash Chandra Mondal', coOwnerName: 'Mita Mondal',
    villageMauza: 'Bhangar Rajarhat', tehsil: 'Baruipur', district: 'South 24 Parganas', state: 'West Bengal',
    areaAcres: 1.80, areaUnit: 'Bigha', landCategory: 'Agricultural', landUse: 'Fish Pond',
    status: 'PENDING_VERIFICATION', ocrConfidence: 86.2, documentLanguage: 'BENGALI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-04 11:30',
    recordYear: '2023',
  },
  {
    id: 'LR-1043', khasraNo: '1122/A', khewatNo: '882', ownerName: 'Tapan Kumar Das',
    villageMauza: 'Narendrapur', tehsil: 'Sonarpur', district: 'South 24 Parganas', state: 'West Bengal',
    areaAcres: 0.72, areaUnit: 'Bigha', landCategory: 'Residential',
    status: 'VERIFIED', ocrConfidence: 94.8, documentLanguage: 'BENGALI',
    uploadedBy: 'Rajesh V. Sharma', uploadedAt: '2026-09-01 09:00', verifiedBy: 'Amitabh R. Roy', verifiedAt: '2026-09-02 15:30',
    mutationNo: 'MTN-WB-2022-0812',
  },
  {
    id: 'LR-1044', khasraNo: '441/5', khewatNo: '321', ownerName: 'Ananda Mukhopadhyay',
    villageMauza: 'Garia Station Road', tehsil: 'Sonarpur', district: 'South 24 Parganas', state: 'West Bengal',
    areaAcres: 0.55, areaUnit: 'Bigha', landCategory: 'Commercial',
    status: 'LOW_CONFIDENCE', ocrConfidence: 72.1, documentLanguage: 'BENGALI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-06 13:30',
    flagReason: 'Bengali script OCR confidence below threshold. Several boundary words unclear.',
    riskScore: 18,
  },
  {
    id: 'LR-1045', khasraNo: '208/2', khewatNo: '144', ownerName: 'Pranab Bandyopadhyay',
    villageMauza: 'Jadavpur', tehsil: 'Jadavpur', district: 'South 24 Parganas', state: 'West Bengal',
    areaAcres: 1.10, areaUnit: 'Bigha', landCategory: 'Residential',
    status: 'VERIFIED', ocrConfidence: 98.1, documentLanguage: 'BENGALI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-08-29 10:00', verifiedBy: 'Amitabh R. Roy', verifiedAt: '2026-08-30 12:00',
  },
  {
    id: 'LR-1046', khasraNo: '719/1', khewatNo: '605', ownerName: 'Sukumar Ghosh',
    villageMauza: 'Baruipur North', tehsil: 'Baruipur', district: 'South 24 Parganas', state: 'West Bengal',
    areaAcres: 4.20, areaUnit: 'Bigha', landCategory: 'Agricultural',
    status: 'ANOMALY_DETECTED', ocrConfidence: 79.5, documentLanguage: 'BENGALI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-07 12:00',
    riskScore: 68,
    flagReason: 'Suspected inconsistent formatting near boundary description. Risk: potential document alteration.',
    anomalyFlags: [
      { type: 'Formatting Inconsistency', description: 'Different font detected in boundary clause versus rest of document', confidence: 68 },
    ],
  },
  {
    id: 'LR-1047', khasraNo: '99/7B', khewatNo: '78', ownerName: 'Lipika Roy Choudhury',
    villageMauza: 'Bongaon Khas', tehsil: 'Bongaon', district: 'North 24 Parganas', state: 'West Bengal',
    areaAcres: 2.50, areaUnit: 'Bigha', landCategory: 'Agricultural',
    status: 'VERIFIED', ocrConfidence: 96.4, documentLanguage: 'BENGALI',
    uploadedBy: 'Rajesh V. Sharma', uploadedAt: '2026-09-02 14:00', verifiedBy: 'Amitabh R. Roy', verifiedAt: '2026-09-03 16:30',
  },
  // Extra records for realistic count
  {
    id: 'LR-1048', khasraNo: '302/6', khewatNo: '192', ownerName: 'Kamlesh Nath Gupta',
    villageMauza: 'Varanasi Cantonment', tehsil: 'Varanasi', district: 'Varanasi', state: 'Uttar Pradesh',
    areaAcres: 1.80, areaUnit: 'Acres', landCategory: 'Residential',
    status: 'VERIFIED', ocrConfidence: 97.2, documentLanguage: 'HINDI',
    uploadedBy: 'Rajesh V. Sharma', uploadedAt: '2026-08-22 10:00', verifiedBy: 'Amitabh R. Roy', verifiedAt: '2026-08-23 09:30',
  },
  {
    id: 'LR-1049', khasraNo: '555/1', khewatNo: '401', ownerName: 'Sanjay Rajput & Co.',
    villageMauza: 'Agra Rural', tehsil: 'Agra', district: 'Agra', state: 'Uttar Pradesh',
    areaAcres: 12.0, areaUnit: 'Acres', landCategory: 'Agricultural',
    status: 'PENDING_VERIFICATION', ocrConfidence: 88.5, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-07 16:00',
  },
  {
    id: 'LR-1050', khasraNo: '127/3A', khewatNo: '77', ownerName: 'Mukhtar Ahmed',
    villageMauza: 'Muzaffarpur Khas', tehsil: 'Muzaffarpur', district: 'Muzaffarpur', state: 'Bihar',
    areaAcres: 3.30, areaUnit: 'Bigha', landCategory: 'Agricultural',
    status: 'REJECTED', ocrConfidence: 45.2, documentLanguage: 'HINDI',
    uploadedBy: 'Priya S. Verma', uploadedAt: '2026-09-04 09:00',
    verifiedBy: 'Amitabh R. Roy', verifiedAt: '2026-09-05 14:00',
    verificationRemarks: 'Document quality too poor for reliable extraction. Physical document unreadable due to water damage.',
    flagReason: 'Rejected: document unreadable.',
  },
];

// ─── ACTIVITY FEED ─────────────────────────────────────────────────────────────
export const MOCK_ACTIVITIES: ActivityLog[] = [
  { id: 'ACT-101', type: 'process',   message: 'Document #LR-1038 (Khasra 89/4C) processed with 97.8% AI confidence', timestamp: '10 mins ago', severity: 'success', user: 'AI Engine v2.4', recordId: 'LR-1038' },
  { id: 'ACT-102', type: 'verify',    message: 'Record #LR-1040 verified and published by Officer A. R. Roy',           timestamp: '25 mins ago', severity: 'info',    user: 'Amitabh R. Roy',   recordId: 'LR-1040' },
  { id: 'ACT-103', type: 'flag',      message: 'Low-confidence record #LR-1026 requires manual review (Mutation no. unclear)', timestamp: '42 mins ago', severity: 'warning', user: 'OCR Service', recordId: 'LR-1026' },
  { id: 'ACT-104', type: 'duplicate', message: 'Duplicate record detected: Match found for #LR-1039 with #LR-1036 (91% similarity)', timestamp: '1 hour ago', severity: 'danger', user: 'Deduplication AI', recordId: 'LR-1039' },
  { id: 'ACT-105', type: 'upload',    message: 'Batch import #B-882 (120 Jamabandi documents) uploaded successfully',   timestamp: '2 hours ago', severity: 'info',    user: 'Priya S. Verma' },
  { id: 'ACT-106', type: 'system',    message: 'PostGIS GIS Spatial sync completed for Zone 4 Tehsils',                 timestamp: '3 hours ago', severity: 'success', user: 'GIS Daemon' },
  { id: 'ACT-107', type: 'process',   message: 'Document #LR-1035 flagged for anomaly: suspected text overwriting (Risk 82%)', timestamp: '4 hours ago', severity: 'danger', user: 'Anomaly AI Engine', recordId: 'LR-1035' },
  { id: 'ACT-108', type: 'approve',   message: 'Record #LR-1043 approved and added to public land registry',            timestamp: '5 hours ago', severity: 'success', user: 'Amitabh R. Roy',   recordId: 'LR-1043' },
];

// ─── SYSTEM STATUS ─────────────────────────────────────────────────────────────
export const MOCK_SYSTEM_STATUS: SystemServiceStatus[] = [
  { name: 'OCR Engine (Tesseract + Custom AI)', status: 'Online', latency: '85 ms',  uptime: '99.94%', lastCheck: 'Just now' },
  { name: 'AI Extraction & LLM Validation',     status: 'Online', latency: '142 ms', uptime: '99.88%', lastCheck: 'Just now' },
  { name: 'Central PostgreSQL / PostGIS DB',     status: 'Online', latency: '12 ms',  uptime: '99.99%', lastCheck: 'Just now' },
  { name: 'GIS Spatial Mapping Service',         status: 'Online', latency: '64 ms',  uptime: '99.91%', lastCheck: 'Just now' },
  { name: 'Deduplication Engine',                status: 'Online', latency: '38 ms',  uptime: '99.96%', lastCheck: '1 min ago' },
  { name: 'Anomaly Detection ML Service',        status: 'Degraded', latency: '340 ms', uptime: '97.20%', lastCheck: '2 min ago' },
];

// ─── CHART DATA ────────────────────────────────────────────────────────────────
export const CHART_DOCUMENTS_OVER_TIME = [
  { month: 'Apr', Ingested: 12000, Processed: 10500, Verified: 9800  },
  { month: 'May', Ingested: 15400, Processed: 14100, Verified: 12900 },
  { month: 'Jun', Ingested: 18200, Processed: 16800, Verified: 15200 },
  { month: 'Jul', Ingested: 22100, Processed: 20400, Verified: 18600 },
  { month: 'Aug', Ingested: 26500, Processed: 24800, Verified: 22100 },
  { month: 'Sep', Ingested: 31200, Processed: 29310, Verified: 26800 },
];

export const CHART_VERIFICATION_STATUS = [
  { name: 'Verified',        value: 118400, color: '#15803D' },
  { name: 'Pending Review',  value: 14510,  color: '#B45309' },
  { name: 'Low Confidence',  value: 842,    color: '#EF4444' },
  { name: 'Duplicate Found', value: 318,    color: '#6366F1' },
  { name: 'Anomaly Flagged', value: 97,     color: '#DC2626' },
  { name: 'Rejected',        value: 204,    color: '#64748B' },
];

export const CHART_DISTRICT_DIGITIZATION = [
  { district: 'Jaipur Rural',       total: 32000, digitized: 29500 },
  { district: 'Patna',              total: 28000, digitized: 24200 },
  { district: 'Lucknow',            total: 35000, digitized: 31800 },
  { district: 'South 24 Parganas',  total: 24000, digitized: 19800 },
  { district: 'Varanasi',           total: 21000, digitized: 18400 },
  { district: 'Agra',               total: 19500, digitized: 16900 },
  { district: 'Muzaffarpur',        total: 17000, digitized: 13200 },
];

export const CHART_CONFIDENCE_DISTRIBUTION = [
  { range: '40-50%', count: 48  },
  { range: '50-60%', count: 112 },
  { range: '60-70%', count: 234 },
  { range: '70-80%', count: 1840 },
  { range: '80-90%', count: 8420 },
  { range: '90-95%', count: 41200 },
  { range: '95-100%', count: 81056 },
];

export const CHART_ERROR_CATEGORIES = [
  { category: 'Low OCR Quality',     count: 842  },
  { category: 'Missing Fields',      count: 514  },
  { category: 'Invalid Date',        count: 288  },
  { category: 'Area Mismatch',       count: 191  },
  { category: 'Signature Unclear',   count: 167  },
  { category: 'Village-Tehsil Mismatch', count: 94 },
];

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'N-001', type: 'verification', message: '8 records require officer verification', timestamp: '15 mins ago', isRead: false, severity: 'warning' },
  { id: 'N-002', type: 'duplicate',    message: '2 new duplicate records detected: #LR-1039, #LR-1027', timestamp: '1 hour ago', isRead: false, severity: 'danger', recordId: 'LR-1039' },
  { id: 'N-003', type: 'processing',   message: 'Batch #B-882 (120 docs) successfully processed', timestamp: '2 hours ago', isRead: false, severity: 'success' },
  { id: 'N-004', type: 'anomaly',      message: 'High-risk anomaly detected in Record #LR-1035 (Risk: 82%)', timestamp: '4 hours ago', isRead: true, severity: 'danger', recordId: 'LR-1035' },
  { id: 'N-005', type: 'system',       message: 'Anomaly Detection ML Service running in degraded mode', timestamp: '6 hours ago', isRead: true, severity: 'warning' },
  { id: 'N-006', type: 'processing',   message: '12 documents have OCR confidence below 75%', timestamp: '8 hours ago', isRead: true, severity: 'warning' },
];

// ─── AUDIT LOGS ────────────────────────────────────────────────────────────────
export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'LOG-8842', actor: 'Rajesh V. Sharma',  actorRole: 'ADMIN', action: 'System Config Update',    target: 'OCR Threshold Parameters',        timestamp: '2026-09-08 15:22:10', ipAddress: '10.24.18.91',   status: 'SUCCESS', previousValue: 'Threshold: 70%', newValue: 'Threshold: 75%', details: 'Minimum OCR confidence threshold updated for field validation.' },
  { id: 'LOG-8841', actor: 'Priya S. Verma',    actorRole: 'LAND_RECORD_OFFICER', action: 'Batch Document Upload', target: 'Jamabandi #B-882 (120 Files)', timestamp: '2026-09-08 14:10:05', ipAddress: '10.24.22.14', status: 'SUCCESS' },
  { id: 'LOG-8840', actor: 'Priya S. Verma',    actorRole: 'LAND_RECORD_OFFICER', action: 'Record Approved',      target: 'Record #LR-1040',             timestamp: '2026-09-08 12:45:30', ipAddress: '10.24.22.14', status: 'SUCCESS', recordId: 'LR-1040', previousValue: 'PENDING_VERIFICATION', newValue: 'VERIFIED' },
  { id: 'LOG-8839', actor: 'AI Dedup Engine',   actorRole: 'SYSTEM', action: 'Duplicate Flag',          target: 'Record #LR-1039 vs #LR-1036',     timestamp: '2026-09-08 11:45:00', ipAddress: 'Internal Cluster', status: 'FLAGGED', details: '91% similarity score. Same tehsil, similar owner name and area.' },
  { id: 'LOG-8838', actor: 'Priya S. Verma',    actorRole: 'LAND_RECORD_OFFICER', action: 'Field Edit',           target: 'Record #LR-1026',             timestamp: '2026-09-08 11:10:00', ipAddress: '10.24.22.14', status: 'SUCCESS', recordId: 'LR-1026', previousValue: 'Mutation No: 8?14', newValue: 'Mutation No: 8814' },
  { id: 'LOG-8837', actor: 'OCR Engine v2.4',   actorRole: 'SYSTEM', action: 'Anomaly Detection',       target: 'Record #LR-1035',                 timestamp: '2026-09-08 10:30:00', ipAddress: 'AI Cluster',      status: 'FLAGGED', details: 'Risk Score: 82%. Suspected text overwriting near owner name.' },
  { id: 'LOG-8836', actor: 'Priya S. Verma',    actorRole: 'LAND_RECORD_OFFICER', action: 'Document Upload',      target: 'Khasra 377/2, Fatuha, Bihar',  timestamp: '2026-09-08 09:55:00', ipAddress: '10.24.22.14', status: 'SUCCESS' },
  { id: 'LOG-8835', actor: 'Priya S. Verma',    actorRole: 'LAND_RECORD_OFFICER', action: 'Record Rejected',      target: 'Record #LR-1050',             timestamp: '2026-09-08 09:40:00', ipAddress: '10.24.22.14', status: 'SUCCESS', recordId: 'LR-1050', previousValue: 'PENDING_VERIFICATION', newValue: 'REJECTED', details: 'Document unreadable due to water damage.' },
  { id: 'LOG-8834', actor: 'Rajesh V. Sharma',  actorRole: 'ADMIN', action: 'User Role Modified',       target: 'Officer Dinesh Yadav',             timestamp: '2026-09-07 16:00:00', ipAddress: '10.24.18.91',   status: 'SUCCESS', previousValue: 'Status: INACTIVE', newValue: 'Status: ACTIVE' },
  { id: 'LOG-8833', actor: 'GIS Daemon',         actorRole: 'SYSTEM', action: 'GIS Sync',                target: 'Zone 4 Tehsils (Jaipur Rural)',    timestamp: '2026-09-07 15:30:00', ipAddress: 'GIS Cluster',     status: 'SUCCESS', details: '148 parcel polygons updated in PostGIS.' },
  { id: 'LOG-8832', actor: 'Priya S. Verma',    actorRole: 'LAND_RECORD_OFFICER', action: 'Login',                target: 'Officer Portal',               timestamp: '2026-09-07 09:00:00', ipAddress: '10.24.22.14', status: 'SUCCESS' },
  { id: 'LOG-8831', actor: 'Priya S. Verma',    actorRole: 'LAND_RECORD_OFFICER', action: 'Record Approved',      target: 'Record #LR-1047',             timestamp: '2026-09-07 08:30:00', ipAddress: '10.24.22.14', status: 'SUCCESS', recordId: 'LR-1047', previousValue: 'PENDING_VERIFICATION', newValue: 'VERIFIED' },
];
