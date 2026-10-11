import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight, Check, ChevronDown, ClipboardList, FileText, PenLine, ShieldCheck,
  Gavel, Calculator, Home, Minus, MapPin, ExternalLink, HelpCircle,
} from 'lucide-react';
import LazyMapFrame from '../common/LazyMapFrame';
import SiteHeader from '../site/SiteHeader';
import SiteFooter from '../site/SiteFooter';
import { START_URL } from '../../config/tracking';
import {
  START_SIMPLIFIED_URL, START_FULL_URL, ELIGIBILITY_CHECK_URL, FULL_REPRESENTATION_URL,
  BAR_PROFILE_URL, PROCESS_PATH,
} from '../site/siteLinks';

// MyProbateCA home and pricing (W7-landing, Rozsa's decisions sections 21 to 32).
// Scope (sections 4, 5, 22): the client is the self-represented petitioner and files the papers;
// the office prepares the court papers and clears the probate notes. Prices: section 28 (tiers),
// section 30 (add-ons). Savings example: section 27 (Probate Code 10810, never next to $2,495).

const PAY_LINE = 'Pay in full, in 3 monthly payments that add up exactly to the fee, or over time with Klarna (subject to approval).';

const TIERS = [
  ['Probate estate up to $1,000,000', '$3,995'],
  ['$1,000,000 to $2,000,000', '$5,995'],
  ['Over $2,000,000', '$7,995'],
];

const STEPS = [
  { icon: ClipboardList, title: 'Answer questions online', text: 'Tell us about the estate in your client home. Your answers save as you go, so you can stop and come back on any device.' },
  { icon: FileText, title: 'We prepare your court papers', text: 'An attorney prepares your petition and the papers for each stage of your case.' },
  { icon: PenLine, title: 'You sign and file', text: 'You are the petitioner. Step-by-step guides show you how to file, mail the notices and place the newspaper notice.' },
  { icon: ShieldCheck, title: 'We clear the probate notes and guide you to closing', text: 'We answer the court\'s probate notes and prepare the papers for each stage until the estate is closed.' },
];

const INCLUDED = [
  'Court papers for your service, prepared by an attorney',
  'Probate notes cleared before your hearings',
  'Step-by-step guides for filing, mailing the notices and the newspaper notice',
  'Notices and proofs of mailing prepared for you to have mailed',
  'Your client home: progress bar, deadline reminders and messages with our office',
];

const NOT_INCLUDED = [
  'Court filing fees, paid to the court',
  'Newspaper publication, paid to the newspaper',
  'Probate referee fee for the appraisal',
  'Bond premium, only if the court requires a bond',
  'Certified copies of the death certificate and of the Letters',
];

const REVIEWS = [
  { quote: 'The online dashboard made everything so clear. I always knew exactly what step we were on and what needed to happen next. Rozsa was responsive to all my questions.', name: 'Maria G.', where: 'Los Angeles County' },
  { quote: 'As an out-of-state executor, I was worried about handling probate remotely. The flat fee gave me peace of mind and everything was handled professionally.', name: 'Robert T.', where: 'Orange County' },
  { quote: 'After my mother passed, I had no idea where to start. The intake process was simple and within days I had all the paperwork ready to file. Highly recommend.', name: 'Jennifer K.', where: 'San Bernardino County' },
];

