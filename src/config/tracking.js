// Google tag IDs and Google Ads conversion labels for MyProbateCA.
// The same values are used on portal.myprobateca.com (src/config/tracking.js in the portal repo).
// Conversion actions live in the shared Ads account 389-236-9053 and are grouped in the
// custom goal "MyProbateCA conversions" (campaign "California Probate" optimizes on it only).
export const GA4_ID = 'G-7TZF1ST69G';
export const ADS_ID = 'AW-989094207';

export const ADS_LABELS = {
  // "MyProbateCA - Lead (intake or account)", category Submit lead form, count One
  lead: 'Q45UCLeRjJgdEL_C0dcD',
  // "MyProbateCA - Purchase", category Purchase, count Every, value from checkout
  purchase: 'kp1LCLqRjJgdEL_C0dcD',
  // "MyProbateCA - Consultation booked", category Book appointment, count One (fires on the portal)
  booking: 'R1D2CL2RjJgdEL_C0dcD',
};

// Free consultation booking lives on the client portal
export const BOOKING_URL = 'https://portal.myprobateca.com/book';
