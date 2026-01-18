import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from './ArticleLayout';
import { Check, AlertTriangle } from 'lucide-react';

const WhatIsProbateReferee = () => {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "What is a Probate Referee in California?",
    "description": "Learn about California's court-appointed probate referees. How they're assigned, what they appraise, fees (0.1%), and how to work with them.",
    "author": {
      "@type": "Person",
      "@id": "https://myprobateca.com/#attorney",
      "name": "Rozsa Gyene"
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://myprobateca.com/#organization",
      "name": "MyProbateCA"
    },
    "datePublished": "2025-01-12",
    "dateModified": "2025-01-12",
    "mainEntityOfPage": "https://myprobateca.com/learn-california-probate/what-is-probate-referee-california"
  };

  const relatedArticles = [
    { title: "California Probate Fees Explained", url: "/learn-california-probate/california-probate-fees-statutory-vs-flat", category: "Fees & Costs" },
    { title: "Letters Testamentary California Guide", url: "/learn-california-probate/letters-testamentary-california-guide", category: "Forms & Documents" },
    { title: "How to Clear IGN Notes", url: "/learn-california-probate/clear-ign-notes-stanley-mosk", category: "Court Procedures" }
  ];

  return (
    <ArticleLayout
      title="What is a Probate Referee in California?"
      metaDescription="Learn about California's court-appointed probate referees. How they're assigned, what they appraise, fees (0.1%), and how to work with them."
      canonicalUrl="https://myprobateca.com/learn-california-probate/what-is-probate-referee-california"
      publishDate="January 12, 2025"
      readTime="8"
      category="Process"
      schemaMarkup={schemaMarkup}
      relatedArticles={relatedArticles}
    >
      <p className="text-xl text-gray-600 mb-8">
        Every California probate case requires working with a <strong>Probate Referee</strong>—a court-appointed official who appraises estate assets. This guide explains who they are, what they do, and how to work with them effectively.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What is a Probate Referee?</h2>
      <p className="text-gray-700 mb-4">
        A Probate Referee is a specially qualified appraiser appointed by the California State Controller to value estate assets for probate proceedings. They're not employees of the court—they're independent professionals licensed to provide official valuations.
      </p>

      <p className="text-gray-700 mb-4">
        When you file a Petition for Probate, the court automatically assigns a Probate Referee to your case. You don't choose them—they're assigned on a rotating basis in each county.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Facts About Probate Referees</h2>

      <div className="grid md:grid-cols-3 gap-4 my-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Appointment</p>
          <p className="font-bold text-gray-900 text-lg">Court-Assigned</p>
          <p className="text-xs text-gray-500">You don't choose</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Fee</p>
          <p className="font-bold text-gray-900 text-lg">0.1% of assets</p>
          <p className="text-xs text-gray-500">$75 minimum</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Deadline</p>
          <p className="font-bold text-gray-900 text-lg">4 months</p>
          <p className="text-xs text-gray-500">From Letters</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What Does a Probate Referee Appraise?</h2>
      <p className="text-gray-700 mb-4">
        The Probate Referee values all non-cash assets in the estate. This includes:
      </p>

      <ul className="space-y-2 mb-6">
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Real estate</strong> - Homes, land, commercial property, rental properties</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Vehicles</strong> - Cars, boats, RVs, motorcycles</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Securities</strong> - Stocks, bonds, mutual funds (valued at date of death)</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Business interests</strong> - Ownership in LLCs, partnerships, corporations</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Personal property</strong> - Jewelry, art, collectibles, furniture</span>
        </li>
      </ul>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
        <p className="font-bold text-blue-800 mb-2">What the Executor Values</p>
        <p className="text-blue-900">The executor (not the referee) values cash and cash equivalents: bank accounts, money market accounts, and similar liquid assets. You report these values on the Inventory & Appraisal form.</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Probate Referee Fees</h2>
      <p className="text-gray-700 mb-4">
        The Probate Referee charges <strong>0.1% (one-tenth of one percent)</strong> of the total assets they appraise, with a minimum fee of $75. This fee is paid from estate funds.
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold">Assets Appraised</th>
              <th className="text-left p-4 font-semibold">Referee Fee (0.1%)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="p-4">$100,000</td>
              <td className="p-4">$100</td>
            </tr>
            <tr>
              <td className="p-4">$500,000</td>
              <td className="p-4">$500</td>
            </tr>
            <tr>
              <td className="p-4">$1,000,000</td>
              <td className="p-4">$1,000</td>
            </tr>
            <tr>
              <td className="p-4">$2,000,000</td>
              <td className="p-4">$2,000</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">The Inventory & Appraisal Process</h2>
      <p className="text-gray-700 mb-4">
        Here's how the process works:
      </p>

      <ol className="space-y-4 my-6">
        <li className="flex items-start">
          <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</span>
          <div>
            <h3 className="font-bold text-gray-900">Receive Letters Testamentary</h3>
            <p className="text-gray-700 mt-1">The 4-month clock for the Inventory & Appraisal starts when you receive your Letters.</p>
          </div>
        </li>
        <li className="flex items-start">
          <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</span>
          <div>
            <h3 className="font-bold text-gray-900">Compile Asset List</h3>
            <p className="text-gray-700 mt-1">Identify all assets that need appraisal and gather supporting documentation (deeds, statements, titles).</p>
          </div>
        </li>
        <li className="flex items-start">
          <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</span>
          <div>
            <h3 className="font-bold text-gray-900">Contact the Probate Referee</h3>
            <p className="text-gray-700 mt-1">Reach out to the assigned referee with your asset list. They may schedule property inspections if needed.</p>
          </div>
        </li>
        <li className="flex items-start">
          <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">4</span>
          <div>
            <h3 className="font-bold text-gray-900">Receive Appraisal</h3>
            <p className="text-gray-700 mt-1">The referee provides their official valuations, which you incorporate into Form DE-160.</p>
          </div>
        </li>
        <li className="flex items-start">
          <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">5</span>
          <div>
            <h3 className="font-bold text-gray-900">File the Inventory & Appraisal</h3>
            <p className="text-gray-700 mt-1">Submit Form DE-160 to the court within the 4-month deadline, signed by you and the referee.</p>
          </div>
        </li>
      </ol>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Tips for Working with Probate Referees</h2>
      <ul className="space-y-2 mb-6">
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Start early</strong> - Don't wait until month 3 to contact the referee</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Be organized</strong> - Provide complete documentation for each asset</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Respond promptly</strong> - Answer the referee's questions quickly</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Allow access</strong> - If they need to inspect property, schedule it promptly</span>
        </li>
      </ul>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 my-8">
        <h3 className="font-bold text-green-900 mb-2">How MyProbateCA Helps</h3>
        <p className="text-green-900 mb-4">
          Our $3,995 flat fee includes full coordination with the Probate Referee:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-green-900">We identify which assets need referee appraisal</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-green-900">We prepare and organize all documentation</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-green-900">We communicate with the referee on your behalf</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-green-900">We prepare and file Form DE-160 correctly</span>
          </li>
        </ul>
      </div>

      <p className="text-gray-700 mt-8">
        Need help with the Inventory & Appraisal process? <Link to="/register" className="text-indigo-600 hover:underline font-medium">Get started with MyProbateCA</Link> for complete probate referee coordination.
      </p>
    </ArticleLayout>
  );
};

export default WhatIsProbateReferee;
