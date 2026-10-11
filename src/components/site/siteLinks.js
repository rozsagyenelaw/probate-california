// Links shared by the home page, the 11 stages page and the site footer (W7-landing, decisions 31C and 32).
import { START_URL } from '../../config/tracking';

// "Start your case" on a service card opens the one-screen start in the client home with that
// service preselected (decision 32, built by W3-home). "Not sure which you need?" runs the short
// eligibility check first, then the same start screen.
export const startUrlFor = (service) => `${START_URL}?service=${encodeURIComponent(service)}`;
export const START_SIMPLIFIED_URL = startUrlFor('simplified');
export const START_FULL_URL = startUrlFor('full');
export const ELIGIBILITY_CHECK_URL = `${START_URL}?check=eligibility`;
export const CLIENT_LOGIN_URL = 'https://portal.myprobateca.com/';

// Decision 28: the one quiet full representation link (the firm's own page, never a consultation).
export const FULL_REPRESENTATION_URL = 'https://portal.livingtrust-attorneys.com/book';

export const BAR_PROFILE_URL = 'https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356';
export const PROCESS_PATH = '/california-probate-process';
export const COURTS_PATH = '/probate-court-locations-california';
