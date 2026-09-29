/**
 * Transliteration & Multilingual Indic Script Normalization Engine
 * 
 * Supports:
 * - English, Hindi, Bengali, Assamese, Urdu, Tamil, Telugu, Marathi,
 *   Gujarati, Punjabi, Kannada, Malayalam, Odia.
 * - Automatic script & language detection via Unicode ranges.
 * - Complete normalization of all Indic & Arabic numerals to standard 0-9.
 * - Phonetic Romanization / Transliteration of person & place names.
 * - English normalization of revenue terminology (Land Type, Units, Offices).
 */

export interface ScriptDetectionResult {
  primaryScript: string;
  detectedLanguage: string;
  confidence: number;
  allScripts: string[];
}

// ─── 1. Universal Numeral Normalization ──────────────────────────────────────

const NUMERAL_MAPS: Record<string, string> = {
  // Devanagari (Hindi, Marathi)
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  // Bengali / Assamese
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  // Eastern Arabic / Persian / Urdu
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  // Arabic Standard
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  // Gujarati
  '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4', '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
  // Gurmukhi (Punjabi)
  '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4', '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9',
  // Odia
  '୦': '0', '୧': '1', '୨': '2', '୩': '3', '୪': '4', '୫': '5', '୬': '6', '୭': '7', '୮': '8', '୯': '9',
  // Tamil
  '௦': '0', '௧': '1', '௨': '2', '௩': '3', '௪': '4', '௫': '5', '௬': '6', '௭': '7', '௮': '8', '௯': '9',
  // Telugu
  '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4', '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9',
  // Kannada
  '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4', '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
  // Malayalam
  '൦': '0', '൧': '1', '൨': '2', '൩': '3', '൪': '4', '൫': '5', '൬': '6', '൭': '7', '൮': '8', '൯': '9',
};

/**
 * Replaces any Indic / Arabic numerals with ASCII 0-9 digits.
 */
export function normalizeIndicNumerals(input: string): string {
  if (!input) return '';
  let result = '';
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    result += NUMERAL_MAPS[char] !== undefined ? NUMERAL_MAPS[char] : char;
  }
  return result;
}

// ─── 2. Automatic Script & Language Detection ───────────────────────────────

export function detectScriptAndLanguage(text: string): ScriptDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      primaryScript: 'Latin',
      detectedLanguage: 'English',
      confidence: 100,
      allScripts: ['Latin (English)']
    };
  }

  const counts: Record<string, number> = {
    Devanagari: 0,
    Bengali: 0,
    Urdu: 0,
    Tamil: 0,
    Telugu: 0,
    Gujarati: 0,
    Gurmukhi: 0,
    Kannada: 0,
    Malayalam: 0,
    Odia: 0,
    Latin: 0,
  };

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x0900 && code <= 0x097F) counts.Devanagari++;
    else if (code >= 0x0980 && code <= 0x09FF) counts.Bengali++;
    else if ((code >= 0x0600 && code <= 0x06FF) || (code >= 0xFB50 && code <= 0xFDFF) || (code >= 0xFE70 && code <= 0xFEFF)) counts.Urdu++;
    else if (code >= 0x0B80 && code <= 0x0BFF) counts.Tamil++;
    else if (code >= 0x0C00 && code <= 0x0C7F) counts.Telugu++;
    else if (code >= 0x0A80 && code <= 0x0AFF) counts.Gujarati++;
    else if (code >= 0x0A00 && code <= 0x0A7F) counts.Gurmukhi++;
    else if (code >= 0x0C80 && code <= 0x0CFF) counts.Kannada++;
    else if (code >= 0x0D00 && code <= 0x0D7F) counts.Malayalam++;
    else if (code >= 0x0B00 && code <= 0x0B7F) counts.Odia++;
    else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) counts.Latin++;
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0];
  const totalScriptChars = Object.values(counts).reduce((a, b) => a + b, 0);

  const scriptToLang: Record<string, string> = {
    Devanagari: 'Hindi / Marathi',
    Bengali: 'Bengali / Assamese',
    Urdu: 'Urdu',
    Tamil: 'Tamil',
    Telugu: 'Telugu',
    Gujarati: 'Gujarati',
    Gurmukhi: 'Punjabi',
    Kannada: 'Kannada',
    Malayalam: 'Malayalam',
    Odia: 'Odia',
    Latin: 'English',
  };

  const detectedLanguage = scriptToLang[primary[0]] || 'English';
  const confidence = totalScriptChars > 0 ? Math.min(Math.round((primary[1] / totalScriptChars) * 100), 99) : 85;

  const allScripts = sorted
    .filter(([_, count]) => count > 0)
    .map(([script]) => `${script} (${scriptToLang[script] || script})`);

  return {
    primaryScript: primary[0],
    detectedLanguage,
    confidence: confidence || 85,
    allScripts: allScripts.length > 0 ? allScripts : ['English (Latin)']
  };
}

