// GENERATED from src/lib/questions.js by scripts/sync-shared-cjs.mjs. Do not edit; edit the original and run the script.
'use strict';
// Which questions are still open (Rozsa, fourth message 2026-10-12, A: we never refuse a payment).
// Pure module, used three ways: the client home (portal src/home/questions.js, an exact copy), the payment functions
// (netlify/functions/lib/questions.js, a CommonJS copy made by scripts/sync-shared-cjs.mjs) and this site.
// The required answers are the same ones the client home asks for page by page (portal IntakePage missingFor),
// plus the value of the main home, which decides the fee.

const PAGE_TITLES = Object.freeze({
  decedent: 'The person who passed away',
  petitioner: 'About you',
  will: 'The will',
  heirs: 'Family and others who inherit',
  realProperty: 'House and land'
});

const num = (v) => { const f = parseFloat(String(v == null ? '' : v).replace(/[$,\s]/g, '')); return Number.isFinite(f) && f > 0 ? f : 0; };
const isHome = (p) => p && (p.propertyType === 'primary_residence' || p.isPrimaryResidence === true);

// [{ page: 'decedent', title: 'The person who passed away', items: ['Date of death', ...] }, ...]
function missingQuestions(f) {
  const x = f || {};
  const d = x.decedent || {}; const a = d.lastAddress || {};
  const p = x.petitioner || {}; const pa = p.address || {};
  const out = [];
  const add = (page, items) => { const list = items.filter(Boolean); if (list.length) out.push({ page, title: PAGE_TITLES[page], items: list }); };
  add('decedent', [!d.firstName && 'First name', !d.lastName && 'Last name', !d.dateOfDeath && 'Date of death',
    !a.street && 'Street address', !a.city && 'City', !a.county && 'County', !d.maritalStatus && 'Marital status']);
  add('petitioner', [!p.firstName && 'Your first name', !p.lastName && 'Your last name', !p.relationship && 'How you are related',
    !p.phone && 'Phone', !p.email && 'Email', !pa.street && 'Street address', !pa.city && 'City', !pa.zip && 'ZIP code']);
  const will = x.willExists;
  add('will', [(will !== true && will !== false) && 'Is there a will? (yes or no)',
    will === true && !x.willDate && 'Date of the will',
    will === true && !x.namedExecutor && 'Person named in the will to handle the estate',
    will === true && (x.bondWaivedInWill !== true && x.bondWaivedInWill !== false) && 'Does the will say no bond is needed?']);
  add('heirs', [!(Array.isArray(x.heirs) && x.heirs.length > 0) && 'At least one family member or other person who inherits']);
  const homes = ((x.assets && x.assets.realProperty) || []).filter(isHome);
  add('realProperty', homes.filter((h) => !num(h.estimatedValue ?? h.value)).map((h) => `The value of the home${h.address ? ` at ${h.address}` : ''}`));
  return out;
}

// Fix 5 (sixth message, 2026-10-12): the client's own details already known from the account and the start screen
// fill the empty "About you" answers, so the email never shows as missing, nor the name and phone when known.
function withAccountDefaults(f, account) {
  const x = f || {};
  const a = account || {};
  const p = x.petitioner || {};
  const fill = (cur, v) => (cur && String(cur).trim() ? cur : (v || cur || ''));
  return { ...x, petitioner: { ...p, email: fill(p.email, a.email), firstName: fill(p.firstName, a.firstName), lastName: fill(p.lastName, a.lastName), phone: fill(p.phone, a.phone) } };
}

function answersComplete(f) {
  return missingQuestions(f).length === 0;
}

// One plain line per page, for emails and the office: "The person who passed away: Date of death, County"
function missingLines(f) {
  return missingQuestions(f).map((m) => `${m.title}: ${m.items.join(', ')}`);
}

// The full probate fee basis (A3): with complete answers the fee follows the answers (10810 and tiers); with
// incomplete answers it is the tier of the estate range chosen on the first screen; with no range, $3,995, flagged.
// estateRange uses the payment keys: 'up-to-1m' | '1m-to-2m' | 'over-2m'.
function feeBasisFor({ formData, estateRange, answersValueCents }) {
  const complete = answersComplete(formData);
  if (complete && Number(answersValueCents) > 0) return { use: 'answers', estateValueCents: Math.round(Number(answersValueCents)), estateRange: null, flag: null };
  if (['up-to-1m', '1m-to-2m', 'over-2m'].includes(estateRange)) return { use: 'range', estateValueCents: null, estateRange, flag: complete ? null : 'questions-missing' };
  return { use: 'default', estateValueCents: null, estateRange: 'up-to-1m', flag: 'no-estate-range' };
}

module.exports = { PAGE_TITLES, missingQuestions, withAccountDefaults, answersComplete, missingLines, feeBasisFor };
