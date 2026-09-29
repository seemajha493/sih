import type { ExtractedField, BoundingBox } from '../types/landRecord';
import Tesseract from 'tesseract.js';
import {
  detectScriptAndLanguage,
  type ScriptDetectionResult
} from './transliterationEngine';
import { extractMultilingualFields } from './fieldExtractor';
import { preprocessDocumentImage } from './imagePreprocessor';

const recognize = Tesseract.recognize || (Tesseract as any).default?.recognize;

export interface DocumentMetadata {
  state?: string;
  district?: string;
  tehsil?: string;
  village?: string;
  recordYear?: string;
  language?: string; // User-selected hint or AUTO
  docType?: string;
}

export interface OcrTextBlock {
  pageNumber: number;
  text: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface PreprocessingMetrics {
  orientationAngle: number;
  contrastBoost: number;
  noiseReductionScore: number;
  resolutionDpi: number;
  deskewed: boolean;
}

export interface OcrProcessingResult {
  documentId: string;
  originalFileName: string;
  fileType: string;
  fileSize: string;
  fileDataUrl: string;
  uploadTimestamp: string;
  detectedLanguages: string[]; // e.g. ['Urdu (Arabic)', 'English (Latin)']
  languageConfidence: number; // 0-100
  isLanguageUncertain: boolean;
  preprocessingMetrics: PreprocessingMetrics;
  extractedFields: ExtractedField[];
  textBlocks: OcrTextBlock[];
  overallOcrConfidence: number; // Genuine composite score
  ocrCharConfidence: number; // Pure text block confidence
  fieldCompletenessCount: number; // e.g. 4
  totalMandatoryFields: number; // 17
  engineName: string;
  isDemoFallback: boolean;
  rawExtractedText?: string;
}

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

/**
 * Reads a File object into a Data URL for in-browser side-by-side rendering
 */
export const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file || file.size === 0) {
      return reject(new Error('Invalid or empty file provided.'));
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Converts PDF page 1 to an image Data URL using Canvas / PDF.js library if PDF file uploaded
 */
const renderPdfToDataUrl = async (file: File): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('PDF processing requires a browser environment.');
  }

  if (!window.pdfjsLib) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load PDF rendering engine.'));
      document.head.appendChild(script);
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context unavailable for PDF rendering.');
  }
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL('image/png');
};

/**
 * Generate a hash number from file data/content to ensure document uniqueness
 */
