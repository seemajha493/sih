import React from 'react';

interface DigitalIndiaLogoProps {
  className?: string;
}

export const DigitalIndiaLogo: React.FC<DigitalIndiaLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Digital India Tricolor Emblem SVG */}
      <svg viewBox="0 0 120 70" className="h-9 w-auto shrink-0" fill="none">
        {/* Tricolor Dynamic Swoosh Ribbon */}
        {/* Saffron Top Swoosh */}
        <path
          d="M10 20 C 35 5, 75 15, 110 8 C 90 22, 50 18, 10 20 Z"
          fill="#FF9933"
        />
        {/* White Center Swoosh */}
        <path
          d="M12 28 C 37 15, 77 23, 112 18 C 92 30, 52 26, 12 28 Z"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="0.5"
        />
        {/* India Green Bottom Swoosh */}
        <path
          d="M15 36 C 40 25, 80 32, 115 28 C 95 40, 55 35, 15 36 Z"
          fill="#138808"
        />

        {/* Ashoka Chakra in Center */}
        <circle cx="62" cy="24" r="5" fill="none" stroke="#000080" strokeWidth="1" />
        <path d="M62 19 V29 M57 24 H67 M58 20 L66 28 M58 28 L66 20" stroke="#000080" strokeWidth="0.5" />

        {/* Text: Digital India */}
        <text x="60" y="55" fontSize="13" fontWeight="900" textAnchor="middle" fill="#064E3B" fontFamily="sans-serif" letterSpacing="0.5">
          Digital India
        </text>
        <text x="60" y="66" fontSize="6.5" fontWeight="700" textAnchor="middle" fill="#D97706" fontFamily="sans-serif" letterSpacing="0.8">
          POWER TO EMPOWER
        </text>
      </svg>
    </div>
  );
};
