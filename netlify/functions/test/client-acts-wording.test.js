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

// Item l: no "specialist" or specializing claims (State Bar rules), no court representation offered as part of the
// package (only the optional limited scope appearance and the separate full representation retainer, decision 28), the
// accounting only as an add-on, and Probate Code 8121 stated accurately.
test('item l: no specialist claims, no representation claims, accounting as an add-on, 8121 stated accurately', () => {
  const BAD_L = [/stanley mosk specialists/i, /specialized our workflows/i, /\bspecialist:/i, /\bwe specialize\b/i, /specializes in (california probate|drafting)/i,
    /se especializa en la administraci/i, /nos especializamos/i, /bond coordination/i, /publication coordination/i, /court filing coordination/i,
    /all 11 phases of administration/i, /cannot represent you in court/i, /we can represent you in court/i, /we prepare the detailed accounting/i,
    /do you handle probate in all california counties/i, /require careful coordination/i, /coordination with (the )?probate referee/i,
    /complete probate referee coordination/i, /full coordination with the probate referee/i, /the newspaper must be in the city where the decedent lived/i,
    /court appearance \(remote\) if needed/i, /complete case management/i, /creditor notification management/i, /prepared and filed/i];
  const hits = [];
  for (const f of files) { const s = fs.readFileSync(f, 'utf8'); for (const re of BAD_L) { const m = s.match(re); if (m) hits.push(`${path.relative(root, f)}: ${m[0]}`); } }
  assert.deepStrictEqual(hits.filter(h => !/legal\/TermsOfService/.test(h)), []); // Terms wording is HOLD for Rozsa's approval
  const how = fs.readFileSync(path.join(root, 'src/components/learn/articles/HowToFileProbate.jsx'), 'utf8');
  // item n (third message) restated the 8121 rule from the statute text: 'general circulation in the city', 8121(b)
  assert.ok(how.includes('Use a newspaper of general circulation in the city where the decedent lived, if there is one; otherwise, one in the county (Probate Code 8121(b)).'));
  const adm = fs.readFileSync(path.join(root, 'src/components/pages/CaliforniaProbateAdministration.jsx'), 'utf8');
  assert.ok(adm.includes('Simple $995 for fewer than 50 transactions, Complex $1,995 for 50 or more'));
});

