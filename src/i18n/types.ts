export type SupportedLanguage = 'en' | 'hi' | 'mai' | 'bn' | 'bho';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  script: string;
  flag?: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari / Mithilakshar' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Eastern Nagari' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', script: 'Devanagari / Kaithi' },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
