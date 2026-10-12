// Item q (Rozsa, point 10 approved in writing 2026-10-12): a NEW Simplified, Full or Accounting-only purchase is
// accepted only from a signed-in client whose case has the questions done. The approved order is account, fee
// agreement, questions, payment (decisions section 32), all in the client home. Add-ons for an existing case,
// balances and court appearances are not new purchases and keep working.
const START_URL = 'https://portal.myprobateca.com/start';
const CONTINUE_URL = 'https://portal.myprobateca.com/?tab=intake';
const NEW_PURCHASE_TYPES = ['simplified', 'full', 'accounting_only'];

const REFUSAL = {
  error: 'Please start your case in your client home first. It takes you through your account, the questions about the estate and then payment. New here? Start your case. Already started? Continue your case.',
  code: 'start_your_case',
  startUrl: START_URL,
  continueUrl: CONTINUE_URL,
  links: [{ label: 'Start your case', url: START_URL }, { label: 'Continue your case', url: CONTINUE_URL }]
};

const QUESTIONS_NOT_DONE = {
  error: 'Please finish the questions about the estate first. Continue your case in your client home; your answers are saved.',
  code: 'questions_not_done',
  continueUrl: CONTINUE_URL,
  links: [{ label: 'Continue your case', url: CONTINUE_URL }]
};

const isNewPurchase = (serviceType) => NEW_PURCHASE_TYPES.includes(serviceType);

// The questions are done when the answers have what every probate petition needs (a subset of what the client
// home already requires before its payment step, so a client who finished the questions is never refused).
function questionsDone(f) {
  const d = (f && f.decedent) || {};
  const p = (f && f.petitioner) || {};
  return !!(d.firstName && d.lastName && /^\d{4}-\d{2}-\d{2}/.test(String(d.dateOfDeath || ''))
    && p.firstName && p.lastName
    && (f.willExists === true || f.willExists === false)
    && Array.isArray(f.heirs) && f.heirs.length > 0);
}

// create-checkout-session: { ok } or { ok: false, status, body }
function checkNewPurchase({ serviceType, caller, caseDoc }) {
  if (!isNewPurchase(serviceType)) return { ok: true };
  if (caller && caseDoc && caseDoc.intakeCompletedAt) return { ok: true };
  return { ok: false, status: 403, body: REFUSAL };
}

module.exports = { checkNewPurchase, questionsDone, isNewPurchase, REFUSAL, QUESTIONS_NOT_DONE, START_URL, CONTINUE_URL, NEW_PURCHASE_TYPES };