// ─── 3. Comprehensive Indian Name & Word Dictionary ─────────────────────────

const FREQUENT_NAMES_DICTIONARY: Record<string, string> = {
  // Hindi / Devanagari Common Names & Surnames
  'राहुल': 'Rahul',
  'कुमार': 'Kumar',
  'मोहन': 'Mohan',
  'प्रसाद': 'Prasad',
  'रामेश्वर': 'Rameshwar',
  'शिवदयाल': 'Shivdayal',
  'सुरेश': 'Suresh',
  'रमेश': 'Ramesh',
  'महेश': 'Mahesh',
  'दिनेश': 'Dinesh',
  'राजेश': 'Rajesh',
  'मुकेश': 'Mukesh',
  'संजय': 'Sanjay',
  'अजय': 'Ajay',
  'विजय': 'Vijay',
  'अनिल': 'Anil',
  'सुनील': 'Sunil',
  'अमित': 'Amit',
  'सुमित': 'Sumit',
  'रोहित': 'Rohit',
  'विकास': 'Vikas',
  'आलोक': 'Alok',
  'दीपक': 'Deepak',
  'मनोज': 'Manoj',
  'विनोद': 'Vinod',
  'राकेश': 'Rakesh',
  'अशोक': 'Ashok',
  'संतोष': 'Santosh',
  'पवन': 'Pawan',
  'रवि': 'Ravi',
  'सोनू': 'Sonu',
  'मोनू': 'Monu',
  'गोपाल': 'Gopal',
  'कृष्णा': 'Krishna',
  'राम': 'Ram',
  'श्याम': 'Shyam',
  'हरि': 'Hari',
  'ओम': 'Om',
  'प्रकाश': 'Prakash',
  'चन्द्र': 'Chandra',
  'सिंह': 'Singh',
  'शर्मा': 'Sharma',
  'वर्मा': 'Varma',
  'गुप्ता': 'Gupta',
  'यादव': 'Yadav',
  'चौधरी': 'Choudhary',
  'महतो': 'Mahto',
  'मिश्रा': 'Mishra',
  'पांडेय': 'Pandey',
  'तिवारी': 'Tiwari',
  'दुबे': 'Dubey',
  'शुक्ला': 'Shukla',
  'त्रिपाठी': 'Tripathi',
  'झा': 'Jha',
  'ठाकुर': 'Thakur',
  'पासवान': 'Paswan',
  'मांझी': 'Manjhi',
  'पटेल': 'Patel',
  'रेड्डी': 'Reddy',
  'नायर': 'Nair',
  'गौड़ा': 'Gowda',
  'देवी': 'Devi',
  'कुमारी': 'Kumari',
  'बेगम': 'Begum',
  'खातून': 'Khatoon',
  'सुनीता': 'Sunita',
  'अनिता': 'Anita',
  'गीता': 'Geeta',
  'सीता': 'Sita',
  'राधा': 'Radha',
  'माया': 'Maya',
  'रेखा': 'Rekha',
  'पूजा': 'Pooja',

  // Bengali / Assamese Names
  'মহেশ': 'Mahesh',
  'চন্দ্র': 'Chandra',
  'দাস': 'Das',
  'সুভাষ': 'Subhash',
  'বসু': 'Bose',
  'অরুণ': 'Arun',
  'বিমল': 'Bimal',
  'নির্মল': 'Nirmal',
  'স্বপন': 'Swapan',
  'রতন': 'Ratan',
  'প্রদীপ': 'Pradip',
  'অলোক': 'Alok',
  'উত্তম': 'Uttam',
  'তপন': 'Tapan',
  'গোপাল': 'Gopal',
  'কমল': 'Kamal',
  'অমল': 'Amal',
  'সুশীল': 'Sushil',
  'শ্যামল': 'Shyamal',
  'দেবাশীষ': 'Debashis',
  'সঞ্জয়': 'Sanjay',
  'অনিল': 'Anil',
  'মুখার্জি': 'Mukherjee',
  'ব্যানার্জি': 'Banerjee',
  'চ্যাটার্জি': 'Chatterjee',
  'ঘোষ': 'Ghosh',
  'দত্ত': 'Dutta',
  'সেন': 'Sen',
  'রায়': 'Roy',
  'বিশ্বাস': 'Biswas',
  'সরকার': 'Sarkar',
  'মজুমদার': 'Majumdar',
  'চৌধুরী': 'Chowdhury',
  'মণ্ডল': 'Mondal',
  'হালদার': 'Haldar',
  'পাল': 'Paul',
  'দে': 'Dey',
  'হরিদাস': 'Haridas',
  'শ্রী': 'Shri',
  'নদীয়া': 'Nadia',
  'বেলপুকুর': 'Belpukur',
  'কৃষ্ণনগর': 'Krishnanagar',
  'কোতোয়ালী': 'Kotwali',
  'আলী': 'Ali',
  'খান': 'Khan',
  'রহমান': 'Rahman',
  'আহমেদ': 'Ahmed',

  // Urdu / Arabic Names
  'محمد': 'Mohammad',
  'علی': 'Ali',
  'خان': 'Khan',
  'احمد': 'Ahmed',
  'حسن': 'Hassan',
  'حسین': 'Hussain',
  'غلام': 'Ghulam',
  'رسول': 'Rasool',
  'شیر': 'Sher',
  'عبد': 'Abdul',
  'رحیم': 'Rahim',
  'کریم': 'Karim',
  'طارق': 'Tariq',
  'اسلم': 'Aslam',
  'اقبال': 'Iqbal',
  'انور': 'Anwar',
  'اکرم': 'Akram',
  'شہزاد': 'Shehzad',
  'فاروق': 'Farooq',
  'بلال': 'Bilal',
  'عمر': 'Umar',
  'عثمان': 'Usman',
  'سید': 'Syed',
  'شیخ': 'Sheikh',
  'قریشی': 'Qureshi',
  'انصاری': 'Ansari',
  'ملک': 'Malik',
  'چودھری': 'Chaudhry',
  'صدیقی': 'Siddiqui',
  'بیگم': 'Begum',
  'فاطمہ': 'Fatima',
  'عائشہ': 'Ayesha',
  'مریم': 'Maryam',
  'زینب': 'Zainab',

  // Gujarati Names
  'દિનેશ': 'Dinesh',
  'શાહ': 'Shah',
  'હરેશ': 'Haresh',
  'નરેશ': 'Naresh',
  'જયેશ': 'Jayesh',
  'હિતેશ': 'Hitesh',
  'ભાવેશ': 'Bhavesh',
  'મેહુલ': 'Mehul',
  'જીતેન્દ્ર': 'Jitendra',
  'મહેન્દ્ર': 'Mahendra',
  'પરમાર': 'Parmar',
  'સોલંકી': 'Solanki',
  'વાઘેલા': 'Vaghela',
  'ચૌહાણ': 'Chauhan',
  'દેસાઈ': 'Desai',
  'જોશી': 'Joshi',
  'મહેતા': 'Mehta',

  // Punjabi / Gurmukhi Names
  'ਗੁਰਪ੍ਰੀਤ': 'Gurpreet',
  'ਹਰਜੀਤ': 'Harjit',
  'ਮਨਪ੍ਰੀਤ': 'Manpreet',
  'ਕੁਲਦੀਪ': 'Kuldeep',
  'ਜਸਵਿੰਦਰ': 'Jaswinder',
  'ਸਰਬਜੀਤ': 'Sarbjit',
  'ਜਗਤਾਰ': 'Jagtar',
  'ਸਤਨਾਮ': 'Satnam',
  'ਬਲਵਿੰਦਰ': 'Balwinder',
  'ਹਰਪ੍ਰੀਤ': 'Harpreet',
  'ਸਿੰਘ': 'Singh',
  'ਕੌਰ': 'Kaur',
  'ਢਿੱਲੋਂ': 'Dhillon',
  'ਸੰਧੂ': 'Sandhu',
  'ਗਿੱਲ': 'Gill',
  'ਸਿੱਧੂ': 'Sidhu',
  'ਗਰੇਵਾਲ': 'Grewal',

  // Tamil Names
  'முத்துவேல்': 'Muthuvel',
  'செல்வம்': 'Selvam',
  'முருகன்': 'Murugan',
  'கார்த்திக்': 'Karthik',
  'சுரேஷ்': 'Suresh',
  'ரமேஷ்': 'Ramesh',
  'சரவணன்': 'Saravanan',
  'குமார்': 'Kumar',
  'கண்ணன்': 'Kannan',
  'மணி': 'Mani',
  'ராஜா': 'Raja',
  'சுந்தரம்': 'Sundaram',

  // Telugu Names
  'రాజేష్': 'Rajesh',
  'వర్మ': 'Varma',
  'వెంకటేశ్వర': 'Venkateswara',
  'రావు': 'Rao',
  'శ్రీనివాస్': 'Srinivas',
  'రాము': 'Ramu',
  'కృష్ణ': 'Krishna',
  'నాయుడు': 'Naidu',
  'చౌదరి': 'Chowdary',
  'రెడ్డి': 'Reddy',

  // Kannada Names
  'ಗೌಡ': 'Gowda',
  'ಬಸವರಾಜ್': 'Basavaraj',
  'ಮಂಜುನಾಥ್': 'Manjunath',
  'ಶೆಟ್ಟಿ': 'Shetty',
  'ಹೆಗಡೆ': 'Hegde',
  'ಕುಮಾರ್': 'Kumar',

  // Malayalam Names
  'നായർ': 'Nair',
  'മേനോൻ': 'Menon',
  'പിള്ള': 'Pillai',
  'വർമ്മ': 'Varma',
  'കുറുപ്പ്': 'Kurup',

  // Odia Names
  'ପଟ୍ଟନାୟକ': 'Patnaik',
  'ମହାପାତ୍ର': 'Mohapatra',
  'ଷଡ଼ଙ୍ଗୀ': 'Sarangi',
  'ଦାସ': 'Das',
  'ମିଶ୍ର': 'Mishra',
  'ସାହୁ': 'Sahu',
  'ପ୍ରଧାନ': 'Pradhan',
  'ରାଉତ': 'Rout',
  'ବେହେରା': 'Behera',
  'ଜେନା': 'Jena',

  // Common Places
  'रामपुर': 'Rampur',
  'किशनपुरा': 'Kishanpura',
  'दानापुर': 'Danapur',
  'पटना': 'Patna',
  'सदर': 'Sadar',
  'सीतापुर': 'Sitapur',
  'महोली': 'Maholi',
  'जयपुर': 'Jaipur',
  'सांगानेर': 'Sanganer',
  'लखनऊ': 'Lucknow',
  'वाराणसी': 'Varanasi',
  'कोलकाता': 'Kolkata',
  'কলকাতা': 'Kolkata',
  'বর্ধমান': 'Bardhaman',
  'হাওড়া': 'Howrah',
  'মেদিনীপুর': 'Medinipur',
  'মুর্শিদাবাদ': 'Murshidabad',
  'ঢাকা': 'Dhaka',
  'চেন্নাই': 'Chennai',
  'மதுரை': 'Madurai',
  'ஹைதராபாத்': 'Hyderabad',
  'హైదరాబాద్': 'Hyderabad',
  'బెంగళూరు': 'Bengaluru',
  'ಬೆಂಗಳೂರು': 'Bengaluru',
  'અમદાવાદ': 'Ahmedabad',
  'સુરત': 'Surat',
  'પટના': 'Patna',
  'লাহোর': 'Lahore',
  'کراچی': 'Karachi',
  'کشمیر': 'Kashmir',
  'ساہوال': 'Sahiwal',
  'ساہیوال': 'Sahiwal',
  'ملتان': 'Multan',
  'فیصل': 'Faisal',
  'آباد': 'Abad',
  'سرگودھا': 'Sargodha',
  'گوجرانوالہ': 'Gujranwala',
  'سیالکوٹ': 'Sialkot',
  'قصور': 'Kasur',
  'جھنگ': 'Jhang',
  'بہاولپور': 'Bahawalpur',
  'گجرات': 'Gujrat',
  'فاقل': 'Faqil',
  'اعد': 'Asad',
};

