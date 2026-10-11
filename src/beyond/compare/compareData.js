// Item 73 (HOLD): comparison pages. Every competitor claim cites a page opened on 2026-10-10
// (build-evidence/W3-beyond/sources/73-competitor-sources-2026-10-10.txt). Where a competitor's page
// does not say something, we leave that row out rather than guess (review ruling 2026-10-10).
export const CHECKED_ON = 'October 10, 2026';

export const SRC = {
  twCa: { label: 'Trust & Will, California probate attorney page', url: 'https://probate.trustandwill.com/affordable-probate-attorney-california' },
  twMain: { label: 'Trust & Will, Probate page', url: 'https://trustandwill.com/probate' },
  swift: { label: 'SwiftProbate home page', url: 'https://swiftprobate.com' },
  swiftDisc: { label: 'SwiftProbate disclaimer', url: 'https://swiftprobate.com/disclaimer' },
  atticusFaq: { label: 'Atticus FAQs', url: 'https://weareatticus.com/faqs' },
  atticusFam: { label: 'Atticus for families', url: 'https://weareatticus.com/for-families' },
  eePricing: { label: 'EstateExec pricing', url: 'https://www.estateexec.com/pricing.html' },
  eeTerms: { label: 'EstateExec terms', url: 'https://www.estateexec.com/terms.html' },
  ever: { label: 'EverSettled home page', url: 'https://eversettled.com' },
  calbar: { label: 'State Bar of California, Unauthorized practice of law', url: 'https://www.calbar.ca.gov/Public/Free-Legal-Information/Unauthorized-Practice-of-Law' },
};

export const PAGES = {
  'trust-and-will-probate': {
    title: 'MyProbateCA vs. Trust & Will probate (EZ-Probate) in California',
    description: 'A side-by-side look at MyProbateCA and Trust & Will’s California probate service: who does the legal work, price, and what is included.',
    intro: 'Both services help California families through probate for a flat fee. Here is how they compare, using each company’s own published information.',
    columns: ['MyProbateCA', 'Trust & Will probate'],
    rows: [
      { label: 'Who prepares the court papers', ours: 'Law Offices of Rozsa Gyene, a California law firm (attorney Rozsa Gyene, 26+ years, 500+ cases). We prepare your court papers and answer the court’s probate notes, in simplified and full probate.', theirs: 'EZ-Probate helps prepare “ready-to-sign court forms”, with legal counsel from a California partner attorney and an “expert probate team” to help answer questions.', src: ['twCa'] },
      { label: 'Who files and goes to court', ours: 'You sign and file the papers we prepare, as the petitioner, with step-by-step filing instructions. Rozsa can appear at a hearing for you as limited scope representation: optional, $500 per hearing.', theirs: 'Its page does not say who files or appears in court. It says it “connects you with an attorney in your area for the legal counsel you need.”', src: ['twCa'] },
      { label: 'Is the company a law firm?', ours: 'Yes.', theirs: 'Trust & Will says: “We are not a law firm, we do not provide legal advice.” Legal counsel comes from its partner attorney.', src: ['twMain', 'twCa'] },
      { label: 'Flat fee', ours: '$2,495 simplified probate. Full probate: $3,995 for a probate estate up to $1,000,000; $5,995 from $1,000,000 to $2,000,000; $7,995 over $2,000,000. Final accounting, if needed, is a separate add-on.', theirs: 'Starting at $5,000.', src: ['twCa'] },
      { label: 'Payment plan', ours: 'Pay in 3 payments that add up to the same price.', theirs: 'Starting at $500 per month.', src: ['twCa'] },
      { label: 'Online account', ours: 'Yes: a client home with a step-by-step progress bar, messages with our office, documents, e-signing, deadline reminders and a guide for every step.', theirs: 'Yes: an online probate account (“Login to Your Probate Account”).', src: ['twMain'] },
    ],
    closing: 'If you want a California attorney’s office to prepare your court documents for a lower flat fee, MyProbateCA may be a good fit. Prices and services change, so check each company’s site before you decide.',
  },
  'diy-probate-software': {
    title: 'MyProbateCA vs. do-it-yourself probate software',
    description: 'How an attorney-led flat-fee probate service compares with SwiftProbate, Atticus, EstateExec and EverSettled.',
    intro: 'Do-it-yourself tools cost less and can help you stay organized. They are not law firms, so they cannot give you legal advice about your case or have a lawyer prepare your court papers. In California, only attorneys can practice law.',
    introSrc: ['calbar'],
    columns: ['Service', 'Price (as published)', 'What the company says about legal advice'],
    software: [
      { name: 'SwiftProbate', price: 'Free tier; $39 one time for the full plan.', legal: '“We are not a law firm.” “No attorney-client relationship is created by using this service.”', src: ['swift', 'swiftDisc'] },
      { name: 'Atticus', price: '$499, with plans starting at $175.', legal: '“Atticus is not a law firm or an attorney.”', files: '“Our users represent themselves in their matters.”', src: ['atticusFam', 'atticusFaq'] },
      { name: 'EstateExec', price: '$199 one time after a 10-day free trial.', legal: 'Its terms say it “does NOT provide legal or financial advice.”', src: ['eePricing', 'eeTerms'] },
      { name: 'EverSettled', price: '$1,999 total for the estate.', legal: '“EverSettled is not a law firm and does not give legal advice.”', files: '“You provide the details, review, sign, and submit everything.”', src: ['ever'] },
    ],
    ours: { name: 'MyProbateCA (Law Offices of Rozsa Gyene)', price: '$2,495 simplified probate. Full probate: $3,995 for a probate estate up to $1,000,000; $5,995 from $1,000,000 to $2,000,000; $7,995 over $2,000,000. Final accounting, if needed, is a separate add-on.', legal: 'A California law firm prepares your court papers and answers the court\u2019s probate notes. Questions go to our office through your portal messages.', files: 'You file the papers we prepare, as the petitioner. Rozsa can appear at a hearing for you as limited scope representation: optional, $500 per hearing.' },
    closing: 'If your estate is simple and you are comfortable preparing the court papers yourself, software may be enough. If you want a California attorney\u2019s office to prepare your court papers, clear the court\u2019s notes and answer your legal questions while you file them yourself, you can start your case online today.',
  },
};