const FAQS = [
  {
    q: 'Who files the papers and goes to court?',
    a: 'You do, as the petitioner. You represent yourself and your name goes on the court forms. Our office prepares the court papers, clears the probate notes and gives you step-by-step filing guides. If you want an attorney at a hearing, Rozsa Gyene can appear for you as limited scope counsel for $500 per hearing. If the hearing is continued, the appearance carries over to the new date.',
  },
  {
    q: 'Which service do I need?',
    a: 'Simplified probate ($2,495) is a court petition for the home that was the person\'s main residence, worth up to $750,000, for deaths on or after April 1, 2025 (Probate Code 13151). Most other estates need full probate. Not sure? The short eligibility check asks a few questions and shows which service fits before you sign up or pay.',
  },
  {
    q: 'How is the full probate fee set?',
    a: 'By the value of the probate estate: $3,995 up to $1,000,000, $5,995 from $1,000,000 to $2,000,000 and $7,995 over $2,000,000. The estate value is the gross value of what goes through probate, as the inventory will show it. It does not count a living trust, joint tenancy or accounts with a named beneficiary. You see your exact fee before you pay. For small estates, the fee is never more than the statutory fee for that estate (Probate Code 10810). If the inventory puts the estate in a different tier, the fee moves to that tier, with a refund or a balance due.',
  },
  {
    q: 'How does the flat fee compare with the statutory attorney fee?',
    a: 'California law sets the attorney fee in a probate by the value of the estate (Probate Code 10810). On a $500,000 estate, the statutory attorney fee is $13,000. Our flat fee is $3,995.',
  },
  {
    q: 'What costs are not included?',
    a: 'Amounts paid to others: the court filing fees, the newspaper publication, the probate referee fee for the appraisal and a bond premium if the court requires a bond. A court appearance, a final accounting and a house sale are optional add-ons with the prices shown above.',
  },
  {
    q: 'How long does a full probate take?',
    a: 'Creditors have at least four months after the court first issues Letters to file claims (Probate Code 9100), so a full probate stays open at least that long. With the first hearing, the inventory and the final petition, most full probates take a year or more. Your client home shows where you are and what comes next.',
  },
  {
    q: 'How can I pay?',
    a: 'At checkout you choose to pay in full, in 3 monthly payments that add up exactly to the fee, or over time with Klarna, subject to Klarna\'s approval. Payment is in US dollars.',
  },
  {
    q: 'Do I need to come to the office or call?',
    a: 'No. Everything happens online in your client home, and you can send our office a message there at any time. Our phone number is at the bottom of this page if you prefer it.',
  },
];

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://myprobateca.com/#website',
      name: 'MyProbateCA',
      url: 'https://myprobateca.com',
      description: 'California probate papers prepared by an attorney for a flat fee: Simplified Probate $2,495, Full Probate from $3,995.',
      publisher: { '@id': 'https://myprobateca.com/#organization' },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://myprobateca.com/#webpage',
      url: 'https://myprobateca.com',
      name: 'California Probate, Attorney-Prepared | Flat Fees from $2,495 | MyProbateCA',
      description: 'California probate papers prepared by an attorney for a flat fee. You file as the petitioner; our office prepares the court papers and clears the probate notes.',
      isPartOf: { '@id': 'https://myprobateca.com/#website' },
      about: { '@id': 'https://myprobateca.com/#organization' },
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.hero-headline', '.hero-subheadline'] },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://myprobateca.com/#faq',
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
};

const SectionHeading = ({ id, title, intro }) => (
  <div className="max-w-2xl mb-8 md:mb-10">
    <h2 id={id} className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">{title}</h2>
    {intro && <p className="mt-3 text-base md:text-lg text-slate-600 leading-relaxed">{intro}</p>}
  </div>
);

const CheckItem = ({ children }) => (
  <li className="flex gap-2.5">
    <Check className="h-5 w-5 mp-brand shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden="true" />
    <span>{children}</span>
  </li>
);

