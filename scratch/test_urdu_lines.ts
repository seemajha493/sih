import Tesseract from 'tesseract.js';
import path from 'path';
import { extractMultilingualFields } from '../src/services/fieldExtractor';
import { OcrService } from '../src/services/ocrService';

async function inspectText() {
  const filePath = path.join(process.cwd(), 'uploads', '1790580576462-485997656-WhatsApp Image 2026-09-28 at 12.57.13.jpeg');
  console.log('Loading file:', filePath);
  
  const worker = await Tesseract.createWorker(['urd', 'eng']);
  const res = await worker.recognize(filePath);
  await worker.terminate();

  console.log('--- OCR RAW TEXT ---');
  console.log(res.data.text);
  console.log('\n--- OCR CONFIDENCE ---', res.data.confidence);

  const lines = res.data.text.split('\n').filter(l => l.trim().length > 0);
  console.log('\n--- EXTRACTED LINES (Total: ' + lines.length + ') ---');
  lines.forEach((l, i) => console.log(`[${i}] ${l.trim()}`));

  const textBlocks = lines.map(l => ({
    pageNumber: 1,
    text: l.trim(),
    confidence: 80
  }));

  const fields = extractMultilingualFields(res.data.text, textBlocks, {
    language: 'URDU',
    docType: 'Jamabandi'
  });

  console.log('\n--- EXTRACTED FIELDS ---');
  fields.forEach(f => {
    console.log(`[${f.fieldName}] ${f.fieldLabel}: "${f.value}" (Conf: ${f.confidence}%, RTL: ${f.isRtl || false}, Orig: "${f.originalValue || ''}")`);
  });
}

inspectText();