// ─── 4. Phonetic Indic Transliteration Table ────────────────────────────────

interface ScriptTable {
  vowels: Record<string, string>;
  matras: Record<string, string>;
  consonants: Record<string, string>;
  halant: string;
  anusvara: string[];
  visarga: string;
}

const DEVANAGARI_TABLE: ScriptTable = {
  halant: '्',
  anusvara: ['ं', 'ँ'],
  visarga: 'ः',
  vowels: {
    'अ': 'A', 'आ': 'Aa', 'इ': 'I', 'ई': 'Ee', 'उ': 'U', 'ऊ': 'Oo', 'ऋ': 'Ri',
    'ए': 'E', 'ऐ': 'Ai', 'ओ': 'O', 'औ': 'Au',
  },
  matras: {
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
    'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
  },
  consonants: {
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy', 'श्र': 'shr',
    'ड़': 'r', 'ढ़': 'rh', 'ज़': 'z', 'फ़': 'f', 'ख़': 'kh', 'ग़': 'gh', 'क़': 'q',
  }
};

const BENGALI_TABLE: ScriptTable = {
  halant: '্',
  anusvara: ['ং', 'ঁ'],
  visarga: 'ঃ',
  vowels: {
    'অ': 'A', 'আ': 'Aa', 'ই': 'I', 'ঈ': 'Ee', 'উ': 'U', 'ঊ': 'Oo', 'ঋ': 'Ri',
    'এ': 'E', 'ঐ': 'Oi', 'ও': 'O', 'ঔ': 'Ou',
  },
  matras: {
    'া': 'a', 'ি': 'i', 'ী': 'ee', 'ু': 'u', 'ূ': 'oo', 'ৃ': 'ri',
    'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
  },
  consonants: {
    'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
    'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'ny',
    'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
    'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
    'প': 'p', 'ফ': 'ph', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
    'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
    'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't', 'ৰ': 'r', 'ৱ': 'w',
  }
};

