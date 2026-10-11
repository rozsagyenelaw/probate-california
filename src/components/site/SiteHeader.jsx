import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Menu, X, LogIn } from 'lucide-react';
import { START_URL } from '../../config/tracking';
import { CLIENT_LOGIN_URL } from './siteLinks';

// Site header for the redesigned home (decision 31C, item 1): MyProbateCA logo with the firm line,
// Services, How it works, Pricing, FAQ, Client login and a "Start your case" button.
// On other pages the section links point back to the home page.
const SiteHeader = ({ onHome = false }) => {
  const [open, setOpen] = useState(false);
  const base = onHome ? '' : '/';
  const links = [
    { href: `${base}#services`, label: 'Services' },
    { href: `${base}#how-it-works`, label: 'How it works' },
    { href: `${base}#pricing`, label: 'Pricing' },
    { href: `${base}#faq`, label: 'FAQ' },
  ];
  return (
    <header className="mp-header sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 min-w-0" aria-label="MyProbateCA home">
          <Scale className="h-7 w-7 mp-brand shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <span className="flex flex-col leading-tight min-w-0">
            <span className="text-lg font-semibold mp-brand tracking-tight">MyProbateCA</span>
            <span className="text-xs text-slate-600 truncate">Law Offices of Rozsa Gyene</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] text-slate-700 hover:text-[var(--mp-navy)]">{l.label}</a>
          ))}
          <a href={CLIENT_LOGIN_URL} className="inline-flex items-center gap-1.5 text-[15px] text-slate-700 hover:text-[var(--mp-navy)]">
            <LogIn className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Client login
          </a>
          <a href={START_URL} className="mp-btn px-4 py-2 text-[15px]">Start your case</a>
        </nav>

        <div className="flex items-center gap-1 lg:hidden">
          <a href={CLIENT_LOGIN_URL} className="inline-flex items-center gap-1 px-2 py-2 text-sm font-medium mp-brand">
            <LogIn className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Client login
          </a>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="p-2 text-slate-700"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mp-mobile-menu"
          >
            {open ? <X className="h-6 w-6" strokeWidth={1.75} /> : <Menu className="h-6 w-6" strokeWidth={1.75} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mp-mobile-menu" className="lg:hidden border-t border-slate-200 bg-white" aria-label="Main">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-base text-slate-800 border-b border-slate-100">{l.label}</a>
            ))}
            <a href={START_URL} className="mp-btn mt-4 mb-2 px-4 py-3 text-base text-center">Start your case</a>
          </div>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
