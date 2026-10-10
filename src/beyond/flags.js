import { useEffect, useState } from 'react';

// W3-beyond switches for the main site, read from Firestore config/beyondFeatures (public read)
// through the REST endpoint, so these pages do not load the Firebase SDK.
// HOLD pages (Spanish landing 70, comparison pages 73) stay hidden until their switch is true.
const URL_ = 'https://firestore.googleapis.com/v1/projects/probate-california/databases/(default)/documents/config/beyondFeatures';

function demo() {
  return import.meta.env.VITE_BEYOND_DEMO === 'true' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

let cached = null;
export async function loadFlags() {
  if (demo()) return { spanish: true, comparisonPages: true };
  if (cached) return cached;
  try {
    const res = await fetch(URL_);
    const json = res.ok ? await res.json() : {};
    const fields = json.fields || {};
    cached = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.booleanValue === true]));
  } catch {
    cached = {};
  }
  return cached;
}

export function useFlag(name) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    let alive = true;
    loadFlags().then((f) => alive && setValue(f[name] === true));
    return () => { alive = false; };
  }, [name]);
  return value;
}
