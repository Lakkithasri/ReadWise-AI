import React from 'react';

interface GlowingBookLogoProps {
  className?: string;
  glow?: boolean;
}

export const GlowingBookLogo: React.FC<GlowingBookLogoProps> = ({
  className = 'w-6 h-6',
  glow = true
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {glow && (
          <filter id="book-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      <g filter={glow ? 'url(#book-glow)' : undefined}>
        {/* Sparkles / Magic Stars */}
        {/* Top-left large sparkle */}
        <path
          d="M17 21 C17 25 15 27 11 27 C15 27 17 29 17 33 C17 29 19 27 23 27 C19 27 17 25 17 21 Z"
          fill="currentColor"
        />
        {/* Top-left small sparkle */}
        <path
          d="M9 34 C9 36 8 37 6 37 C8 37 9 38 9 40 C9 38 10 37 12 37 C10 37 9 36 9 34 Z"
          fill="currentColor"
          opacity="0.85"
        />
        {/* Top-center floating sparkle */}
        <path
          d="M44 26 C44 28 43 29 41 29 C43 29 44 30 44 32 C44 30 45 29 47 29 C45 29 44 28 44 26 Z"
          fill="currentColor"
          opacity="0.9"
        />
        {/* Top-right large sparkle */}
        <path
          d="M79 19 C79 23 77 25 73 25 C77 25 79 27 79 31 C79 27 81 25 85 25 C81 25 79 23 79 19 Z"
          fill="currentColor"
        />
        {/* Top-right small sparkle */}
        <path
          d="M87 29 C87 31 86 32 84 32 C86 32 87 33 87 35 C87 33 88 32 90 32 C88 32 87 31 87 29 Z"
          fill="currentColor"
          opacity="0.85"
        />
        {/* Bottom-left small sparkle */}
        <path
          d="M13 86 C13 88 12 89 10 89 C12 89 13 90 13 92 C13 90 14 89 16 89 C14 89 13 88 13 86 Z"
          fill="currentColor"
          opacity="0.85"
        />
        {/* Bottom-right small sparkle */}
        <path
          d="M88 83 C88 85 87 86 85 86 C87 86 88 87 88 89 C88 87 89 86 91 86 C89 86 88 85 88 83 Z"
          fill="currentColor"
          opacity="0.85"
        />

        {/* Outer Page Layers (Depth outline) */}
        <path
          d="M20 40 V77 C20 77 22.5 80 27 81 L46 86 C48.5 86.8 51.5 86.8 54 86 L73 81 C77.5 80 80 77 80 77 V40"
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Left Outer Cover Rim */}
        <path
          d="M16 43 V75"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Right Outer Cover Rim */}
        <path
          d="M84 43 V75"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Main Left Page */}
        <path
          d="M50 43 C42.5 35.5 32 34 26 35 C23 35.5 21 38 21 41.5 V74.5 C21 76.5 23 78.5 26 78 C32 77 42.5 78 50 84.5 Z"
          stroke="currentColor"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Main Right Page */}
        <path
          d="M50 43 C57.5 35.5 68 34 74 35 C77 35.5 79 38 79 41.5 V74.5 C79 76.5 77 78.5 74 78 C68 77 57.5 78 50 84.5 Z"
          stroke="currentColor"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center Spine */}
        <line
          x1="50"
          y1="43"
          x2="50"
          y2="84.5"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
