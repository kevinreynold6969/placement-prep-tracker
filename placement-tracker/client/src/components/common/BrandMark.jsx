import React from 'react';

const BrandMark = ({ size = 38, className = '' }) => (
  <svg
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    className={className}
  >
    <rect x="1" y="1" width="38" height="38" rx="12" fill="var(--theme-mark)" />
    <path
      d="M14 29V11h8.2a6 6 0 0 1 0 12H14"
      stroke="var(--theme-primary)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="29" cy="29" r="3.2" fill="var(--theme-accent)" />
  </svg>
);

export default BrandMark;
