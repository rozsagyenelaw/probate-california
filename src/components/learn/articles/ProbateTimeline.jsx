import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import ArticleLayout from './ArticleLayout';

const ProbateTimeline = () => {
  // Schema.org structured data for the article
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Probate Timeline California: What to Expect Each Month",
    "description": "Understand the California probate timeline from filing to distribution. Learn what happens each month during the 9-18 month probate process and how to avoid delays.",
    "image": "https://myprobateca.com/images/blog/best-online-living-trust-california.jpg",
    "author": {
      "@type": "Organization",
      "name": "Law Offices of Rozsa Gyene"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Law Offices of Rozsa Gyene",
      "logo": {
        "@type": "ImageObject",
        "url": "https://myprobateca.com/favicon.svg"
      }
    },
    "datePublished": "2025-01-12",
    "dateModified": "2025-01-12",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://myprobateca.com/learn-california-probate/probate-timeline-california-what-to-expect"
    }
  };

  // FAQ Schema for common timeline questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long does probate take in California?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "California probate typically takes 9 to 18 months for straightforward estates. Complex estates with disputes, real property sales, or creditor issues may take 2 years or longer."
        }
      },
      {
        "@type": "Question",
        "name": "What is the mandatory 4-month creditor period in California probate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "California law requires a minimum 4-month waiting period after Letters Testamentary are issued, during which creditors can file claims against the estate. This period cannot be shortened."
        }
      },
      {
        "@type": "Question",
        "name": "Can probate be expedited in California?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "While the 4-month creditor period cannot be shortened, you can speed up other phases by filing documents promptly, responding quickly to court requests, and working with experienced probate attorneys who know the local court procedures."
        }
      }
    ]
  };

  const timelinePhases = [
    {
      months: "Month 1",
      title: "Initial Filing & Petition",
      tasks: [
        "Locate and review the original will",
        "Identify heirs and beneficiaries",
        "Inventory assets for the petition",
        "File Petition for Probate with the Superior Court",
        "Pay filing fees ($435-$550 depending on county)",
        "Schedule hearing date (typically 30-45 days out)"
      ],
      tip: "File the petition within 30 days of death to avoid potential complications."
    },
    {
      months: "Month 2",
      title: "Notice & Publication",
      tasks: [
        "Mail Notice of Petition to all heirs and beneficiaries",
        "Publish Notice of Death in local newspaper (3 consecutive weeks)",
        "File Proof of Service with the court",
        "Prepare for probate hearing"
      ],
      tip: "Use a newspaper approved for legal notices in the county where the decedent lived."
    },
    {
      months: "Month 2-3",
      title: "Probate Hearing & Appointment",
      tasks: [
        "Attend the probate hearing",
        "Present will for admission to probate",
        "Receive court order appointing executor/administrator",
        "Obtain Letters Testamentary or Letters of Administration",
        "Order certified copies of Letters (typically 6-10 copies needed)"
      ],
      tip: "Letters Testamentary are essential - you'll need them to access bank accounts and manage assets."
    },
    {
      months: "Months 3-4",
      title: "Asset Collection & Notification",
      tasks: [
        "Open estate bank account",
        "Transfer assets into estate name",
        "Notify Social Security, pension providers, insurance companies",
        "Send formal Notice to Creditors",
        "Begin collecting debts owed to the estate",
        "Secure and insure real property"
      ],
      tip: "Keep detailed records of all transactions - you'll need them for the final accounting."
    },
    {
      months: "Months 4-7",
      title: "4-Month Creditor Period (Mandatory)",
      tasks: [
        "Wait for creditor claims (4-month minimum period)",
        "Review and evaluate any claims received",
        "Pay valid creditor claims from estate funds",
        "Reject invalid or excessive claims",
        "Continue managing estate assets",
        "File federal estate tax return if required (due 9 months after death)"
      ],
      tip: "This waiting period cannot be shortened - it's required by California law."
    },
    {
      months: "Months 5-8",
      title: "Real Property Sale (If Applicable)",
      tasks: [
        "Obtain property appraisal",
        "List property for sale",
        "Review and accept offers",
        "File Notice of Proposed Action (if selling below appraisal)",
        "Obtain court confirmation if required",
        "Complete sale and deposit proceeds into estate account"
      ],
      tip: "Sales at 90% or more of appraised value typically don't require court confirmation."
    },
    {
      months: "Months 8-12",
      title: "Final Inventory & Tax Returns",
      tasks: [
        "Complete Inventory and Appraisal (Form DE-160)",
        "File final income tax returns for decedent",
        "File estate income tax returns if applicable",
        "Pay any outstanding taxes",
        "Obtain tax clearance from FTB and IRS if needed"
      ],
      tip: "Hire a CPA experienced with estate taxation to ensure compliance and minimize taxes."
    },
    {
      months: "Months 10-15",
      title: "Final Accounting & Petition",
      tasks: [
        "Prepare detailed accounting of all receipts and disbursements",
        "Calculate statutory fees for executor and attorney",
        "Prepare proposed distribution plan",
        "File Petition for Final Distribution",
        "Mail notice to all interested parties",
        "Schedule final hearing"
      ],
      tip: "Accurate accounting is crucial - errors can delay distribution by months."
    },
    {
      months: "Months 12-18",
      title: "Distribution & Closing",
      tasks: [
        "Attend final hearing for court approval",
        "Receive Order for Final Distribution",
        "Distribute assets to beneficiaries",
        "Obtain receipts from all beneficiaries",
        "File final receipts with the court",
        "Receive Order Discharging Executor"
      ],
      tip: "Keep copies of all signed receipts - they protect you from future claims."
    }
  ];

  const delayFactors = [
    {
      factor: "Will Contests",
      impact: "6-24+ months",
      description: "If someone challenges the validity of the will, probate essentially pauses until the dispute is resolved through mediation, settlement, or trial."
    },
    {
      factor: "Missing Heirs",
      impact: "3-12 months",
      description: "If beneficiaries cannot be located, the court may require extensive search efforts and publication before proceeding."
    },
    {
      factor: "Real Property Issues",
      impact: "3-6 months",
      description: "Clouded titles, boundary disputes, or difficulties selling property can significantly extend the timeline."
    },
    {
      factor: "Tax Complications",
      impact: "3-12 months",
      description: "Complex tax situations, audits, or disputes with tax authorities can delay final distribution."
    },
    {
      factor: "Creditor Disputes",
      impact: "2-6 months",
      description: "If creditors file claims that must be litigated, resolution can take several additional months."
    },
    {
      factor: "Court Backlogs",
      impact: "1-4 months",
      description: "Some California counties have significant court backlogs, especially in larger urban areas like Los Angeles."
    }
  ];

  return (
    <ArticleLayout>
      <Helmet>
        <title>Probate Timeline California: What to Expect Each Month | MyProbateCA</title>
        <meta
          name="description"
          content="Understand the California probate timeline from filing to distribution. Learn what happens each month during the 9-18 month process and how to avoid costly delays."
        />
        <meta name="keywords" content="California probate timeline, how long does probate take, probate process duration, probate waiting period, creditor period California" />
        <link rel="canonical" href="https://myprobateca.com/learn-california-probate/probate-timeline-california-what-to-expect" />

        {/* Open Graph */}
        <meta property="og:title" content="Probate Timeline California: What to Expect Each Month" />
        <meta property="og:description" content="Complete month-by-month guide to the California probate timeline. Understand each phase and how to avoid delays." />
        <meta property="og:url" content="https://myprobateca.com/learn-california-probate/probate-timeline-california-what-to-expect" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://myprobateca.com/images/blog/best-online-living-trust-california.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Probate Timeline California: What to Expect Each Month" />
        <meta name="twitter:description" content="Complete month-by-month guide to the California probate timeline." />
        <meta name="twitter:image" content="https://myprobateca.com/images/blog/best-online-living-trust-california.jpg" />

        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <article className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link to="/learn-california-probate" className="hover:text-blue-600">Learn Hub</Link>
            <span>/</span>
            <span>Probate Timeline</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Probate Timeline California: What to Expect Each Month
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            A comprehensive month-by-month guide to understanding how long probate takes in California
            and what happens at each stage of the process.
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <span>Updated January 2025</span>
            <span>•</span>
            <span>15 min read</span>
          </div>

          <img
            src="/images/blog/best-online-living-trust-california.jpg"
            alt="Calendar and estate planning documents representing probate timeline in California"
            className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md"
          />
        </header>

        {/* Quick Summary Box */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Quick Summary: California Probate Timeline</h2>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Simple estates:</strong> 9-12 months minimum</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Average estates:</strong> 12-18 months</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Complex estates:</strong> 18-36+ months</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Mandatory minimum:</strong> 4-month creditor period (cannot be shortened)</span>
            </li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-gray-700">
            <li><a href="#overview" className="hover:text-blue-600">Overview: How Long Does Probate Take?</a></li>
            <li><a href="#timeline" className="hover:text-blue-600">Month-by-Month Timeline</a></li>
            <li><a href="#delays" className="hover:text-blue-600">Common Causes of Delays</a></li>
            <li><a href="#expedite" className="hover:text-blue-600">How to Speed Up Probate</a></li>
            <li><a href="#faqs" className="hover:text-blue-600">Frequently Asked Questions</a></li>
          </ul>
        </nav>

        {/* Main Content */}
        <div className="prose prose-lg max-w-none">

          {/* Overview Section */}
          <section id="overview" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Overview: How Long Does Probate Take in California?
            </h2>

            <p className="text-gray-700 mb-4">
              California probate typically takes between <strong>9 and 18 months</strong> for most estates.
              However, this timeline can vary significantly based on the complexity of the estate, whether
              there are disputes, and the efficiency of the local probate court.
            </p>

            <p className="text-gray-700 mb-4">
              One thing that cannot change is California's mandatory <strong>4-month creditor notification
              period</strong>. This waiting period is required by law (California Probate Code Section 9100)
              and gives creditors time to file claims against the estate. Even the simplest estate cannot
              close before this period ends.
            </p>

            <p className="text-gray-700 mb-4">
              Understanding the probate timeline helps executors and beneficiaries set realistic expectations
              and plan accordingly. While you can't eliminate the waiting periods, working with an
              experienced <Link to="/california-probate-courts" className="text-blue-600 hover:underline">probate attorney familiar with your local court</Link> can
              help minimize unnecessary delays.
            </p>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
              <p className="text-amber-800 text-sm">
                <strong>Important:</strong> If the estate qualifies for a{' '}
                <Link to="/learn-california-probate/small-estate-affidavit-california" className="text-amber-700 hover:underline">
                  small estate affidavit
                </Link> (under $184,500 in assets), you may be able to avoid probate entirely and
                transfer assets in as little as 40 days after death.
              </p>
            </div>
          </section>

          {/* Month-by-Month Timeline */}
          <section id="timeline" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Month-by-Month California Probate Timeline
            </h2>

            <p className="text-gray-700 mb-6">
              Below is a detailed breakdown of what typically happens during each phase of California probate.
              Keep in mind that these timeframes can overlap and may vary based on your specific situation.
            </p>

            <div className="space-y-6">
              {timelinePhases.map((phase, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between">
                    <h3 className="font-semibold">{phase.title}</h3>
                    <span className="bg-blue-700 px-3 py-1 rounded text-sm">{phase.months}</span>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-2 mb-4">
                      {phase.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex items-start gap-2 text-gray-700">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                      <p className="text-sm text-gray-600">
                        <strong className="text-gray-800">Pro Tip:</strong> {phase.tip}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Delays Section */}
          <section id="delays" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Common Causes of Probate Delays
            </h2>

            <p className="text-gray-700 mb-6">
              While the timeline above represents a typical probate case, several factors can significantly
              extend the process. Being aware of these potential delays can help you plan and potentially
              avoid them.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {delayFactors.map((item, index) => (
                <div key={index} className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-red-900">{item.factor}</h3>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      +{item.impact}
                    </span>
                  </div>
                  <p className="text-sm text-red-800">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How to Expedite Section */}
          <section id="expedite" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How to Speed Up the Probate Process
            </h2>

            <p className="text-gray-700 mb-6">
              While you cannot eliminate the mandatory waiting periods, there are several strategies to
              minimize delays and keep your probate case moving efficiently.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900">File Promptly</h3>
                  <p className="text-gray-700">
                    Don't delay starting the process. File the petition within 30 days of death to get your
                    hearing date scheduled as soon as possible. Learn more in our{' '}
                    <Link to="/learn-california-probate/how-to-file-probate-california" className="text-blue-600 hover:underline">
                      step-by-step filing guide
                    </Link>.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Hire an Experienced Probate Attorney</h3>
                  <p className="text-gray-700">
                    An attorney who regularly practices in your specific court knows the local rules, judges'
                    preferences, and how to avoid common mistakes that cause delays. Our{' '}
                    <Link to="/california-probate-administration" className="text-blue-600 hover:underline">
                      flat-fee probate service
                    </Link> handles all 11 phases efficiently.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Organize Documents Early</h3>
                  <p className="text-gray-700">
                    Gather all necessary documents before filing: death certificate, original will, asset
                    statements, beneficiary information, and creditor details. Missing documents cause delays.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Respond Quickly to Court Requests</h3>
                  <p className="text-gray-700">
                    When the court requests additional information or documents, respond immediately.
                    Delays in responding can push your case to the back of the queue.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">5</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Communicate with Beneficiaries</h3>
                  <p className="text-gray-700">
                    Keep all heirs and beneficiaries informed throughout the process. Clear communication
                    can prevent disputes and objections that delay distribution.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">6</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Handle Real Property Strategically</h3>
                  <p className="text-gray-700">
                    If selling real estate, list it early in the process. Sales at or above 90% of appraised
                    value don't require court confirmation, which saves significant time.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Visual Timeline */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Visual Probate Timeline Overview
            </h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">1</div>
                  <p className="text-sm font-medium">Filing</p>
                  <p className="text-xs text-gray-500">Month 1</p>
                </div>
                <div className="hidden md:block flex-1 h-1 bg-blue-200"></div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">2</div>
                  <p className="text-sm font-medium">Hearing</p>
                  <p className="text-xs text-gray-500">Month 2-3</p>
                </div>
                <div className="hidden md:block flex-1 h-1 bg-blue-200"></div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">3</div>
                  <p className="text-sm font-medium">Creditor Period</p>
                  <p className="text-xs text-gray-500">4 Months (Required)</p>
                </div>
                <div className="hidden md:block flex-1 h-1 bg-blue-200"></div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">4</div>
                  <p className="text-sm font-medium">Accounting</p>
                  <p className="text-xs text-gray-500">Month 8-12</p>
                </div>
                <div className="hidden md:block flex-1 h-1 bg-blue-200"></div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">5</div>
                  <p className="text-sm font-medium">Distribution</p>
                  <p className="text-xs text-gray-500">Month 12-18</p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600">
                Total Timeline: 9-18 months (typical) | 18-36+ months (complex estates)
              </p>
            </div>
          </section>

          {/* FAQs Section */}
          <section id="faqs" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions About Probate Timeline
            </h2>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  How long does probate take in California?
                </h3>
                <p className="text-gray-700">
                  California probate typically takes 9 to 18 months for straightforward estates. Complex
                  estates with disputes, real property sales, or creditor issues may take 2 years or longer.
                  The mandatory 4-month creditor period means no probate can close in less than about 7-8
                  months at absolute minimum.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What is the mandatory 4-month creditor period in California probate?
                </h3>
                <p className="text-gray-700">
                  California law requires a minimum 4-month waiting period after{' '}
                  <Link to="/learn-california-probate/letters-testamentary-california-guide" className="text-blue-600 hover:underline">
                    Letters Testamentary
                  </Link> are issued, during which creditors can file claims against the estate. This period
                  cannot be shortened and is designed to protect creditors' rights.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can probate be expedited in California?
                </h3>
                <p className="text-gray-700">
                  While the 4-month creditor period cannot be shortened, you can speed up other phases by
                  filing documents promptly, responding quickly to court requests, and working with
                  experienced probate attorneys who know the local court procedures. Some courts also offer
                  expedited hearing dates in certain circumstances.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What happens if probate takes longer than expected?
                </h3>
                <p className="text-gray-700">
                  If probate extends beyond initial expectations, beneficiaries must wait for their
                  inheritances. The executor continues to manage the estate and may need to file status
                  reports with the court. In some cases, the executor can request permission to make
                  partial distributions to beneficiaries while the case is pending.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  How much does probate cost for an 18-month case?
                </h3>
                <p className="text-gray-700">
                  California{' '}
                  <Link to="/learn-california-probate/california-probate-fees-statutory-vs-flat" className="text-blue-600 hover:underline">
                    statutory probate fees
                  </Link> are based on estate value, not duration. However, longer cases may incur
                  additional "extraordinary fees" for complex matters. Our flat-fee service of $3,995
                  covers all standard probate work regardless of how long the case takes.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-blue-900 text-white rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Need Help Navigating the Probate Timeline?
            </h2>
            <p className="mb-6 text-blue-100">
              Our experienced team handles California probate cases every day. We know how to keep your
              case moving efficiently through each phase, minimizing delays and reducing stress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/free-consultation"
                className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold text-center hover:bg-blue-50 transition-colors"
              >
                Schedule Free Consultation
              </Link>
              <a
                href="tel:+18182916217"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-white/10 transition-colors"
              >
                Call (818) 291-6217
              </a>
            </div>
          </section>

          {/* Related Articles */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                to="/learn-california-probate/how-to-file-probate-california"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-2">How to File Probate in California</h3>
                <p className="text-sm text-gray-600">Step-by-step guide to starting the probate process.</p>
              </Link>
              <Link
                to="/learn-california-probate/small-estate-affidavit-california"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Small Estate Affidavit California</h3>
                <p className="text-sm text-gray-600">Learn when you can skip probate entirely.</p>
              </Link>
              <Link
                to="/learn-california-probate/letters-testamentary-california-guide"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Letters Testamentary Guide</h3>
                <p className="text-sm text-gray-600">Essential document for managing estate assets.</p>
              </Link>
            </div>
          </section>
        </div>
      </article>
    </ArticleLayout>
  );
};

export default ProbateTimeline;
