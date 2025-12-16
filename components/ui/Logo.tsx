import React from 'react';

export const SiplanLogo = () => (
    <svg viewBox="0 0 220 120" className="w-28 h-auto" xmlns="http://www.w3.org/2000/svg" aria-label="SIPLAN SESAP Logo">
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#2dd4bf" />
            </marker>
        </defs>
        <rect x="120" y="35" width="14" height="30" fill="#5D5FEF" rx="1" />
        <rect x="138" y="25" width="14" height="40" fill="#5D5FEF" rx="1" />
        <rect x="156" y="15" width="14" height="50" fill="#5D5FEF" rx="1" />
        <rect x="174" y="25" width="14" height="40" fill="#5D5FEF" rx="1" />
        <rect x="192" y="5" width="14" height="60" fill="#5D5FEF" rx="1" />
        <polyline points="127,35 145,25 163,15 181,25 199,5" fill="none" stroke="#2DD4BF" strokeWidth="2.5" markerEnd="url(#arrowhead)" />
        <circle cx="127" cy="35" r="3.5" fill="#2DD4BF" stroke="white" strokeWidth="1" />
        <circle cx="145" cy="25" r="3.5" fill="#2DD4BF" stroke="white" strokeWidth="1" />
        <circle cx="163" cy="15" r="3.5" fill="#2DD4BF" stroke="white" strokeWidth="1" />
        <circle cx="181" cy="25" r="3.5" fill="#2DD4BF" stroke="white" strokeWidth="1" />
        <circle cx="199" cy="5" r="3.5" fill="#2DD4BF" stroke="white" strokeWidth="1" />
        <text x="5" y="100" fontFamily="sans-serif" fontWeight="900" fontSize="68" fill="black" letterSpacing="-3">SIPLAN</text>
        <text x="165" y="118" fontFamily="sans-serif" fontWeight="bold" fontSize="16" fill="black">SESAP</text>
    </svg>
);
