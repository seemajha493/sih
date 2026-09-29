import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { type SupportedLanguage, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './types';

import en from './translations/en.json';
import hi from './translations/hi.json';
import mai from './translations/mai.json';
import bn from './translations/bn.json';
import bho from './translations/bho.json';

const TRANSLATIONS: Record<SupportedLanguage, Record<string, any>> = {
  en,
  hi,
  mai,
  bn,
  bho,
};

const STORAGE_KEY = 'bhumitrace_lang';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  languages: typeof SUPPORTED_LANGUAGES;
  currentLanguageOption: typeof SUPPORTED_LANGUAGES[0];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
      if (saved && TRANSLATIONS[saved]) {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read language from localStorage:', e);
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (!TRANSLATIONS[newLang]) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Translates a dot-separated key (e.g. "common.login", "navbar.home")
   * Falls back to English if the key is missing in the current language.
   */
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      
      // Look up in selected language
      let value: any = TRANSLATIONS[language];
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }

      // Fallback to English if missing
      if (value === undefined || typeof value !== 'string') {
        let fallbackVal: any = TRANSLATIONS[DEFAULT_LANGUAGE];
        for (const k of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && k in fallbackVal) {
            fallbackVal = fallbackVal[k];
          } else {
            fallbackVal = undefined;
            break;
          }
        }
        value = fallbackVal !== undefined ? fallbackVal : key;
      }

      // String interpolation for placeholders e.g. {{name}} or {name}
      if (typeof value === 'string' && params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          value = (value as string)
            .replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), String(paramVal))
            .replace(new RegExp(`{\\s*${paramKey}\\s*}`, 'g'), String(paramVal));
        });
      }

      return typeof value === 'string' ? value : key;
    },
    [language]
  );

  const currentLanguageOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageOption,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
