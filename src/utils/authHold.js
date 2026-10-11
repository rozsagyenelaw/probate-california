import { useEffect, useState } from 'react';

// While a Google or Apple sign-in still needs the client's answer (Apple "Hide My Email": do you
// already have an account?), the app must stay on the sign-in screen even though Firebase has
// already signed someone in. In memory only, so a reload never gets stuck on it.
let hold = false;
export function setAuthHold(on) {
  hold = !!on;
  window.dispatchEvent(new CustomEvent('mpca-auth-hold', { detail: hold }));
}
export function isAuthHold() { return hold; }
export function useAuthHold() {
  const [h, setH] = useState(hold);
  useEffect(() => {
    const f = (e) => setH(!!e.detail);
    window.addEventListener('mpca-auth-hold', f);
    return () => window.removeEventListener('mpca-auth-hold', f);
  }, []);
  return h;
}
