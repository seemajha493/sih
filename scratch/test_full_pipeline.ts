import Tesseract from 'tesseract.js';
import path from 'path';
import { OcrService } from '../src/services/ocrService';
import { detectScriptAndLanguage } from '../src/services/transliterationEngine';

const recognize = Tesseract.recognize || (Tesseract as any).default?.recognize;

async function testFullBengaliPipeline() {
  const filePath = path.join(process.cwd(), 'uploads/1790536365828-686689522-WhatsApp Image 2026-09-27 at 23.20.05.jpeg');
  console.log('Testing full pipeline on:', filePath);

  // 1. OCR with ben+hin+eng
  const tesseractResult = await recognize(filePath, 'ben+hin+eng', { logger: () => {} });
  const rawText = tesseractResult.data.text;
  const ocrConfidence = Math.round(tesseractResult.data.confidence || 0);

  console.log('\n--- 1. OCR Raw Output ---');
  console.log('Text Length:', rawText.length);
  console.log('OCR Confidence:', ocrConfidence, '%');
  console.log('Text Sample:\n', rawText.substring(0, 300));

  // 2. Language / Script Detection
  const scriptRes = detectScriptAndLanguage(rawText);
  console.log('\n--- 2. Script & Language Detection ---');
  console.log('Primary Script:', scriptRes.primaryScript);
  console.log('Detected Language:', scriptRes.detectedLanguage);
  console.log('Confidence:', scriptRes.confidence, '%');
  console.log('All Scripts:', scriptRes.allScripts);

  // 3. Structured Field Extraction & English Normalization
  const ocrResult = OcrService.processDocumentWithBhashini(
    {
      originalName: 'WhatsApp Image 2026-09-27 at 23.20.05.jpeg',
      mimeType: 'image/jpeg',
      sizeBytes: 242199,
      dataUrl: 'data:image/jpeg;base64,...'
    },
    { language: 'AUTO', docType: 'Jamabandi' },
    rawText,
    'bengali-test'
  );

  console.log('\n--- 3. Extracted Structured English Fields ---');
  for (const f of ocrResult.extractedFields) {
    if (f.value) {
      console.log(`  ✓ ${f.fieldLabel.padEnd(35)} : "${f.value}" [Confidence: ${f.confidence}%] (Original: "${f.originalValue}")`);
    } else {
      console.log(`  ✗ ${f.fieldLabel.padEnd(35)} : Not detected`);
    }
  }
}

testFullBengaliPipeline();
