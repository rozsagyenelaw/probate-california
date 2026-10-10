// W3-cockpit item 39: the single admin is portal.myprobateca.com/admin. Every main-site admin page sends
// the attorney there (the old pages stay in the code). Asset discovery stays here until the portal has it.
import { useLocation } from 'react-router-dom';

const PORTAL_ADMIN = 'https://portal.myprobateca.com/admin';

export function portalAdminUrl(pathname) {
  const p = pathname.replace(/\/+$/, '');
  const m = p.match(/^\/admin\/cases\/([^/]+)/);
  if (m) return `${PORTAL_ADMIN}/case/${m[1]}`;
  const map = {
    '/admin': '', '/admin/cases': '', '/admin/hearings': '/calendar', '/admin/payments': '/billing',
    '/admin/clients': '/tools/clients', '/admin/documents': '/tools/documents', '/admin/vaults': '/tools/vault',
    '/admin/signatures': '/tools/signatures', '/admin/messages': '/tools/messages'
  };
  return PORTAL_ADMIN + (map[p] ?? '');
}

export default function PortalAdminRedirect({ fallback }) {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin/asset-discovery')) return fallback;
  window.location.replace(portalAdminUrl(pathname));
  return null;
}
