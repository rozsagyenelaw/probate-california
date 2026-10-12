// Makes the CommonJS copies of the shared pure modules for the Netlify functions (CommonJS) from the ESM originals
// used by the browser code. Run after editing src/lib/eligibility.js or src/lib/courtDays.js:
//   node scripts/sync-shared-cjs.mjs
// netlify/functions/test/shared-cjs-parity.test.js fails if a copy is out of date. The client home (portal) keeps
// exact copies of the ESM files (src/home/intake/lib/eligibility.js, src/home/courtDays.js).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PAIRS = [['src/lib/eligibility.js', 'netlify/functions/lib/eligibility.js'], ['src/lib/courtDays.js', 'netlify/functions/lib/courtDays.js']];

export function toCjs(src, from) {
  const names = [];
  let out = src.replace(/^export (const|function|class) ([A-Za-z0-9_$]+)/gm, (m, kind, name) => { names.push(name); return `${kind} ${name}`; });
  out = out.replace(/^export default [A-Za-z0-9_$]+;\s*$/gm, '');
  if (/^\s*(import|export)\s/m.test(out)) throw new Error(`${from}: only plain exports are supported`);
  return `// GENERATED from ${from} by scripts/sync-shared-cjs.mjs. Do not edit; edit the original and run the script.\n'use strict';\n${out.trimEnd()}\n\nmodule.exports = { ${names.join(', ')} };\n`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  for (const [from, to] of PAIRS) {
    fs.writeFileSync(path.join(root, to), toCjs(fs.readFileSync(path.join(root, from), 'utf8'), from));
    console.log('wrote', to);
  }
}