// Item p2 (APPROVAL-8, approved in writing: point 8 all 10 rows): court appearance wording is limited scope counsel,
// $500 per hearing ($600 if someone has filed an objection); no "on your behalf", flat fee, Zoom or hourly wording.
test('item p2: APPROVAL-8 rows 1 to 10', () => {
  const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  const pages = ['src/components/pages/ProbateFAQ.jsx', 'src/components/pages/ProbateCourtLocations.jsx', 'src/components/pages/CityProbatePage.jsx', 'src/components/intake/steps/PaymentStep.jsx'];
  const BAD = [/on your behalf/i, /\$500 flat fee/i, /zoom or microsoft/i, /we represent many/i, /specifically designed for out-of-state/i, /2-hour/i, /can't attend your hearing/i];
  const hits = [];
  for (const f of pages) { const s = read(f); for (const re of BAD) { const m = s.match(re); if (m) hits.push(`${f}: ${m[0]}`); } }
  assert.deepStrictEqual(hits, []);
  const faq = read(pages[0]);
  assert.ok(faq.includes('Not always. Many California probate hearings can be attended remotely, if the court allows it for your hearing. Your client home shows each hearing date and what to do.'), 'row 1');
  assert.ok(faq.includes('If you want an attorney at a hearing, Rozsa Gyene can appear for you at that hearing as limited scope counsel, for $500 per hearing ($600 if someone has filed an objection). You remain the petitioner.'), 'row 2');
  assert.ok(faq.includes('Out-of-state executors can do everything online in the client home.'), 'row 3');
  const loc = read(pages[1]);
  assert.ok(loc.includes('Optional: Rozsa appears at a hearing as limited scope counsel, $500 per hearing ($600 contested)') && !loc.includes('$500 add-on'), 'row 4');
  assert.ok(loc.includes('No. Many out-of-state executors use MyProbateCA. You do everything online,'), 'row 5');
  assert.ok(loc.includes('Rozsa Gyene can appear at a hearing as limited scope counsel, for $500 per hearing ($600 if someone has filed an objection).'), 'row 6');
  const city = read(pages[2]);
  assert.ok(city.includes('Out-of-state executors can do everything online. If you want an attorney at a ${city.courthouse} hearing'), 'row 7');
  assert.ok(city.includes('Yes, as an option. Rozsa Gyene can appear for you at a ${city.courthouse} hearing as limited scope counsel'), 'row 8');
  assert.ok(read('netlify/functions/lib/stripeText.js').includes("name: 'Contested Hearing Appearance ($600 per hearing, limited scope)'"), 'row 9 (item o)');
  assert.ok(read(pages[3]).includes('Want an attorney at your hearing? Rozsa Gyene can appear for you at that hearing'), 'row 10');
});

// Item t (third message, point 8, approved in writing): the city service line and the Letters article add-on line.
test('item t: city service line and Letters add-on line, every copy', () => {
  const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  const all = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  assert.ok(!all.includes('($500 add-on)') && !all.includes('($500 additional)') && !all.includes('($500 adicionales)'));
  assert.ok(read('src/components/pages/CityProbatePage.jsx').includes('Optional remote court appearance ($500 per hearing, limited scope)'));
  const L = 'Optional attorney appearance at a hearing ($500 per hearing, limited scope representation)';
  assert.ok(read('src/components/learn/articles/LettersTestamentary.jsx').includes(L));
  assert.strictEqual(read('src/beyond/es/learn/articles-es.json').split(L).length - 1, 2);
  assert.ok(read('src/beyond/es/learn/articles-es.json').includes('Comparecencia opcional de la abogada en una audiencia ($500 por audiencia, representación de alcance limitado)'));
  assert.ok(read('netlify/functions/ai-helper-data/learn-articles.json').includes(L));
});

// Item s2 (eighth message A, approved in writing): 'already started' answers, the court locations card, no IGN note clearance anywhere.
test('item s2: already-started answers with the 10810 ending and link, Probate Notes card, every IGN note clearance copy', () => {
  const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  const END = 'under a separate written agreement with her law office. The fee is the statutory fee set by California law (Probate Code 10810), paid from the estate as approved by the court.';
  const LINK = new RegExp('Rozsa Gyene can <a href="https://portal\\.livingtrust-attorneys\\.com/book" target="_blank" rel="noopener noreferrer" className="[^"]+">represent you directly</a> ' + END.replace(/[.()]/g, '\\$&'));
  const loc = read('src/components/pages/ProbateCourtLocations.jsx');
  const faq = read('src/components/pages/ProbateFAQ.jsx');
  assert.ok(loc.includes('Rozsa Gyene can represent you directly ' + END), 'search data copy');
  assert.ok(LINK.test(loc) && LINK.test(faq), 'page copies with the link');
  for (const t of [loc, faq]) assert.ok(!/consult/i.test(t.split('already started')[1].slice(0, 900)), 'no consultation wording');
  assert.ok(loc.includes('<h3 className="font-bold text-gray-900 mb-2">Probate Notes</h3>') && loc.includes("We check the court's probate notes and prepare the answers before your hearing. You sign the answers (Verified Supplements) and file them."), 'card');
  const all = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  assert.ok(!/IGN note clearance|IGN Note Clearance|notas IGN y Suplementos|Note Clearance" service/.test(all), 'no IGN note clearance copy left');
});

// Item w (fourth message, point 9): the appearance line sits under its own "Optional add-ons" heading, not under
// "Our flat fee includes:" (English page, English and Spanish copies, AI helper data).
test('item w: Letters appearance line under "Optional add-ons"', () => {
  const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  const L = 'Optional attorney appearance at a hearing ($500 per hearing, limited scope representation)';
  const page = read('src/components/learn/articles/LettersTestamentary.jsx');
  assert.ok(page.indexOf('Optional add-ons') > page.indexOf('Instructions for using Letters with banks and institutions') && page.indexOf(L) > page.indexOf('Optional add-ons'));
  const es = JSON.parse(read('src/beyond/es/learn/articles-es.json')).articles.find((a) => a.component === 'LettersTestamentary').blocks;
  const i = es.findIndex((b) => b.type === 'h3' && b.en === 'Optional add-ons' && b.text === 'Servicios opcionales');
  assert.ok(i > 0 && es[i + 1].type === 'ul' && es[i + 1].en[0] === L);
  assert.ok(!es[i - 1].en.includes(L), 'not under "Our flat fee includes:"');
  assert.ok(es.some((b) => b.en === 'Our flat fee includes:' && b.text === 'Nuestra tarifa fija incluye:'), 'eighth message B');
  assert.ok(!es.some((b) => /\$3,995 flat fee includes:|tarifa fija de \$3,995 incluye:/.test(`${b.en} ${b.text}`)), 'no $3,995 in the Letters fee line');
  assert.ok(read('netlify/functions/ai-helper-data/learn-articles.json').includes('Instructions for using Letters with banks and institutionsOptional add-onsOptional attorney appearance'));
});

// Item n (third message): approved point 11 rows plus the publication schedule (Prob. Code 8121(a), 8121(b), 8124,
// opened on leginfo 2026-10-12), the Step 5 heading, and no client-facing "IGN" anywhere (English, Spanish, AI helper).
test('item n: point 11 rows, publication schedule, Step 5 heading, no IGN', () => {
  const hits = [];
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8');
    for (const re of [/\bIGN\b/, /consecutive weeks/i, /successive weeks/i, /semanas consecutivas/i, /Publish Notice and Mail to Heirs/, /mail notice to all heirs, beneficiaries, and any creditors/i, /within 30 days of appointment/i, /publish notice of death/i]) {
      const m = s.match(re); if (m) hits.push(`${path.relative(root, f)}: ${m[0]}`);
    }
  }
  assert.deepStrictEqual(hits, []);
  const how = fs.readFileSync(path.join(root, 'src/components/learn/articles/HowToFileProbate.jsx'), 'utf8');
  assert.ok(how.includes('Step 5: Publish the Notice and Have It Mailed to Heirs'));
  assert.ok(how.includes('with at least five days between the first and last publication dates, not counting those dates (Probate Code 8121(a))'));
  assert.ok(how.includes('The court does not hear the petition until the proof of publication is on file (Probate Code 8124).'));
  assert.ok(how.includes('An adult who is not part of the case') && how.includes('Notice of Administration to Creditors (DE-157)'));
});

// Item n3 (eighth message E2, E3, E5, E6, approved in writing).
test('item n3: Probate Notes capitalized, no $3,995-alone prices in the probate notes article copies, article title, 13151 payment line', () => {
  const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  const all = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  assert.ok(!/probate Notes/.test(all) && !/probate notes probate/.test(all), 'E2');
  const ai = JSON.parse(read('netlify/functions/ai-helper-data/learn-articles.json')).articles.find((a) => a.path.endsWith('clear-ign-notes-stanley-mosk'));
  assert.strictEqual(ai.title, 'How to Clear Probate Notes at Stanley Mosk Courthouse', 'E5 title, address unchanged');
  assert.ok(!/\$3,995 full probate|\$3,995 for full probate|\(\$3,995/.test(ai.text), 'E3 AI helper');
  const es = JSON.parse(read('src/beyond/es/learn/articles-es.json')).articles.find((a) => a.component === 'ClearIGNNotes');
  assert.ok(!/\$3,995|\$2,495/.test(JSON.stringify(es.blocks)), 'E3 Spanish file');
  assert.ok(!/\$3,995|\$2,495/.test(read('src/components/learn/articles/ClearIGNNotes.jsx')), 'E3 page');
  const L = 'For a main home in California worth $750,000 or less (Probate Code 13151)';
  assert.ok(read('src/components/intake/steps/PaymentStep.jsx').includes(L) && read('src/components/PaymentPage.jsx').includes(L), 'E6');
  assert.ok(!all.includes('when the rest of the estate is small'), 'E6 old line gone');
});
