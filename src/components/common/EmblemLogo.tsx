import React from 'react';

interface EmblemLogoProps {
  variant?: 'light' | 'dark' | 'header';
  compact?: boolean;
}

export const EmblemLogo: React.FC<EmblemLogoProps> = ({ variant = 'header', compact = false }) => {
  // 'header' or 'light' variant is used on DARK background, so text must be WHITE/LIGHT
  const isDarkBg = variant === 'header' || variant === 'light';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* State Emblem of India — Ashoka Lion Capital */}
      <div className="flex flex-col items-center justify-center shrink-0">
        <svg viewBox="0 0 100 120" className={`w-10 h-12 ${isDarkBg ? 'text-amber-400 drop-shadow' : 'text-[#1B365D]'}`} fill="currentColor">
          {/* Three Lions Top Contour */}
          <path d="M50 10 C35 10 30 25 30 35 C30 45 40 50 50 50 C60 50 70 45 70 35 C70 25 65 10 50 10 Z" fill="currentColor" opacity="0.95" />
          <circle cx="35" cy="28" r="4" fill="#000" opacity="0.3" />
          <circle cx="50" cy="28" r="5" fill="#000" opacity="0.3" />
          <circle cx="65" cy="28" r="4" fill="#000" opacity="0.3" />
          {/* Middle Band */}
          <rect x="25" y="52" width="50" height="12" rx="1" fill="currentColor" />
          {/* Ashoka Chakra in Base */}
          <circle cx="50" cy="74" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M50 64 V84 M40 74 H60 M43 67 L57 81 M43 81 L57 67" stroke="currentColor" strokeWidth="1" />
          {/* Bull & Horse accents */}
          <circle cx="30" cy="74" r="3" fill="currentColor" />
          <circle cx="70" cy="74" r="3" fill="currentColor" />
          {/* Pedestal Base */}
          <rect x="20" y="88" width="60" height="6" rx="1" fill="currentColor" />
          <text x="50" y="106" fontSize="10" fontWeight="bold" textAnchor="middle" fill="currentColor" fontFamily="serif">
            सत्यमेव जयते
          </text>
        </svg>
      </div>

      <div className={`flex flex-col justify-center border-l ${isDarkBg ? 'border-slate-500' : 'border-slate-300'} pl-3`}>
        <div className={`font-extrabold text-xs sm:text-sm leading-tight ${
          isDarkBg ? 'text-white tracking-wide' : 'text-[#064E3B]'
        }`}>
          भारत सरकार | Government of India
        </div>
        <div className={`text-[11px] font-medium leading-tight mt-0.5 ${
          isDarkBg ? 'text-slate-200' : 'text-slate-600'
        }`}>
          Ministry of Rural Development
        </div>
        {!compact && (
          <div className={`text-[11px] font-bold leading-tight mt-0.5 ${
            isDarkBg ? 'text-amber-300' : 'text-[#1B365D]'
          }`}>
            Department of Land Resources (DoLR)
          </div>
        )}
      </div>
    </div>
  );
};
