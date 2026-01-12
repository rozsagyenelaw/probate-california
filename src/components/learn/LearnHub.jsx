import React from 'react';
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
  Gavel,
  DollarSign,
  FileText,
  Users,
  Clock,
  Building2,
  Search,
  BookOpen
} from 'lucide-react';
import { useState } from 'react';

const LearnHub = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Schema markup
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://myprobateca.com/learn-california-probate/#webpage",
        "name": "California Probate Learning Center | Attorney Guides & Executor Resources",
        "description": "Comprehensive educational resource for California executors. In-depth articles on Stanley Mosk court procedures, bond requirements, fee structures, and the 11-phase probate process.",
        "url": "https://myprobateca.com/learn-california-probate/",
        "publisher": {
          "@id": "https://myprobateca.com/#organization"
        },
        "breadcrumb": {
          "@id": "https://myprobateca.com/learn-california-probate/#breadcrumb"
        },
        "mainEntity": {
          "@id": "https://myprobateca.com/learn-california-probate/#blog"
        }
      },
      {
        "@type": "LegalService",
        "@id": "https://myprobateca.com/#organization",
        "name": "MyProbateCA - Law Offices of Rozsa Gyene",
        "url": "https://myprobateca.com/",
        "telephone": "+1-818-291-6217",
        "email": "rozsagyenelaw@yahoo.com",
        "priceRange": "$3,995",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Glendale",
          "addressRegion": "CA",
          "postalCode": "91203",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "34.1425",
          "longitude": "-118.2551"
        }
      },
      {
        "@type": "Person",
        "@id": "https://myprobateca.com/#attorney",
        "name": "Rozsa Gyene",
        "jobTitle": "Lead Probate Attorney",
        "identifier": "208356",
        "description": "Licensed California Attorney with 25+ years experience appearing at the Stanley Mosk Courthouse. Specialist in clearing probate examiner notes and complex estate administration.",
        "url": "https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356",
        "affiliation": {
          "@type": "Organization",
          "name": "State Bar of California",
          "url": "https://www.calbar.ca.gov/"
        },
        "knowsAbout": [
          "California Probate Law",
          "Estate Administration",
          "Stanley Mosk Courthouse Procedures",
          "Probate Court Notes (IGN)",
          "Probate Code Section 10810"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://myprobateca.com/learn-california-probate/#breadcrumb",
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
            "name": "Learn California Probate",
            "item": "https://myprobateca.com/learn-california-probate/"
          }
        ]
      },
      {
        "@type": "Blog",
        "@id": "https://myprobateca.com/learn-california-probate/#blog",
        "name": "The California Probate Insider",
        "description": "Expert tips on navigating California probate courts, clearing examiner notes, understanding fees, and protecting yourself as executor.",
        "url": "https://myprobateca.com/learn-california-probate/",
        "author": {
          "@id": "https://myprobateca.com/#attorney"
        },
        "publisher": {
          "@id": "https://myprobateca.com/#organization"
        },
        "blogPost": [
          {
            "@type": "BlogPosting",
            "headline": "How to Clear IGN Notes at Stanley Mosk Courthouse",
            "url": "https://myprobateca.com/learn-california-probate/clear-ign-notes-stanley-mosk/",
            "author": { "@id": "https://myprobateca.com/#attorney" }
          },
          {
            "@type": "BlogPosting",
            "headline": "California Probate Fees Exposed: Statutory vs Flat Fee",
            "url": "https://myprobateca.com/learn-california-probate/california-probate-fees-statutory-vs-flat/",
            "author": { "@id": "https://myprobateca.com/#attorney" }
          },
          {
            "@type": "BlogPosting",
            "headline": "What is a Probate Referee in California?",
            "url": "https://myprobateca.com/learn-california-probate/what-is-probate-referee-california/",
            "author": { "@id": "https://myprobateca.com/#attorney" }
          },
          {
            "@type": "BlogPosting",
            "headline": "Letters Testamentary California: Your Golden Ticket Explained",
            "url": "https://myprobateca.com/learn-california-probate/letters-testamentary-california-guide/",
            "author": { "@id": "https://myprobateca.com/#attorney" }
          },
          {
            "@type": "BlogPosting",
            "headline": "Probate Bond Requirements in California: When You Need One",
            "url": "https://myprobateca.com/learn-california-probate/probate-bond-requirements-california/",
            "author": { "@id": "https://myprobateca.com/#attorney" }
          }
        ]
      },
      {
        "@type": "ImageObject",
        "@id": "https://myprobateca.com/images/attorney/rozsa-gyene-probate-attorney.jpg",
        "url": "https://myprobateca.com/images/attorney/rozsa-gyene-probate-attorney.jpg",
        "contentUrl": "https://myprobateca.com/images/attorney/rozsa-gyene-probate-attorney.jpg",
        "name": "California Probate Attorney Rozsa Gyene",
        "description": "Rozsa Gyene, California State Bar #208356, Lead Probate Attorney at MyProbateCA",
        "contentLocation": {
          "@type": "Place",
          "name": "Law Offices of Rozsa Gyene",
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
          }
        }
      },
      {
        "@type": "ImageObject",
        "@id": "https://myprobateca.com/images/courthouses/stanley-mosk-courthouse.jpg",
        "url": "https://myprobateca.com/images/courthouses/stanley-mosk-courthouse.jpg",
        "contentUrl": "https://myprobateca.com/images/courthouses/stanley-mosk-courthouse.jpg",
        "name": "Stanley Mosk Courthouse - Los Angeles Probate Division",
        "description": "Stanley Mosk Courthouse at 111 N Hill Street, Los Angeles CA 90012 - Central District Probate Division handling all LA County probate cases",
        "contentLocation": {
          "@type": "Place",
          "name": "Stanley Mosk Courthouse",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "111 N Hill Street",
            "addressLocality": "Los Angeles",
            "addressRegion": "CA",
            "postalCode": "90012",
            "addressCountry": "US"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "34.0560",
            "longitude": "-118.2457"
          }
        }
      },
      {
        "@type": "HowTo",
        "name": "How to Clear Probate Notes (IGN) at Stanley Mosk Courthouse",
        "description": "Step-by-step guide to clearing examiner notes before your probate hearing",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Access the Court Portal",
            "text": "Log into the LA Superior Court website 5-10 days before your scheduled hearing to check for posted notes."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Review Examiner Notes",
            "text": "Identify all 'Incomplete,' 'Grant,' or 'Needs' (IGN) flags posted by the probate examiner."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Draft a Verified Supplement",
            "text": "Prepare a formal legal 'Supplement to the Petition' addressing each specific deficiency noted."
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "Attorney Review",
            "text": "Have the supplement reviewed and verified by a licensed California probate attorney."
          },
          {
            "@type": "HowToStep",
            "position": 5,
            "name": "File Before Hearing",
            "text": "File the verified supplement at least 2 court days before your hearing to allow the examiner to clear the notes."
          }
        ]
      }
    ]
  };

  const phases = [
    { num: 1, title: "Petition for Probate", desc: "File Form DE-111 with the Superior Court to open the case and request appointment as executor." },
    { num: 2, title: "Notice of Petition", desc: "Mail Form DE-120 to all heirs and beneficiaries at least 15 days before the hearing." },
    { num: 3, title: "Publication", desc: "Publish notice in an adjudicated newspaper for 3 consecutive weeks to notify unknown creditors." },
    { num: 4, title: "Bond", desc: "Obtain surety bond if required (often waived if the Will says so or all beneficiaries consent)." },
    { num: 5, title: "Order for Probate", desc: "Attend hearing. Judge signs order appointing you as executor/administrator." },
    { num: 6, title: "Letters Testamentary", desc: "Receive certified Letters (Form DE-150)—your legal authority to act for the estate." },
    { num: 7, title: "Inventory & Appraisal", desc: "Work with Probate Referee to inventory and value all assets within 4 months." },
    { num: 8, title: "Notice to Creditors", desc: "Send formal notice to known creditors. 4-month claim period begins." },
    { num: 9, title: "Clear Court Notes", desc: "Monitor for examiner notes. File Verified Supplements to clear any deficiencies." },
    { num: 10, title: "Final Accounting", desc: "Prepare detailed accounting of all income, expenses, and proposed distribution." },
    { num: 11, title: "Distribution & Close", desc: "After court approval, distribute assets, obtain receipts, close the estate." }
  ];

  return (
    <>
      <Helmet>
        <title>California Probate Learning Center | Attorney Guides & Executor Resources</title>
        <meta name="description" content="Master California probate with attorney-verified guides. Learn about Stanley Mosk court procedures, clearing IGN notes, bond requirements, and how to save $19,000+ on statutory fees." />
        <meta name="keywords" content="california probate guide, how to probate california, stanley mosk courthouse, probate referee, executor duties california, IGN notes probate" />
        <link rel="canonical" href="https://myprobateca.com/learn-california-probate/" />

        <meta property="og:title" content="California Probate Learning Center | Expert Guides for Executors" />
        <meta property="og:description" content="Comprehensive educational resource for California executors. In-depth articles on court procedures, fees, and the 11-phase process." />
        <meta property="og:url" content="https://myprobateca.com/learn-california-probate/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://myprobateca.com/images/california-probate-learning-center-og.jpg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="California Probate Learning Center" />
        <meta name="twitter:description" content="Attorney-verified guides for California executors. Master probate court procedures and save thousands." />

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
                <Link to="/probate-faq-california" className="hover:text-blue-200">FAQ</Link>
                <Link to="/learn-california-probate" className="text-amber-300">Learn</Link>
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
                  <Link to="/probate-faq-california" className="hover:text-blue-200">FAQ</Link>
                  <Link to="/learn-california-probate" className="text-amber-300">Learn</Link>
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
                <li className="text-gray-900 font-medium">Learn California Probate</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white py-12 px-6 md:px-8 rounded-lg mb-12">
            <div className="max-w-4xl mx-auto">
              <p className="text-indigo-200 text-sm font-medium mb-2">THE CALIFORNIA PROBATE INSIDER</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">California Probate Learning Center: Master the Process</h1>
              <p className="text-xl text-indigo-100 mb-6">Attorney-verified guides, court insider tips, and step-by-step resources for California executors. Written by Rozsa Gyene, Esq. (Bar #208356) with 25+ years of Stanley Mosk Courthouse experience.</p>
              <div className="flex flex-wrap gap-4">
                <a href="#featured-guides" className="inline-block bg-white text-indigo-900 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition">Browse Guides</a>
                <button onClick={handleStartCase} className="inline-block border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-indigo-900 transition">Start Your Case</button>
              </div>
            </div>
          </section>

          {/* Featured Snippet Section */}
          <section className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-lg mb-12">
            <h2 className="text-xl font-bold text-indigo-900 mb-3">How does probate work in California?</h2>
            <p className="text-gray-700 mb-4">Probate is the legal process of validating a will, identifying heirs, paying debts, and distributing assets under court supervision. It is governed by the <a href="https://leginfo.legislature.ca.gov/faces/codes_displayexpandedbranch.xhtml?tocCode=PROB" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">California Probate Code</a> and involves <strong>11 mandatory phases</strong>, including:</p>
            <ul className="text-gray-700 mb-4 space-y-1">
              <li>• Filing a Petition for Probate (Form DE-111)</li>
              <li>• Publishing legal notices in an adjudicated newspaper</li>
              <li>• Obtaining Letters Testamentary (your legal authority)</li>
              <li>• Working with the court-appointed Probate Referee</li>
              <li>• Managing the 4-month creditor claim period</li>
              <li>• Filing a Final Accounting and obtaining distribution approval</li>
            </ul>
            <p className="text-gray-700">In Los Angeles County, all probate cases are centralized at the <a href="https://www.lacourt.org/courthouse/info/smm" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Stanley Mosk Courthouse</a>. Using an attorney-supervised system like MyProbateCA ensures these phases are completed correctly for a <strong>flat $3,995 fee</strong>—saving $15,000-$25,000+ compared to statutory attorney fees.</p>
          </section>

          {/* Quick Category Navigation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Topic</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <a href="#court-procedures" className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-indigo-500 hover:shadow-md transition">
                <span className="text-2xl mb-2 block">⚖️</span>
                <span className="font-medium text-gray-800 text-sm">Court Procedures</span>
              </a>
              <a href="#fees-costs" className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-indigo-500 hover:shadow-md transition">
                <span className="text-2xl mb-2 block">💰</span>
                <span className="font-medium text-gray-800 text-sm">Fees & Costs</span>
              </a>
              <a href="#forms-documents" className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-indigo-500 hover:shadow-md transition">
                <span className="text-2xl mb-2 block">📄</span>
                <span className="font-medium text-gray-800 text-sm">Forms & Documents</span>
              </a>
              <a href="#executor-guide" className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-indigo-500 hover:shadow-md transition">
                <span className="text-2xl mb-2 block">👤</span>
                <span className="font-medium text-gray-800 text-sm">Executor Guide</span>
              </a>
              <a href="#timeline-phases" className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-indigo-500 hover:shadow-md transition">
                <span className="text-2xl mb-2 block">⏱️</span>
                <span className="font-medium text-gray-800 text-sm">Timeline & Phases</span>
              </a>
              <a href="#local-courts" className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-indigo-500 hover:shadow-md transition">
                <span className="text-2xl mb-2 block">🏛️</span>
                <span className="font-medium text-gray-800 text-sm">Local Courts</span>
              </a>
            </div>
          </section>

          {/* Featured Guides */}
          <section id="featured-guides" className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Guides</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Featured Article 1 */}
              <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                <div className="bg-red-600 text-white text-xs font-bold px-3 py-1">MOST POPULAR</div>
                <div className="p-6">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Court Procedures</span>
                  <h3 className="font-bold text-lg text-gray-900 mt-1 mb-2">
                    <Link to="/learn-california-probate/clear-ign-notes-stanley-mosk" className="hover:text-indigo-600">How to Clear IGN Notes at Stanley Mosk Courthouse</Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">The 5-step process for clearing probate examiner notes before your hearing—and avoiding 3-month continuances.</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>By Rozsa Gyene, Esq.</span>
                    <span className="mx-2">•</span>
                    <span>12 min read</span>
                  </div>
                </div>
              </article>

              {/* Featured Article 2 */}
              <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                <div className="bg-green-600 text-white text-xs font-bold px-3 py-1">SAVE $19,000+</div>
                <div className="p-6">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Fees & Costs</span>
                  <h3 className="font-bold text-lg text-gray-900 mt-1 mb-2">
                    <Link to="/learn-california-probate/california-probate-fees-statutory-vs-flat" className="hover:text-indigo-600">California Probate Fees Exposed: Statutory vs Flat Fee</Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">Why a $1M home with a $900K mortgage still costs $23,000 in statutory fees—and how to pay $3,995 instead.</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>By Rozsa Gyene, Esq.</span>
                    <span className="mx-2">•</span>
                    <span>10 min read</span>
                  </div>
                </div>
              </article>

              {/* Featured Article 3 */}
              <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1">ESSENTIAL</div>
                <div className="p-6">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Forms & Documents</span>
                  <h3 className="font-bold text-lg text-gray-900 mt-1 mb-2">
                    <Link to="/learn-california-probate/letters-testamentary-california-guide" className="hover:text-indigo-600">Letters Testamentary California: Your Golden Ticket Explained</Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">What Letters Testamentary are, why you need certified copies, and how to use them to access estate assets.</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>By Rozsa Gyene, Esq.</span>
                    <span className="mx-2">•</span>
                    <span>8 min read</span>
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* Section: Court Procedures */}
          <section id="court-procedures" className="mb-16">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">⚖️</span>
              <h2 className="text-2xl font-bold text-gray-900">Understanding the "Stanley Mosk" Standard</h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-4">If your loved one was a resident of <strong>any Los Angeles County city</strong>—from Glendale to Santa Monica, Long Beach to Calabasas—your probate case will be heard at the <a href="https://www.lacourt.org/courthouse/info/smm" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Stanley Mosk Courthouse</a> at 111 N. Hill Street in Downtown Los Angeles.</p>

              <p className="text-gray-700 mb-4">Unlike smaller counties where probate judges know you by name, the LA Superior Court uses a massive team of <strong>Probate Examiners</strong>. These specialized reviewers examine your file approximately <strong>5-10 days before your hearing</strong>. If they find even a minor issue—a typo in your Notice of Petition, an inconsistent date, a missing heir—they will post <strong>Probate Notes</strong> (also called IGN notes: Incomplete, Grant, or Needs).</p>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
                <p className="font-bold text-yellow-800 mb-2">⚠️ Pro Tip for Executors</p>
                <p className="text-yellow-900">Never walk into a hearing at Stanley Mosk without checking the court portal for notes. If you have uncleared notes, the judge will <strong>continue</strong> your hearing—typically for another 3+ months. Our guides teach you how to draft Verified Supplements to clear these notes so your case stays on track.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  <Link to="/learn-california-probate/clear-ign-notes-stanley-mosk" className="hover:text-indigo-600">How to Clear IGN Notes at Stanley Mosk →</Link>
                </h3>
                <p className="text-gray-600 text-sm">Step-by-step guide to checking for notes, understanding what they mean, and filing the supplements needed to clear them.</p>
              </article>
              <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  <span className="text-gray-400">LA County Probate Examiner Guide →</span>
                </h3>
                <p className="text-gray-600 text-sm">What examiners look for, common reasons for notes, and how to file a clean petition the first time. <em className="text-gray-400">(Coming soon)</em></p>
              </article>
            </div>
          </section>

          {/* Section: Fees & Costs */}
          <section id="fees-costs" className="mb-16">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">💰</span>
              <h2 className="text-2xl font-bold text-gray-900">The Hidden Costs: Statutory Fees vs Transparency</h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-4">One of the most requested topics in our Learning Center is understanding <a href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=10810" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">California Probate Code § 10810</a>—the statutory fee schedule. Most families are shocked to learn that attorney fees are calculated on the <strong>gross value</strong> of the estate, not the net equity.</p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-6">
                <p className="font-bold text-red-800 mb-2">The Shocking Truth About Estate Valuation</p>
                <p className="text-red-900 mb-2">A <strong>$1,000,000 home with a $900,000 mortgage</strong> is still valued at $1,000,000 for fee calculation purposes.</p>
                <ul className="text-red-900 space-y-1">
                  <li>• Statutory Attorney Fee on $1M: <strong>$23,000</strong></li>
                  <li>• Statutory Executor Fee on $1M: <strong>$23,000</strong></li>
                  <li>• Combined Total: <strong>$46,000</strong> (from only $100K in equity!)</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-6">
                <p className="font-bold text-green-800 mb-2">The MyProbateCA Alternative</p>
                <p className="text-green-900">Our flat fee of <strong>$3,995</strong> provides the same attorney oversight by Rozsa Gyene (Bar #208356) while returning <strong>$19,000+</strong> in value back to the heirs. We achieve this through technology-enabled efficiency—not by cutting corners on legal review.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  <Link to="/learn-california-probate/california-probate-fees-statutory-vs-flat" className="hover:text-indigo-600">Statutory vs Flat Fee: Complete Breakdown →</Link>
                </h3>
                <p className="text-gray-600 text-sm">Detailed comparison showing exactly how much you'll pay at different estate values—and how much you can save.</p>
              </article>
              <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  <Link to="/learn-california-probate/what-is-probate-referee-california" className="hover:text-indigo-600">Probate Referee Fees Explained →</Link>
                </h3>
                <p className="text-gray-600 text-sm">What the court-appointed appraiser charges (0.1% of assets) and what services they provide.</p>
              </article>
            </div>
          </section>

          {/* Section: Forms & Documents */}
          <section id="forms-documents" className="mb-16">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">📄</span>
              <h2 className="text-2xl font-bold text-gray-900">Forms & Documents Deep Dive</h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-4">California probate requires dozens of court forms, each with specific requirements. Understanding what each form does—and what mistakes to avoid—can save you months of delays.</p>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-semibold">Form</th>
                      <th className="text-left p-3 font-semibold">Name</th>
                      <th className="text-left p-3 font-semibold">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-3 font-mono text-indigo-600">DE-111</td>
                      <td className="p-3">Petition for Probate</td>
                      <td className="p-3 text-gray-600">Starts the probate case</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-indigo-600">DE-120</td>
                      <td className="p-3">Notice of Petition</td>
                      <td className="p-3 text-gray-600">Mailed to heirs/beneficiaries</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-indigo-600">DE-121</td>
                      <td className="p-3">Proof of Service</td>
                      <td className="p-3 text-gray-600">Proves you mailed notices</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-indigo-600">DE-140</td>
                      <td className="p-3">Order for Probate</td>
                      <td className="p-3 text-gray-600">Judge's appointment order</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-indigo-600">DE-150</td>
                      <td className="p-3">Letters Testamentary</td>
                      <td className="p-3 text-gray-600">Your legal authority document</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-indigo-600">DE-160</td>
                      <td className="p-3">Inventory & Appraisal</td>
                      <td className="p-3 text-gray-600">List of all estate assets</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  <Link to="/learn-california-probate/letters-testamentary-california-guide" className="hover:text-indigo-600">Letters Testamentary: The Complete Guide →</Link>
                </h3>
                <p className="text-gray-600 text-sm">What Letters are, how to get certified copies, and how banks and title companies use them.</p>
              </article>
              <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  <span className="text-gray-400">Form DE-111: Petition for Probate Guide →</span>
                </h3>
                <p className="text-gray-600 text-sm">Line-by-line instructions for completing the petition that starts your probate case. <em className="text-gray-400">(Coming soon)</em></p>
              </article>
            </div>
          </section>

          {/* Section: Executor Guide */}
          <section id="executor-guide" className="mb-16">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">👤</span>
              <h2 className="text-2xl font-bold text-gray-900">Executor Guide: Duties, Liability & Protection</h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-4">Being named executor is an honor—and a serious legal responsibility. You have a <strong>fiduciary duty</strong> to the estate and beneficiaries. Mistakes can result in personal liability, removal, or even legal action.</p>

              <p className="text-gray-700">Our executor guides help you understand your obligations, avoid common pitfalls, and protect yourself throughout the process.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  <Link to="/learn-california-probate/probate-bond-requirements-california" className="hover:text-indigo-600">Probate Bond: Do You Need One? →</Link>
                </h3>
                <p className="text-gray-600 text-sm">When bonds are required, how much they cost, and when they can be waived.</p>
              </article>
              <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  <span className="text-gray-400">Executor Duties: Complete Checklist →</span>
                </h3>
                <p className="text-gray-600 text-sm">Every responsibility you have as executor—from securing assets to filing tax returns. <em className="text-gray-400">(Coming soon)</em></p>
              </article>
            </div>
          </section>

          {/* Section: Timeline & Phases */}
          <section id="timeline-phases" className="mb-16">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">⏱️</span>
              <h2 className="text-2xl font-bold text-gray-900">The 11 Phases: Step-by-Step Roadmap</h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-6">Every California probate follows the same 11 phases. Understanding each step helps you anticipate what's coming and avoid delays.</p>

              <div className="space-y-4">
                {phases.map(phase => (
                  <div key={phase.num} className="flex items-start">
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0 text-sm">{phase.num}</span>
                    <div>
                      <strong className="text-gray-900">{phase.title}</strong>
                      <p className="text-gray-600 text-sm">{phase.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  <span className="text-gray-400">California Probate Timeline: What to Expect →</span>
                </h3>
                <p className="text-gray-600 text-sm">Month-by-month breakdown of the typical 12-18 month probate process. <em className="text-gray-400">(Coming soon)</em></p>
              </article>
              <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  <span className="text-gray-400">Creditor Claims: The 4-Month Window →</span>
                </h3>
                <p className="text-gray-600 text-sm">How to properly notice creditors, review claims, and protect the estate from liability. <em className="text-gray-400">(Coming soon)</em></p>
              </article>
            </div>
          </section>

          {/* Section: Local Courts */}
          <section id="local-courts" className="mb-16">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">🏛️</span>
              <h2 className="text-2xl font-bold text-gray-900">Local Court Guides</h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700">Each California county has its own probate procedures, wait times, and examiner quirks. Our local guides help you understand what to expect in your specific courthouse.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/locations/los-angeles-probate-attorney" className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition">
                <h3 className="font-bold text-gray-900">Los Angeles (Stanley Mosk)</h3>
                <p className="text-gray-600 text-sm">Central District • 8-12 week wait</p>
              </Link>
              <Link to="/locations/san-francisco-probate-attorney" className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition">
                <h3 className="font-bold text-gray-900">San Francisco</h3>
                <p className="text-gray-600 text-sm">Civic Center • Strict examiners</p>
              </Link>
              <Link to="/locations/san-diego-probate-attorney" className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition">
                <h3 className="font-bold text-gray-900">San Diego</h3>
                <p className="text-gray-600 text-sm">Central Courthouse • 6-8 week wait</p>
              </Link>
              <Link to="/locations/irvine-probate-attorney" className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition">
                <h3 className="font-bold text-gray-900">Orange County</h3>
                <p className="text-gray-600 text-sm">Lamoreaux Justice Center</p>
              </Link>
              <Link to="/locations/santa-barbara-probate-attorney" className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition">
                <h3 className="font-bold text-gray-900">Santa Barbara</h3>
                <p className="text-gray-600 text-sm">Anacapa Division • 4-6 week wait</p>
              </Link>
              <Link to="/probate-court-locations-california" className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition">
                <h3 className="font-bold text-indigo-700">View All 35 Locations →</h3>
                <p className="text-indigo-600 text-sm">Complete courthouse directory</p>
              </Link>
            </div>
          </section>

          {/* Probate Referee Section */}
          <section className="mb-16">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">🔍</span>
              <h2 className="text-2xl font-bold text-gray-900">The Probate Referee: Your Court-Appointed Appraiser</h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-4">Every California executor must work with a <strong>Probate Referee</strong>—a court-appointed official who appraises non-cash assets including real estate, vehicles, jewelry, and business interests.</p>

              <div className="grid md:grid-cols-3 gap-4 my-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Appointment</p>
                  <p className="font-bold text-gray-900">Court-Assigned</p>
                  <p className="text-xs text-gray-500">You don't choose</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Fee</p>
                  <p className="font-bold text-gray-900">0.1% of assets</p>
                  <p className="text-xs text-gray-500">$75 minimum</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Timeline</p>
                  <p className="font-bold text-gray-900">4 months</p>
                  <p className="text-xs text-gray-500">From Letters</p>
                </div>
              </div>

              <p className="text-gray-700">We handle all coordination with the Probate Referee, ensuring the Inventory & Appraisal (Form DE-160) is completed correctly and filed on time.</p>
            </div>

            <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                <Link to="/learn-california-probate/what-is-probate-referee-california" className="hover:text-indigo-600">What is a Probate Referee? Complete Guide →</Link>
              </h3>
              <p className="text-gray-600 text-sm">How referees are assigned, what they appraise, how much they charge, and how to work with them effectively.</p>
            </article>
          </section>

          {/* How to Clear IGN Notes - Featured Snippet */}
          <section className="mb-16">
            <div className="bg-indigo-900 text-white p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">How to Clear Probate Notes (IGN) at Stanley Mosk Courthouse</h2>
              <p className="text-indigo-200 mb-6">Follow these 5 steps to clear examiner notes before your hearing:</p>

              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-white text-indigo-900 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</span>
                  <div>
                    <strong>Access the Court Portal</strong>
                    <p className="text-indigo-200 text-sm">Log into the LA Superior Court website 5-10 days before your scheduled hearing to check for posted notes.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-white text-indigo-900 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</span>
                  <div>
                    <strong>Review Examiner Notes</strong>
                    <p className="text-indigo-200 text-sm">Identify all "Incomplete," "Grant," or "Needs" (IGN) flags. Each note specifies exactly what information is missing.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-white text-indigo-900 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</span>
                  <div>
                    <strong>Draft a Verified Supplement</strong>
                    <p className="text-indigo-200 text-sm">Prepare a formal "Supplement to the Petition" addressing each specific deficiency noted by the examiner.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-white text-indigo-900 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">4</span>
                  <div>
                    <strong>Attorney Review & Verification</strong>
                    <p className="text-indigo-200 text-sm">Have the supplement reviewed and signed under penalty of perjury by a licensed California probate attorney.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-white text-indigo-900 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">5</span>
                  <div>
                    <strong>File Before Hearing</strong>
                    <p className="text-indigo-200 text-sm">File the verified supplement at least 2 court days before your hearing to allow the examiner time to review and clear the notes.</p>
                  </div>
                </li>
              </ol>

              <div className="mt-6 pt-6 border-t border-indigo-700">
                <Link to="/learn-california-probate/clear-ign-notes-stanley-mosk" className="inline-block bg-white text-indigo-900 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition">Read the Full Guide →</Link>
              </div>
            </div>
          </section>

          {/* Attorney Bio */}
          <section className="mb-16">
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="md:w-1/3">
                  <div className="rounded-lg overflow-hidden shadow-lg mb-4">
                    <img
                      src="/images/attorney/rozsa-gyene-probate-attorney.jpg"
                      alt="California Probate Attorney Rozsa Gyene, State Bar #208356, Glendale Office"
                      className="w-full"
                      loading="lazy"
                    />
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-md h-40">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3301.5!2d-118.2551!3d34.1425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c0f24e2d3c3d%3A0x9a5b8e2c3d4e5f6a!2s655%20N%20Central%20Ave%2C%20Glendale%2C%20CA%2091203!5e0!3m2!1sen!2sus!4v1704903600000"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      title="Law Offices of Rozsa Gyene - Glendale, California"
                    ></iframe>
                  </div>
                </div>
                <div className="md:w-2/3">
                  <p className="text-sm text-indigo-600 font-medium mb-1">ABOUT THE AUTHOR</p>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Rozsa Gyene, Esq.</h2>
                  <p className="text-gray-600 mb-4">California State Bar #208356 • 25+ Years Experience</p>
                  <p className="text-gray-700 mb-4">Rozsa Gyene has spent over two decades appearing at the Stanley Mosk Courthouse and other California probate courts. She specializes in clearing complex examiner notes, handling contested estates, and helping out-of-state executors navigate the California probate system.</p>
                  <p className="text-gray-700 mb-4 italic">"Professional attorney oversight shouldn't cost $20,000. Technology allows us to provide the same rigorous legal review at a fraction of the traditional cost."</p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <a href="https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm flex items-center">
                      Verify License <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600 text-sm">655 N Central Ave, Suite 1704, Glendale, CA 91203</span>
                  </div>
                  <button onClick={handleStartCase} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Start Your Case →</button>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-gradient-to-r from-green-600 to-green-500 text-white p-8 rounded-lg text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Your Probate Case?</h2>
            <p className="text-lg mb-6 text-green-100">Our free intake questionnaire takes about 30 minutes. We'll determine if you qualify for simplified probate and give you a clear path forward—all for a flat $3,995 fee.</p>
            <button onClick={handleStartCase} className="inline-block bg-white text-green-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-50 transition">Check My Eligibility - Free</button>
          </section>

          {/* Internal Links Footer */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Explore More Resources</h3>
            <div className="grid md:grid-cols-4 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Service Pages</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><Link to="/" className="hover:text-indigo-600">Home - Probate App</Link></li>
                  <li><Link to="/california-probate-administration" className="hover:text-indigo-600">Administration Service</Link></li>
                  <li><button onClick={handleStartCase} className="hover:text-indigo-600 text-left">Start Your Case</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Information</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><Link to="/probate-faq-california" className="hover:text-indigo-600">Probate FAQ</Link></li>
                  <li><Link to="/#pricing" className="hover:text-indigo-600">Pricing & Fees</Link></li>
                  <li><Link to="/#how-it-works" className="hover:text-indigo-600">How It Works</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Locations</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><Link to="/probate-court-locations-california" className="hover:text-indigo-600">All 35 Locations</Link></li>
                  <li><Link to="/locations/los-angeles-probate-attorney" className="hover:text-indigo-600">Los Angeles</Link></li>
                  <li><Link to="/locations/glendale-probate-attorney" className="hover:text-indigo-600">Glendale</Link></li>
                  <li><Link to="/locations/san-francisco-probate-attorney" className="hover:text-indigo-600">San Francisco</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Related Services</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>
                    <a href="https://livingtrustcalifornia.com/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 flex items-center">
                      Living Trust California ($400)
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                  <li>
                    <a href="https://livingtrust-attorneys.com/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 flex items-center">
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
                <h4 className="font-semibold text-white mb-4">Learn</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/learn-california-probate" className="hover:text-white">Learning Center</Link></li>
                  <li><Link to="/learn-california-probate/clear-ign-notes-stanley-mosk" className="hover:text-white">Clear IGN Notes</Link></li>
                  <li><Link to="/learn-california-probate/california-probate-fees-statutory-vs-flat" className="hover:text-white">Fees Explained</Link></li>
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

export default LearnHub;
