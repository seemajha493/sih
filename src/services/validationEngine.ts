import type {
  ExtractedField,
  ValidationResult,
  DuplicateMatch,
  AnomalyFlag,
  LandRecord
} from '../types/landRecord';
import type { OcrProcessingResult } from './ocrService';

export interface ValidationEngineOutput {
  validationResults: ValidationResult[];
  duplicateMatch?: DuplicateMatch;
  anomalyFlags: AnomalyFlag[];
  riskScore: number; // 0–100 risk score
  requiresHumanVerification: boolean;
  routingReasons: string[];
}

export class ValidationEngine {
  /**
   * Run validation rules, duplicate check, data consistency check, and anomaly scoring
   */
  static validate(
    ocrResult: OcrProcessingResult,
    existingRecords: LandRecord[]
  ): ValidationEngineOutput {
    const results: ValidationResult[] = [];
    const anomalyFlags: AnomalyFlag[] = [];
    const routingReasons: string[] = [];
    let duplicateMatch: DuplicateMatch | undefined = undefined;

    const fieldsMap = new Map<string, ExtractedField>();
    ocrResult.extractedFields.forEach(f => fieldsMap.set(f.fieldName, f));

    // 1. Mandatory Required Field Validation
    const requiredFields = [
      { key: 'ownerName', label: 'Owner Name' },
      { key: 'khasraNo', label: 'Khasra Number' },
      { key: 'villageMauza', label: 'Village / Mauza' },
      { key: 'areaAcres', label: 'Land Area' },
    ];

    requiredFields.forEach(req => {
      const field = fieldsMap.get(req.key);
      if (!field || !field.value || field.value.trim() === '' || field.value === '—') {
        results.push({
          ruleId: `REQ_${req.key.toUpperCase()}`,
          ruleName: `Required Field: ${req.label}`,
          status: 'FAIL',
          severity: 'HIGH',
          description: `⚠️ Required field missing: ${req.label}`,
          suggestedAction: `Manual entry required by Verification Officer.`,
          fieldName: req.key,
        });
        anomalyFlags.push({
          type: 'MISSING_REQUIRED_FIELD',
          description: `Mandatory field "${req.label}" could not be extracted from document.`,
          confidence: 100,
        });
        routingReasons.push(`Missing mandatory field: ${req.label}`);
      } else {
        results.push({
          ruleId: `REQ_${req.key.toUpperCase()}`,
          ruleName: `Required Field: ${req.label}`,
          status: 'PASS',
          severity: 'HIGH',
          description: `Mandatory field "${req.label}" present ("${field.value}").`,
          suggestedAction: 'No action needed.',
          fieldName: req.key,
        });
      }
    });

    // 2. Format Validation
    const khasraField = fieldsMap.get('khasraNo');
    if (khasraField && khasraField.value) {
      const isFormatValid = /^[0-9]+(\/[0-9]+)?$/.test(khasraField.value.trim()) || khasraField.value.includes('Khasra');
      if (!isFormatValid) {
        results.push({
          ruleId: 'FMT_KHASRA',
          ruleName: 'Khasra Format Validation',
          status: 'WARNING',
          severity: 'MEDIUM',
          description: `⚠️ Possible invalid Khasra format: "${khasraField.value}"`,
          suggestedAction: 'Verify Khasra number pattern against tehsil revenue guidelines.',
          fieldName: 'khasraNo',
        });
        anomalyFlags.push({
          type: 'INVALID_FORMAT',
          description: `Khasra number format "${khasraField.value}" requires officer verification.`,
          confidence: 85,
        });
      } else {
        results.push({
          ruleId: 'FMT_KHASRA',
          ruleName: 'Khasra Format Validation',
          status: 'PASS',
          severity: 'LOW',
          description: `Khasra format valid (${khasraField.value}).`,
          suggestedAction: 'No action needed.',
        });
      }
    }

    // 3. Low Confidence Field Check
    const lowConfFields = ocrResult.extractedFields.filter(f => f.confidence < 75);
    if (lowConfFields.length > 0) {
      lowConfFields.forEach(f => {
        results.push({
          ruleId: `CONF_${f.fieldName.toUpperCase()}`,
          ruleName: `Low Confidence: ${f.fieldLabel}`,
          status: 'WARNING',
          severity: f.confidence < 65 ? 'HIGH' : 'MEDIUM',
          description: `⚠️ ${f.fieldLabel} confidence is ${f.confidence}% (below 75% threshold).`,
          suggestedAction: 'Review original document text to verify extracted value.',
          fieldName: f.fieldName,
        });
        routingReasons.push(`${f.fieldLabel} OCR confidence low (${f.confidence}%)`);
      });
      anomalyFlags.push({
        type: 'LOW_OCR_CONFIDENCE',
        description: `${lowConfFields.length} field(s) extracted with low legibility confidence.`,
        confidence: 90,
      });
    }

    // 4. Duplicate Check against authorized registry
    const extractedKhasra = fieldsMap.get('khasraNo')?.value || '';
    const extractedVillage = fieldsMap.get('villageMauza')?.value || '';
    const extractedOwner = fieldsMap.get('ownerName')?.value || '';

    const matchedRecord = existingRecords.find(r =>
      r.khasraNo === extractedKhasra ||
      (r.villageMauza && extractedVillage.includes(r.villageMauza)) ||
      r.ownerName === extractedOwner
    );

    if (matchedRecord) {
      const isExactKhasraMatch = matchedRecord.khasraNo === extractedKhasra;
      duplicateMatch = {
        matchedRecordId: matchedRecord.id,
        similarity: isExactKhasraMatch ? 96 : 82,
        matchedFields: isExactKhasraMatch ? ['Khasra Number', 'Village'] : ['Owner Name'],
        matchedOwner: matchedRecord.ownerName,
        matchedKhasra: matchedRecord.khasraNo,
        matchedVillage: matchedRecord.villageMauza,
      };

      results.push({
        ruleId: 'DUP_CHECK',
        ruleName: 'Duplicate Record Check',
        status: 'WARNING',
        severity: 'CRITICAL',
        description: `⚠️ Possible duplicate land record found (Matches Record #${matchedRecord.id}, Khasra ${matchedRecord.khasraNo}).`,
        suggestedAction: 'Human review required before publishing. Do not auto-reject.',
      });

      anomalyFlags.push({
        type: 'POSSIBLE_DUPLICATE',
        description: `Matching record #${matchedRecord.id} already exists in revenue database.`,
        confidence: 95,
      });

      routingReasons.push(`Possible duplicate land record (Matches #${matchedRecord.id})`);
    } else {
      results.push({
        ruleId: 'DUP_CHECK',
        ruleName: 'Duplicate Record Check',
        status: 'PASS',
        severity: 'HIGH',
        description: 'No duplicate found in central land registry.',
        suggestedAction: 'No action needed.',
      });
    }

    // 5. Data Consistency & Area Mismatch Check
    const areaField = fieldsMap.get('areaAcres');
    if (areaField && areaField.value) {
      const extractedAreaNum = parseFloat(areaField.value);
      if (extractedAreaNum > 10.0) {
        results.push({
          ruleId: 'AREA_MISMATCH',
          ruleName: 'Area Consistency Check',
          status: 'WARNING',
          severity: 'HIGH',
          description: `⚠️ Significant area mismatch detected (Extracted: ${extractedAreaNum} Acres vs Typical Tehsil parcel size 1.25-2.5 Acres).`,
          suggestedAction: 'Compare extracted area against original register seal.',
          fieldName: 'areaAcres',
        });
        anomalyFlags.push({
          type: 'AREA_MISMATCH',
          description: `Extracted area (${extractedAreaNum} Acres) significantly exceeds expected parcel threshold.`,
          confidence: 88,
        });
        routingReasons.push(`Significant area mismatch detected (${extractedAreaNum} Acres)`);
      }
    }

    // Calculate Overall Risk Score (0-100)
    let riskScore = 10;
    if (lowConfFields.length > 0) riskScore += lowConfFields.length * 15;
    if (duplicateMatch) riskScore += 35;
    if (anomalyFlags.some(a => a.type === 'AREA_MISMATCH')) riskScore += 25;
    if (ocrResult.isLanguageUncertain) riskScore += 20;
    riskScore = Math.min(Math.max(riskScore, 5), 98);

    const requiresHumanVerification =
      routingReasons.length > 0 ||
      ocrResult.overallOcrConfidence < 88 ||
      ocrResult.isLanguageUncertain ||
      riskScore >= 40;

    return {
      validationResults: results,
      duplicateMatch,
      anomalyFlags,
      riskScore,
      requiresHumanVerification,
      routingReasons,
    };
  }
}
