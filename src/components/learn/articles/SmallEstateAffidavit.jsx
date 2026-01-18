import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from './ArticleLayout';
import { Check, X, AlertTriangle, DollarSign, Clock, FileText } from 'lucide-react';

const SmallEstateAffidavit = () => {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Small Estate Affidavit California: When You Don't Need Probate",
    "description": "Learn when you can use California's Small Estate Affidavit to transfer assets without probate. Understand the $184,500 limit, requirements, and step-by-step process.",
    "author": {
      "@type": "Person",
      "@id": "https://myprobateca.com/#attorney",
      "name": "Rozsa Gyene",
      "jobTitle": "Lead Probate Attorney"
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://myprobateca.com/#organization",
      "name": "MyProbateCA"
    },
    "datePublished": "2026-01-12",
    "dateModified": "2026-01-12",
    "mainEntityOfPage": "https://myprobateca.com/learn-california-probate/small-estate-affidavit-california"
  };

  const relatedArticles = [
    { title: "How to File Probate in California", url: "/learn-california-probate/how-to-file-probate-california", category: "Step-by-Step Guide" },
    { title: "Letters Testamentary California Guide", url: "/learn-california-probate/letters-testamentary-california-guide", category: "Forms & Documents" },
    { title: "California Probate Fees Explained", url: "/learn-california-probate/california-probate-fees-statutory-vs-flat", category: "Fees & Costs" }
  ];

  return (
    <ArticleLayout
      title="Small Estate Affidavit California: When You Don't Need Probate"
      metaDescription="Learn when you can use California's Small Estate Affidavit to transfer assets without probate. Understand the $184,500 limit, requirements, and step-by-step process."
      canonicalUrl="https://myprobateca.com/learn-california-probate/small-estate-affidavit-california"
      publishDate="January 12, 2026"
      readTime="10"
      category="Avoid Probate"
      schemaMarkup={schemaMarkup}
      relatedArticles={relatedArticles}
    >
      <p className="text-xl text-gray-600 mb-8">
        Not every estate needs to go through California's lengthy probate process. If the estate is small enough, you may be able to transfer assets using a <strong>Small Estate Affidavit</strong> — a simple form that avoids court entirely.
      </p>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
        <p className="font-bold text-green-800">Good News</p>
        <p className="text-green-900">California has some of the most generous small estate thresholds in the country. As of April 1, 2022, you can transfer up to <strong>$184,500</strong> in personal property without probate.</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What is a Small Estate Affidavit?</h2>
      <p className="text-gray-700 mb-4">
        A Small Estate Affidavit (also called a "Declaration for Collection of Personal Property") is a legal document that allows you to claim a deceased person's assets without going through probate court. Under <a href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=13100" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">California Probate Code Section 13100</a>, qualifying successors can use this affidavit to:
      </p>

      <ul className="space-y-2 mb-6 text-gray-700">
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <span>Collect bank account funds</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <span>Transfer vehicle titles</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <span>Claim stocks, bonds, and investment accounts</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <span>Collect insurance proceeds payable to the estate</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <span>Retrieve personal property from storage units or safe deposit boxes</span>
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">California Small Estate Limits (2024-2025)</h2>

      <div className="bg-white border-2 border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-blue-900 text-xl mb-4">Current Thresholds</h3>
        <table className="w-full">
          <tbody>
            <tr className="border-b">
              <td className="py-3 text-gray-700"><strong>Personal Property Affidavit</strong><br /><span className="text-sm text-gray-500">(No court filing required)</span></td>
              <td className="py-3 text-right font-bold text-green-600 text-xl">$184,500</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 text-gray-700"><strong>Simplified Real Property Petition</strong><br /><span className="text-sm text-gray-500">(Streamlined court process)</span></td>
              <td className="py-3 text-right font-bold text-blue-600 text-xl">$184,500</td>
            </tr>
            <tr>
              <td className="py-3 text-gray-700"><strong>Spousal Property Petition</strong><br /><span className="text-sm text-gray-500">(For surviving spouses)</span></td>
              <td className="py-3 text-right font-bold text-purple-600 text-xl">No Limit</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-sm text-gray-600">
          <strong>Note:</strong> Effective April 1, 2025, these limits increase to <strong>$208,850</strong> for personal property and <strong>$750,000</strong> for real property (primary residence only).
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Do You Qualify? Requirements Checklist</h2>
      <p className="text-gray-700 mb-4">
        To use a Small Estate Affidavit in California, ALL of the following must be true:
      </p>

      <div className="space-y-4 mb-8">
        <div className="flex items-start bg-gray-50 p-4 rounded-lg">
          <Check className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-900">40 Days Have Passed</p>
            <p className="text-gray-600 text-sm">At least 40 days must have elapsed since the decedent's death</p>
          </div>
        </div>
        <div className="flex items-start bg-gray-50 p-4 rounded-lg">
          <Check className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-900">No Probate Filed</p>
            <p className="text-gray-600 text-sm">No probate proceeding is currently pending or has been conducted</p>
          </div>
        </div>
        <div className="flex items-start bg-gray-50 p-4 rounded-lg">
          <Check className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-900">Under the Limit</p>
            <p className="text-gray-600 text-sm">Total value of ALL estate property in California is $184,500 or less</p>
          </div>
        </div>
        <div className="flex items-start bg-gray-50 p-4 rounded-lg">
          <Check className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-900">You're the Rightful Successor</p>
            <p className="text-gray-600 text-sm">You are entitled to the property under the will or California intestacy laws</p>
          </div>
        </div>
        <div className="flex items-start bg-gray-50 p-4 rounded-lg">
          <Check className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-900">No Real Estate (for Affidavit)</p>
            <p className="text-gray-600 text-sm">The estate does not include real property (separate process required)</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What DOESN'T Count Toward the $184,500 Limit</h2>
      <p className="text-gray-700 mb-4">
        Good news — many assets are excluded when calculating whether you're under the limit:
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-bold text-green-800 mb-2">Excluded from Calculation</h4>
          <ul className="text-green-900 text-sm space-y-1">
            <li>• Joint tenancy property</li>
            <li>• Property in a living trust</li>
            <li>• Life insurance (with named beneficiary)</li>
            <li>• Retirement accounts (401k, IRA with beneficiary)</li>
            <li>• Payable-on-death bank accounts</li>
            <li>• Transfer-on-death securities</li>
            <li>• Vehicles under $184,500 (with DMV affidavit)</li>
          </ul>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-bold text-red-800 mb-2">Included in Calculation</h4>
          <ul className="text-red-900 text-sm space-y-1">
            <li>• Bank accounts in decedent's name only</li>
            <li>• Stocks/bonds without TOD designation</li>
            <li>• Personal property (furniture, jewelry)</li>
            <li>• Vehicles titled solely in decedent's name</li>
            <li>• Business interests</li>
            <li>• Money owed to decedent</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">How to Use a Small Estate Affidavit: Step by Step</h2>

      <div className="space-y-6 mb-8">
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-900">Step 1: Wait 40 Days</h4>
          <p className="text-gray-600">You cannot use the affidavit until 40 days after the date of death.</p>
        </div>
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-900">Step 2: Prepare the Affidavit</h4>
          <p className="text-gray-600">Complete the "Declaration for Collection of Personal Property" form. Include your information, the decedent's information, description of property, and your legal basis to claim it.</p>
        </div>
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-900">Step 3: Attach Required Documents</h4>
          <p className="text-gray-600">Include a certified copy of the death certificate. If there's a will, attach a copy.</p>
        </div>
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-900">Step 4: Sign Under Penalty of Perjury</h4>
          <p className="text-gray-600">The affidavit must be signed and dated. Some institutions require notarization.</p>
        </div>
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-900">Step 5: Present to the Institution</h4>
          <p className="text-gray-600">Deliver the affidavit to the bank, brokerage, or other entity holding the property. They must release it within a reasonable time.</p>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800">Important Warning</p>
            <p className="text-amber-900">By signing the affidavit, you become personally liable to creditors, other heirs, and the state of California if you misrepresent the facts or misuse the funds. This is a sworn statement under penalty of perjury.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What About Real Estate?</h2>
      <p className="text-gray-700 mb-4">
        Real property (homes, land, commercial buildings) <strong>cannot</strong> be transferred with a Small Estate Affidavit. However, California offers a simplified process for small real estate holdings:
      </p>

      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h4 className="font-bold text-blue-900 mb-3">Affidavit for Real Property of Small Value</h4>
        <p className="text-blue-800 mb-3">If the gross value of all real property in California is $184,500 or less (increasing to $750,000 for primary residences on April 1, 2025), you can file a simplified petition with the court. This is faster and cheaper than full probate.</p>
        <p className="text-blue-700 text-sm">Requirements: 6 months must pass after death, no probate pending, property value under threshold.</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Small Estate Affidavit vs Full Probate</h2>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Factor</th>
              <th className="px-4 py-3 text-center font-semibold text-green-600">Small Estate Affidavit</th>
              <th className="px-4 py-3 text-center font-semibold text-red-600">Full Probate</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3">Time Required</td>
              <td className="px-4 py-3 text-center text-green-600 font-medium">40 days + processing</td>
              <td className="px-4 py-3 text-center text-red-600">9-18 months</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3">Court Filing</td>
              <td className="px-4 py-3 text-center text-green-600 font-medium">Not required</td>
              <td className="px-4 py-3 text-center text-red-600">Required</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3">Attorney Required</td>
              <td className="px-4 py-3 text-center text-green-600 font-medium">No</td>
              <td className="px-4 py-3 text-center text-red-600">Highly recommended</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3">Cost</td>
              <td className="px-4 py-3 text-center text-green-600 font-medium">$0 - $100</td>
              <td className="px-4 py-3 text-center text-red-600">$3,995 - $23,000+</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Asset Limit</td>
              <td className="px-4 py-3 text-center text-green-600 font-medium">$184,500</td>
              <td className="px-4 py-3 text-center text-red-600">No limit</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">When You Can't Avoid Probate</h2>
      <p className="text-gray-700 mb-4">
        Unfortunately, a Small Estate Affidavit won't work if:
      </p>

      <ul className="space-y-3 mb-6">
        <li className="flex items-start">
          <X className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">Estate value exceeds $184,500</span>
        </li>
        <li className="flex items-start">
          <X className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">Real estate is involved (unless using simplified real property petition)</span>
        </li>
        <li className="flex items-start">
          <X className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">There are disputes among heirs</span>
        </li>
        <li className="flex items-start">
          <X className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">Creditors need formal court process</span>
        </li>
        <li className="flex items-start">
          <X className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">The institution refuses to honor the affidavit</span>
        </li>
      </ul>

      <div className="bg-gray-100 p-6 rounded-lg my-8">
        <h3 className="font-bold text-gray-900 text-lg mb-3">Estate Over the Limit?</h3>
        <p className="text-gray-700 mb-4">
          If the estate exceeds $184,500 or includes real property, you'll need to file probate. MyProbateCA offers complete California probate for a <Link to="/learn-california-probate/california-probate-fees-statutory-vs-flat" className="text-blue-600 hover:underline">flat fee of $3,995</Link> — saving you thousands compared to traditional attorney fees.
        </p>
        <Link to="/learn-california-probate/how-to-file-probate-california" className="text-blue-600 hover:underline font-medium">
          See our step-by-step probate guide →
        </Link>
      </div>
    </ArticleLayout>
  );
};

export default SmallEstateAffidavit;