const LandingPage = () => (
  <>
    <Helmet>
      <title>California Probate, Attorney-Prepared | Flat Fees from $2,495 | MyProbateCA</title>
      <meta name="description" content="California probate papers prepared by an attorney for a flat fee: simplified probate $2,495, full probate from $3,995. You file as the petitioner; we prepare the papers and clear the probate notes. All online." />
      <link rel="canonical" href="https://myprobateca.com/" />
      <meta property="og:title" content="California probate papers, prepared by an attorney. Flat fee. Online." />
      <meta property="og:description" content="Simplified probate $2,495. Full probate from $3,995. You file as the petitioner; our office prepares the court papers and clears the probate notes." />
      <meta property="og:url" content="https://myprobateca.com/" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MyProbateCA" />
      <meta property="og:image" content="https://myprobateca.com/images/attorney/rozsa-gyene-760.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="California probate papers, prepared by an attorney. Flat fee. Online." />
      <meta name="twitter:description" content="Simplified probate $2,495. Full probate from $3,995. You file as the petitioner; our office prepares the court papers and clears the probate notes." />
      <meta name="twitter:image" content="https://myprobateca.com/images/attorney/rozsa-gyene-760.jpg" />
      <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
    </Helmet>

    <div className="min-h-screen bg-white text-slate-800">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] bg-white px-3 py-2 rounded">Skip to content</a>
      <SiteHeader onHome />

      <main id="main">
        {/* 1. Compact hero */}
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10 md:pt-14 md:pb-16">
            <div className="max-w-3xl">
              <h1 className="hero-headline text-[1.75rem] leading-tight md:text-5xl md:leading-[1.1] font-semibold tracking-tight text-slate-900">
                California probate papers, prepared by an attorney. Flat fee. Online.
              </h1>
              <p className="hero-subheadline mt-4 text-base md:text-xl text-slate-700 leading-relaxed">
                You file as the petitioner. Our office prepares your court papers and clears the probate notes, with step-by-step guides at every stage.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <a href={START_URL} className="mp-btn px-6 py-3.5 text-base md:text-lg">
                  Start your case
                  <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </a>
                <a href="#services" className="mp-link text-base text-center sm:text-left py-1">See services and prices</a>
              </div>
              <p className="mt-6 text-sm text-slate-600">
                Rozsa Gyene, Esq. <span aria-hidden="true">&middot;</span> State Bar #208356 <span aria-hidden="true">&middot;</span> 26+ years <span aria-hidden="true">&middot;</span> 500+ cases
              </p>
            </div>
          </div>
        </section>

        {/* 2. Service cards, directly under the hero */}
        <section id="services" aria-labelledby="services-title" className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading id="services-title" title="Choose your service" intro="One flat fee for the court papers. You see your exact fee before you pay." />

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Simplified */}
              <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="text-xl font-semibold text-slate-900">Simplified probate</h3>
                <p className="mt-1 text-sm text-slate-600">For the home that was the main residence, worth up to $750,000</p>
                <p className="mt-4"><span className="text-4xl font-semibold text-slate-900">$2,495</span> <span className="text-slate-600">flat fee</span></p>
                <a href={START_SIMPLIFIED_URL} className="mp-btn mt-5 px-5 py-3 text-base">Start your case</a>
                <p className="mt-3 text-xs text-slate-600 leading-relaxed">{PAY_LINE}</p>
                <ul className="mt-5 space-y-2.5 text-sm text-slate-700 border-t border-slate-100 pt-5">
                  <CheckItem>Petition asking the court to confirm who inherits the home, prepared by an attorney</CheckItem>
                  <CheckItem>Notice of the petition to the heirs and beneficiaries prepared, with filing steps</CheckItem>
                  <CheckItem>Probate notes cleared</CheckItem>
                </ul>
                <p className="mt-auto pt-5 text-xs text-slate-600">Probate Code 13151, for deaths on or after April 1, 2025.</p>
              </article>

              {/* Full probate */}
              <article className="flex flex-col rounded-xl border-2 border-[var(--mp-navy)] bg-white p-6">
                <h3 className="text-xl font-semibold text-slate-900">Full probate</h3>
                <p className="mt-1 text-sm text-slate-600">For estates that need a full court probate</p>
                <p className="mt-4"><span className="text-slate-600">from</span> <span className="text-4xl font-semibold text-slate-900">$3,995</span> <span className="text-slate-600">flat fee</span></p>
                <a href={START_FULL_URL} className="mp-btn mt-5 px-5 py-3 text-base">Start your case</a>
                <p className="mt-3 text-xs text-slate-600 leading-relaxed">{PAY_LINE}</p>
                <table className="mt-5 w-full text-sm border-t border-slate-100">
                  <caption className="sr-only">Full probate fee by probate estate value</caption>
                  <tbody>
                    {TIERS.map(([label, price]) => (
                      <tr key={label} className="border-b border-slate-100">
                        <th scope="row" className="py-2 pr-2 text-left font-normal text-slate-700">{label}</th>
                        <td className="py-2 text-right font-semibold text-slate-900">{price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
                  <CheckItem>The court papers for each stage, from the petition to final distribution, prepared by an attorney (a court accounting and a house sale are add-ons)</CheckItem>
                  <CheckItem>Probate notes cleared before your hearings</CheckItem>
                  <CheckItem>Notices, proofs of mailing and filing guides for each stage</CheckItem>
                </ul>
                <p className="mt-auto pt-5 text-xs text-slate-600 leading-relaxed">Estate value means what goes through probate. Small estates never pay more than the statutory fee (Probate Code 10810).</p>
              </article>

              {/* Not sure */}
              <article className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-6">
                <HelpCircle className="h-7 w-7 mp-brand" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="mt-3 text-xl font-semibold text-slate-900">Not sure which you need?</h3>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  Answer a few short questions about the estate. We show you which service fits before you sign up or pay.
                </p>
                <a href={ELIGIBILITY_CHECK_URL} className="mp-btn mt-5 px-5 py-3 text-base">Check which one fits</a>
                <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                  Some estates need no probate at all, for example when everything is in a living trust. The check tells you that too.
                </p>
              </article>
            </div>

            {/* Add-ons */}
            <h3 className="mt-12 text-lg font-semibold text-slate-900">Optional add-ons</h3>
            <p className="mt-1 text-sm text-slate-600">Add any of these from your client home, only if your case needs it.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2"><Gavel className="h-5 w-5 mp-brand" strokeWidth={1.75} aria-hidden="true" /><h4 className="font-semibold text-slate-900">Court appearance</h4></div>
                <p className="mt-2 text-sm"><span className="text-xl font-semibold text-slate-900">$500</span> <span className="text-slate-600">per hearing</span></p>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">Rozsa Gyene appears for you as limited scope counsel. If the hearing is continued, the appearance carries over to the new date. A contested hearing is $600.</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2"><Calculator className="h-5 w-5 mp-brand" strokeWidth={1.75} aria-hidden="true" /><h4 className="font-semibold text-slate-900">Final accounting</h4></div>
                <dl className="mt-2 text-sm space-y-1">
                  <div className="flex justify-between gap-3"><dt className="text-slate-600">Fewer than 50 transactions</dt><dd className="font-semibold text-slate-900">$995</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-slate-600">50 or more transactions</dt><dd className="font-semibold text-slate-900">$1,995</dd></div>
                </dl>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">If your case needs a court accounting.</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2"><Home className="h-5 w-5 mp-brand" strokeWidth={1.75} aria-hidden="true" /><h4 className="font-semibold text-slate-900">House sale</h4></div>
                <dl className="mt-2 text-sm space-y-1">
                  <div className="flex justify-between gap-3"><dt className="text-slate-600">By Notice of Proposed Action</dt><dd className="font-semibold text-slate-900">$995</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-slate-600">When the court must confirm the sale</dt><dd className="font-semibold text-slate-900">$1,495</dd></div>
                </dl>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">We prepare the sale papers and clear any probate notes; you sign, serve and file them.</p>
              </div>
            </div>

            {/* Decision 28: the one quiet full representation line */}
            <p className="mt-8 text-sm text-slate-600 leading-relaxed max-w-3xl">
              Prefer an attorney to handle everything, including court? Rozsa Gyene can represent you directly as your attorney. The fee is the statutory fee set by California law (Probate Code 10810), approved by the court.{' '}
              <a href={FULL_REPRESENTATION_URL} className="underline underline-offset-2 text-slate-700">Full representation</a>
            </p>
          </div>
        </section>

        {/* 3. How it works */}
        <section id="how-it-works" aria-labelledby="how-title" className="py-12 md:py-16 bg-slate-50 border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading id="how-title" title="How it works" />
            <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-xl bg-white border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--mp-navy)] mp-brand text-sm font-semibold" aria-hidden="true">{i + 1}</span>
                    <s.icon className="h-5 w-5 mp-brand" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.text}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8">
              <Link to={PROCESS_PATH} className="mp-link">See the 11 stages of a California probate</Link>
            </p>
          </div>
        </section>

        {/* 4. What's included and what's not */}
        <section id="pricing" aria-labelledby="included-title" className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading id="included-title" title="What the fee includes" intro="The flat fee covers our office's work on your court papers. Amounts paid to the court and others are separate." />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900">Included</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  {INCLUDED.map((t) => <CheckItem key={t}>{t}</CheckItem>)}
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="font-semibold text-slate-900">Not included</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  {NOT_INCLUDED.map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <Minus className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden="true" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-slate-600">Court appearances, a final accounting and a house sale are the optional add-ons above.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. About Rozsa */}
        <section id="about" aria-labelledby="about-title" className="py-12 md:py-16 bg-slate-50 border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start">
            <img
              src="/images/attorney/rozsa-gyene-560.webp"
              srcSet="/images/attorney/rozsa-gyene-360.webp 360w, /images/attorney/rozsa-gyene-560.webp 560w, /images/attorney/rozsa-gyene-760.webp 760w"
              sizes="(min-width: 768px) 420px, 100vw"
              alt="Attorney Rozsa Gyene in her office"
              width="560"
              height="560"
              loading="lazy"
              decoding="async"
              className="w-full max-w-md rounded-xl border border-slate-200 aspect-square object-cover"
            />
            <div>
              <h2 id="about-title" className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">About Rozsa Gyene</h2>
              <p className="mt-1 text-slate-600">Law Offices of Rozsa Gyene</p>
              <p className="mt-4 text-slate-700 leading-relaxed">
                Rozsa Gyene has practiced law in California for 26+ years and has completed 500+ cases. Through MyProbateCA, her office prepares the court papers for families who handle a probate themselves, and answers the probate notes the court issues on them.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                <li className="flex gap-2.5"><ShieldCheck className="h-5 w-5 mp-brand shrink-0" strokeWidth={1.75} aria-hidden="true" /><span>California State Bar #208356. <a href={BAR_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Verify the license<ExternalLink className="inline h-3.5 w-3.5 ml-1 align-[-2px]" strokeWidth={1.75} aria-hidden="true" /></a></span></li>
                <li className="flex gap-2.5"><MapPin className="h-5 w-5 mp-brand shrink-0" strokeWidth={1.75} aria-hidden="true" /><span>3500 W. Olive Ave., Suite 300, Burbank, CA 91505</span></li>
              </ul>
              <div className="mt-6 h-56 md:h-64 rounded-xl overflow-hidden border border-slate-200">
                <LazyMapFrame src="https://www.google.com/maps?q=3500+W.+Olive+Ave.,+Suite+300,+Burbank,+CA+91505&output=embed" title="Map of the Law Offices of Rozsa Gyene" />
              </div>
            </div>
          </div>
        </section>

        {/* 6. Reviews (Rozsa confirmed they are real clients, decision 31C) */}
        <section aria-labelledby="reviews-title" className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading id="reviews-title" title="What clients say" />
            <div className="grid gap-6 md:grid-cols-3">
              {REVIEWS.map((r) => (
                <figure key={r.name} className="rounded-xl border border-slate-200 p-6 flex flex-col">
                  <blockquote className="text-slate-700 leading-relaxed">&ldquo;{r.quote}&rdquo;</blockquote>
                  <figcaption className="mt-auto pt-4 text-sm">
                    <span className="font-semibold text-slate-900">{r.name}</span>
                    <span className="text-slate-600">, {r.where}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-5 text-xs text-slate-600 leading-relaxed max-w-3xl">
              Testimonials do not guarantee or predict the outcome of any matter.
            </p>
          </div>
        </section>

        {/* 7. FAQ */}
        <section id="faq" aria-labelledby="faq-title" className="py-12 md:py-16 bg-slate-50 border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <SectionHeading id="faq-title" title="Questions" />
            <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white rounded-xl border-x">
              {FAQS.map((f) => (
                <details key={f.q} className="mp-faq group px-5">
                  <summary className="flex items-center justify-between gap-4 py-4 font-medium text-slate-900">
                    <span>{f.q}</span>
                    <ChevronDown className="mp-faq-chevron h-5 w-5 text-slate-500 shrink-0 transition-transform" strokeWidth={1.75} aria-hidden="true" />
                  </summary>
                  <p className="pb-5 text-slate-700 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
            <p className="mt-6">
              <Link to="/probate-faq-california" className="mp-link">More probate questions</Link>
            </p>
          </div>
        </section>

        {/* 8. Final start band */}
        <section aria-labelledby="start-title" className="bg-[var(--mp-navy)] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 id="start-title" className="text-2xl md:text-3xl font-semibold tracking-tight">Ready to start?</h2>
              <p className="mt-2 text-white/90">The first questions take a few minutes. You see your exact fee before you pay.</p>
            </div>
            <a href={START_URL} className="mp-btn px-6 py-3.5 text-lg !bg-white !text-[var(--mp-navy)] hover:!bg-slate-100">
              Start your case
              <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  </>
);

export { LandingPage };
export default LandingPage;
