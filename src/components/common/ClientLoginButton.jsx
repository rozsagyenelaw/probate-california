import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

// Header "Client Login" button shown on every public page (desktop and phone).
// tone="dark" for blue headers, tone="light" for white headers.
const ClientLoginButton = ({ tone = 'dark', compact = false, onNavigate }) => {
  const navigate = useNavigate();
  const styles = tone === 'dark'
    ? 'border-white/70 text-white hover:bg-white hover:text-blue-900'
    : 'border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white';
  return (
    <button
      type="button"
      onClick={() => { if (onNavigate) onNavigate(); navigate('/login'); }}
      className={`inline-flex items-center gap-1.5 border rounded-lg font-semibold whitespace-nowrap transition-colors ${compact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} ${styles}`}
    >
      <LogIn className="h-4 w-4" />
      Client Login
    </button>
  );
};

export default ClientLoginButton;
