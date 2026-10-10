import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

// The client home lives at portal.myprobateca.com (one home for every client). The main site's
// old client pages send the client to the matching place there.
export const PORTAL_URL = 'https://portal.myprobateca.com';

const TABS = {
  '/dashboard': '',
  '/intake': '?tab=intake',
  '/documents': '?tab=documents',
  '/messages': '?tab=messages',
  '/vault': '?tab=vault',
  '/petition': '?tab=forms',
  '/final-petition': '?tab=distribution',
  '/distribution': '?tab=distribution',
  '/closing': '?tab=distribution',
  '/accounting': '?tab=accounting'
};

export function portalUrlFor(pathname) {
  if (pathname.startsWith('/sign/')) return `${PORTAL_URL}${pathname}`;
  if (pathname === '/register' || pathname === '/start') return `${PORTAL_URL}/start`;
  const base = '/' + (pathname.split('/')[1] || '');
  return `${PORTAL_URL}/${TABS[base] !== undefined ? TABS[base] : ''}`;
}

const PortalRedirect = () => {
  const { pathname } = useLocation();
  useParams();
  const target = portalUrlFor(pathname);
  useEffect(() => { window.location.replace(target); }, [target]);
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <p className="text-gray-800 text-center">Opening your client home… <a href={target} className="text-blue-800 underline">Continue</a></p>
    </main>
  );
};

export default PortalRedirect;
