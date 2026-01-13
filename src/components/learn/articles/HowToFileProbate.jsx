import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from './ArticleLayout';
import { Check, AlertTriangle, FileText, Clock, DollarSign } from 'lucide-react';

const HowToFileProbate = () => {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to File Probate in California: Step-by-Step Guide",
    "description": "Complete guide to filing probate in California. Learn what documents you need, where to file, and how to navigate the 11-phase process.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Locate the Will and Death Certificate",
        "text": "Gather the original will (if one exists) and obtain certified copies of the death certificate from the county recorder."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Determine the Correct Court",
        "text": "File in the Superior Court of the county where the decedent lived at the time of death."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Complete the Petition for Probate (DE-111)",
        "text": "Fill out the Petition for Probate form, listing all heirs, the proposed executor, and known assets."
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "File with the Court and Pay Filing Fees",
        "text": "Submit the petition to the probate clerk and pay the filing fee ($435-500)."
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Publish Notice and Mail to Heirs",
        "text": "Arrange newspaper publication and mail notice to all heirs at least 15 days before the hearing."
      },
      {
        "@type": "HowToStep",
        "position": 6,
        "name": "Attend the Hearing and Receive Letters",
        "text": "Appear at the probate hearing. If approved, receive Letters Testamentary granting legal authority."
      }
    ],
    "totalTime": "PT12M",
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
    "mainEntityOfPage": "https://myprobateca.com/learn-california-probate/how-to-file-probate-california/"
  };

  const relatedArticles = [
    { title: "California Probate Fees: Statutory vs Flat Fee", url: "/learn-california-probate/california-probate-fees-statutory-vs-flat", category: "Fees & Costs" },
    { title: "Letters Testamentary California Guide", url: "/learn-california-probate/letters-testamentary-california-guide", category: "Forms & Documents" },
    { title: "Probate Timeline California: What to Expect", url: "/learn-california-probate/probate-timeline-california", category: "Process" }
  ];

  return (
    <ArticleLayout
      title="How to File Probate in California: Step-by-Step Guide"
      metaDescription="Complete guide to filing probate in California. Learn what documents you need, where to file, court fees, and how to navigate the 11-phase process successfully."
      canonicalUrl="https://myprobateca.com/learn-california-probate/how-to-file-probate-california/"
      publishDate="January 12, 2026"
      readTime="15"
      category="Step-by-Step Guide"
      schemaMarkup={schemaMarkup}
      relatedArticles={relatedArticles}
    >
      <p className="text-xl text-gray-600 mb-8">
        Filing probate in California can seem overwhelming, but it follows a predictable 11-phase process. This guide walks you through exactly what you need to do, from gathering documents to receiving your <Link to="/learn-california-probate/letters-testamentary-california-guide" className="text-indigo-600 hover:underline">Letters Testamentary</Link>.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
        <p className="font-bold text-blue-800">Before You Start</p>
        <p className="text-blue-900">California probate is required when someone dies owning assets titled solely in their name worth more than $184,500 (or any real estate not in a trust). If the estate qualifies, you may be able to use a <Link to="/learn-california-probate/small-estate-affidavit-california" className="text-blue-600 hover:underline">Small Estate Affidavit</Link> instead.</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Step 1: Gather Essential Documents</h2>
      <p className="text-gray-700 mb-4">Before filing anything with the court, collect these critical documents:</p>

      <ul className="space-y-3 mb-6">
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Original Will</strong> (if one exists) — the court requires the original, not a copy</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Certified Death Certificates</strong> — order 10-15 copies from the county recorder</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>List of Assets</strong> — real estate, bank accounts, investments, vehicles</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>List of Heirs</strong> — names, addresses, and relationships of all beneficiaries and legal heirs</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>List of Debts</strong> — mortgages, credit cards, medical bills, taxes owed</span>
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Step 2: Determine Where to File</h2>
      <p className="text-gray-700 mb-4">
        California probate must be filed in the Superior Court of the county where the decedent <strong>lived at the time of death</strong> (their "domicile"). This is true even if they owned property in other counties.
      </p>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h4 className="font-bold text-gray-900 mb-3">Common California Probate Courts</h4>
        <ul className="space-y-2 text-gray-700">
          <li><strong>Los Angeles County:</strong> <Link to="/locations/los-angeles-probate-attorney" className="text-blue-600 hover:underline">Stanley Mosk Courthouse</Link>, 111 N. Hill Street</li>
          <li><strong>Orange County:</strong> Lamoreaux Justice Center, 341 The City Drive</li>
          <li><strong>San Diego County:</strong> Central Courthouse, 1100 Union Street</li>
          <li><strong>San Francisco:</strong> Civic Center Courthouse, 400 McAllister Street</li>
          <li><strong>Santa Clara County:</strong> Downtown Superior Court, 191 N. First Street</li>
        </ul>
        <p className="mt-4 text-sm text-gray-600">
          <Link to="/probate-court-locations-california" className="text-blue-600 hover:underline">See all 35 California probate court locations →</Link>
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Step 3: Complete the Petition for Probate (Form DE-111)</h2>
      <p className="text-gray-700 mb-4">
        The Petition for Probate is your formal request to open the estate. This form requires:
      </p>

      <ul className="space-y-2 mb-6 text-gray-700">
        <li>• Decedent's full legal name and any aliases</li>
        <li>• Date and place of death</li>
        <li>• Whether a will exists (and attach it)</li>
        <li>• Names and addresses of all heirs and beneficiaries</li>
        <li>• Estimated value of the estate</li>
        <li>• Name of proposed executor/administrator</li>
        <li>• Request for authority (full or limited)</li>
      </ul>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800">Common Mistake</p>
            <p className="text-amber-900">Many self-filed petitions are rejected because the heir information is incomplete or inconsistent. Every heir must be listed with their exact legal relationship to the decedent.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Step 4: File with the Court and Pay Fees</h2>
      <p className="text-gray-700 mb-4">
        Submit your completed petition to the probate clerk. You'll need to pay the filing fee at this time.
      </p>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 text-green-600 mr-2" />
          California Probate Filing Costs
        </h4>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b">
              <td className="py-2 text-gray-700">Petition Filing Fee</td>
              <td className="py-2 text-right font-medium">$435 - $500</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-gray-700">Newspaper Publication</td>
              <td className="py-2 text-right font-medium">$200 - $350</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-gray-700">Certified Copies (each)</td>
              <td className="py-2 text-right font-medium">$25 - $50</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-700"><Link to="/learn-california-probate/what-is-probate-referee-california" className="text-blue-600 hover:underline">Probate Referee Fee</Link></td>
              <td className="py-2 text-right font-medium">0.1% of assets</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-sm text-gray-600">
          <Link to="/learn-california-probate/california-probate-fees-statutory-vs-flat" className="text-blue-600 hover:underline">See complete fee breakdown →</Link>
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Step 5: Publish Notice and Mail to Heirs</h2>
      <p className="text-gray-700 mb-4">
        California law requires two types of notice before the hearing:
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-5 rounded-lg">
          <h4 className="font-bold text-gray-900 mb-2">Newspaper Publication</h4>
          <p className="text-gray-700 text-sm">Publish "Notice of Petition to Administer Estate" in an adjudicated newspaper for 3 consecutive weeks. The newspaper must be in the city where the decedent lived.</p>
        </div>
        <div className="bg-gray-50 p-5 rounded-lg">
          <h4 className="font-bold text-gray-900 mb-2">Mail Notice (DE-120/121)</h4>
          <p className="text-gray-700 text-sm">Mail notice to all heirs, beneficiaries, and any creditors you know about at least 15 days before the hearing date.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Step 6: Attend the Probate Hearing</h2>
      <p className="text-gray-700 mb-4">
        Approximately 6-10 weeks after filing, you'll have your first court hearing. If filing in Los Angeles County, check for <Link to="/learn-california-probate/clear-ign-notes-stanley-mosk" className="text-indigo-600 hover:underline">IGN notes</Link> 5-10 days before your hearing and file any required supplements.
      </p>

      <p className="text-gray-700 mb-4">At the hearing, the judge will:</p>
      <ul className="space-y-2 mb-6 text-gray-700">
        <li>• Review your petition for completeness</li>
        <li>• Confirm proper notice was given</li>
        <li>• Hear any objections from heirs or creditors</li>
        <li>• Appoint you as executor/administrator (if approved)</li>
        <li>• Issue Letters Testamentary or Letters of Administration</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Step 7: After Your Hearing - What's Next</h2>
      <p className="text-gray-700 mb-4">
        Once appointed, you'll need to complete these remaining phases:
      </p>

      <ol className="space-y-4 mb-8">
        <li className="flex items-start">
          <span className="bg-blue-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">7</span>
          <div>
            <p className="font-bold text-gray-900">Inventory & Appraisal</p>
            <p className="text-gray-600 text-sm">Work with the court-appointed <Link to="/learn-california-probate/what-is-probate-referee-california" className="text-blue-600 hover:underline">probate referee</Link> to value all estate assets within 4 months.</p>
          </div>
        </li>
        <li className="flex items-start">
          <span className="bg-blue-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">8</span>
          <div>
            <p className="font-bold text-gray-900">Creditor Management</p>
            <p className="text-gray-600 text-sm">Notice known creditors and wait the 4-month claim period before paying valid debts.</p>
          </div>
        </li>
        <li className="flex items-start">
          <span className="bg-blue-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">9</span>
          <div>
            <p className="font-bold text-gray-900">Tax Returns</p>
            <p className="text-gray-600 text-sm">File the decedent's final personal tax return and estate income tax returns if needed.</p>
          </div>
        </li>
        <li className="flex items-start">
          <span className="bg-blue-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">10</span>
          <div>
            <p className="font-bold text-gray-900">Final Accounting</p>
            <p className="text-gray-600 text-sm">Prepare a detailed accounting of all money received and paid by the estate.</p>
          </div>
        </li>
        <li className="flex items-start">
          <span className="bg-blue-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">11</span>
          <div>
            <p className="font-bold text-gray-900">Final Distribution</p>
            <p className="text-gray-600 text-sm">Obtain court approval and distribute remaining assets to beneficiaries.</p>
          </div>
        </li>
      </ol>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 my-8">
        <h3 className="font-bold text-green-900 text-lg mb-3">Need Help Filing?</h3>
        <p className="text-green-800 mb-4">
          MyProbateCA handles all 11 phases of California probate for a flat fee of $3,995 — saving you $19,000+ compared to statutory attorney fees. We prepare all documents, clear IGN notes, and guide you through every step.
        </p>
        <Link to="/register" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition">
          Start Your Case - Free
        </Link>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">How Long Does California Probate Take?</h2>
      <p className="text-gray-700 mb-4">
        Most California probate cases take <strong>9 to 18 months</strong> from filing to final distribution. See our <Link to="/learn-california-probate/probate-timeline-california" className="text-indigo-600 hover:underline">detailed timeline guide</Link> for what to expect each month.
      </p>

      <div className="flex items-center bg-gray-100 p-4 rounded-lg">
        <Clock className="h-8 w-8 text-blue-600 mr-4" />
        <div>
          <p className="font-bold text-gray-900">Timeline Factors</p>
          <p className="text-gray-600 text-sm">Simple estates: 9-12 months | Complex estates or disputes: 18-24+ months</p>
        </div>
      </div>
    </ArticleLayout>
  );
};

export default HowToFileProbate;
