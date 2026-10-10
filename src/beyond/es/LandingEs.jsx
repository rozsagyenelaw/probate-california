import React from 'react';
import BeyondPage from '../BeyondPage';
import { ES } from './landingEsText';

// Item 70 (HOLD): Spanish landing page at /es. The text lives in landingEsText.js so the office
// can review it in APPROVAL-70-spanish/. Hidden until config/beyondFeatures.spanish is true.
export default function LandingEs() {
  return (
    <BeyondPage flag="spanish" lang="es" title={ES.metaTitle} description={ES.metaDescription} canonicalPath="/es"
      altLinks={[{ hreflang: 'es', path: '/es' }, { hreflang: 'en', path: '/' }]}>
      <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">{ES.heroTitle}</h1>
          <p className="mt-4 text-lg sm:text-xl text-blue-100 max-w-3xl">{ES.heroText}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="https://portal.myprobateca.com/book" className="bg-white text-blue-900 font-semibold rounded-lg px-6 py-3">{ES.ctaBook}</a>
            <a href="tel:+18183374071" className="border border-white font-semibold rounded-lg px-6 py-3">{ES.ctaCall}</a>
          </div>
          <p className="mt-6 text-sm text-blue-100">{ES.heroSmall}</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold">{ES.servicesTitle}</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {ES.services.map((s) => (
            <div key={s.name} className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold">{s.name}</h3>
              <p className="mt-1 text-3xl font-bold text-blue-900">{s.price}</p>
              <p className="mt-3 text-gray-700">{s.who}</p>
              <ul className="mt-4 space-y-2 text-gray-800">{s.includes.map((i) => <li key={i} className="flex gap-2"><span aria-hidden="true">✓</span><span>{i}</span></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-slate-50 rounded-xl p-6">
          <h3 className="font-semibold">{ES.addonsTitle}</h3>
          <ul className="mt-2 space-y-1 text-gray-800">{ES.addons.map((a) => <li key={a}>{a}</li>)}</ul>
          <p className="mt-3 text-sm text-gray-600">{ES.thirdPartyCosts}</p>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold">{ES.stepsTitle}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-4">
            {ES.steps.map((s, i) => (
              <li key={s.title} className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-blue-900">{ES.stepLabel} {i + 1}</p>
                <h3 className="mt-1 font-semibold">{s.title}</h3>
                <p className="mt-2 text-gray-700 text-sm">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold">{ES.aboutTitle}</h2>
        <p className="mt-4 text-gray-800 max-w-3xl">{ES.aboutText}</p>
        <p className="mt-3 text-gray-800 max-w-3xl">{ES.languageNote}</p>
      </section>

      <section className="bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold">{ES.faqTitle}</h2>
          <div className="mt-6 space-y-3">
            {ES.faq.map((f) => (
              <details key={f.q} className="bg-white border border-gray-200 rounded-xl p-5">
                <summary className="font-semibold cursor-pointer">{f.q}</summary>
                <p className="mt-3 text-gray-700">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">{ES.finalTitle}</h2>
        <p className="mt-3 text-gray-700">{ES.finalText}</p>
        <a href="https://portal.myprobateca.com/book" className="mt-6 inline-block bg-blue-900 text-white font-semibold rounded-lg px-6 py-3">{ES.ctaBook}</a>
      </section>
    </BeyondPage>
  );
}
