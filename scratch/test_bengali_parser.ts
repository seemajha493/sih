import { transliterateToEnglish, normalizeIndicNumerals } from '../src/services/transliterationEngine';
import { OcrService } from '../src/services/ocrService';

const bengaliText = `
সা 5 Br CT ১ So
ফর্মনং-৬ pil (খতিয়ান/জমির নথি)
)। On
wom ল্লাণ 1
3 পশ্চিমবঙ্গ সরকার
4 ভূমি ও भूमि সংস্কার দপ্তর
জমির খতিয়ান
জেলা : নদীয়া (রাজস্ব রেকর্ডের অনুলিপি) মৌজা : বেলপুকুর
থানা : কোতোয়ালী গ্রাম : বেলপুকুর
খতিয়ান নং : ১২৩৪ তারিখ : ১৪/০৩/২০২৫
দাগ নং : ৫৬৭, ৫৬৮
মালিকের নাম : মহেশ চন্দ্র দাস
পিতার নাম : শ্রী হরিদাস দাস
ঠিকানা : বেলপুকুর, কৃষ্ণনগর, নদীয়া
জমির শ্রেণী : কৃষি জমি (ধান চাষের উপযোগী)
মোট জমির পরিমাণ: ১.২৫ একর (এক একর পঁচিশ শতক)
বর্তমান দখলদার : মহেশ চন্দ্র দাস
দাগ নং খতিয়ান নং se জমির শ্রেণী মন্তব্য
০.৭৫ একর
১.২৫ একর
নথি নং: ৪৫/২০২৫
`;

const res = OcrService.processDocumentWithBhashini(
  {
    originalName: 'WhatsApp Image 2026-09-27 at 23.20.05.jpeg',
    mimeType: 'image/jpeg',
    sizeBytes: 242199,
    dataUrl: 'data:image/jpeg;base64,...'
  },
  {
    language: 'AUTO',
    docType: 'Jamabandi (Record of Rights)'
  },
  bengaliText,
  'test-bengali-service'
);

console.log('Detected Languages:', res.detectedLanguages);
console.log('Overall Confidence:', res.overallOcrConfidence);
console.log('Extracted Fields:');
for (const f of res.extractedFields) {
  if (f.value) {
    console.log(`  ✓ ${f.fieldLabel} (${f.fieldName}): "${f.value}" [Conf: ${f.confidence}%] (Original: "${f.originalValue}")`);
  } else {
    console.log(`  ✗ ${f.fieldLabel} (${f.fieldName}): Not detected`);
  }
}
