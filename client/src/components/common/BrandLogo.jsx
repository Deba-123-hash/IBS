import React from 'react';
import { Link } from 'react-router-dom';
import BRAND from '../../config/brand.js';

export default function BrandLogo({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  asLink = true,
  to = '/',
  className = ''
}) {
  const sizeMap = {
    sm: { badge: 'h-8 w-8 text-xs rounded-lg', title: 'text-sm', sub: 'text-[9px]' },
    md: { badge: 'h-9 w-9 text-sm rounded-xl', title: 'text-base', sub: 'text-[10px]' },
    lg: { badge: 'h-11 w-11 text-base rounded-2xl', title: 'text-xl', sub: 'text-xs' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Clean Monogram Badge */}
      <div
        className={`flex ${currentSize.badge} items-center justify-center bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white font-black tracking-tight shadow-xs relative overflow-hidden`}
      >
        <span className="relative z-10 font-mono tracking-tighter">{BRAND.monogram || 'COS'}</span>
        {/* Subtle geometric light shine */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/30 pointer-events-none" />
      </div>

      {/* Brand Wordmark & Label */}
      {showWordmark && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-slate-900 ${currentSize.title}`}>
              {BRAND.name}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
              PRO
            </span>
          </div>
          {showTagline && (
            <span className={`text-slate-500 font-medium tracking-tight mt-0.5 ${currentSize.sub}`}>
              {BRAND.tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link to={to} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
