// Reads config/business (public, admin-written) over the defaults. Cached for 60 seconds per warm function.
const defaults = require('./businessDefaults');
let cache = null; let cachedAt = 0;
async function getBusinessSettings(db) {
  if (cache && Date.now() - cachedAt < 60000) return cache;
  let live = {};
  try { const s = await db.collection('config').doc('business').get(); if (s.exists) live = s.data() || {}; } catch (e) { console.warn('config/business unreadable, using defaults:', e.message); }
  const merged = { ...defaults };
  for (const k of Object.keys(defaults)) if (live[k] !== undefined && live[k] !== null) merged[k] = live[k];
  merged.contestedHearing = { ...defaults.contestedHearing, ...(live.contestedHearing || {}) };
  // Placeholder refund policy until W2-fee's fee agreement text is approved (refundPolicyText in config/business).
  merged.refundPolicyText = live.refundPolicyText || null;
  cache = merged; cachedAt = Date.now();
  return merged;
}
module.exports = { getBusinessSettings, defaults };
