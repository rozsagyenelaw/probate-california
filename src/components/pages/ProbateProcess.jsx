import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '../site/SiteHeader';
import SiteFooter from '../site/SiteFooter';
import { START_URL } from '../../config/tracking';

// The 11 stages of a full California probate (moved off the home page, decision 31C item 4).
// Stage names match the client home's progress bar (W3-cockpit phase model, notes/shared-data-model.md section 3).
// Scope (decisions 4, 5, 22): the client is the petitioner and files; the office prepares the papers and clears the notes.
const STAGES = [
  { title: 'Telling us about the estate', you: 'Answer the questions online in your client home.', we: 'Review your answers and confirm which papers your case needs.' },
  { title: 'Preparing your court papers', you: 'Sign the petition and file it with the court, using the step-by-step filing guide.', we: 'Prepare the Petition for Probate and the papers that go with it.' },
  { title: 'Notifying the public and the family', you: 'Ask an adult who is not part of the case to mail the notices, and place the newspaper notice we give you.', we: 'Prepare the notices, the proof of mailing and the exact newspaper notice text.' },
  { title: 'Answering the court\'s questions', you: 'Before your court date, sign and file the papers that answer the probate notes, at least 3 court days before the hearing.', we: 'Read the court\'s probate notes and prepare what clears them.' },
  { title: 'Your court date', you: 'Attend if the court requires it, or add our $500 appearance as limited scope representation for that hearing.', we: 'Tell you what to expect at the hearing.' },
  { title: 'Bond, if the court orders one', you: 'If the court\'s order requires a bond, get it from a bonding company before your Letters are issued.', we: 'Tell you the amount the order sets and what to do.' },
  { title: 'You are officially in charge', you: 'Pick up your Letters and open the estate bank account.', we: 'Prepare the proposed order and the Letters for the court.' },
  { title: 'Listing and valuing what the estate owns', you: 'Gather statements and values; the probate referee appraises the rest.', we: 'Prepare the Inventory and Appraisal.' },
  { title: 'Paying the estate\'s bills', you: 'Pay valid debts from the estate account during the creditor claim period.', we: 'Prepare notices to known creditors and responses to claims.' },
  { title: 'Asking the court to approve the final split', you: 'Sign and file the final petition.', we: 'Prepare the petition for final distribution and the order.' },
  { title: 'Finishing up', you: 'Transfer the property as the order says and file the receipts.', we: 'Prepare the receipts and the papers to close the estate.' },
];

const ProbateProcess = () => (
  <>
    <Helmet>
      <title>The 11 Stages of California Probate | MyProbateCA</title>
      <meta name="description" content="The 11 stages of a full California probate, from the petition to closing: what you do as the petitioner and what our office prepares at each stage." />
      <link rel="canonical" href="https://myprobateca.com/california-probate-process" />
      <meta property="og:title" content="The 11 Stages of California Probate | MyProbateCA" />
      <meta property="og:url" content="https://myprobateca.com/california-probate-process" />
    </Helmet>
    <div className="min-h-screen bg-white text-slate-800">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">The 11 stages of a California probate</h1>
        <p className="mt-4 text-lg text-slate-700 leading-relaxed">
          A full probate moves through these stages, and your client home shows the same stages on its progress bar. You file as the petitioner; our office prepares the court papers and clears the probate notes.
        </p>
        <ol className="mt-10 space-y-4">
          {STAGES.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-slate-200 p-5">
              <h2 className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--mp-navy)] mp-brand text-sm" aria-hidden="true">{i + 1}</span>
                <span><span className="sr-only">Stage {i + 1}: </span>{s.title}</span>
              </h2>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 sm:gap-6">
                <div><dt className="font-semibold text-slate-900">You</dt><dd className="mt-1 text-slate-700 leading-relaxed">{s.you}</dd></div>
                <div><dt className="font-semibold text-slate-900">Our office</dt><dd className="mt-1 text-slate-700 leading-relaxed">{s.we}</dd></div>
              </dl>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-slate-600 leading-relaxed">
          Creditors have at least four months after the court first issues Letters to file claims (Probate Code 9100), so most full probates take a year or more. Simplified probate for a home worth up to $750,000 (Probate Code 13151) uses a single petition instead of these stages.
        </p>
        <a href={START_URL} className="mp-btn mt-8 px-6 py-3.5 text-lg">
          Start your case
          <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </a>
      </main>
      <SiteFooter />
    </div>
  </>
);

export default ProbateProcess;
