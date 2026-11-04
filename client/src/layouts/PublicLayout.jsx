import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { getLanguage, setLanguage, t } from '../i18n/index.js';
import BrandLogo from '../components/common/BrandLogo.jsx';

export default function PublicLayout() {
  const currentLang = getLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAF9] text-slate-900">
      {/* Public Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 md:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo size="md" showTagline={true} />

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link to="/" className="hover:text-emerald-700 transition">{t('nav.home', 'Home')}</Link>
            <Link to="/about" className="hover:text-emerald-700 transition">{t('nav.about', 'About')}</Link>
            <Link to="/help" className="hover:text-emerald-700 transition">{t('nav.help', 'Help Desk')}</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <select
              value={currentLang}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 font-medium outline-none focus:border-emerald-500"
            >
              <option value="en">English (Default)</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="or">Odia (ଓଡ଼ିଆ Regional)</option>
            </select>

            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-emerald-700 transition hover-lift"
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
          <p>© 2026 CAMPUS OS • Smart Campus & Hostel Management System. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <Link to="/about" className="hover:text-emerald-700 hover:underline">Architecture</Link>
            <Link to="/help" className="hover:text-emerald-700 hover:underline">Help Desk</Link>
            <a href="/api/health" target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold hover:underline">API Health</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