const GUJARATI_TABLE: ScriptTable = {
  halant: '્',
  anusvara: ['ં', 'ઁ'],
  visarga: 'ઃ',
  vowels: {
    'અ': 'A', 'આ': 'Aa', 'ઇ': 'I', 'ઈ': 'Ee', 'ઉ': 'U', 'ઊ': 'Oo', 'ઋ': 'Ri',
    'એ': 'E', 'ઐ': 'Ai', 'ઓ': 'O', 'ઔ': 'Au',
  },
  matras: {
    'ા': 'a', 'િ': 'i', 'ી': 'ee', 'ુ': 'u', 'ૂ': 'oo', 'ૃ': 'ri',
    'ે': 'e', 'ૈ': 'ai', 'ો': 'o', 'ૌ': 'au',
  },
  consonants: {
    'ક': 'k', 'ખ': 'kh', 'ગ': 'g', 'ઘ': 'gh', 'ઙ': 'ng',
    'ચ': 'ch', 'છ': 'chh', 'જ': 'j', 'ઝ': 'jh', 'ઞ': 'ny',
    'ટ': 't', 'ઠ': 'th', 'ડ': 'd', 'ઢ': 'dh', 'ણ': 'n',
    'ત': 't', 'થ': 'th', 'દ': 'd', 'ધ': 'dh', 'ન': 'n',
    'પ': 'p', 'ફ': 'ph', 'બ': 'b', 'ભ': 'bh', 'મ': 'm',
    'ય': 'y', 'ર': 'r', 'લ': 'l', 'વ': 'v', 'શ': 'sh', 'ષ': 'sh', 'સ': 's', 'હ': 'h',
    'ળ': 'l',
  }
};

