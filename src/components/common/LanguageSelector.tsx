import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'compact' | 'dropdown' | 'inline' | 'header';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  className = '',
}) => {
  const { language, setLanguage, languages, currentLanguageOption } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Header / Top bar minimal inline switch
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 font-semibold text-[11px] ${className}`} role="region" aria-label="Language Selector">
        <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
        <div className="flex items-center divide-x divide-emerald-700/60">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-1.5 py-0.5 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400 rounded ${
                language === l.code
                  ? 'text-amber-300 font-bold bg-emerald-900/60'
                  : 'text-slate-200 hover:text-white'
              }`}
              title={`${l.name} (${l.nativeName})`}
              aria-label={`Switch to ${l.name} - ${l.nativeName}`}
              aria-pressed={language === l.code}
            >
              {l.nativeName}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Header style with button + dropdown
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 border border-white/20 text-white transition focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Current interface language: ${currentLanguageOption.name} (${currentLanguageOption.nativeName}). Click to select language.`}
        title="Select Interface Language"
      >
        <Globe className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
        <span className="font-medium">{currentLanguageOption.nativeName}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 opacity-80 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-52 bg-white text-slate-900 border border-slate-300 rounded shadow-xl z-50 py-1 text-xs divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 bg-slate-50 flex items-center justify-between">
            <span>Select UI Language</span>
            <span className="text-emerald-700 font-mono text-[9px]">i18n</span>
          </div>

          <div className="py-1">
            {languages.map((l) => {
              const isSelected = language === l.code;
              return (
                <button
                  key={l.code}
                  role="menuitem"
                  onClick={() => {
                    setLanguage(l.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 font-bold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-label={`${l.name} (${l.nativeName})`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-900">{l.nativeName}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{l.name} · {l.script}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 ml-2" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1.5 text-[10px] text-slate-500 bg-slate-50 leading-tight">
            Independent from document OCR processing script.
          </div>
        </div>
      )}
    </div>
  );
};
