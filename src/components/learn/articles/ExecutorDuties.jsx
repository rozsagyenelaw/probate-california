import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from './ArticleLayout';
import { Check, X, AlertTriangle, ClipboardList, Shield, DollarSign, FileText, Users, Clock, HelpCircle } from 'lucide-react';

const ExecutorDuties = () => {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Executor Duties in California Probate: Complete Responsibilities Guide",
    "description": "Comprehensive guide to executor duties in California. Learn your legal responsibilities, timeline, potential liabilities, and how to fulfill your role properly.",
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
    "datePublished": "2026-01-18",
    "dateModified": "2026-01-18",
    "mainEntityOfPage": "https://myprobateca.com/learn-california-probate/executor-duties-california-probate",
    "image": "https://myprobateca.com/images/blog/executor-duties.jpg"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the first thing an executor should do?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The first priorities are: (1) locate and secure the original will, (2) obtain multiple certified copies of the death certificate, (3) secure all estate assets to prevent loss or theft, and (4) consult with a probate attorney to understand the process and timeline."
        }
      },
      {
        "@type": "Question",
        "name": "Can an executor be held personally liable?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Executors can be held personally liable for mismanaging estate assets, failing to pay legitimate creditors, distributing assets improperly, missing tax deadlines, or breaching their fiduciary duty to beneficiaries."
        }
      },
      {
        "@type": "Question",
        "name": "How much does an executor get paid in California?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "California Probate Code Section 10800 provides statutory compensation: 4% of the first $100,000, 3% of the next $100,000, 2% of the next $800,000, and 1% of amounts over $1 million. For a $500,000 estate, this equals $13,000."
        }
      },
      {
        "@type": "Question",
        "name": "Can I decline to be an executor?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Being named as executor in a will doesn't obligate you to serve. You can decline (renounce) before being officially appointed by the court. If you've already been appointed, you can petition to resign, though the court must approve."
        }
      }
    ]
  };

  const relatedArticles = [
    { title: "How to File Probate in California", url: "/learn-california-probate/how-to-file-probate-california", category: "Step-by-Step Guide" },
    { title: "Probate Bond Requirements California", url: "/learn-california-probate/probate-bond-requirements-california", category: "Executor Guide" },
    { title: "Letters Testamentary California Guide", url: "/learn-california-probate/letters-testamentary-california-guide", category: "Forms & Documents" }
  ];

  return (
    <ArticleLayout
      title="Executor Duties in California Probate: Complete Responsibilities Guide"
      metaDescription="Comprehensive guide to executor duties in California. Learn your legal responsibilities, timeline, potential liabilities, and how to fulfill your role properly."
      canonicalUrl="https://myprobateca.com/learn-california-probate/executor-duties-california-probate"
      publishDate="January 18, 2026"
      readTime="14"
      category="Executor Guide"
      schemaMarkup={schemaMarkup}
      image="https://myprobateca.com/images/blog/executor-duties.jpg"
      relatedArticles={relatedArticles}
    >
      {/* FAQ Schema */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      <p className="text-xl text-gray-600 mb-8">
        Being named executor of a California estate is both an honor and a significant responsibility. As executor (also called "personal representative"), you're legally obligated to manage the estate, protect its assets, pay debts, and distribute property to beneficiaries — all while navigating California's probate court system.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
        <p className="font-bold text-blue-800">Executor vs. Administrator</p>
        <p className="text-blue-900">An <strong>executor</strong> is named in a will. An <strong>administrator</strong> is appointed by the court when there's no will or the named executor can't serve. The duties are essentially identical — only the appointment process differs.</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Your Core Fiduciary Duties</h2>
      <p className="text-gray-700 mb-4">
        As executor, you have a <strong>fiduciary duty</strong> to the estate and its beneficiaries. This is the highest legal duty of care and means you must:
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Shield className="h-6 w-6 text-green-600 mr-2" />
            <h4 className="font-bold text-gray-900">Duty of Loyalty</h4>
          </div>
          <p className="text-gray-600 text-sm">Act solely in the interest of the beneficiaries, never for personal gain. Avoid conflicts of interest.</p>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <ClipboardList className="h-6 w-6 text-green-600 mr-2" />
            <h4 className="font-bold text-gray-900">Duty of Care</h4>
          </div>
          <p className="text-gray-600 text-sm">Manage estate assets prudently. Make informed decisions. Seek professional help when needed.</p>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <FileText className="h-6 w-6 text-green-600 mr-2" />
            <h4 className="font-bold text-gray-900">Duty to Account</h4>
          </div>
          <p className="text-gray-600 text-sm">Keep detailed records of all transactions. Provide accountings to the court and beneficiaries.</p>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Users className="h-6 w-6 text-green-600 mr-2" />
            <h4 className="font-bold text-gray-900">Duty of Impartiality</h4>
          </div>
          <p className="text-gray-600 text-sm">Treat all beneficiaries fairly. Don't favor one heir over another unless the will specifies.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Complete Executor Responsibilities Checklist</h2>

      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
        <span className="bg-blue-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center mr-3">1</span>
        Immediate Actions (First 30 Days)
      </h3>

      <div className="space-y-3 mb-8 ml-11">
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Locate the original will</p>
            <p className="text-gray-600 text-sm">Check safe deposit boxes, home safes, the decedent's attorney, or the county clerk.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Obtain 10-15 certified death certificates</p>
            <p className="text-gray-600 text-sm">You'll need these for banks, title companies, insurance, and government agencies.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Secure all estate property</p>
            <p className="text-gray-600 text-sm">Change locks if needed, collect valuables, redirect mail, secure vehicles.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Notify Social Security, pension providers, employers</p>
            <p className="text-gray-600 text-sm">Stop benefits to avoid overpayments that must be repaid.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Contact a probate attorney</p>
            <p className="text-gray-600 text-sm">Get guidance on whether probate is needed and understand the process.</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
        <span className="bg-blue-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center mr-3">2</span>
        Opening Probate (Months 1-2)
      </h3>

      <div className="space-y-3 mb-8 ml-11">
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">File Petition for Probate (Form DE-111)</p>
            <p className="text-gray-600 text-sm">Submit to the Superior Court in the county where the decedent lived.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Post <Link to="/learn-california-probate/probate-bond-requirements-california" className="text-blue-600 hover:underline">probate bond</Link> (if required)</p>
            <p className="text-gray-600 text-sm">May be waived if the will includes "full IAEA" powers.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Notify heirs and beneficiaries</p>
            <p className="text-gray-600 text-sm">Mail Notice of Petition (Form DE-121) at least 15 days before hearing.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Publish notice in local newspaper</p>
            <p className="text-gray-600 text-sm">Required for 3 consecutive weeks to notify unknown creditors.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Attend probate hearing</p>
            <p className="text-gray-600 text-sm">The court will formally appoint you and issue <Link to="/learn-california-probate/letters-testamentary-california-guide" className="text-blue-600 hover:underline">Letters Testamentary</Link>.</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
        <span className="bg-blue-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center mr-3">3</span>
        Estate Administration (Months 2-12)
      </h3>

      <div className="space-y-3 mb-8 ml-11">
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Open estate bank account</p>
            <p className="text-gray-600 text-sm">Deposit estate funds here. Never commingle with personal funds.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Inventory all assets</p>
            <p className="text-gray-600 text-sm">Create a complete list of real property, bank accounts, investments, personal property.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Work with <Link to="/learn-california-probate/what-is-probate-referee-california" className="text-blue-600 hover:underline">probate referee</Link> for appraisals</p>
            <p className="text-gray-600 text-sm">The court-appointed referee values most non-cash assets.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">File Inventory and Appraisal (Form DE-160)</p>
            <p className="text-gray-600 text-sm">Due within 4 months of appointment.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Notify known creditors</p>
            <p className="text-gray-600 text-sm">Mail Notice to Creditors (Form DE-157) within 30 days of appointment.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Review and pay valid creditor claims</p>
            <p className="text-gray-600 text-sm">Creditors have 4 months to file claims. Evaluate each claim carefully.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Manage ongoing expenses</p>
            <p className="text-gray-600 text-sm">Pay mortgage, utilities, insurance, property taxes from estate funds.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">File tax returns</p>
            <p className="text-gray-600 text-sm">Final personal return (Form 1040), estate income tax (Form 1041), and estate tax (Form 706) if applicable.</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
        <span className="bg-blue-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center mr-3">4</span>
        Closing the Estate (Final Months)
      </h3>

      <div className="space-y-3 mb-8 ml-11">
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Prepare final accounting</p>
            <p className="text-gray-600 text-sm">Document all receipts, disbursements, and distributions.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">File Petition for Final Distribution</p>
            <p className="text-gray-600 text-sm">Request court approval to distribute remaining assets to beneficiaries.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Distribute assets to beneficiaries</p>
            <p className="text-gray-600 text-sm">Transfer property, write checks, and obtain receipts from each beneficiary.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">File receipts with court</p>
            <p className="text-gray-600 text-sm">Prove that beneficiaries received their distributions.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Request discharge from duties</p>
            <p className="text-gray-600 text-sm">The court officially releases you from your executor role.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Executor Compensation in California</h2>
      <p className="text-gray-700 mb-4">
        Under <a href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=10800" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">California Probate Code Section 10800</a>, executors are entitled to statutory compensation:
      </p>

      <div className="bg-white border-2 border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-blue-900 text-xl mb-4 flex items-center">
          <DollarSign className="h-6 w-6 mr-2" />
          Statutory Executor Fees
        </h3>
        <table className="w-full">
          <tbody>
            <tr className="border-b">
              <td className="py-3 text-gray-700">First $100,000 of estate value</td>
              <td className="py-3 text-right font-bold text-blue-600">4%</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 text-gray-700">Next $100,000</td>
              <td className="py-3 text-right font-bold text-blue-600">3%</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 text-gray-700">Next $800,000</td>
              <td className="py-3 text-right font-bold text-blue-600">2%</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 text-gray-700">Next $9,000,000</td>
              <td className="py-3 text-right font-bold text-blue-600">1%</td>
            </tr>
            <tr>
              <td className="py-3 text-gray-700">Above $10,000,000</td>
              <td className="py-3 text-right font-bold text-blue-600">0.5%</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-sm text-gray-600">
          <strong>Example:</strong> For a $500,000 estate: $4,000 + $3,000 + $6,000 = <strong>$13,000 executor fee</strong>
        </p>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800">Executor Fees Are Taxable Income</p>
            <p className="text-amber-900">Unlike inheritances (which are tax-free), executor compensation is taxable as ordinary income. Many family member executors choose to waive fees, especially if they're also beneficiaries.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Personal Liability Risks</h2>
      <p className="text-gray-700 mb-4">
        Executors can be held <strong>personally liable</strong> for:
      </p>

      <ul className="space-y-3 mb-6">
        <li className="flex items-start">
          <X className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Mismanaging assets</strong> — Letting property deteriorate, making bad investments, or losing estate funds</span>
        </li>
        <li className="flex items-start">
          <X className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Premature distributions</strong> — Distributing assets before paying all debts and taxes</span>
        </li>
        <li className="flex items-start">
          <X className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Missing tax deadlines</strong> — Failing to file returns or pay taxes on time</span>
        </li>
        <li className="flex items-start">
          <X className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Self-dealing</strong> — Using estate assets for personal benefit</span>
        </li>
        <li className="flex items-start">
          <X className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700"><strong>Ignoring creditors</strong> — Distributing assets without properly addressing valid claims</span>
        </li>
      </ul>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
        <p className="font-bold text-green-800">Protect Yourself</p>
        <p className="text-green-900">The best way to avoid liability is to: (1) keep meticulous records, (2) get court approval before major decisions, (3) work with a probate attorney, and (4) never commingle estate funds with personal funds.</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Frequently Asked Questions</h2>

      <div className="space-y-6 mb-8">
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-900 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
            Can I decline to be an executor?
          </h4>
          <p className="text-gray-600 mt-2">Yes. Being named in a will doesn't obligate you to serve. You can renounce (decline) before the court appoints you. Once appointed, you can petition to resign, but the court must approve.</p>
        </div>
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-900 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
            Can there be multiple executors?
          </h4>
          <p className="text-gray-600 mt-2">Yes. Co-executors must generally act together and agree on decisions. This can provide checks and balances but may also create conflict. Each co-executor is entitled to full statutory compensation.</p>
        </div>
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-900 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
            Can an executor also be a beneficiary?
          </h4>
          <p className="text-gray-600 mt-2">Absolutely. It's very common for a spouse or child to serve as both executor and primary beneficiary. However, you must still fulfill all duties impartially and document everything carefully.</p>
        </div>
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-900 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
            What if beneficiaries disagree with my decisions?
          </h4>
          <p className="text-gray-600 mt-2">Beneficiaries can file objections with the probate court. The court will review your actions and determine if they were appropriate. Always document your reasoning for major decisions.</p>
        </div>
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-900 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
            How long does probate take?
          </h4>
          <p className="text-gray-600 mt-2">California probate typically takes 9-18 months. See our <Link to="/learn-california-probate/probate-timeline-california-what-to-expect" className="text-blue-600 hover:underline">complete probate timeline guide</Link> for month-by-month details.</p>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg my-8">
        <h3 className="font-bold text-gray-900 text-lg mb-3">Overwhelmed by Executor Duties?</h3>
        <p className="text-gray-700 mb-4">
          You don't have to do this alone. Our experienced probate attorneys guide executors through every step of the process for a <Link to="/learn-california-probate/california-probate-fees-statutory-vs-flat" className="text-blue-600 hover:underline">flat fee of $3,995</Link>. We handle the paperwork, court filings, and deadlines — you focus on your family.
        </p>
        <Link to="/register" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
          Get Executor Support Today
        </Link>
      </div>
    </ArticleLayout>
  );
};

export default ExecutorDuties;