const GURMUKHI_TABLE: ScriptTable = {
  halant: '੍',
  anusvara: ['ਂ', 'ੰ'],
  visarga: 'ਃ',
  vowels: {
    'ਅ': 'A', 'ਆ': 'Aa', 'ਇ': 'I', 'ਈ': 'Ee', 'ਉ': 'U', 'ਊ': 'Oo',
    'ਏ': 'E', 'ਐ': 'Ai', 'ਓ': 'O', 'ਔ': 'Au',
  },
  matras: {
    'ਾ': 'a', 'ਿ': 'i', 'ੀ': 'ee', 'ੁ': 'u', 'ੂ': 'oo',
    'ੇ': 'e', 'ੈ': 'ai', 'ੋ': 'o', 'ੌ': 'au',
  },
  consonants: {
    'ਕ': 'k', 'ਖ': 'kh', 'ਗ': 'g', 'ਘ': 'gh', 'ਙ': 'ng',
    'ਚ': 'ch', 'ਛ': 'chh', 'ਜ': 'j', 'ਝ': 'jh', 'ਞ': 'ny',
    'ਟ': 't', 'ਠ': 'th', 'ਡ': 'd', 'ਢ': 'dh', 'ਣ': 'n',
    'ਤ': 't', 'ਥ': 'th', 'ਦ': 'd', 'ਧ': 'dh', 'ਨ': 'n',
    'ਪ': 'p', 'ਫ': 'ph', 'ਬ': 'b', 'ਭ': 'bh', 'ਮ': 'm',
    'ਯ': 'y', 'ਰ': 'r', 'ਲ': 'l', 'ਵ': 'v', 'ਸ਼': 'sh', 'ਸ': 's', 'ਹ': 'h',
    'ੜ': 'r', 'ਜ਼': 'z', 'ਫ਼': 'f',
  }
};

const TAMIL_TABLE: ScriptTable = {
  halant: '்',
  anusvara: [],
  visarga: 'ஃ',
  vowels: {
    'அ': 'A', 'ஆ': 'Aa', 'இ': 'I', 'ஈ': 'Ee', 'உ': 'U', 'ஊ': 'Oo',
    'எ': 'E', 'ஏ': 'E', 'ஐ': 'Ai', 'ஒ': 'O', 'ஓ': 'O', 'ஔ': 'Au',
  },
  matras: {
    'ா': 'a', 'ி': 'i', 'ீ': 'ee', 'ு': 'u', 'ூ': 'oo',
    'ெ': 'e', 'ே': 'e', 'ை': 'ai', 'ொ': 'o', 'ோ': 'o', 'ௌ': 'au',
  },
  consonants: {
    'க': 'k', 'ங': 'ng', 'ச': 'ch', 'ஞ': 'ny', 'ட': 't', 'ண': 'n',
    'த': 'th', 'ந': 'n', 'ப': 'p', 'ம': 'm', 'ய': 'y', 'ர': 'r',
    'ல': 'l', 'வ': 'v', 'ழ': 'zh', 'ள': 'l', 'ற': 'r', 'ன': 'n',
    'ஜ': 'j', 'ஷ': 'sh', 'ஸ': 's', 'ஹ': 'h', 'க்ஷ': 'ksh',
  }
};

