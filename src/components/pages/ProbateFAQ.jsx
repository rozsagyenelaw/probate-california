import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import {
  Scale,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  LogIn,
  LogOut,
  LayoutDashboard,
  Shield,
  ArrowRight,
  Check,
  ExternalLink,
  Award,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Clock,
  FileText,
  Users,
  Gavel,
  AlertTriangle,
  Home,
  HelpCircle
} from 'lucide-react';

const ProbateFAQ = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleStartCase = () => {
    navigate(user ? '/intake' : '/register');
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Schema markup
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LegalService",
        "@id": "https://myprobateca.com/#organization",
        "name": "MyProbateCA - Law Offices of Rozsa Gyene",
        "url": "https://myprobateca.com/",
        "telephone": "+1-818-291-6217",
        "email": "rozsagyenelaw@yahoo.com",
        "priceRange": "$3,995",
        "image": "https://myprobateca.com/images/rozsa-gyene-probate-attorney.jpg",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "655 N Central Ave, Suite 1704",
          "addressLocality": "Glendale",
          "addressRegion": "CA",
          "postalCode": "91203",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "34.1425",
          "longitude": "-118.2551"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "5.0",
          "reviewCount": "184"
        },
        "sameAs": [
          "https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356"
        ]
      },
      {
        "@type": "Person",
        "@id": "https://myprobateca.com/#attorney",
        "name": "Rozsa Gyene",
        "jobTitle": "Lead Probate Attorney",
        "identifier": "208356",
        "url": "https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356",
        "affiliation": {
          "@type": "Organization",
          "name": "State Bar of California",
          "url": "https://www.calbar.ca.gov/"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://myprobateca.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "California Probate FAQ",
            "item": "https://myprobateca.com/probate-faq-california/"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How much does probate cost in California?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "California probate costs include court filing fees ($435-500), publication costs ($200-350), probate referee fees (0.1% of assets), and attorney fees. Traditional statutory attorney fees are calculated as 4% of the first $100,000, 3% of the next $100,000, 2% of the next $800,000, and 1% of the next $9 million. For a $1 million estate, statutory fees total $23,000. MyProbateCA offers a flat fee of $3,995 for complete attorney-supervised administration."
            }
          },
          {
            "@type": "Question",
            "name": "How long does the California probate process take?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The California probate process typically takes 9 to 18 months from petition filing to final distribution. Simple estates with no disputes may close in 9-12 months. Complex estates with real estate sales, creditor claims, or family disputes can extend to 18-24 months. Los Angeles County (Stanley Mosk Courthouse) often has longer timelines due to high case volume."
            }
          },
          {
            "@type": "Question",
            "name": "What are IGN notes at the Stanley Mosk Courthouse?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "IGN notes are 'Incomplete,' 'Grant,' or 'Needs' notes posted by probate examiners 5-10 days before your hearing. They indicate deficiencies in your filing that must be corrected before the judge will sign your order. MyProbateCA specializes in drafting and filing the Verified Supplements required to clear these notes."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need a lawyer if there is a Will?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. In California, a Will does not avoid probate—it simply provides instructions for the court to follow. You still must complete the formal probate process to transfer real estate titles, close bank accounts, and distribute assets. The only way to avoid probate is with a properly funded living trust, joint tenancy, or beneficiary designations."
            }
          },
          {
            "@type": "Question",
            "name": "What is the $3,995 flat fee for California probate?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "MyProbateCA offers complete attorney-supervised probate administration for a flat $3,995 fee. This includes attorney preparation of all documents for all 11 phases, review by California Bar Attorney #208356, IGN note clearance, and dashboard tracking. This compares to statutory fees of $13,000-$33,000+ for estates valued at $500,000-$1,500,000."
            }
          },
          {
            "@type": "Question",
            "name": "Am I personally liable as executor for estate debts?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, you can be held personally liable if you distribute assets before paying valid creditors or taxes. This is called being 'surcharged.' California law requires executors to properly notice creditors, wait the 4-month claim period, pay valid debts, and file final tax returns before distribution. Attorney review of your accounting protects you from personal liability."
            }
          },
          {
            "@type": "Question",
            "name": "Can I do California probate myself without a lawyer?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Technically yes, but it's risky. Self-represented executors face a high rejection rate at filing, IGN notes they don't understand, personal liability for mistakes, and an average 6+ month longer timeline. Court examiners don't provide legal advice. MyProbateCA provides attorney oversight at a fraction of traditional attorney costs."
            }
          },
          {
            "@type": "Question",
            "name": "What triggers probate in California?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Probate is required when a California resident dies owning assets titled solely in their name worth more than $184,500 (personal property) or any real estate not held in trust, joint tenancy, or with a transfer-on-death deed. Even with a Will, these assets must go through probate court."
            }
          },
          {
            "@type": "Question",
            "name": "What is simplified probate in California?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "California offers simplified probate for smaller estates. For deaths after April 1, 2025: Small Estate Affidavit (no court) for personal property under $208,850, and Simplified Real Property Petition for primary residences under $750,000 with total personal property under $208,850. These have shorter timelines and lower costs than full probate."
            }
          },
          {
            "@type": "Question",
            "name": "How do I start the California probate process?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "To start California probate: 1) Locate the original Will if one exists, 2) Determine which Superior Court has jurisdiction (county of decedent's residence), 3) Complete and file the Petition for Probate (Form DE-111), 4) Pay the filing fee ($435-500), 5) Arrange publication in an adjudicated newspaper. MyProbateCA's intake questionnaire guides you through gathering all necessary information."
            }
          }
        ]
      },
      {
        "@type": "HowTo",
        "name": "The 11 Phases of California Probate",
        "description": "Complete guide to the California probate process from petition to distribution",
        "totalTime": "P12M",
        "estimatedCost": {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": "3995"
        },
        "step": [
          { "@type": "HowToStep", "position": 1, "name": "File Petition for Probate", "text": "Complete and file Form DE-111 with the Superior Court in the county where the decedent resided. Pay the filing fee ($435-500)." },
          { "@type": "HowToStep", "position": 2, "name": "Send Notice of Petition", "text": "Mail Form DE-120 to all heirs and beneficiaries at least 15 days before the hearing date." },
          { "@type": "HowToStep", "position": 3, "name": "Publish Notice", "text": "Publish notice in an adjudicated newspaper for 3 consecutive weeks to notify unknown creditors." },
          { "@type": "HowToStep", "position": 4, "name": "Obtain Bond", "text": "If required, obtain a surety bond to protect the estate from executor mismanagement." },
          { "@type": "HowToStep", "position": 5, "name": "Attend Hearing & Obtain Order", "text": "Appear at the probate hearing (or have attorney appear). Judge signs Order for Probate appointing you as executor/administrator." },
          { "@type": "HowToStep", "position": 6, "name": "Receive Letters Testamentary", "text": "Obtain certified Letters Testamentary (Form DE-150)—your legal authority to act on behalf of the estate." },
          { "@type": "HowToStep", "position": 7, "name": "Complete Inventory & Appraisal", "text": "Work with the court-appointed Probate Referee to inventory and appraise all estate assets within 4 months." },
          { "@type": "HowToStep", "position": 8, "name": "Manage Creditor Claims", "text": "Send Notice to Creditors. Allow 4-month claim period. Review, accept, or reject creditor claims." },
          { "@type": "HowToStep", "position": 9, "name": "Clear Court Notes", "text": "Review examiner notes posted before hearing. File Verified Supplements to clear any deficiencies." },
          { "@type": "HowToStep", "position": 10, "name": "File Final Accounting", "text": "Prepare and file complete accounting of all estate income, expenses, and proposed distribution." },
          { "@type": "HowToStep", "position": 11, "name": "Distribute Assets & Close Estate", "text": "After court approval, distribute assets to beneficiaries, file receipts, and close the estate." }
        ]
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>California Probate FAQ | Attorney Answers on Fees, Forms & Court Notes</title>
        <meta name="description" content="Get professional answers to California probate questions. Learn about the $3,995 flat fee, clearing Stanley Mosk IGN notes, executor liability, and the 11-phase process." />
        <meta name="keywords" content="california probate faq, probate court questions, stanley mosk courthouse notes, executor duties ca, probate attorney fee calculator" />
        <link rel="canonical" href="https://myprobateca.com/probate-faq-california/" />

        <meta property="og:title" content="California Probate FAQ | Expert Guidance for Executors & Heirs" />
        <meta property="og:description" content="Everything you need to know about the California probate process, from filing the petition to final distribution." />
        <meta property="og:url" content="https://myprobateca.com/probate-faq-california/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://myprobateca.com/images/california-probate-faq-og.jpg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="California Probate FAQ | Expert Guidance" />
        <meta name="twitter:description" content="Attorney-verified answers to California probate questions. Fees, timelines, court procedures & more." />

        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-blue-900 text-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2">
                <Scale className="h-8 w-8" />
                <span className="font-bold text-xl">MyProbateCA</span>
              </Link>

              <div className="hidden md:flex items-center space-x-6">
                <Link to="/california-probate-administration" className="hover:text-blue-200">Services</Link>
                <Link to="/probate-court-locations-california" className="hover:text-blue-200">Locations</Link>
                <Link to="/probate-faq-california" className="hover:text-blue-200 text-amber-300">FAQ</Link>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-1 hover:text-blue-200">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>
                    {isAdmin && (
                      <button onClick={() => navigate('/admin')} className="flex items-center space-x-1 hover:text-blue-200">
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </button>
                    )}
                    <button onClick={handleLogout} className="flex items-center space-x-1 hover:text-blue-200">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/login')} className="flex items-center space-x-1 hover:text-blue-200">
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </button>
                    <button onClick={handleStartCase} className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg font-semibold">
                      Get Started
                    </button>
                  </div>
                )}
              </div>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-blue-800">
                <div className="flex flex-col space-y-3">
                  <Link to="/california-probate-administration" className="hover:text-blue-200">Services</Link>
                  <Link to="/probate-court-locations-california" className="hover:text-blue-200">Locations</Link>
                  <Link to="/probate-faq-california" className="hover:text-blue-200 text-amber-300">FAQ</Link>
                  {user ? (
                    <>
                      <button onClick={() => navigate('/dashboard')} className="text-left hover:text-blue-200">Dashboard</button>
                      <button onClick={handleLogout} className="text-left hover:text-blue-200">Logout</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => navigate('/login')} className="text-left hover:text-blue-200">Login</button>
                      <button onClick={handleStartCase} className="bg-amber-500 px-4 py-2 rounded-lg font-semibold text-center">
                        Get Started
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Breadcrumbs */}
        <div className="bg-gray-100 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
              <ol className="flex items-center space-x-2">
                <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
                <li><span className="mx-2">&gt;</span></li>
                <li className="text-gray-900 font-medium">California Probate FAQ</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 px-6 md:px-8 rounded-lg mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">California Probate FAQ: Expert Answers for Executors & Heirs</h1>
            <p className="text-xl text-blue-100 mb-6">Attorney-verified answers to your California probate questions. Understand fees, timelines, court procedures, and how to protect yourself as executor.</p>
            <div className="flex flex-wrap gap-4">
              <button onClick={handleStartCase} className="inline-block bg-white text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
                Check My Eligibility - Free
              </button>
              <a href="#cost-questions" className="inline-block border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-900 transition">
                Jump to Cost Questions
              </a>
            </div>
          </section>

          {/* Quick Navigation */}
          <section className="bg-gray-50 p-6 rounded-lg mb-12">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Navigation</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <a href="#cost-questions" className="text-blue-600 hover:underline flex items-center">
                <DollarSign className="h-4 w-4 mr-2" /> Probate Costs & Fees
              </a>
              <a href="#process-questions" className="text-blue-600 hover:underline flex items-center">
                <FileText className="h-4 w-4 mr-2" /> The 11-Phase Process
              </a>
              <a href="#court-questions" className="text-blue-600 hover:underline flex items-center">
                <Gavel className="h-4 w-4 mr-2" /> Court & Filing Questions
              </a>
              <a href="#executor-questions" className="text-blue-600 hover:underline flex items-center">
                <Users className="h-4 w-4 mr-2" /> Executor Duties & Liability
              </a>
              <a href="#timeline-questions" className="text-blue-600 hover:underline flex items-center">
                <Clock className="h-4 w-4 mr-2" /> Timeline & Delays
              </a>
              <a href="#special-situations" className="text-blue-600 hover:underline flex items-center">
                <Home className="h-4 w-4 mr-2" /> Special Situations
              </a>
            </div>
          </section>

          {/* Featured Snippet Section - Cost */}
          <section className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-12">
            <h2 className="text-xl font-bold text-blue-900 mb-3">How much does probate cost in California?</h2>
            <p className="text-gray-700 mb-4">California probate costs include court filing fees ($435-500), publication costs ($200-350), probate referee fees (0.1% of assets), and attorney fees. Traditional <strong>statutory attorney fees</strong> are calculated as:</p>
            <ul className="text-gray-700 mb-4 space-y-1 ml-4">
              <li>4% of the first $100,000</li>
              <li>3% of the next $100,000</li>
              <li>2% of the next $800,000</li>
              <li>1% of the next $9,000,000</li>
            </ul>
            <p className="text-gray-700">For a <strong>$1 million estate</strong>, statutory fees total <strong>$23,000</strong>. MyProbateCA offers a flat fee of <strong>$3,995</strong> for complete attorney-supervised administration—saving you $19,000+.</p>
          </section>

          {/* ===================== CATEGORY 1: COST QUESTIONS ===================== */}
          <section id="cost-questions" className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-blue-600 flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-blue-600" /> Probate Costs & The $3,995 Flat Fee
            </h2>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Is the $3,995 flat fee for probate real?</h3>
                <p className="text-gray-700 mb-3">Yes. While most California attorneys charge "statutory fees" (a percentage of the estate value), MyProbateCA provides complete attorney-supervised probate administration for a <strong>flat fee of $3,995</strong>.</p>
                <p className="text-gray-700 mb-3">This includes:</p>
                <ul className="text-gray-700 mb-3 space-y-1 ml-4">
                  <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /> Attorney preparation of all documents for all 11 phases</li>
                  <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /> Review by California Bar Attorney #208356</li>
                  <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /> IGN note clearance and Verified Supplements</li>
                  <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /> Dashboard tracking throughout the process</li>
                </ul>
                <p className="text-gray-700">It does <strong>not</strong> include third-party costs: court filing fees (~$465), publication (~$200-350), probate referee fees (0.1% of assets), or bond premiums if required.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Why is statutory probate so expensive?</h3>
                <p className="text-gray-700 mb-3">Statutory fees are set by <a href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=10810" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">California Probate Code Section 10810</a>. The law dates to an era when attorneys hand-typed documents and made multiple courthouse trips.</p>
                <p className="text-gray-700 mb-3">Today's technology enables dramatic efficiency. For a <strong>$1.5 million estate</strong>, statutory attorney fees are <strong>$28,000</strong>. We believe this is excessive for standard administration when modern systems can streamline the process.</p>
                <p className="text-gray-700">Our app handles data gathering and document generation, allowing Attorney Rozsa Gyene (Bar #208356) to provide professional oversight at a fraction of the traditional cost.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">What additional costs should I expect beyond attorney fees?</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-semibold">Cost Type</th>
                        <th className="text-left p-3 font-semibold">Amount</th>
                        <th className="text-left p-3 font-semibold">When Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-3">Court Filing Fee</td>
                        <td className="p-3">$435-500</td>
                        <td className="p-3">At initial filing</td>
                      </tr>
                      <tr>
                        <td className="p-3">Newspaper Publication</td>
                        <td className="p-3">$200-350</td>
                        <td className="p-3">After filing</td>
                      </tr>
                      <tr>
                        <td className="p-3">Probate Referee Fee</td>
                        <td className="p-3">0.1% of assets</td>
                        <td className="p-3">After inventory</td>
                      </tr>
                      <tr>
                        <td className="p-3">Certified Copies</td>
                        <td className="p-3">$25-50 each</td>
                        <td className="p-3">As needed</td>
                      </tr>
                      <tr>
                        <td className="p-3">Bond Premium (if required)</td>
                        <td className="p-3">0.5-1% of bond amount</td>
                        <td className="p-3">Before hearing</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Can I pay in installments?</h3>
                <p className="text-gray-700 mb-3">Yes. We offer flexible payment options:</p>
                <ul className="text-gray-700 space-y-2 ml-4">
                  <li><strong>Pay in Full:</strong> $3,995 (Full Probate) or $2,495 (Simplified)</li>
                  <li><strong>3 Monthly Payments:</strong> Split into 3 equal payments at no extra cost</li>
                  <li><strong>Klarna:</strong> 4 interest-free payments of $999 (Full) or $624 (Simplified)</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Do executors get paid?</h3>
                <p className="text-gray-700 mb-3">Yes. California law allows executors to receive "statutory compensation" using the same formula as attorney fees. For a $1 million estate, executor compensation is $23,000.</p>
                <p className="text-gray-700">However, many family member executors waive this fee to preserve estate assets for beneficiaries. The court requires you to disclose your compensation in the Final Accounting.</p>
              </div>
            </div>
          </section>

          {/* ===================== CATEGORY 2: PROCESS QUESTIONS ===================== */}
          <section id="process-questions" className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-green-600 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-green-600" /> The 11 Phases of California Probate
            </h2>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-lg text-green-900 mb-4">What are the 11 phases of California probate?</h3>
              <p className="text-gray-700 mb-4">Every California probate follows these mandatory steps, whether you use an attorney or go it alone:</p>
              <ol className="space-y-4">
                {[
                  { num: 1, title: "Petition for Probate", desc: "File Form DE-111 with the Superior Court. Name the executor, identify heirs, and submit the original Will (if any)." },
                  { num: 2, title: "Notice of Petition", desc: "Mail Form DE-120 to all heirs and beneficiaries at least 15 days before the hearing." },
                  { num: 3, title: "Publication", desc: "Publish notice in an adjudicated newspaper for 3 consecutive weeks to notify unknown creditors." },
                  { num: 4, title: "Bond", desc: "Obtain a surety bond if required (often waived if the Will waives bond or all beneficiaries consent)." },
                  { num: 5, title: "Order for Probate", desc: "Attend the hearing (or have attorney appear remotely). Judge signs order appointing you as executor/administrator." },
                  { num: 6, title: "Letters Testamentary", desc: "Receive certified Letters (Form DE-150)—your \"golden ticket\" proving legal authority to act for the estate." },
                  { num: 7, title: "Inventory & Appraisal", desc: "Work with the court-appointed Probate Referee to inventory and value all estate assets within 4 months." },
                  { num: 8, title: "Notice to Creditors", desc: "Send formal notice to known creditors. Manage the 4-month claim period. Accept, reject, or negotiate claims." },
                  { num: 9, title: "Clear Court Notes", desc: "Review examiner IGN notes posted before hearings. File Verified Supplements to satisfy deficiencies." },
                  { num: 10, title: "Final Accounting", desc: "Prepare complete accounting of all income, expenses, distributions, and proposed final distribution." },
                  { num: 11, title: "Distribution & Close", desc: "After court approval, distribute assets to beneficiaries, obtain receipts, and file the Order for Final Distribution." }
                ].map(phase => (
                  <li key={phase.num} className="flex items-start">
                    <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">{phase.num}</span>
                    <div>
                      <strong className="text-gray-900">{phase.title}</strong>
                      <p className="text-gray-600 text-sm">{phase.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">What is a Petition for Probate (Form DE-111)?</h3>
                <p className="text-gray-700 mb-3">Form DE-111 is the official court document that starts the probate process. It identifies:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>The decedent and date of death</li>
                  <li>Whether there is a Will</li>
                  <li>Who is requesting appointment as executor/administrator</li>
                  <li>All heirs at law (even if there's a Will)</li>
                  <li>Estimated estate value</li>
                  <li>Whether bond should be waived</li>
                </ul>
                <p className="text-gray-700 mt-3">The petition must be verified (signed under penalty of perjury) and filed with the original Will, if any.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">What are Letters Testamentary?</h3>
                <p className="text-gray-700 mb-3">Letters Testamentary (Form DE-150) are your legal proof of authority to act on behalf of the estate. Banks, title companies, and financial institutions require certified copies to:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>Access and close bank accounts</li>
                  <li>Sell real estate</li>
                  <li>Transfer vehicle titles</li>
                  <li>Manage investment accounts</li>
                  <li>File tax returns for the estate</li>
                </ul>
                <p className="text-gray-700 mt-3">Order multiple certified copies (at least 5-10)—many institutions require originals and won't return them.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">What is a Probate Referee?</h3>
                <p className="text-gray-700 mb-3">A Probate Referee is a court-appointed appraiser who values estate assets. They're assigned automatically when you file the Petition. The referee:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>Appraises real estate, stocks, and other assets</li>
                  <li>Signs the official Inventory & Appraisal (Form DE-160)</li>
                  <li>Charges 0.1% of asset value (minimum $75)</li>
                </ul>
                <p className="text-gray-700 mt-3">You don't choose the referee—they're assigned by the court on a rotating basis.</p>
              </div>
            </div>
          </section>

          {/* ===================== CATEGORY 3: COURT QUESTIONS ===================== */}
          <section id="court-questions" className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-purple-600 flex items-center">
              <Gavel className="h-6 w-6 mr-2 text-purple-600" /> Court & Filing Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">What are IGN notes at the Stanley Mosk Courthouse?</h3>
                <p className="text-gray-700 mb-3">IGN stands for "Incomplete," "Grant," or "Needs." These are notes posted by probate examiners 5-10 days before your hearing indicating problems with your filing.</p>
                <p className="text-gray-700 mb-3">Common IGN note issues include:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>Missing heir information</li>
                  <li>Bond calculation errors</li>
                  <li>Inconsistent dates or names</li>
                  <li>Missing proof of mailing</li>
                  <li>Publication problems</li>
                </ul>
                <p className="text-gray-700 mt-3">If you don't file a Verified Supplement clearing the notes before your hearing, the judge will <strong>continue (postpone)</strong> your case—often by 3+ months.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Can you help if I already started my case and got stuck with court notes?</h3>
                <p className="text-gray-700 mb-3"><strong>Yes.</strong> This is actually a common request. Many people start probate themselves, get hit with IGN notes they don't understand, and need professional help.</p>
                <p className="text-gray-700 mb-3">Our <strong>Note Clearance Service</strong> is included in the $3,995 flat fee. We:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /> Review all examiner notes</li>
                  <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /> Identify exactly what's needed</li>
                  <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /> Draft the Verified Supplement</li>
                  <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /> File before your hearing</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Why do all Los Angeles probate cases go to Stanley Mosk?</h3>
                <p className="text-gray-700 mb-3">Los Angeles County has centralized its probate division at the <a href="https://www.lacourt.org/courthouse/info/smm" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stanley Mosk Courthouse</a> at 111 N. Hill Street in Downtown LA.</p>
                <p className="text-gray-700 mb-3">Whether the decedent lived in Santa Monica, Glendale, Long Beach, or anywhere else in LA County, probate is filed at Stanley Mosk. This centralization means:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>Very high case volume (longest backlogs in California)</li>
                  <li>Highly specialized examiners</li>
                  <li>Strict formatting and filing requirements</li>
                  <li>8-12 week wait for hearing dates</li>
                </ul>
                <p className="text-gray-700 mt-3">Our extensive experience with Stanley Mosk's specific requirements helps avoid common pitfalls.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Do I have to appear in court?</h3>
                <p className="text-gray-700 mb-3">Not necessarily. Most California probate courts now allow <strong>remote appearances</strong> via Zoom or Microsoft Teams for standard hearings.</p>
                <p className="text-gray-700 mb-3">Attorney Rozsa Gyene can appear on your behalf for a <strong>$500 flat fee</strong>. This is especially helpful if you:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>Live out of state</li>
                  <li>Can't take time off work</li>
                  <li>Are uncomfortable in legal settings</li>
                  <li>Have health or mobility concerns</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Which court do I file in?</h3>
                <p className="text-gray-700 mb-3">You must file in the <strong>Superior Court of the county where the decedent resided</strong> at the time of death—not where the property is located or where you live.</p>
                <p className="text-gray-700">If the decedent lived in Glendale (Los Angeles County), you file at Stanley Mosk Courthouse—even if their only asset is a vacation home in San Diego.</p>
              </div>
            </div>
          </section>

          {/* ===================== CATEGORY 4: EXECUTOR QUESTIONS ===================== */}
          <section id="executor-questions" className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-red-600 flex items-center">
              <Users className="h-6 w-6 mr-2 text-red-600" /> Executor Duties & Liability
            </h2>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Am I personally liable for estate debts?</h3>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-red-800"><strong>Yes, you can be.</strong> If you distribute assets before paying valid creditors or taxes, you can be held "personally surcharged"—meaning you pay from your own pocket.</p>
                </div>
                <p className="text-gray-700 mb-3">To protect yourself:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>Properly notice all known creditors</li>
                  <li>Wait the full 4-month creditor claim period</li>
                  <li>Pay valid debts before distribution</li>
                  <li>File final state and federal tax returns</li>
                  <li>Keep detailed records of every transaction</li>
                </ul>
                <p className="text-gray-700 mt-3">Attorney review of your Notice to Creditors and Final Accounting protects you from personal liability.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">What are my duties as executor?</h3>
                <p className="text-gray-700 mb-3">As executor (or administrator), you have a <strong>fiduciary duty</strong> to the estate and beneficiaries. This means you must:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>Act in the estate's best interest (not your own)</li>
                  <li>Preserve and protect estate assets</li>
                  <li>Keep estate funds separate from personal funds</li>
                  <li>Provide accountings to the court and beneficiaries</li>
                  <li>Distribute assets according to the Will or intestacy law</li>
                  <li>File all required tax returns</li>
                </ul>
                <p className="text-gray-700 mt-3">Breach of fiduciary duty can result in personal liability, removal as executor, and even criminal charges in extreme cases.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Can I be the executor if I live out of state?</h3>
                <p className="text-gray-700 mb-3"><strong>Yes.</strong> California allows non-resident executors. However, the court may require you to:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>Post a bond (even if the Will waives it)</li>
                  <li>Appoint a California resident as agent for service of process</li>
                </ul>
                <p className="text-gray-700 mt-3">Our service is specifically designed for out-of-state executors. Everything is handled remotely through our online platform, and Attorney Gyene can appear at hearings on your behalf.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Can I decline to be executor?</h3>
                <p className="text-gray-700 mb-3"><strong>Yes.</strong> Being named executor in a Will doesn't obligate you to serve. You can decline by:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>Simply not filing the petition</li>
                  <li>Filing a formal declination with the court</li>
                </ul>
                <p className="text-gray-700 mt-3">If you decline, the alternate executor named in the Will can serve. If there's no alternate (or no Will), the court will appoint an administrator—typically the next of kin.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">What is a bond and do I need one?</h3>
                <p className="text-gray-700 mb-3">A probate bond is insurance protecting the estate from executor mismanagement. The bond amount typically equals the total estate value plus one year's income.</p>
                <p className="text-gray-700 mb-3">You may <strong>not</strong> need a bond if:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>The Will explicitly waives bond</li>
                  <li>All beneficiaries consent to waive bond</li>
                  <li>You have "Independent Administration" powers</li>
                </ul>
                <p className="text-gray-700 mt-3">Bond premiums typically cost 0.5-1% of the bond amount annually.</p>
              </div>
            </div>
          </section>

          {/* ===================== CATEGORY 5: TIMELINE QUESTIONS ===================== */}
          <section id="timeline-questions" className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-yellow-600 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-yellow-600" /> Timeline & Delays
            </h2>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">How long does California probate take?</h3>
                <p className="text-gray-700 mb-3">The California probate process typically takes <strong>9 to 18 months</strong> from petition filing to final distribution.</p>
                <div className="bg-gray-50 p-4 rounded mt-3">
                  <p className="font-semibold text-gray-800 mb-2">Typical Timeline:</p>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li><strong>Months 1-2:</strong> File petition, publish notice, wait for hearing</li>
                    <li><strong>Month 3:</strong> Hearing, receive Letters Testamentary</li>
                    <li><strong>Months 3-7:</strong> Inventory assets, 4-month creditor period</li>
                    <li><strong>Months 7-12:</strong> Sell property (if needed), pay debts, file accounting</li>
                    <li><strong>Months 12-18:</strong> Final hearing, distribution, close estate</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">What causes probate delays?</h3>
                <p className="text-gray-700 mb-3">Common causes of extended probate timelines:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li><strong>Court backlogs:</strong> LA County often has 8-12 week waits for hearing dates</li>
                  <li><strong>IGN notes:</strong> Uncleared examiner notes cause 3+ month continuances</li>
                  <li><strong>Real estate sales:</strong> Selling property through probate takes time</li>
                  <li><strong>Creditor disputes:</strong> Contested claims require court resolution</li>
                  <li><strong>Family disputes:</strong> Contested Wills or beneficiary fights</li>
                  <li><strong>Tax issues:</strong> Estate or income tax problems</li>
                  <li><strong>Missing heirs:</strong> Locating unknown beneficiaries</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Can probate be expedited?</h3>
                <p className="text-gray-700 mb-3">The 4-month creditor claim period is mandatory and cannot be shortened. However, you can minimize delays by:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>Filing complete, accurate documents the first time</li>
                  <li>Responding promptly to examiner notes</li>
                  <li>Using Independent Administration powers (avoids court approval for routine matters)</li>
                  <li>Working with an attorney who knows local court requirements</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ===================== CATEGORY 6: SPECIAL SITUATIONS ===================== */}
          <section id="special-situations" className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-teal-600 flex items-center">
              <Home className="h-6 w-6 mr-2 text-teal-600" /> Special Situations
            </h2>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Do I need probate if there is a Will?</h3>
                <p className="text-gray-700 mb-3"><strong>Yes.</strong> A common misconception is that a Will "avoids" probate. In California, a Will does not avoid probate—it simply provides instructions for the court to follow.</p>
                <p className="text-gray-700 mb-3">You still must complete the formal probate process to:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>Transfer real estate titles</li>
                  <li>Close bank accounts titled solely in the decedent's name</li>
                  <li>Access investment accounts</li>
                  <li>Distribute assets to beneficiaries</li>
                </ul>
                <p className="text-gray-700 mt-3">The only way to avoid probate is with a properly <strong>funded living trust</strong>, joint tenancy, or beneficiary designations.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">What if there is no Will?</h3>
                <p className="text-gray-700 mb-3">If someone dies without a Will (called "intestate"), California's intestacy laws determine who inherits. The process is similar to probate with a Will, but:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>The court appoints an "administrator" instead of "executor"</li>
                  <li>Assets pass according to a legal formula (spouse, children, parents, siblings, etc.)</li>
                  <li>Bond is typically required</li>
                </ul>
                <p className="text-gray-700 mt-3">Our $3,995 flat fee applies to both testate (with Will) and intestate (no Will) cases.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">What is simplified probate?</h3>
                <p className="text-gray-700 mb-3">California offers streamlined procedures for smaller estates:</p>
                <div className="bg-gray-50 p-4 rounded mt-3">
                  <p className="font-semibold text-gray-800">For deaths after April 1, 2025:</p>
                  <ul className="text-gray-700 text-sm space-y-2 mt-2">
                    <li><strong>Small Estate Affidavit:</strong> Personal property under $208,850 (no court filing required)</li>
                    <li><strong>Simplified Real Property Petition:</strong> Primary residence under $750,000 + personal property under $208,850</li>
                  </ul>
                </div>
                <p className="text-gray-700 mt-3">Our flat fee for Simplified Probate is <strong>$2,495</strong> (vs $3,995 for full probate).</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">What if the decedent owned property in multiple states?</h3>
                <p className="text-gray-700 mb-3">You'll need <strong>"ancillary probate"</strong> in each state where the decedent owned real estate. The primary probate occurs in California (where they resided), and separate proceedings are filed in other states for out-of-state property.</p>
                <p className="text-gray-700">Our service focuses on California probate. We can recommend attorneys in other states if needed for ancillary proceedings.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Can I do California probate myself without a lawyer?</h3>
                <p className="text-gray-700 mb-3">Technically yes, but the risks are significant:</p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li><strong>High rejection rate:</strong> Self-filed petitions often have errors requiring refiling</li>
                  <li><strong>IGN notes:</strong> Examiners post deficiency notes that non-attorneys struggle to clear</li>
                  <li><strong>Personal liability:</strong> Mistakes in creditor notice or distribution can cost you personally</li>
                  <li><strong>Longer timeline:</strong> DIY probate averages 6+ months longer than attorney-assisted</li>
                </ul>
                <p className="text-gray-700 mt-3">Court examiners cannot provide legal advice. MyProbateCA provides attorney oversight at a fraction of traditional costs.</p>
              </div>
            </div>
          </section>

          {/* Attorney Credentials */}
          <section className="bg-gray-50 p-8 rounded-lg mb-12">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center">
                <Award className="h-16 w-16 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Answers Verified by Rozsa Gyene, Esq.</h2>
                <p className="text-gray-600">California State Bar #208356</p>
                <p className="text-gray-600">25+ Years Experience in Los Angeles Superior Court</p>
                <p className="text-gray-600">Specialist: Clearing Stanley Mosk IGN Supplements</p>
                <p className="text-gray-700 mt-3 italic">"Professional attorney oversight shouldn't cost $20,000."</p>
                <a
                  href="https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-3 text-blue-600 hover:underline"
                >
                  Verify License <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-gradient-to-r from-green-600 to-green-500 text-white p-8 rounded-lg text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-6 text-green-100">Our free intake questionnaire takes about 30 minutes. We'll determine if you qualify for simplified probate and give you a clear path forward.</p>
            <button
              onClick={handleStartCase}
              className="inline-block bg-white text-green-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-50 transition"
            >
              Check My Eligibility - Free
            </button>
          </section>

          {/* Internal Links - Anti-Orphan Footer */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Related Resources</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Service Pages</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><Link to="/" className="hover:text-blue-600">Home - Probate App Overview</Link></li>
                  <li><Link to="/california-probate-administration" className="hover:text-blue-600">Probate Administration Service</Link></li>
                  <li><button onClick={handleStartCase} className="hover:text-blue-600 text-left">Start Your Case</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Location Guides</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><Link to="/probate-court-locations-california" className="hover:text-blue-600">All 35 California Locations</Link></li>
                  <li><Link to="/locations/los-angeles-probate-attorney" className="hover:text-blue-600">Los Angeles (Stanley Mosk)</Link></li>
                  <li><Link to="/locations/glendale-probate-attorney" className="hover:text-blue-600">Glendale</Link></li>
                  <li><Link to="/locations/san-francisco-probate-attorney" className="hover:text-blue-600">San Francisco</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Related Services</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>
                    <a href="https://livingtrustcalifornia.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 flex items-center">
                      Living Trust California ($400)
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                  <li>
                    <a href="https://livingtrust-attorneys.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 flex items-center">
                      Full-Service Estate Planning
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-5 gap-8">
              <div>
                <div className="flex items-center space-x-2 text-white mb-4">
                  <Scale className="h-6 w-6" />
                  <span className="font-bold text-lg">MyProbateCA</span>
                </div>
                <p className="text-sm text-gray-400">
                  Professional attorney-led probate administration for California estates.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Services</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/california-probate-administration" className="hover:text-white">Full Probate</Link></li>
                  <li><Link to="/" className="hover:text-white">Simplified Probate</Link></li>
                  <li><Link to="/probate-faq-california" className="hover:text-white">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Locations</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/probate-court-locations-california" className="hover:text-white">All Locations</Link></li>
                  <li><Link to="/locations/los-angeles-probate-attorney" className="hover:text-white">Los Angeles</Link></li>
                  <li><Link to="/locations/glendale-probate-attorney" className="hover:text-white">Glendale</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                  <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Contact</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    (818) 291-6217
                  </li>
                  <li className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    rozsagyenelaw@yahoo.com
                  </li>
                  <li className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-1" />
                    <span>655 N Central Ave, Suite 1704<br />Glendale, CA 91203</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} Law Offices of Rozsa Gyene. All rights reserved.</p>
              <p className="mt-2">California State Bar #208356</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ProbateFAQ;
