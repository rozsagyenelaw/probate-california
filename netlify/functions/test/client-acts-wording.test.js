// Item k (decisions sections 4, 5 and 22): the client is the self-represented petitioner. Site text never says the office
// files, publishes or mails for the client, or selects and places the newspaper notice.
// node --test netlify/functions/test/client-acts-wording.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..', '..');
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(jsx?|json)$/.test(f)) files.push(p); } })(path.join(root, 'src'));
files.push(path.join(root, 'netlify/functions/ai-helper-data/learn-articles.json'));
const BAD = [/newspaper selection/i, /we handle (all )?publication/i, /publication handled as part of our service/i, /we coordinate (all |with )?.{0,40}(publication|newspaper)/i,
  /we (handle|monitor)[^.]{0,60}\b(file|files)\b/i, /\bwe (will )?file (the|your|verified)/i, /\bwe (will )?(mail|publish) (the|your)/i, /we handle the (complex )?mailing/i,
  /we handle the paperwork, court filings/i, /we handle blocked account/i, /communicate with the referee on your behalf/i, /prepare and file form/i, /we handle probate filings/i,
  /handles all 11 phases/i, /prepares all 11 phases/i, /certified specialist apprais/i, /\bwe (frequently |regularly )?handle (many )?estates\b/i, /our firm serves [^.]*expertise/i, /10-15 (certified )?(copies|death)/i];
test('no text says the office files, publishes or mails for the client', () => {
  const hits = [];
  for (const f of files) { const s = fs.readFileSync(f, 'utf8'); for (const re of BAD) { const m = s.match(re); if (m) hits.push(`${path.relative(root, f)}: ${m[0]}`); } }
  assert.deepStrictEqual(hits, []);
});
test('publication notes follow section 22 and keep only cost ranges already there', async () => {
  const { PUBLICATION_INFO, getPublicationInfo } = await import(path.join(root, 'src/data/cityDetailedData.js'));
  for (const [county, v] of [...Object.entries(PUBLICATION_INFO), ['default', getPublicationInfo('Nowhere')]]) {
    assert.match(v.note, /^You place the notice with the newspaper yourself\. Your client home tells you which newspaper to use and gives you the exact notice text and what to ask for, including whether the newspaper files the proof of publication with the court\./, county);
    assert.ok(!/[–—]/.test(v.note) && !/consult/i.test(v.note), county);
  }
});

test('current small estate limit: $208,850 (deaths on or after April 1, 2025), never $184,500 as the current limit', () => {
  const hits = [];
  for (const f of files) {
    if (/eligibility/.test(f)) continue; // the dated threshold table keeps every period's figure
    const s = fs.readFileSync(f, 'utf8').replace(/April 1, 2022 through March 31, 2025, the affidavit and residence petition limit was \$184,500/g, '').replace(/For deaths before April 1, 2022, they were \$166,250/g, '');
    if (/\$184,500|\$166,250/.test(s)) hits.push(path.relative(root, f));
  }
  assert.deepStrictEqual(hits, []);
});