const TELUGU_TABLE: ScriptTable = {
  halant: '్',
  anusvara: ['ం'],
  visarga: 'ః',
  vowels: {
    'అ': 'A', 'ఆ': 'Aa', 'ఇ': 'I', 'ఈ': 'Ee', 'ఉ': 'U', 'ఊ': 'Oo', 'ఋ': 'Ri',
    'ఎ': 'E', 'ఏ': 'E', 'ఐ': 'Ai', 'ఒ': 'O', 'ఓ': 'O', 'ఔ': 'Au',
  },
  matras: {
    'ా': 'a', 'ి': 'i', 'ీ': 'ee', 'ు': 'u', 'ూ': 'oo', 'ృ': 'ri',
    'ె': 'e', 'ే': 'e', 'ై': 'ai', 'ొ': 'o', 'ో': 'o', 'ౌ': 'au',
  },
  consonants: {
    'క': 'k', 'ఖ': 'kh', 'గ': 'g', 'ఘ': 'gh', 'ఙ': 'ng',
    'చ': 'ch', 'ఛ': 'chh', 'జ': 'j', 'ఝ': 'jh', 'ఞ': 'ny',
    'ట': 't', 'ఠ': 'th', 'డ': 'd', 'ఢ': 'dh', 'ణ': 'n',
    'త': 't', 'థ': 'th', 'ద': 'd', 'ధ': 'dh', 'న': 'n',
    'ప': 'p', 'ఫ': 'ph', 'బ': 'b', 'భ': 'bh', 'మ': 'm',
    'య': 'y', 'ర': 'r', 'ల': 'l', 'వ': 'v', 'శ': 'sh', 'ష': 'sh', 'స': 's', 'హ': 'h',
    'ళ': 'l',
  }
};

const KANNADA_TABLE: ScriptTable = {
  halant: '್',
  anusvara: ['ಂ'],
  visarga: 'ಃ',
  vowels: {
    'ಅ': 'A', 'ಆ': 'Aa', 'ಇ': 'I', 'ಈ': 'Ee', 'ಉ': 'U', 'ಊ': 'Oo', 'ಋ': 'Ri',
    'ಎ': 'E', 'ಏ': 'E', 'ಐ': 'Ai', 'ಒ': 'O', 'ಓ': 'O', 'ಔ': 'Au',
  },
  matras: {
    'ಾ': 'a', 'ಿ': 'i', 'ೀ': 'ee', 'ು': 'u', 'ೂ': 'oo', 'ೃ': 'ri',
    'ೆ': 'e', 'ೇ': 'e', 'ೈ': 'ai', 'ೊ': 'o', 'ೋ': 'o', 'ೌ': 'au',
  },
  consonants: {
    'ಕ': 'k', 'ಖ': 'kh', 'ಗ': 'g', 'ಘ': 'gh', 'ಙ': 'ng',
    'ಚ': 'ch', 'ಛ': 'chh', 'ಜ': 'j', 'ಝ': 'jh', 'ಞ': 'ny',
    'ಟ': 't', 'ಠ': 'th', 'ಡ': 'd', 'ಢ': 'dh', 'ಣ': 'n',
    'ತ': 't', 'ಥ': 'th', 'ದ': 'd', 'ಧ': 'dh', 'ನ': 'n',
    'ಪ': 'p', 'ಫ': 'ph', 'ಬ': 'b', 'ಭ': 'bh', 'ಮ': 'm',
    'ಯ': 'y', 'ರ': 'r', 'ಲ': 'l', 'ವ': 'v', 'ಶ': 'sh', 'ಷ': 'sh', 'ಸ': 's', 'ಹ': 'h',
    'ಳ': 'l',
  }
};

const MALAYALAM_TABLE: ScriptTable = {
  halant: '്',
  anusvara: ['ം'],
  visarga: 'ഃ',
  vowels: {
    'അ': 'A', 'ആ': 'Aa', 'ഇ': 'I', 'ഈ': 'Ee', 'ഉ': 'U', 'ഊ': 'Oo', 'ഋ': 'Ri',
    'എ': 'E', 'ഏ': 'E', 'ഐ': 'Ai', 'ഒ': 'O', 'ഓ': 'O', 'ഔ': 'Au',
  },
  matras: {
    'ാ': 'a', 'ി': 'i', 'ീ': 'ee', 'ു': 'u', 'ൂ': 'oo', 'ൃ': 'ri',
    'െ': 'e', 'േ': 'e', 'ൈ': 'ai', 'ൊ': 'o', 'ോ': 'o', 'ൌ': 'au',
  },
  consonants: {
    'ക': 'k', 'ഖ': 'kh', 'ഗ': 'g', 'ഘ': 'gh', 'ങ': 'ng',
    'ച': 'ch', 'ഛ': 'chh', 'ജ': 'j', 'ഝ': 'jh', 'ഞ': 'ny',
    'ട': 't', 'ഠ': 'th', 'ഡ': 'd', 'ഢ': 'dh', 'ണ': 'n',
    'ത': 't', 'ഥ': 'th', 'ദ': 'd', 'ധ': 'dh', 'ന': 'n',
    'പ': 'p', 'ഫ': 'ph', 'ബ': 'b', 'ഭ': 'bh', 'മ': 'm',
    'യ': 'y', 'ര': 'r', 'ല': 'l', 'വ': 'v', 'ശ': 'sh', 'ഷ': 'sh', 'സ': 's', 'ഹ': 'h',
    'ള': 'l', 'ഴ': 'zh', 'റ': 'r',
  }
};

