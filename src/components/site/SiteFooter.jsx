import React from 'react';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { BAR_PROFILE_URL, CLIENT_LOGIN_URL, COURTS_PATH, PROCESS_PATH } from './siteLinks';

// Site footer for the redesigned home and the 11 stages page (decision 31C, item 9).
// The court list lives on its own page and is linked here. Phone stays in the footer.
const cities = [
  ['los-angeles', 'Los Angeles'], ['glendale', 'Glendale'], ['burbank', 'Burbank'], ['pasadena', 'Pasadena'],
  ['encino', 'Encino'], ['santa-monica', 'Santa Monica'],
];

const SiteFooter = () => (
  <footer className="bg-slate-50 border-t border-slate-200 text-slate-700">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Scale className="h-6 w-6 mp-brand" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-lg font-semibold mp-brand">MyProbateCA</span>
        </div>
        <p className="text-sm leading-relaxed">
          Law Offices of Rozsa Gyene<br />
          Rozsa Gyene, Esq., State Bar #208356
        </p>
        <address className="not-italic text-sm leading-relaxed mt-3">
          3500 W. Olive Ave., Suite 300<br />
          Burbank, CA 91505<br />
          <a href="tel:+18183374071" className="underline underline-offset-2">818-337-4071</a><br />
          <a href="mailto:rozsa@myprobateca.com" className="underline underline-offset-2">rozsa@myprobateca.com</a>
        </address>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Probate guides</h2>
        <ul className="space-y-2 text-sm">
          <li><Link to={PROCESS_PATH} className="hover:underline">The 11 stages of California probate</Link></li>
          <li><Link to="/california-probate-administration" className="hover:underline">California probate administration</Link></li>
          <li><Link to="/learn-california-probate" className="hover:underline">Learn center</Link></li>
          <li><Link to="/probate-faq-california" className="hover:underline">All probate questions</Link></li>
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Courts and cities</h2>
        <ul className="space-y-2 text-sm">
          <li><Link to={COURTS_PATH} className="hover:underline">California probate courts</Link></li>
          {cities.map(([slug, name]) => (
            <li key={slug}><Link to={`/locations/${slug}-probate-attorney`} className="hover:underline">{name}</Link></li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Your case</h2>
        <ul className="space-y-2 text-sm">
          <li><a href={CLIENT_LOGIN_URL} className="hover:underline">Client login</a></li>
          <li><Link to="/terms" className="hover:underline">Terms of Service</Link></li>
          <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
          <li><a href={BAR_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">Verify State Bar #208356</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-slate-200">
      <p className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-xs text-slate-600 leading-relaxed">
        &copy; {new Date().getFullYear()} Law Offices of Rozsa Gyene. MyProbateCA is an online probate service of the Law Offices of Rozsa Gyene.
        You file your own court papers as the petitioner; our office prepares them. This site gives general information, not legal advice for your situation.
      </p>
    </div>
  </footer>
);

export default SiteFooter;
