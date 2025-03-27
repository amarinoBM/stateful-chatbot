import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const BotIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
  >
    <rect width="18" height="14" x="3" y="6" rx="2" />
    <path d="M14 15c0 1.105-0.895 2-2 2s-2-0.895-2-2" />
    <path d="M14 6h-4V4c0-1.1 0.9-2 2-2s2 0.9 2 2v2z" />
    <path d="M6 10h.01" />
    <path d="M18 10h.01" />
  </svg>
);

export const UserIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const GitIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2" 
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export const VercelIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 116 100"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z" />
  </svg>
);

export const MasonryIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg" 
    width={size}
    height={size}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
); 