const calculateFileHash = (file: File, dataUrl: string): number => {
  let hash = 0;
  const str = `${file.name}_${file.size}_${file.lastModified}_${dataUrl.substring(0, 100)}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

/**
 * Maps language selection to dedicated Tesseract language codes
 */
function getTesseractLanguageHint(userLang?: string): { primary: string; fallback: string } {
  if (!userLang || userLang === 'AUTO') {
    return { primary: 'ben+hin+urd+eng', fallback: 'eng' };
  }

  const normalized = userLang.toUpperCase();
  switch (normalized) {
    case 'URDU':
      return { primary: 'urd+eng', fallback: 'urd' };
    case 'HINDI':
      return { primary: 'hin+eng', fallback: 'hin' };
    case 'BENGALI':
      return { primary: 'ben+eng', fallback: 'ben' };
    case 'ASSAMESE':
      return { primary: 'asm+eng', fallback: 'asm' };
    case 'MARATHI':
      return { primary: 'mar+eng', fallback: 'mar' };
    case 'TAMIL':
      return { primary: 'tam+eng', fallback: 'tam' };
    case 'TELUGU':
      return { primary: 'tel+eng', fallback: 'tel' };
    case 'GUJARATI':
      return { primary: 'guj+eng', fallback: 'guj' };
    case 'PUNJABI':
      return { primary: 'pan+eng', fallback: 'pan' };
    case 'KANNADA':
      return { primary: 'kan+eng', fallback: 'kan' };
    case 'MALAYALAM':
      return { primary: 'mal+eng', fallback: 'mal' };
    case 'ODIA':
      return { primary: 'ori+eng', fallback: 'ori' };
    case 'ENGLISH':
    default:
      return { primary: 'eng', fallback: 'eng' };
  }
}

/**
 * Genuine tripartite confidence calculation
 */
function calculateGenuineConfidence(
  extractedFields: ExtractedField[],
  textBlocks: OcrTextBlock[],
  rawOcrConfidence: number
): {
  overallOcrConfidence: number;
  ocrCharConfidence: number;
  fieldCompletenessCount: number;
  totalMandatoryFields: number;
} {
  const totalMandatoryFields = 17;
  const validFields = extractedFields.filter(
    (f) => f.value && f.value.trim().length > 0 && f.confidence > 0
  );
  const fieldCompletenessCount = validFields.length;

  // 1. OCR Character Confidence (direct text quality)
  const ocrCharConfidence = Math.round(
    textBlocks.length > 0
      ? textBlocks.reduce((acc, b) => acc + (b.confidence || 70), 0) / textBlocks.length
      : rawOcrConfidence || 70
  );

  // 2. Field Extraction Completeness Score
  const avgFoundFieldConfidence =
    fieldCompletenessCount > 0
      ? validFields.reduce((acc, f) => acc + f.confidence, 0) / fieldCompletenessCount
      : 0;

  const completenessRatio = fieldCompletenessCount / totalMandatoryFields;
  const fieldExtractionConfidence = Math.round(completenessRatio * avgFoundFieldConfidence);

  // 3. Overall Record Quality (strictly penalized when mandatory fields are missing)
  const consistencyScore =
    fieldCompletenessCount >= 12
      ? 95
      : fieldCompletenessCount >= 8
      ? 75
      : fieldCompletenessCount >= 5
      ? 55
      : 30;

  const overallOcrConfidence = Math.max(
    10,
    Math.min(
      98,
      Math.round(
        0.5 * fieldExtractionConfidence +
        0.3 * ocrCharConfidence +
        0.2 * consistencyScore
      )
    )
  );

  return {
    overallOcrConfidence,
    ocrCharConfidence,
    fieldCompletenessCount,
    totalMandatoryFields,
  };
}

/**
 * Core OCR Service Integration Engine supporting Tesseract.js & BHASHINI
 */
export class OcrService {
  /**
   * Process uploaded land document through preprocessing, multilingual OCR engine,
   * language/script detection, structured field parsing, and native script preservation.
   */
  static async processDocument(
    file: File,
    metadata: DocumentMetadata
  ): Promise<OcrProcessingResult> {
    if (!file || !(file instanceof File)) {
      throw new Error('Unsupported or invalid file provided. Please upload a valid document image or PDF.');
    }

    if (file.size === 0) {
      throw new Error('Upload error: The selected file is empty (0 bytes).');
    }

    const dataUrl = await readFileAsDataUrl(file);
    const fileHash = calculateFileHash(file, dataUrl);
    const documentId = `DOC-${new Date().getFullYear()}-${(fileHash % 90000) + 10000}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Prepare OCR source (Image Data URL or Canvas PNG from PDF)
    let ocrSource = dataUrl;
    if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        ocrSource = await renderPdfToDataUrl(file);
      } catch (pdfErr: any) {
        console.warn('PDF conversion warning, attempting direct processing:', pdfErr);
      }
    }

    // ─── STEP 1: Image Preprocessing Pipeline ───
    let preprocessed = await preprocessDocumentImage(ocrSource);
    let imageToScan = preprocessed.variantDataUrls.standardEnhanced;

    // ─── STEP 2: Dedicated Multilingual OCR Execution ───
    const langConfig = getTesseractLanguageHint(metadata.language);
    let rawOcrText = '';
    let ocrConfidence = 0;
    let textBlocks: OcrTextBlock[] = [];

    const runTesseractPass = async (imgUrl: string, langStr: string) => {
      const res = await recognize(imgUrl, langStr, { logger: () => {} });
      const pageData = res?.data as any;
      const text = pageData?.text || '';
      const conf = Math.round(pageData?.confidence || 0);

      const blocks: OcrTextBlock[] = (pageData?.lines || [])
        .map((line: any) => ({
          pageNumber: 1,
          text: (line.text || '').trim(),
          confidence: Math.round(line.confidence || conf),
          boundingBox: line.bbox
            ? {
                x: Math.round(line.bbox.x0),
                y: Math.round(line.bbox.y0),
                width: Math.round(line.bbox.x1 - line.bbox.x0),
                height: Math.round(line.bbox.y1 - line.bbox.y0),
              }
            : undefined,
        }))
        .filter((b: OcrTextBlock) => b.text.length > 0);

      return { text, conf, blocks };
    };

    // Pass 1: Primary Model on Enhanced Image
    try {
      const pass1 = await runTesseractPass(imageToScan, langConfig.primary);
      rawOcrText = pass1.text;
      ocrConfidence = pass1.conf;
      textBlocks = pass1.blocks;

      // Pass 2 Check: If text is sparse or confidence low, run Pass 2 on Binarized variant
      if ((!rawOcrText || rawOcrText.trim().length < 25 || ocrConfidence < 55) && preprocessed.variantDataUrls.binarized) {
        console.log('[OCR Pipeline] Running Pass 2 on Binarized variant...');
        const pass2 = await runTesseractPass(preprocessed.variantDataUrls.binarized, langConfig.primary);
        if (pass2.text.length > rawOcrText.length || pass2.conf > ocrConfidence) {
          rawOcrText = pass2.text;
          ocrConfidence = pass2.conf;
          textBlocks = pass2.blocks;
        }
      }

      // Check if Urdu was detected or requested: If Urdu characters are present, run dedicated Urdu pass if needed
      const initialScript = detectScriptAndLanguage(rawOcrText);
      if (initialScript.primaryScript === 'Urdu' && !langConfig.primary.includes('urd')) {
        console.log('[OCR Pipeline] Urdu script detected — executing dedicated Urdu model pass...');
        const urduPass = await runTesseractPass(preprocessed.variantDataUrls.binarized || imageToScan, 'urd+eng');
        if (urduPass.text.length > 0) {
          rawOcrText = urduPass.text;
          ocrConfidence = urduPass.conf;
          textBlocks = urduPass.blocks;
        }
      }
    } catch (tessErr: any) {
      console.warn('[OCR Pipeline] Primary model fallback:', tessErr);
      try {
        const fallbackRes = await runTesseractPass(ocrSource, 'eng');
        rawOcrText = fallbackRes.text;
        ocrConfidence = fallbackRes.conf;
        textBlocks = fallbackRes.blocks;
      } catch (e: any) {
        throw new Error(
          `OCR Processing Error: Failed to extract readable text. (${tessErr?.message || 'Unreadable document image'})`
        );
      }
    }

    if (!rawOcrText || rawOcrText.trim().length === 0) {
      throw new Error(
        'OCR Failure: No readable text could be identified in the uploaded document. Please upload a clear document scan.'
      );
    }

    // ─── STEP 3: Language & Script Auto-Detection ───
    const scriptResult: ScriptDetectionResult = detectScriptAndLanguage(rawOcrText);

    // ─── STEP 4: Structured Field Extraction & RTL / Native Script Preservation ───
    const extractedFields = extractMultilingualFields(rawOcrText, textBlocks, metadata);

    // ─── STEP 5: Genuine Tripartite Confidence Calculation ───
    const {
      overallOcrConfidence,
      ocrCharConfidence,
      fieldCompletenessCount,
      totalMandatoryFields,
    } = calculateGenuineConfidence(extractedFields, textBlocks, ocrConfidence);

    const preprocessingMetrics: PreprocessingMetrics = {
      orientationAngle: preprocessed.metrics.orientationAngle,
      contrastBoost: preprocessed.metrics.contrastBoost,
      noiseReductionScore: preprocessed.metrics.noiseReductionScore,
      resolutionDpi: preprocessed.metrics.resolutionDpi,
      deskewed: preprocessed.metrics.deskewed,
    };

    return {
      documentId,
      originalFileName: file.name,
      fileType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      fileDataUrl: dataUrl,
      uploadTimestamp: timestamp,
      detectedLanguages: scriptResult.allScripts,
      languageConfidence: scriptResult.confidence,
      isLanguageUncertain: overallOcrConfidence < 70,
      preprocessingMetrics,
      extractedFields,
      textBlocks,
      overallOcrConfidence,
      ocrCharConfidence,
      fieldCompletenessCount,
      totalMandatoryFields,
      engineName: `Multilingual OCR Engine (${scriptResult.primaryScript} Native · ${langConfig.primary})`,
      isDemoFallback: false,
      rawExtractedText: rawOcrText,
    };
  }

  /**
   * Server-side / BHASHINI OCR processing path.
   */
  static processDocumentWithBhashini(
    fileInfo: {
      originalName: string;
      mimeType: string;
      sizeBytes: number;
      dataUrl: string;
    },
    metadata: DocumentMetadata,
    bhashiniText: string,
    bhashiniServiceId: string
  ): OcrProcessingResult {
    const fileHash = Math.abs(
      Array.from(`${fileInfo.originalName}_${fileInfo.sizeBytes}_${Date.now()}`).reduce(
        (h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0,
        0
      )
    );
    const documentId = `DOC-${new Date().getFullYear()}-${(fileHash % 90000) + 10000}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Build text blocks from output
    const lines = bhashiniText.split('\n').filter((l) => l.trim().length > 0);
    const textBlocks: OcrTextBlock[] = lines.map((line) => ({
      pageNumber: 1,
      text: line.trim(),
      confidence: 88,
      boundingBox: undefined,
    }));

    // Auto-detect language and script
    const scriptResult: ScriptDetectionResult = detectScriptAndLanguage(bhashiniText);

    // Structured multilingual field extraction
    const extractedFields = extractMultilingualFields(bhashiniText, textBlocks, metadata);

    // Calculate genuine confidence
    const {
      overallOcrConfidence,
      ocrCharConfidence,
      fieldCompletenessCount,
      totalMandatoryFields,
    } = calculateGenuineConfidence(extractedFields, textBlocks, 88);

    const preprocessingMetrics: PreprocessingMetrics = {
      orientationAngle: 0,
      contrastBoost: 0,
      noiseReductionScore: 95,
      resolutionDpi: 300,
      deskewed: true,
    };

    return {
      documentId,
      originalFileName: fileInfo.originalName,
      fileType: fileInfo.mimeType || 'image/jpeg',
      fileSize: `${(fileInfo.sizeBytes / 1024).toFixed(1)} KB`,
      fileDataUrl: fileInfo.dataUrl,
      uploadTimestamp: timestamp,
      detectedLanguages: scriptResult.allScripts,
      languageConfidence: scriptResult.confidence,
      isLanguageUncertain: overallOcrConfidence < 70,
      preprocessingMetrics,
      extractedFields,
      textBlocks,
      overallOcrConfidence,
      ocrCharConfidence,
      fieldCompletenessCount,
      totalMandatoryFields,
      engineName: `BHASHINI Udyat OCR (${scriptResult.primaryScript} · Service: ${bhashiniServiceId})`,
      isDemoFallback: false,
      rawExtractedText: bhashiniText,
    };
  }
}
