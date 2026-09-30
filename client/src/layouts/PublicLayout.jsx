import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { getLanguage, setLanguage, t } from '../i18n/index.js';

export default function PublicLayout() {
  const currentLang = getLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Public Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur px-4 md:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-sm">
              C
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base leading-tight tracking-tight block">
                Campus Life, Debugged
              </span>
              <span className="text-[10px] font-medium text-blue-600 block">
                Unified Campus Operations OS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition">{t('nav.home', 'Home')}</Link>
            <Link to="/about" className="hover:text-blue-600 transition">{t('nav.about', 'About')}</Link>
            <Link to="/help" className="hover:text-blue-600 transition">{t('nav.help', 'Help Desk')}</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <select
              value={currentLang}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 font-medium"
            >
              <option value="en">EN (English)</option>
              <option value="hi">HI (हिंदी)</option>
              <option value="or">OR (ଓଡ଼ିଆ)</option>
            </select>

            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <span>{t('nav.login', 'Sign In')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 md:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Campus Life, Debugged • Built for Fretbox Hackathon</p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <Link to="/about" className="hover:underline">Project Architecture</Link>
            <Link to="/help" className="hover:underline">Offline Desk</Link>
            <a href="/api/v1/health" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">API Health</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
