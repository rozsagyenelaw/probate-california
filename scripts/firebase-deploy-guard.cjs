#!/usr/bin/env node
// Firebase predeploy guard (MyProbateCA). Runs before every deploy of the target it is attached to in firebase.json.
// Refuses (exit 1) when:
//   1. the project is not probate-california, or
//   2. mode "functions": the deploy does not name every function (`--only functions:<name>,functions:<name>`).
//      A bare `firebase deploy`, `--only functions` or `--only functions:` would delete or overwrite functions.
//   3. mode "none": this folder must never deploy this target at all.
// The firebase command line is read from the parent processes (the CLI does not pass --only to hooks).
// If it cannot be found, the guard refuses (fails closed).
// Usage in firebase.json:  "predeploy": ["node \"$PROJECT_DIR/scripts/firebase-deploy-guard.cjs\" functions"]
const { execFileSync } = require('child_process');

const EXPECTED_PROJECT = 'probate-california';
const mode = process.argv[2] || 'rules';
const fail = (msg) => { console.error(`\n*** DEPLOY REFUSED by scripts/firebase-deploy-guard.cjs: ${msg}\n`); process.exit(1); };

if (mode === 'none') fail('this folder must never deploy this target. Cloud Functions deploy only from the myprobateca-portal repo; rules only from probate-california.');

const project = process.env.GCLOUD_PROJECT || '';
if (project !== EXPECTED_PROJECT) fail(`project is "${project || '(unknown)'}", expected "${EXPECTED_PROJECT}". Use --project ${EXPECTED_PROJECT}.`);

function firebaseCommandLine() {
  let pid = process.ppid;
  for (let i = 0; i < 12 && pid > 1; i++) {
    let out = '';
    try { out = execFileSync('ps', ['-o', 'ppid=,command=', '-p', String(pid)], { encoding: 'utf8' }).trim(); } catch { return null; }
    const m = out.match(/^(\d+)\s+(.*)$/s);
    if (!m) return null;
    const cmd = m[2];
    if (!cmd.includes('firebase-deploy-guard') && /(^|[\/\s])firebase(\.js)?\s/.test(cmd) && /\sdeploy(\s|$)/.test(cmd)) return cmd;
    pid = Number(m[1]);
  }
  return null;
}

if (mode === 'functions') {
  const cmd = firebaseCommandLine();
  if (!cmd) fail('could not read the firebase command line to check --only. Deploy functions by name: firebase deploy --only functions:<name>,functions:<name> --project probate-california');
  const m = cmd.match(/--only(?:=|\s+)(\S+)/);
  if (!m) fail('functions deploy without --only. Name every function: --only functions:<name>,functions:<name>');
  const targets = m[1].replace(/^["']|["']$/g, '').split(',');
  const fnTargets = targets.filter(t => t === 'functions' || t.startsWith('functions:'));
  if (!fnTargets.length) fail('functions predeploy ran but --only names no functions.');
  const bad = fnTargets.filter(t => !/^functions:[A-Za-z0-9_-]+$/.test(t));
  if (bad.length) fail(`every function must be named; refused target(s): ${bad.join(', ')}`);
  console.log(`deploy guard OK: project ${project}, ${fnTargets.length} named function(s)`);
} else {
  console.log(`deploy guard OK: project ${project}`);
}
