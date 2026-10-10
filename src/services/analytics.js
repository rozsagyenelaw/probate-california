/**
 * Analytics: Google tag (GA4 + Google Ads) and Microsoft Clarity.
 *
 * Speed: the Google tag (about 200 KB) and Clarity load after the visitor first interacts with the
 * page or once the page has been idle for a few seconds, so they never delay the first paint.
 * Calls made before the script arrives are queued in window.dataLayer and sent when it loads,
 * so no page view, lead or purchase is lost. Pages that record a conversion call loadAnalyticsNow().
 *
 * Privacy: a browser sending the Global Privacy Control signal (California opt-out of sharing)
 * gets Google consent mode with advertising storage and ad personalization denied.
 *
 * Env: VITE_GA_MEASUREMENT_ID (defaults to the MyProbateCA GA4 ID), VITE_CLARITY_ID (optional).
 */
import { GA4_ID, ADS_ID, ADS_LABELS } from '../config/tracking';

const isBrowser = typeof window !== 'undefined';
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || GA4_ID;
const IDLE_DELAY_MS = 3500;
const TRIGGERS = ['pointerdown', 'keydown', 'touchstart', 'scroll'];

let initialized = false;
let loaded = false;

function gtagQueue() {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
  }
  return window.gtag;
}

function gpcOptOut() {
  try { return navigator.globalPrivacyControl === true; } catch { return false; }
}

function injectScripts() {
  if (loaded) return;
  loaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(s);

  const clarityId = import.meta.env.VITE_CLARITY_ID;
  if (clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', clarityId);
  }
}

/** Load the tag right away (used on pages that record a conversion). */
export function loadAnalyticsNow() {
  if (!isBrowser) return;
  initAnalytics();
  injectScripts();
}

/** Queue the configuration now; load the scripts on first interaction or when idle. */
export function initAnalytics() {
  if (!isBrowser || initialized) return;
  initialized = true;
  const gtag = gtagQueue();

  if (gpcOptOut()) {
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    });
  }
  gtag('js', new Date());
  // Visits that move between the site and the client portal stay one session
  const linker = { domains: ['myprobateca.com', 'portal.myprobateca.com'] };
  gtag('config', measurementId, { linker });
  gtag('config', ADS_ID, { linker });

  // Phone clicks (tel: links) are recorded as a GA4 event
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest && e.target.closest('a[href^="tel:"]');
    if (a) trackEvent('phone_click', { link_url: a.getAttribute('href') });
  }, { capture: true });

  const trigger = () => {
    TRIGGERS.forEach((t) => window.removeEventListener(t, trigger, true));
    injectScripts();
  };
  TRIGGERS.forEach((t) => window.addEventListener(t, trigger, { capture: true, passive: true }));
  const idle = () => setTimeout(trigger, IDLE_DELAY_MS);
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}

// GA4 events go only to the MyProbateCA property (send_to), never to other properties that share
// the Google tag. Google Ads conversions name their own destination.
export const trackEvent = (eventName, params = {}) => {
  if (!isBrowser) return;
  initAnalytics();
  gtagQueue()('event', eventName, { send_to: measurementId, ...params });
};

/**
 * A lead: a new account, a finished intake, or the first checkout step for a guest.
 * Google Ads counts one lead per ad click, so repeated calls are harmless.
 */
export const trackLead = (source) => {
  trackEvent('generate_lead', { lead_source: source, currency: 'USD', value: 0 });
  trackEvent('conversion', { send_to: `${ADS_ID}/${ADS_LABELS.lead}` });
};

export const trackBeginCheckout = (value, serviceType) => {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value,
    items: [{ item_id: serviceType, item_name: serviceType, price: value, quantity: 1 }],
  });
};

/** A completed Stripe payment. transactionId is the Stripe checkout session id (Google dedupes on it). */
export const trackPurchase = (transactionId, value, serviceType = 'probate') => {
  loadAnalyticsNow();
  trackEvent('purchase', {
    transaction_id: transactionId,
    value,
    currency: 'USD',
    items: [{ item_id: serviceType, item_name: serviceType, price: value, quantity: 1 }],
  });
  trackEvent('conversion', {
    send_to: `${ADS_ID}/${ADS_LABELS.purchase}`,
    value,
    currency: 'USD',
    transaction_id: transactionId,
  });
};

export const trackQuestionnaireStart = () => trackEvent('questionnaire_start');
export const trackQuestionnaireComplete = (probateType) => trackEvent('questionnaire_complete', { probate_type: probateType });
export const trackFormStep = (stepNumber, stepName) => trackEvent('form_step', { step_number: stepNumber, step_name: stepName });

export default {
  initAnalytics,
  loadAnalyticsNow,
  trackEvent,
  trackLead,
  trackQuestionnaireStart,
  trackQuestionnaireComplete,
  trackBeginCheckout,
  trackPurchase,
  trackFormStep,
};
