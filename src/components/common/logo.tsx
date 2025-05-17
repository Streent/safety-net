import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="150"
      height="37.5"
      aria-label="SafetyNet Logo"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="200" height="50" rx="8" fill="transparent" />
      <path
        d="M25 10 Q20 10, 15 15 L15 35 Q20 40, 25 40 M25 10 L45 10 Q50 10, 50 15 L50 35 Q50 40, 45 40 L25 40"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="60"
        y="32"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="hsl(var(--foreground))"
      >
        SafetyNet
      </text>
    </svg>
  );
}
