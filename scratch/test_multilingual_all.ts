import { OcrService } from '../src/services/ocrService';
import { extractMultilingualFields } from '../src/services/fieldExtractor';

console.log('=== MULTILINGUAL & URDU OCR TEST SUITE ===\n');

// 1. Urdu Land Record Document Text
const sampleUrduRecord = `
حکومت جموں و کشمیر
محکمہ مالیات - ریکارڈ آف رائٹس (جمابندی)
ضلع: اننت ناگ
تحصیل: بجبہاڑہ
موضع: بجبہاڑہ
کھاتہ نمبر: 142
کھیوٹ نمبر: 88
خسرہ نمبر: 742/12
نام مالک: محمد یوسف خان
ولد: غلام احمد خان
رقبہ: 3 کنال 12 مرلہ
نوعیت زمین: زرعی
سال: 2024
`;

console.log('--- TEST 1: URDU RECORD PROCESSING ---');
const urduResult = OcrService.processDocumentWithBhashini(
  {
    originalName: 'jamabandi_urdu_scan.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 250000,
    dataUrl: 'data:image/jpeg;base64,sample'
  },
  {
    language: 'URDU',
    state: 'Jammu and Kashmir',
    district: '',
    tehsil: '',
    village: '',
    recordYear: '',
    docType: 'Jamabandi'
  },
  sampleUrduRecord,
  'test-engine'
);

console.log('Detected Scripts:', urduResult.detectedLanguages);

console.log('Extracted Urdu Fields:');
urduResult.extractedFields.forEach(f => {
  if (f.value) {
    console.log(`  ✓ ${f.fieldLabel}: "${f.value}" (Original: "${f.originalValue}", Translit: "${f.transliteratedValue || 'N/A'}", RTL: ${f.isRtl || false}, Conf: ${f.confidence}%)`);
  } else {
    console.log(`  ✗ ${f.fieldLabel}: Not detected`);
  }
});

// Check Owner Name preservation and RTL
const ownerField = urduResult.extractedFields.find(f => f.fieldName === 'ownerName');
console.log('\nUrdu Owner Name Check:');
console.log('  Value preserved:', ownerField?.value);
console.log('  isRtl is true:', ownerField?.isRtl === true);
console.log('  Transliteration available:', ownerField?.transliteratedValue);

// 2. Test Low Completeness / 4 Fields Only (Simulating the issue reported by user)
console.log('\n--- TEST 2: LOW FIELD COMPLETENESS CONFIDENCE SCORING (4/17 fields) ---');
const sparseUrduText = `
خسرہ نمبر: 104
نام مالک: طارق مسعود
ضلع: پونچھ
سال: 2023
`;
const sparseResult = OcrService.processDocumentWithBhashini(
  {
    originalName: 'sparse_urdu_scan.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 150000,
    dataUrl: 'data:image/jpeg;base64,sample'
  },
  {
    language: 'URDU',
    state: 'Jammu and Kashmir',
    district: '',
    tehsil: '',
    village: '',
    recordYear: '',
    docType: 'Jamabandi'
  },
  sparseUrduText,
  'test-engine'
);

console.log('Sparse Document Metrics:');
console.log('  Raw OCR text confidence:', sparseResult.ocrCharConfidence + '%');
console.log('  Identified fields count:', `${sparseResult.fieldCompletenessCount} / ${sparseResult.totalMandatoryFields}`);
console.log('  Overall composite confidence:', sparseResult.overallOcrConfidence + '%');
console.log('  Overall is <= 50% (NOT fake 88%):', sparseResult.overallOcrConfidence <= 50);

// 3. Marathi / Devanagari Record
console.log('\n--- TEST 3: MARATHI (7/12 & 8A) RECORD ---');
const marathiRecord = `
महाराष्ट्र शासन - महसूल व वन विभाग
गाव नमुना ७/१२ (अधिकार अभिलेख पत्रक)
जिल्हा : पुणे
तालुका : हवेली
गाव : बावधन
गट क्र./सर्व्हे क्र. : २३४/१
खाते क्र. : ७८९
भूधारणा पद्धती : भोगवटादार वर्ग - १
खातेदाराचे नाव : रमेश विष्णू जोशी
क्षेत्र : ०.४०.५० हेक्टर
आकारणी : १२.५०
`;
const marathiFields = extractMultilingualFields(marathiRecord, [], {
  language: 'MARATHI',
  state: 'Maharashtra',
  district: '',
  tehsil: '',
  village: '',
  recordYear: '',
  docType: '7/12'
});
console.log('Extracted Marathi Fields:');
marathiFields.filter(f => f.value).forEach(f => {
  console.log(`  ✓ ${f.fieldLabel}: "${f.value}" (Original: "${f.originalValue || f.value}")`);
});

// 4. Assamese Record
console.log('\n--- TEST 4: ASSAMESE (Jamabandi / Dharitree) RECORD ---');
const assameseRecord = `
অসম চৰকাৰ - ৰাজহ আৰু দুৰ্যোগ ব্যৱস্থাপনা বিভাগ
জমাবন্দী (ROR)
জিলা : কামৰূপ
চক্ৰ : পলাশবাৰী
মৌজা : ৰামপুৰ
গাওঁ : বিজয়নগৰ
দাগ নং : ১২৮
পট্টা নং : ৪৫
পট্টাদাৰৰ নাম : প্ৰণৱ জ্যোতি কলিতা
পিতাৰ নাম : ৰামেন কলিতা
কালি : ২ বিঘা ৩ কঠা
`;
const assameseFields = extractMultilingualFields(assameseRecord, [], {
  language: 'ASSAMESE',
  state: 'Assam',
  district: '',
  tehsil: '',
  village: '',
  recordYear: '',
  docType: 'Jamabandi'
});
console.log('Extracted Assamese Fields:');
assameseFields.filter(f => f.value).forEach(f => {
  console.log(`  ✓ ${f.fieldLabel}: "${f.value}" (Original: "${f.originalValue || f.value}")`);
});

// 5. Hindi (UP/Bihar/Rajasthan) Record
console.log('\n--- TEST 5: HINDI (Khatauni / Bhulekh) RECORD ---');
const hindiRecord = `
उत्तर प्रदेश राजस्व परिषद - खतौनी (अधिकार अभिलेख)
जनपद : वाराणसी
तहसील : पिण्डरा
ग्राम : करखियाव
खाता संख्या : 00124
खसरा संख्या : 452, 453
खातेदार का नाम : राजेश कुमार सिंह
पिता का नाम : श्री सूर्यभान सिंह
क्षेत्रफल : 0.8500 हेक्टेयर
भूमि श्रेणी : कृषि भूमि
`;
const hindiFields = extractMultilingualFields(hindiRecord, [], {
  language: 'HINDI',
  state: 'Uttar Pradesh',
  district: '',
  tehsil: '',
  village: '',
  recordYear: '',
  docType: 'Khatauni'
});
console.log('Extracted Hindi Fields:');
hindiFields.filter(f => f.value).forEach(f => {
  console.log(`  ✓ ${f.fieldLabel}: "${f.value}" (Original: "${f.originalValue || f.value}")`);
});

console.log('\n=== ALL MULTILINGUAL TESTS EXECUTED SUCCESSFULLY ===');
