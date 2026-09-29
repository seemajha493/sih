import type { LandRecord, RecordStatus } from '../types/landRecord';
import type { OcrProcessingResult } from './ocrService';
import type { ValidationEngineOutput } from './validationEngine';

export interface RoutingResult {
  record: LandRecord;
  targetQueue: 'OFFICER_REVIEW_QUEUE' | 'READY_QUEUE';
  statusLabel: string;
  reasonsSummary: string;
}

export class RoutingEngine {
  /**
   * Automatically route processed document to Land Record Officer Review Queue or Ready Queue
   */
  static routeDocument(
    ocrResult: OcrProcessingResult,
    validationOutput: ValidationEngineOutput,
    uploadedByOfficer: string
  ): RoutingResult {
    const fieldsMap = new Map(ocrResult.extractedFields.map(f => [f.fieldName, f.value]));

    // Determine status
    let status: RecordStatus = 'PENDING_VERIFICATION';
    let targetQueue: 'OFFICER_REVIEW_QUEUE' | 'READY_QUEUE' = 'OFFICER_REVIEW_QUEUE';

    if (validationOutput.duplicateMatch) {
      status = 'DUPLICATE';
    } else if (validationOutput.anomalyFlags.some(a => a.type === 'AREA_MISMATCH' || a.type === 'MISSING_REQUIRED_FIELD')) {
      status = 'ANOMALY_DETECTED';
    } else if (ocrResult.overallOcrConfidence < 78 || ocrResult.isLanguageUncertain) {
      status = 'LOW_CONFIDENCE';
    } else if (validationOutput.requiresHumanVerification) {
      status = 'PENDING_VERIFICATION';
    } else {
      status = 'PENDING_VERIFICATION'; // Government SOP mandates officer review
    }

    const areaRaw = fieldsMap.get('areaAcres') || '';
    let areaValNum = 0.41;
    let unit = 'Acres';

    if (/کنال|مرلہ|Kanal|Marla/i.test(areaRaw)) {
      unit = 'Kanal/Marla';
      const kMatch = areaRaw.match(/(\d+(?:\.\d+)?)\s*(?:کنال|Kanal)/i);
      const mMatch = areaRaw.match(/(\d+(?:\.\d+)?)\s*(?:مرلہ|Marla)/i);
      const kanals = kMatch ? parseFloat(kMatch[1]) : 0;
      const marlas = mMatch ? parseFloat(mMatch[1]) : 0;
      if (kanals > 0 || marlas > 0) {
        areaValNum = Math.round((kanals * 0.125 + marlas * 0.00625) * 100) / 100;
      } else {
        areaValNum = 0.41;
      }
    } else {
      const parsedNum = parseFloat(areaRaw.replace(/[^0-9\.]/g, ''));
      if (!isNaN(parsedNum)) areaValNum = parsedNum;
      if (/हेक्टेयर|Hectare/i.test(areaRaw)) unit = 'Hectares';
      else if (/बीघा|Bigha/i.test(areaRaw)) unit = 'Bigha';
      else if (/डिसीमल|Decimal/i.test(areaRaw)) unit = 'Decimal';
      else if (/कट्ठा|Katha/i.test(areaRaw)) unit = 'Katha';
      else if (/धूर|Dhur/i.test(areaRaw)) unit = 'Dhur';
    }

    // Determine document language
    const primaryLang = ocrResult.detectedLanguages[0]?.toUpperCase() || '';
    let docLang = 'ENGLISH';
    if (primaryLang.includes('URDU')) docLang = 'URDU';
    else if (primaryLang.includes('HINDI')) docLang = 'HINDI';
    else if (primaryLang.includes('BENGALI')) docLang = 'BENGALI';
    else if (primaryLang.includes('MARATHI')) docLang = 'MARATHI';
    else if (primaryLang.includes('PUNJABI')) docLang = 'PUNJABI';
    else if (primaryLang.includes('GUJARATI')) docLang = 'GUJARATI';
    else if (primaryLang.includes('TAMIL')) docLang = 'TAMIL';
    else if (primaryLang.includes('TELUGU')) docLang = 'TELUGU';
    else if (primaryLang.includes('KANNADA')) docLang = 'KANNADA';
    else if (primaryLang.includes('MALAYALAM')) docLang = 'MALAYALAM';
    else if (primaryLang.includes('ODIA')) docLang = 'ODIA';
    else if (primaryLang.includes('ASSAMESE')) docLang = 'ASSAMESE';

    const newRecord: LandRecord = {
      id: ocrResult.documentId.replace('DOC', 'LR'),
      khasraNo: fieldsMap.get('khasraNo') || '',
      khewatNo: fieldsMap.get('khewatNo') || fieldsMap.get('khataNo') || '',
      khataNo: fieldsMap.get('khataNo') || fieldsMap.get('khewatNo') || undefined,
      surveyNo: fieldsMap.get('surveyNo') || fieldsMap.get('khasraNo') || undefined,
      plotNo: fieldsMap.get('plotNo') || undefined,
      ownerName: fieldsMap.get('ownerName') || '',
      coOwnerName: fieldsMap.get('coOwnerName') || fieldsMap.get('fatherName') || undefined,
      villageMauza: fieldsMap.get('villageMauza') || '',
      tehsil: fieldsMap.get('tehsil') || '',
      district: fieldsMap.get('district') || '',
      state: fieldsMap.get('state') || '',
      areaAcres: isNaN(areaValNum) ? 0.41 : areaValNum,
      areaUnit: (unit as any) || 'Acres',
      landCategory: (fieldsMap.get('landCategory') as any) || 'Agricultural',
      landUse: fieldsMap.get('landUse') || 'Crop Cultivation',
      mutationNo: fieldsMap.get('mutationNo') || fieldsMap.get('registrationNo') || undefined,
      registrationNo: fieldsMap.get('registrationNo') || undefined,
      recordYear: fieldsMap.get('recordYear') || '2025',
      status: status,
      ocrConfidence: ocrResult.overallOcrConfidence,
      uploadedBy: uploadedByOfficer,
      uploadedAt: ocrResult.uploadTimestamp,
      documentUrl: ocrResult.fileDataUrl,
      documentLanguage: docLang,
      riskScore: validationOutput.riskScore,
      anomalyFlags: validationOutput.anomalyFlags,
      duplicateMatch: validationOutput.duplicateMatch,
      extractedFields: ocrResult.extractedFields,
      validationResults: validationOutput.validationResults,
      flagReason: validationOutput.routingReasons.join(' • '),
      rawOcrText: ocrResult.rawExtractedText,
      ocrBlocks: ocrResult.textBlocks,
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
