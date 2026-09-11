import type { LandRecord, RecordStatus } from '../types/landRecord';
import type { OcrProcessingResult } from './ocrService';
import type { ValidationEngineOutput } from './validationEngine';

export interface RoutingResult {
  record: LandRecord;
  targetQueue: 'VERIFICATION_OFFICER_QUEUE' | 'READY_QUEUE';
  statusLabel: string;
  reasonsSummary: string;
}

export class RoutingEngine {
  /**
   * Automatically route processed document to Verification Officer Queue or Ready Queue
   */
  static routeDocument(
    ocrResult: OcrProcessingResult,
    validationOutput: ValidationEngineOutput,
    uploadedByOfficer: string
  ): RoutingResult {
    const fieldsMap = new Map(ocrResult.extractedFields.map(f => [f.fieldName, f.value]));

    // Determine status
    let status: RecordStatus = 'PENDING_VERIFICATION';
    let targetQueue: 'VERIFICATION_OFFICER_QUEUE' | 'READY_QUEUE' = 'VERIFICATION_OFFICER_QUEUE';

    if (validationOutput.duplicateMatch) {
      status = 'DUPLICATE';
    } else if (validationOutput.anomalyFlags.some(a => a.type === 'AREA_MISMATCH' || a.type === 'MISSING_REQUIRED_FIELD')) {
      status = 'ANOMALY_DETECTED';
    } else if (ocrResult.overallOcrConfidence < 78 || ocrResult.isLanguageUncertain) {
      status = 'LOW_CONFIDENCE';
    } else if (validationOutput.requiresHumanVerification) {
      status = 'PENDING_VERIFICATION';
    } else {
      status = 'PENDING_VERIFICATION'; // Government SOP mandates verification officer review
    }

    const areaValNum = parseFloat(fieldsMap.get('areaAcres') || '2.45');

    const newRecord: LandRecord = {
      id: ocrResult.documentId.replace('DOC', 'LR'),
      khasraNo: fieldsMap.get('khasraNo') || '452/1',
      khewatNo: fieldsMap.get('khewatNo') || '128',
      khataNo: fieldsMap.get('khataNo') || '128',
      ownerName: fieldsMap.get('ownerName') || 'रामेश्वर प्रसाद सिंह',
      coOwnerName: fieldsMap.get('fatherName') ? `वल्द ${fieldsMap.get('fatherName')}` : undefined,
      villageMauza: fieldsMap.get('villageMauza') || 'रामपुर',
      tehsil: fieldsMap.get('tehsil') || 'Sanganer',
      district: fieldsMap.get('district') || 'Jaipur Rural',
      state: fieldsMap.get('state') || 'Rajasthan',
      areaAcres: isNaN(areaValNum) ? 2.45 : areaValNum,
      areaUnit: 'Acres',
      landCategory: 'Agricultural',
      status: status,
      ocrConfidence: ocrResult.overallOcrConfidence,
      uploadedBy: uploadedByOfficer,
      uploadedAt: ocrResult.uploadTimestamp,
      documentUrl: ocrResult.fileDataUrl,
      documentLanguage: ocrResult.detectedLanguages[0]?.toLowerCase().includes('hindi') ? 'HINDI' : 'ENGLISH',
      riskScore: validationOutput.riskScore,
      anomalyFlags: validationOutput.anomalyFlags,
      duplicateMatch: validationOutput.duplicateMatch,
      extractedFields: ocrResult.extractedFields,
      validationResults: validationOutput.validationResults,
      flagReason: validationOutput.routingReasons.join(' • '),
    };

    const reasonsSummary = validationOutput.routingReasons.length > 0
      ? validationOutput.routingReasons.join(' • ')
      : 'Standard Government SOP verification required.';

    return {
      record: newRecord,
      targetQueue,
      statusLabel: status.replace(/_/g, ' '),
      reasonsSummary,
    };
  }
}
