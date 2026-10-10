import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import ClientLoginButton from '../components/common/ClientLoginButton';
import NotFound from '../components/common/NotFound';
import { useFlag } from './flags';

// Frame for W3-beyond main-site pages. While the page's switch is off it renders the normal
// "not found" page, so the draft is not public.
export default function BeyondPage({ flag, lang = 'en', title, description, canonicalPath, altLinks = [], children }) {
  const on = useFlag(flag);
  if (on === null) return <div className="min-h-screen bg-white" />;
  if (!on) return <NotFound />;
  const es = lang === 'es';
  return (
    <div className="min-h-screen bg-white text-gray-900" lang={lang}>
      <Helmet>
        <html lang={lang} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://myprobateca.com${canonicalPath}`} />
        {altLinks.map((a) => <link key={a.hreflang} rel="alternate" hrefLang={a.hreflang} href={`https://myprobateca.com${a.path}`} />)}
      </Helmet>
      <header className="bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <Link to={es ? '/es' : '/'} className="leading-tight">
            <span className="block text-lg font-bold">MyProbateCA</span>
            <span className="block text-xs text-blue-100">Law Offices of Rozsa Gyene</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <a href="tel:+18183374071" className="whitespace-nowrap font-semibold">818-337-4071</a>
            {es ? <Link to="/" className="underline" lang="en">English</Link> : null}
            <ClientLoginButton tone="dark" compact />
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="bg-gray-900 text-gray-300 text-sm px-4 py-8 text-center">
        <p>Law Offices of Rozsa Gyene · 3500 W. Olive Ave., Suite 300, Burbank, CA 91505 · 818-337-4071</p>
        <p className="mt-2">{es ? 'Esta página da información general y no es consejo legal.' : 'This page is general information, not legal advice.'}</p>
      </footer>
    </div>
  );
}
