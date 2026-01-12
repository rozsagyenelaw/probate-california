import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from './ArticleLayout';
import { Check, AlertTriangle, ExternalLink } from 'lucide-react';

const ClearIGNNotes = () => {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "How to Clear IGN Notes at Stanley Mosk Courthouse",
    "description": "Step-by-step guide to clearing probate examiner notes (IGN) at Stanley Mosk Courthouse. Avoid 3-month continuances with proper Verified Supplements.",
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
    "datePublished": "2025-01-12",
    "dateModified": "2025-01-12",
    "mainEntityOfPage": "https://myprobateca.com/learn-california-probate/clear-ign-notes-stanley-mosk/"
  };

  const relatedArticles = [
    { title: "California Probate Fees: Statutory vs Flat Fee", url: "/learn-california-probate/california-probate-fees-statutory-vs-flat", category: "Fees & Costs" },
    { title: "Letters Testamentary California Guide", url: "/learn-california-probate/letters-testamentary-california-guide", category: "Forms & Documents" },
    { title: "What is a Probate Referee?", url: "/learn-california-probate/what-is-probate-referee-california", category: "Process" }
  ];

  return (
    <ArticleLayout
      title="How to Clear IGN Notes at Stanley Mosk Courthouse"
      metaDescription="Step-by-step guide to clearing probate examiner notes (IGN) at Stanley Mosk Courthouse. Avoid 3-month continuances with proper Verified Supplements."
      canonicalUrl="https://myprobateca.com/learn-california-probate/clear-ign-notes-stanley-mosk/"
      publishDate="January 12, 2025"
      readTime="12"
      category="Court Procedures"
      schemaMarkup={schemaMarkup}
      relatedArticles={relatedArticles}
    >
      <p className="text-xl text-gray-600 mb-8">
        If you're handling a probate case in Los Angeles County, you'll inevitably encounter <strong>IGN notes</strong>—the probate examiner's flags that can derail your hearing and add months to your case. This guide explains exactly what they are and how to clear them.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What Are IGN Notes?</h2>
      <p className="text-gray-700 mb-4">
        IGN stands for <strong>Incomplete, Grant, or Needs</strong>. These are notes posted by probate examiners at the <a href="https://www.lacourt.org/courthouse/info/smm" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Stanley Mosk Courthouse</a> approximately 5-10 days before your scheduled probate hearing.
      </p>

      <p className="text-gray-700 mb-4">
        The Los Angeles Superior Court centralizes all probate cases at Stanley Mosk, handling thousands of cases annually. To manage this volume, specialized probate examiners review every filing before the judge sees it. If they find any issues—even minor ones—they post notes.
      </p>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <p className="font-bold text-red-800">Critical Warning</p>
            <p className="text-red-900">If you appear at your hearing with uncleared IGN notes, the judge will <strong>continue</strong> your case—typically for another 3+ months. This is one of the most common causes of probate delays in LA County.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Common Reasons for IGN Notes</h2>
      <p className="text-gray-700 mb-4">Based on our experience with hundreds of cases, these are the most common issues that trigger examiner notes:</p>

      <ul className="space-y-2 mb-6">
        <li className="flex items-start">
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium mr-3 mt-1">1</span>
          <span className="text-gray-700"><strong>Missing heir information</strong> - Names, addresses, or relationships not properly stated</span>
        </li>
        <li className="flex items-start">
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium mr-3 mt-1">2</span>
          <span className="text-gray-700"><strong>Bond calculation errors</strong> - Incorrect total or missing bond waiver documentation</span>
        </li>
        <li className="flex items-start">
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium mr-3 mt-1">3</span>
          <span className="text-gray-700"><strong>Inconsistent dates or names</strong> - Typos or variations between documents</span>
        </li>
        <li className="flex items-start">
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium mr-3 mt-1">4</span>
          <span className="text-gray-700"><strong>Missing proof of mailing</strong> - DE-121 not properly completed or filed</span>
        </li>
        <li className="flex items-start">
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium mr-3 mt-1">5</span>
          <span className="text-gray-700"><strong>Publication issues</strong> - Newspaper not adjudicated or dates incorrect</span>
        </li>
        <li className="flex items-start">
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium mr-3 mt-1">6</span>
          <span className="text-gray-700"><strong>Will attachment problems</strong> - Original not submitted or copy not certified</span>
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">The 5-Step Process to Clear IGN Notes</h2>

      <div className="bg-indigo-50 p-6 rounded-lg mb-8">
        <ol className="space-y-6">
          <li className="flex items-start">
            <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</span>
            <div>
              <h3 className="font-bold text-gray-900">Access the Court Portal</h3>
              <p className="text-gray-700 mt-1">Log into the LA Superior Court website 5-10 days before your scheduled hearing. Navigate to your case and check for any posted examiner notes.</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</span>
            <div>
              <h3 className="font-bold text-gray-900">Review Each Note Carefully</h3>
              <p className="text-gray-700 mt-1">Read every note in detail. Each one specifies exactly what information is missing or what correction is needed. Don't skip any—all must be addressed.</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</span>
            <div>
              <h3 className="font-bold text-gray-900">Draft Your Verified Supplement</h3>
              <p className="text-gray-700 mt-1">Prepare a formal "Supplement to the Petition" that specifically addresses each deficiency. This must be a verified document (signed under penalty of perjury).</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">4</span>
            <div>
              <h3 className="font-bold text-gray-900">Attorney Review</h3>
              <p className="text-gray-700 mt-1">Have the supplement reviewed by a licensed California probate attorney to ensure it properly addresses all issues and is formatted correctly for the court.</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">5</span>
            <div>
              <h3 className="font-bold text-gray-900">File Before Your Hearing</h3>
              <p className="text-gray-700 mt-1">File the verified supplement at least 2 court days before your hearing. This gives the examiner time to review and clear the notes from your file.</p>
            </div>
          </li>
        </ol>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What is a Verified Supplement?</h2>
      <p className="text-gray-700 mb-4">
        A Verified Supplement is a formal court document that corrects or adds information to your original Petition for Probate. It must:
      </p>

      <ul className="space-y-2 mb-6">
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">Reference your case number and the original petition</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">Specifically address each examiner note</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">Be signed under penalty of perjury</span>
        </li>
        <li className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">Include any supporting documentation referenced</span>
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why DIY Supplements Often Fail</h2>
      <p className="text-gray-700 mb-4">
        Many self-represented executors try to draft their own supplements, but they often fail because:
      </p>

      <ul className="space-y-2 mb-6">
        <li className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">They don't understand the legal terminology used in the notes</span>
        </li>
        <li className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">They address symptoms rather than root causes</span>
        </li>
        <li className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">They use incorrect formatting or miss verification requirements</span>
        </li>
        <li className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">They file too late for the examiner to review before the hearing</span>
        </li>
      </ul>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 my-8">
        <h3 className="font-bold text-green-900 mb-2">How MyProbateCA Handles IGN Notes</h3>
        <p className="text-green-900 mb-4">
          Our <strong>flat $3,995 fee</strong> includes complete IGN note clearance. When notes appear on your case, we:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-green-900">Monitor the court portal before every hearing</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-green-900">Draft professional Verified Supplements addressing each note</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-green-900">Have Attorney Rozsa Gyene (Bar #208356) review and verify</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-green-900">File with the court in time for examiner review</span>
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Takeaways</h2>
      <ul className="space-y-2 mb-6">
        <li className="flex items-start">
          <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs font-medium mr-3 mt-1">1</span>
          <span className="text-gray-700">Check for notes 5-10 days before every hearing</span>
        </li>
        <li className="flex items-start">
          <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs font-medium mr-3 mt-1">2</span>
          <span className="text-gray-700">Never appear at a hearing with uncleared notes</span>
        </li>
        <li className="flex items-start">
          <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs font-medium mr-3 mt-1">3</span>
          <span className="text-gray-700">File your supplement at least 2 court days before the hearing</span>
        </li>
        <li className="flex items-start">
          <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs font-medium mr-3 mt-1">4</span>
          <span className="text-gray-700">Professional attorney review significantly increases success rates</span>
        </li>
      </ul>

      <p className="text-gray-700 mt-8">
        Have IGN notes on your case? <Link to="/register" className="text-indigo-600 hover:underline font-medium">Start your case with MyProbateCA</Link> and get professional help clearing them—included in our flat $3,995 fee.
      </p>
    </ArticleLayout>
  );
};

export default ClearIGNNotes;
