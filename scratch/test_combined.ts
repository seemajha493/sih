import Tesseract from 'tesseract.js';
import path from 'path';

const recognize = Tesseract.recognize || (Tesseract as any).default?.recognize;

async function testCombined() {
  const filePath = path.join(process.cwd(), 'uploads/1790536365828-686689522-WhatsApp Image 2026-09-27 at 23.20.05.jpeg');
  console.log('Testing combined ben+hin+eng on Bengali document:');
  const res = await recognize(filePath, 'ben+hin+eng', { logger: () => {} });
  console.log('Confidence:', res.data.confidence);
  console.log('Text preview:\n', res.data.text.substring(0, 500));
}

testCombined();