const ODIA_TABLE: ScriptTable = {
  halant: '୍',
  anusvara: ['ଂ'],
  visarga: 'ଃ',
  vowels: {
    'ଅ': 'A', 'ଆ': 'Aa', 'ଇ': 'I', 'ଈ': 'Ee', 'ଉ': 'U', 'ଊ': 'Oo', 'ଋ': 'Ri',
    'ଏ': 'E', 'ଐ': 'Ai', 'ଓ': 'O', 'ଔ': 'Au',
  },
  matras: {
    'ା': 'a', 'ି': 'i', 'ୀ': 'ee', 'ୁ': 'u', 'ୂ': 'oo', 'ୃ': 'ri',
    'େ': 'e', 'ୈ': 'ai', 'ୋ': 'o', 'ୌ': 'au',
  },
  consonants: {
    'କ': 'k', 'ଖ': 'kh', 'ଗ': 'g', 'ଘ': 'gh', 'ଙ': 'ng',
    'ଚ': 'ch', 'ଛ': 'chh', 'ଜ': 'j', 'ଝ': 'jh', 'ଞ': 'ny',
    'ଟ': 't', 'ଠ': 'th', 'ଡ': 'd', 'ଢ': 'dh', 'ଣ': 'n',
    'ତ': 't', 'ଥ': 'th', 'ଦ': 'd', 'ଧ': 'dh', 'ନ': 'n',
    'ପ': 'p', 'ଫ': 'ph', 'ବ': 'b', 'ଭ': 'bh', 'ମ': 'm',
    'ଯ': 'j', 'ର': 'r', 'ଲ': 'l', 'ଶ': 'sh', 'ଷ': 'sh', 'ସ': 's', 'ହ': 'h',
    'ଳ': 'l', 'ୟ': 'y', 'ୱ': 'w',
  }
};

const URDU_LETTERS: Record<string, string> = {
  'ا': 'a', 'آ': 'Aa', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ٹ': 't', 'ث': 's',
  'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ڈ': 'd', 'ذ': 'z',
  'ر': 'r', 'ڑ': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's',
  'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
  'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ں': 'n', 'و': 'o',
  'ہ': 'h', 'ۂ': 'h', 'ۃ': 't', 'ھ': 'h', 'ء': '', 'ی': 'i', 'ے': 'e',
};

function getScriptTable(script: string): ScriptTable | null {
  switch (script) {
    case 'Devanagari': return DEVANAGARI_TABLE;
    case 'Bengali': return BENGALI_TABLE;
    case 'Gujarati': return GUJARATI_TABLE;
    case 'Gurmukhi': return GURMUKHI_TABLE;
    case 'Tamil': return TAMIL_TABLE;
    case 'Telugu': return TELUGU_TABLE;
    case 'Kannada': return KANNADA_TABLE;
    case 'Malayalam': return MALAYALAM_TABLE;
    case 'Odia': return ODIA_TABLE;
    default: return null;
  }
}

/**
 * Phonetically transliterates Indic and Urdu text to standard English / Latin Romanization.
 */
export function transliterateToEnglish(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.length === 0) return '';

  // Return if already pure English
  if (/^[A-Za-z0-9\s\.\,\-\/\#\&\(\)]+$/.test(trimmed)) {
    return trimmed;
  }

  // Split into words to check dictionary first
  const words = trimmed.split(/\s+/);
  const resultWords = words.map(word => {
    // 1. Direct dictionary match
    const cleanWord = word.replace(/[,\.\(\)\|\/\\]/g, '');
    if (FREQUENT_NAMES_DICTIONARY[cleanWord]) {
      return word.replace(cleanWord, FREQUENT_NAMES_DICTIONARY[cleanWord]);
    }

    // 2. Urdu Transliteration
    if (/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(word)) {
      let urduRes = '';
      for (let i = 0; i < word.length; i++) {
        const c = word[i];
        urduRes += URDU_LETTERS[c] !== undefined ? URDU_LETTERS[c] : c;
      }
      return capitalizeWord(urduRes);
    }

    // 3. Indic Script Transliteration
    const detection = detectScriptAndLanguage(word);
    const table = getScriptTable(detection.primaryScript);
    if (!table) return word;

    let res = '';
    const chars = Array.from(word);
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const next = i + 1 < chars.length ? chars[i + 1] : '';

      // Independent Vowel
      if (table.vowels[char]) {
        res += table.vowels[char];
        continue;
      }

      // Consonant
      if (table.consonants[char]) {
        const base = table.consonants[char];
        if (next === table.halant) {
          res += base;
          i++; // Skip halant
        } else if (table.matras[next]) {
          res += base + table.matras[next];
          i++; // Skip matra
        } else if (table.anusvara.includes(next)) {
          res += base + 'a' + (next === 'ঁ' ? 'n' : 'n');
          i++;
        } else if (next === table.visarga) {
          res += base + 'ah';
          i++;
        } else {
          // Inherent vowel 'a' if not at the very end of word (schwa deletion at end)
          const isEnd = (i === chars.length - 1);
          res += base + (isEnd ? '' : 'a');
        }
        continue;
      }

      // Matra alone (orphan)
      if (table.matras[char]) {
        res += table.matras[char];
        continue;
      }

      // Anusvara / Visarga alone
      if (table.anusvara.includes(char)) {
        res += 'n';
        continue;
      }
      if (char === table.visarga) {
        res += 'h';
        continue;
      }

      // ASCII / punctuation / other characters
      res += char;
    }

    return capitalizeWord(res);
  });

  return resultWords.join(' ');
}

