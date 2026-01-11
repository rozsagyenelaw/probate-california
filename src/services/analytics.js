/**
 * Analytics Service
 * Initializes Google Analytics 4 and Microsoft Clarity
 *
 * Set these environment variables in Netlify:
 * - VITE_GA_MEASUREMENT_ID: Your GA4 measurement ID (e.g., G-XXXXXXXXXX)
 * - VITE_CLARITY_ID: Your Microsoft Clarity ID (e.g., xxxxxxxxxx)
 */

// Initialize Google Analytics 4
export const initGA4 = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.log('GA4: Measurement ID not configured');
    return;
  }

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);

  console.log('GA4: Initialized with ID', measurementId);
};

// Initialize Microsoft Clarity
export const initClarity = () => {
  const clarityId = import.meta.env.VITE_CLARITY_ID;

  if (!clarityId) {
    console.log('Clarity: ID not configured');
    return;
  }

  (function(c, l, a, r, i, t, y) {
    c[a] = c[a] || function() {
      (c[a].q = c[a].q || []).push(arguments);
    };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", clarityId);

  console.log('Clarity: Initialized with ID', clarityId);
};

// Initialize all analytics
export const initAnalytics = () => {
  initGA4();
  initClarity();
};

// Track custom events
export const trackEvent = (eventName, params = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, params);
    console.log('GA4 Event:', eventName, params);
  }
};

// Conversion tracking events
export const trackQuestionnaireStart = () => {
  trackEvent('questionnaire_start', {
    event_category: 'engagement'
  });
};

export const trackQuestionnaireComplete = (probateType) => {
  trackEvent('questionnaire_complete', {
    event_category: 'engagement',
    probate_type: probateType
  });
};

export const trackBeginCheckout = (value, serviceType) => {
  trackEvent('begin_checkout', {
    event_category: 'ecommerce',
    value: value,
    currency: 'USD',
    service_type: serviceType
  });
};

export const trackPurchase = (transactionId, value, serviceType) => {
  trackEvent('purchase', {
    event_category: 'ecommerce',
    transaction_id: transactionId,
    value: value,
    currency: 'USD',
    service_type: serviceType
  });
};

export const trackFormStep = (stepNumber, stepName) => {
  trackEvent('form_step', {
    event_category: 'engagement',
    step_number: stepNumber,
    step_name: stepName
  });
};

export default {
  initAnalytics,
  trackEvent,
  trackQuestionnaireStart,
  trackQuestionnaireComplete,
  trackBeginCheckout,
  trackPurchase,
  trackFormStep
};
