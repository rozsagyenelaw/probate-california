import React from 'react';
import { useParams } from 'react-router-dom';
import BeyondPage from '../BeyondPage';
import NotFound from '../../components/common/NotFound';
import { PAGES, SRC, CHECKED_ON } from './compareData';

function Sources({ keys }) {
  if (!keys?.length) return null;
  return (
    <span className="block mt-1 text-xs text-gray-500">
      Source: {keys.map((k, i) => <span key={k}>{i > 0 && '; '}<a className="underline" href={SRC[k].url} target="_blank" rel="noopener noreferrer">{SRC[k].label}</a></span>)}
    </span>
  );
}

// Item 73 (HOLD): /compare/trust-and-will-probate and /compare/diy-probate-software
export default function ComparePage() {
  const { slug } = useParams();
  const page = PAGES[slug];
  if (!page) return <NotFound />;
  return (
    <BeyondPage flag="comparisonPages" title={`${page.title} | MyProbateCA`} description={page.description} canonicalPath={`/compare/${slug}`}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl sm:text-4xl font-bold">{page.title}</h1>
        <p className="mt-4 text-lg text-gray-700 max-w-3xl">{page.intro}</p>
        <Sources keys={page.introSrc} />
        <p className="mt-2 text-sm text-gray-500">Competitor information as published on their websites on {CHECKED_ON}.</p>

        {page.rows && (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[36rem]">
              <thead><tr className="border-b-2 border-gray-300">
                <th scope="col" className="py-3 pr-4 w-1/4"> </th>
                {page.columns.map((c) => <th key={c} scope="col" className="py-3 pr-4">{c}</th>)}
              </tr></thead>
              <tbody>
                {page.rows.map((r) => (
                  <tr key={r.label} className="border-b border-gray-200 align-top">
                    <th scope="row" className="py-3 pr-4 font-semibold">{r.label}</th>
                    <td className="py-3 pr-4">{r.ours}</td>
                    <td className="py-3 pr-4">{r.theirs}<Sources keys={r.src} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {page.software && (
          <div className="mt-8 grid gap-4">
            {[...page.software, { ...page.ours, mine: true }].map((s) => (
              <div key={s.name} className={`rounded-xl border p-5 ${s.mine ? 'border-blue-900 bg-blue-50' : 'border-gray-200'}`}>
                <h2 className="text-xl font-semibold">{s.name}</h2>
                <p className="mt-2"><span className="font-medium">Price: </span>{s.price}</p>
                <p className="mt-1"><span className="font-medium">Legal advice: </span>{s.legal}</p>
                <Sources keys={s.src} />
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-gray-800 max-w-3xl">{page.closing}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="https://myprobateca.com/register" className="bg-blue-900 text-white font-semibold rounded-lg px-6 py-3">Start your case online</a>
        </div>
      </div>
    </BeyondPage>
  );
}