function capitalizeWord(word: string): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// ─── 5. Revenue Terms English Normalizer ──────────────────────────────────────

const REVENUE_TERMS_MAP: Record<string, string> = {
  // Land Categories
  'कृषि': 'Agricultural Land',
  'कृषि भूमि': 'Agricultural Land',
  'কৃষি': 'Agricultural Land',
  'কৃষি জমি': 'Agricultural Land',
  'زراعی': 'Agricultural Land',
  'زراعی زمین': 'Agricultural Land',
  'زرعی': 'Agricultural Land',
  'زرعی زمین': 'Agricultural Land',
  'فرد زمین': 'Record of Rights (Fard Zameen)',
  'اراضی نقشہ': 'Cadastral Map (Arazi Naqsha)',
  'ارٹی نقضہ': 'Cadastral Map (Arazi Naqsha)',
  'سکنی': 'Residential Land',
  'ખેતી': 'Agricultural Land',
  'ખેતીની જમીન': 'Agricultural Land',
  'பயிர் நிலம்': 'Agricultural Land',
  'వ్యవసాయ భూమి': 'Agricultural Land',
  'ಕೃಷಿ ಭೂಮಿ': 'Agricultural Land',
  'ആവാസ ഭൂമി': 'Agricultural Land',
  'ଚାଷ ଜମି': 'Agricultural Land',

  'आवासीय': 'Residential Land',
  'आवासीय भूमि': 'Residential Land',
  'বাস্তু': 'Residential / Homestead Land',
  'বাস্তু জমি': 'Residential / Homestead Land',
  'বাড়ি': 'Residential Land',
  'سکونتی': 'Residential Land',
  'રહેણાંક': 'Residential Land',
  'குடியிருப்பு': 'Residential Land',
  'నివాస స్థలం': 'Residential Land',
  'ವಸತಿ': 'Residential Land',

  'व्यावसायिक': 'Commercial Land',
  'বাণিজ্যিক': 'Commercial Land',
  'تجارتی': 'Commercial Land',
  'વાણિજ્યિક': 'Commercial Land',
  'வணிக நிலம்': 'Commercial Land',
  'వాణిజ్య భూమి': 'Commercial Land',

  'सरकारी': 'Government Land',
  'সরকারি': 'Government Land',
  'सरकारी भूमि': 'Government Land',
  'सरकारी खलिहान': 'Government Land',
  'سرکاری': 'Government Land',
  'સરકારી': 'Government Land',
  'அரசு நிலம்': 'Government Land',
  'ప్రభుత్వ భూమి': 'Government Land',

  'वन': 'Forest Land',
  'বনভূমি': 'Forest Land',
  'جنگلات': 'Forest Land',
  'காடு': 'Forest Land',

  'बंजर': 'Wasteland / Barren Land',
  'পতিত জমি': 'Wasteland / Barren Land',
  'بنجر': 'Wasteland / Barren Land',

  // Crops / Land Use
  'धान': 'Paddy / Rice',
  'ধান': 'Paddy / Rice',
  'गेहूं': 'Wheat',
  'গম': 'Wheat',
  'मक्का': 'Maize / Corn',
  'ভুট্টা': 'Maize / Corn',
  'दलहन': 'Pulses',
  'ডাল': 'Pulses',
  'सरसों': 'Mustard',
  'সরিষা': 'Mustard',
  'गन्ना': 'Sugarcane',
  'আখ': 'Sugarcane',
  'कपास': 'Cotton',
  'তুলো': 'Cotton',
  'सब्जी': 'Vegetables',
  'শাকসবজি': 'Vegetables',
  'बागवानी': 'Orchard / Horticulture',
  'বাগান': 'Orchard / Horticulture',
  'मत्स्य पालन': 'Fisheries / Aquaculture',
  'মৎস্য চাষ': 'Fisheries / Aquaculture',
};

/**
 * Maps regional revenue terminology into clean, standardized English text.
 */
export function normalizeRevenueTermToEnglish(term: string): string {
  if (!term) return '';
  const trimmed = term.trim();
  if (REVENUE_TERMS_MAP[trimmed]) {
    return REVENUE_TERMS_MAP[trimmed];
  }

  // Substring match
  for (const [key, english] of Object.entries(REVENUE_TERMS_MAP)) {
    if (trimmed.includes(key)) {
      return english;
    }
  }

  return transliterateToEnglish(trimmed);
}
