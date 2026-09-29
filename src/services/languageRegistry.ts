/**
 * Centralized Language & Script Registry for Multilingual Land-Document OCR
 *
 * Defines metadata, OCR identifiers (Tesseract / Bhashini), Unicode ranges,
 * numeral maps, and field-label patterns across all 13 supported languages.
 */

export interface LanguageConfig {
  id: string; // ISO 639-1 code (e.g. 'bn', 'hi', 'ur')
  name: string; // English display name
  scriptName: string; // Unicode script name
  tesseractCode: string; // Tesseract language code
  bhashiniCode: string; // Bhashini API language code
  unicodeRanges: Array<[number, number]>;
  numeralMap: Record<string, string>;
  stateHints?: string[];
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  ENGLISH: {
    id: 'en',
    name: 'English',
    scriptName: 'Latin',
    tesseractCode: 'eng',
    bhashiniCode: 'en',
    unicodeRanges: [[0x0041, 0x005A], [0x0061, 0x007A]],
    numeralMap: {},
  },
  HINDI: {
    id: 'hi',
    name: 'Hindi',
    scriptName: 'Devanagari',
    tesseractCode: 'hin',
    bhashiniCode: 'hi',
    unicodeRanges: [[0x0900, 0x097F]],
    numeralMap: {
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
      '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
    },
    stateHints: ['Bihar', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Delhi', 'Himachal Pradesh', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand']
  },
  BENGALI: {
    id: 'bn',
    name: 'Bengali',
    scriptName: 'Bengali',
    tesseractCode: 'ben',
    bhashiniCode: 'bn',
    unicodeRanges: [[0x0980, 0x09FF]],
    numeralMap: {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    },
    stateHints: ['West Bengal', 'Tripura']
  },
  URDU: {
    id: 'ur',
    name: 'Urdu',
    scriptName: 'Arabic',
    tesseractCode: 'urd',
    bhashiniCode: 'ur',
    unicodeRanges: [[0x0600, 0x06FF], [0x0750, 0x077F], [0xFB50, 0xFDFF], [0xFE70, 0xFEFF]],
    numeralMap: {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    },
    stateHints: ['Jammu and Kashmir', 'Telangana', 'Uttar Pradesh', 'Delhi', 'Bihar']
  },
  MARATHI: {
    id: 'mr',
    name: 'Marathi',
    scriptName: 'Devanagari',
    tesseractCode: 'mar',
    bhashiniCode: 'mr',
    unicodeRanges: [[0x0900, 0x097F]],
    numeralMap: {
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
      '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
    },
    stateHints: ['Maharashtra', 'Goa']
  },
  GUJARATI: {
    id: 'gu',
    name: 'Gujarati',
    scriptName: 'Gujarati',
    tesseractCode: 'guj',
    bhashiniCode: 'gu',
    unicodeRanges: [[0x0A80, 0x0AFF]],
    numeralMap: {
      '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
      '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9'
    },
    stateHints: ['Gujarat']
  },
  PUNJABI: {
    id: 'pa',
    name: 'Punjabi',
    scriptName: 'Gurmukhi',
    tesseractCode: 'pan',
    bhashiniCode: 'pa',
    unicodeRanges: [[0x0A00, 0x0A7F]],
    numeralMap: {
      '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4',
      '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9'
    },
    stateHints: ['Punjab', 'Chandigarh', 'Haryana']
  },
  TAMIL: {
    id: 'ta',
    name: 'Tamil',
    scriptName: 'Tamil',
    tesseractCode: 'tam',
    bhashiniCode: 'ta',
    unicodeRanges: [[0x0B80, 0x0BFF]],
    numeralMap: {
      '௦': '0', '௧': '1', '௨': '2', '௩': '3', '௪': '4',
      '௫': '5', '௬': '6', '௭': '7', '௮': '8', '௯': '9'
    },
    stateHints: ['Tamil Nadu', 'Puducherry']
  },
  TELUGU: {
    id: 'te',
    name: 'Telugu',
    scriptName: 'Telugu',
    tesseractCode: 'tel',
    bhashiniCode: 'te',
    unicodeRanges: [[0x0C00, 0x0C7F]],
    numeralMap: {
      '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4',
      '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9'
    },
    stateHints: ['Andhra Pradesh', 'Telangana']
  },
  KANNADA: {
    id: 'kn',
    name: 'Kannada',
    scriptName: 'Kannada',
    tesseractCode: 'kan',
    bhashiniCode: 'kn',
    unicodeRanges: [[0x0C80, 0x0CFF]],
    numeralMap: {
      '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4',
      '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9'
    },
    stateHints: ['Karnataka']
  },
  MALAYALAM: {
    id: 'ml',
    name: 'Malayalam',
    scriptName: 'Malayalam',
    tesseractCode: 'mal',
    bhashiniCode: 'ml',
    unicodeRanges: [[0x0D00, 0x0D7F]],
    numeralMap: {
      '൦': '0', '൧': '1', '൨': '2', '൩': '3', '൪': '4',
      '൫': '5', '൬': '6', '൭': '7', '൮': '8', '൯': '9'
    },
    stateHints: ['Kerala', 'Lakshadweep']
  },
  ODIA: {
    id: 'or',
    name: 'Odia',
    scriptName: 'Odia',
    tesseractCode: 'ori',
    bhashiniCode: 'or',
    unicodeRanges: [[0x0B00, 0x0B7F]],
    numeralMap: {
      '୦': '0', '୧': '1', '୨': '2', '୩': '3', '୪': '4',
      '୫': '5', '୬': '6', '୭': '7', '୮': '8', '୯': '9'
    },
    stateHints: ['Odisha']
  },
  ASSAMESE: {
    id: 'as',
    name: 'Assamese',
    scriptName: 'Bengali/Assamese',
    tesseractCode: 'asm',
    bhashiniCode: 'as',
    unicodeRanges: [[0x0980, 0x09FF]],
    numeralMap: {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    },
    stateHints: ['Assam']
  },
};

/**
 * Returns the OCR configuration based on auto-detected script or user hint.
 */
export function getOcrConfig(langKey?: string): {
  langCode: string;
  tesseractCode: string;
  bhashiniCode: string;
} {
  if (!langKey || langKey.toUpperCase() === 'AUTO') {
    return {
      langCode: 'AUTO',
      tesseractCode: 'ben+hin+urd+eng',
      bhashiniCode: 'hi'
    };
  }

  const key = langKey.toUpperCase();
  const cfg = SUPPORTED_LANGUAGES[key];
  if (cfg) {
    return {
      langCode: cfg.id,
      tesseractCode: `${cfg.tesseractCode}+eng`,
      bhashiniCode: cfg.bhashiniCode
    };
  }

  return {
    langCode: 'en',
    tesseractCode: 'eng',
    bhashiniCode: 'en'
  };
}
