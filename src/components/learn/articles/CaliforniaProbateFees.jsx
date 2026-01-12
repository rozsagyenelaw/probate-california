import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from './ArticleLayout';
import { Check, AlertTriangle } from 'lucide-react';

const CaliforniaProbateFees = () => {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "California Probate Fees Exposed: Statutory vs Flat Fee",
    "description": "Understand California Probate Code §10810 statutory fees. See why a $1M home costs $23,000 in attorney fees—and how to pay $3,995 instead.",
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
    "mainEntityOfPage": "https://myprobateca.com/learn-california-probate/california-probate-fees-statutory-vs-flat/"
  };

  const relatedArticles = [
    { title: "How to Clear IGN Notes at Stanley Mosk", url: "/learn-california-probate/clear-ign-notes-stanley-mosk", category: "Court Procedures" },
    { title: "What is a Probate Referee?", url: "/learn-california-probate/what-is-probate-referee-california", category: "Process" },
    { title: "Probate Bond Requirements", url: "/learn-california-probate/probate-bond-requirements-california", category: "Executor Guide" }
  ];

  return (
    <ArticleLayout
      title="California Probate Fees Exposed: Statutory vs Flat Fee"
      metaDescription="Understand California Probate Code §10810 statutory fees. See why a $1M home costs $23,000 in attorney fees—and how to pay $3,995 instead."
      canonicalUrl="https://myprobateca.com/learn-california-probate/california-probate-fees-statutory-vs-flat/"
      publishDate="January 12, 2025"
      readTime="10"
      category="Fees & Costs"
      schemaMarkup={schemaMarkup}
      relatedArticles={relatedArticles}
    >
      <p className="text-xl text-gray-600 mb-8">
        One of the biggest shocks for California executors is discovering how much traditional probate attorneys charge. This guide breaks down the statutory fee structure and shows you how to save $15,000-$25,000+ on your case.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What Are Statutory Fees?</h2>
      <p className="text-gray-700 mb-4">
        <a href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=10810" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">California Probate Code Section 10810</a> sets the "statutory" fee schedule that attorneys can charge for probate work. This fee is calculated as a percentage of the <strong>gross estate value</strong>:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold">Estate Value</th>
              <th className="text-left p-4 font-semibold">Fee Percentage</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="p-4">First $100,000</td>
              <td className="p-4 font-medium">4%</td>
            </tr>
            <tr>
              <td className="p-4">Next $100,000</td>
              <td className="p-4 font-medium">3%</td>
            </tr>
            <tr>
              <td className="p-4">Next $800,000</td>
              <td className="p-4 font-medium">2%</td>
            </tr>
            <tr>
              <td className="p-4">Next $9,000,000</td>
              <td className="p-4 font-medium">1%</td>
            </tr>
            <tr>
              <td className="p-4">Above $10,000,000</td>
              <td className="p-4 font-medium">0.5%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">The Gross Value Problem</h2>
      <p className="text-gray-700 mb-4">
        Here's what catches most people off guard: statutory fees are calculated on <strong>gross value</strong>, not net equity. Mortgages, loans, and debts are ignored.
      </p>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-6">
        <h3 className="font-bold text-red-900 mb-3">Example: The $1M Home</h3>
        <p className="text-red-900 mb-4">Consider a home worth $1,000,000 with a $900,000 mortgage:</p>
        <ul className="space-y-2 text-red-900">
          <li><strong>Actual equity:</strong> $100,000</li>
          <li><strong>Fee calculation basis:</strong> $1,000,000 (gross value)</li>
          <li><strong>Statutory attorney fee:</strong> $23,000</li>
          <li><strong>Statutory executor fee:</strong> $23,000</li>
          <li><strong>Combined fees:</strong> $46,000 from $100K in equity!</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Fee Comparison by Estate Value</h2>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold">Estate Value</th>
              <th className="text-left p-4 font-semibold">Statutory Fee</th>
              <th className="text-left p-4 font-semibold">MyProbateCA</th>
              <th className="text-left p-4 font-semibold text-green-700">You Save</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="p-4">$500,000</td>
              <td className="p-4">$13,000</td>
              <td className="p-4 font-medium text-green-700">$3,995</td>
              <td className="p-4 font-bold text-green-700">$9,005</td>
            </tr>
            <tr>
              <td className="p-4">$750,000</td>
              <td className="p-4">$18,000</td>
              <td className="p-4 font-medium text-green-700">$3,995</td>
              <td className="p-4 font-bold text-green-700">$14,005</td>
            </tr>
            <tr>
              <td className="p-4">$1,000,000</td>
              <td className="p-4">$23,000</td>
              <td className="p-4 font-medium text-green-700">$3,995</td>
              <td className="p-4 font-bold text-green-700">$19,005</td>
            </tr>
            <tr>
              <td className="p-4">$1,500,000</td>
              <td className="p-4">$28,000</td>
              <td className="p-4 font-medium text-green-700">$3,995</td>
              <td className="p-4 font-bold text-green-700">$24,005</td>
            </tr>
            <tr>
              <td className="p-4">$2,000,000</td>
              <td className="p-4">$33,000</td>
              <td className="p-4 font-medium text-green-700">$3,995</td>
              <td className="p-4 font-bold text-green-700">$29,005</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Are Statutory Fees So High?</h2>
      <p className="text-gray-700 mb-4">
        The statutory fee schedule dates from an era when attorneys hand-typed every document and made multiple trips to the courthouse. Today's technology enables dramatic efficiency, but the fee schedule hasn't changed.
      </p>

      <p className="text-gray-700 mb-4">
        Traditional probate attorneys can legally charge these statutory fees—and many do. They're not required to, but it's the easiest path since the fee is pre-approved by the court.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Additional Costs Beyond Attorney Fees</h2>
      <p className="text-gray-700 mb-4">
        Whether you use a statutory-fee attorney or MyProbateCA, you'll have these additional third-party costs:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold">Cost Type</th>
              <th className="text-left p-4 font-semibold">Typical Amount</th>
              <th className="text-left p-4 font-semibold">When Due</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="p-4">Court Filing Fee</td>
              <td className="p-4">$435-500</td>
              <td className="p-4">At initial filing</td>
            </tr>
            <tr>
              <td className="p-4">Newspaper Publication</td>
              <td className="p-4">$200-350</td>
              <td className="p-4">After filing</td>
            </tr>
            <tr>
              <td className="p-4">Probate Referee Fee</td>
              <td className="p-4">0.1% of assets</td>
              <td className="p-4">After inventory</td>
            </tr>
            <tr>
              <td className="p-4">Certified Copies</td>
              <td className="p-4">$25-50 each</td>
              <td className="p-4">As needed</td>
            </tr>
            <tr>
              <td className="p-4">Bond Premium (if required)</td>
              <td className="p-4">0.5-1% of bond</td>
              <td className="p-4">Before hearing</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How MyProbateCA Offers $3,995</h2>
      <p className="text-gray-700 mb-4">
        Our flat fee of $3,995 provides the same attorney oversight from Rozsa Gyene (Bar #208356) at a fraction of the traditional cost. We achieve this through:
      </p>

      <ul className="space-y-2 mb-6">
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Technology-enabled efficiency</strong> - Our app handles data gathering and document generation</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Streamlined processes</strong> - We've completed 500+ cases and know exactly what's needed</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Focused service</strong> - We specialize exclusively in California probate</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Remote-first design</strong> - Everything is handled online, saving overhead</span>
        </li>
      </ul>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 my-8">
        <h3 className="font-bold text-green-900 mb-2">What's Included in $3,995</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-green-900">Attorney preparation of all documents for all 11 phases</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-green-900">Review by California Bar Attorney #208356</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-green-900">IGN note clearance and Verified Supplements</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-green-900">Dashboard tracking throughout the process</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-green-900">Coordination with probate referee</span>
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Takeaways</h2>
      <ul className="space-y-2 mb-6">
        <li className="flex items-start">
          <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs font-medium mr-3 mt-1">1</span>
          <span className="text-gray-700">Statutory fees are based on gross estate value, not net equity</span>
        </li>
        <li className="flex items-start">
          <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs font-medium mr-3 mt-1">2</span>
          <span className="text-gray-700">A $1M estate costs $23,000 in statutory attorney fees</span>
        </li>
        <li className="flex items-start">
          <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs font-medium mr-3 mt-1">3</span>
          <span className="text-gray-700">MyProbateCA provides the same attorney oversight for $3,995</span>
        </li>
        <li className="flex items-start">
          <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs font-medium mr-3 mt-1">4</span>
          <span className="text-gray-700">Additional third-party costs apply regardless of which attorney you use</span>
        </li>
      </ul>

      <p className="text-gray-700 mt-8">
        Ready to save thousands on your probate case? <Link to="/register" className="text-indigo-600 hover:underline font-medium">Get started with MyProbateCA</Link> for a flat $3,995 fee.
      </p>
    </ArticleLayout>
  );
};

export default CaliforniaProbateFees;
