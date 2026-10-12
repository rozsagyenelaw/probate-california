import React from 'react';
import { Link } from 'react-router-dom';

// Shared pieces for the content pages in the home page design (APPROVAL-6, stage 0; Rozsa, 2026-10-12,
// seventh message). Used by the FAQ, the city pages and, later, court locations and the stage 4 pages,
// together with SiteHeader and SiteFooter. Design only: every page passes its own words.

// Button styles from the home page: teal on light backgrounds, white on the navy band.
export const HERO_BUTTON = 'mp-btn px-6 py-3.5 text-base md:text-lg';
export const BAND_BUTTON = 'mp-btn px-6 py-3.5 text-lg !bg-white !text-[var(--mp-navy)] hover:!bg-slate-100';

// White breadcrumb bar under the header. items: [{ to, label }], the last one is the current page (no link).
export const Breadcrumbs = ({ items }) => (
  <div className="bg-white border-b border-slate-200 py-3">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <li aria-hidden="true"><span className="mx-1">&gt;</span></li>}
              <li className={item.to ? undefined : 'text-slate-900 font-medium'}>
                {item.to ? <Link to={item.to} className="hover:text-[var(--mp-navy)]">{item.label}</Link> : item.label}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>
    </div>
  </div>
);

// Light gray hero band, left aligned, same heading scale as the home page hero.
export const PageHero = ({ title, children }) => (
  <section className="bg-slate-50 border-b border-slate-200">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10 md:pt-14 md:pb-16">
      <div className="max-w-3xl">
        <h1 className="text-[1.75rem] leading-tight md:text-5xl md:leading-[1.1] font-semibold tracking-tight text-slate-900">{title}</h1>
        {children}
      </div>
    </div>
  </section>
);

// Navy start band, as at the bottom of the home page. boxed: inside a text column (rounded card);
// otherwise full width.
export const StartBand = ({ title, children, boxed = false }) => (boxed ? (
  <section className="bg-[var(--mp-navy)] text-white p-8 md:p-10 rounded-xl mb-12">
    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
    {children}
  </section>
) : (
  <section className="bg-[var(--mp-navy)] text-white">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
        {children}
      </div>
    </div>
  </section>
));
