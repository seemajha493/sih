import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';

const recognize = Tesseract.recognize || (Tesseract as any).default?.recognize;

async function testOcr() {
  const filePath = path.join(process.cwd(), 'uploads/1790536365828-686689522-WhatsApp Image 2026-09-27 at 23.20.05.jpeg');
  console.log('Testing OCR on:', filePath);

  console.log('\n--- 1. Testing with ben+eng ---');
  try {
    const res1 = await recognize(filePath, 'ben+eng', {
      logger: (m: any) => {
        if (m.status === 'downloading' || m.status === 'loading') {
          console.log(`[Tesseract] ${m.status} ${m.progress ? Math.round(m.progress * 100) + '%' : ''}`);
        }
      }
    });
    console.log('ben+eng Confidence:', res1.data.confidence);
    console.log('ben+eng Raw Text:\n', res1.data.text);
  } catch (err) {
    console.error('ben+eng error:', err);
  }

  console.log('\n--- 2. Testing with hin+eng (What server previously did) ---');
  try {
    const res2 = await recognize(filePath, 'hin+eng', { logger: () => {} });
    console.log('hin+eng Confidence:', res2.data.confidence);
    console.log('hin+eng Raw Text:\n', res2.data.text);
  } catch (err) {
    console.error('hin+eng error:', err);
  }
}

testOcr();
