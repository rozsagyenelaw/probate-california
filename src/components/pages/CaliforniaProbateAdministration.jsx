import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import {
  Scale,
  Check,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Shield,
  Award,
  FileText,
  Users,
  Gavel,
  Menu,
  X,
  LogIn,
  LogOut,
  LayoutDashboard,
  Building2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Briefcase,
  ClipboardCheck,
  BookOpen,
  Bell,
  FileSearch,
  Calculator,
  Home
} from 'lucide-react';

const CaliforniaProbateAdministration = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

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

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 11 Phases of California Probate
  const phases = [
    {
      num: 1,
      title: 'Initial Petition & Venue Selection',
      desc: 'We analyze where the decedent lived and where property is held to ensure the case is filed in the correct county.'
    },
    {
      num: 2,
      title: 'Notice of Petition',
      desc: 'We handle the complex mailing requirements to all heirs, including "due diligence" searches for missing relatives.'
    },
    {
      num: 3,
      title: 'Mandatory Publication',
      desc: 'We coordinate with adjudicated newspapers in the city of death to ensure the "Notice of Petition to Administer Estate" is published correctly.'
    },
    {
      num: 4,
      title: 'Bond Coordination',
      desc: 'If the court requires a bond, we connect you with specialized sureties and prepare the necessary applications.'
    },
    {
      num: 5,
      title: 'Issuance of Letters',
      desc: 'We obtain the "Letters Testamentary" or "Letters of Administration" that grant you legal power to manage bank accounts and real estate.'
    },
    {
      num: 6,
      title: 'Inventory & Appraisal',
      desc: 'We coordinate with the court-assigned Referee to value homes, business interests, and personal property.'
    },
    {
      num: 7,
      title: 'Creditor Management',
      desc: 'We protect the Executor by properly noticing known creditors and managing the 4-month claim period.'
    },
    {
      num: 8,
      title: 'Notice to State Agencies',
      desc: 'We handle required notices to the Franchise Tax Board and Director of Health Care Services.'
    },
    {
      num: 9,
      title: 'Clearing Court Notes (IGN Supplements)',
      desc: 'We monitor the court portal, identify examiners\' concerns, and file Verified Supplements to clear notes before your hearing.'
    },
    {
      num: 10,
      title: 'Final Accounting & Report',
      desc: 'We prepare the detailed accounting of every dollar that moved through the estate.'
    },
    {
      num: 11,
      title: 'Order of Final Distribution',
      desc: 'We obtain the judge\'s signature on the final order, allowing you to legally transfer titles and distribute funds.'
    }
  ];

  // FAQs
  const faqs = [
    {
      q: 'How long does probate take in California?',
      a: 'Most probate cases take 9-18 months depending on complexity. Simple estates with no disputes can sometimes complete in 6-9 months. Contested cases or those with real estate sales may take longer. Our dashboard helps you track progress through all 11 phases.'
    },
    {
      q: 'What is the difference between Letters Testamentary and Letters of Administration?',
      a: 'Letters Testamentary are issued when there is a valid will naming an Executor. Letters of Administration are issued when there is no will (intestate) or the named Executor cannot serve. Both grant the same legal authority to manage estate assets.'
    },
    {
      q: 'Do I need probate if there\'s a will?',
      a: 'Usually yes. A will does not avoid probate in California. The will must be "proved" in probate court before assets can be transferred. The only way to avoid probate is with a living trust, joint ownership, or beneficiary designations.'
    },
    {
      q: 'Can I be executor if I live out of state?',
      a: 'Yes. California allows out-of-state executors. However, you may need to post a bond and appoint a California agent for service of process. Our remote service is ideal for out-of-state executors—we handle everything and can appear at hearings on your behalf for $500.'
    },
    {
      q: 'What are IGN notes and how do you clear them?',
      a: 'IGN stands for "Incomplete/Needs" — notes posted by court examiners identifying deficiencies in your filing. Common issues include missing notices, incorrect bond calculations, or incomplete declarations. We monitor the court portal 5-10 days before your hearing and file Verified Supplements to address each concern, often resulting in first-hearing approval.'
    },
    {
      q: 'What court fees are not included in your flat fee?',
      a: 'Court filing fees (~$435-500), newspaper publication (~$200-300), probate referee fees (0.1% of assets), and bond premium (if required) are paid separately. These are third-party costs that vary by county and estate size.'
    },
    {
      q: 'What if heirs disagree about the estate?',
      a: 'Disputes among heirs can complicate probate. Our $3,995 flat fee covers uncontested cases. If a formal objection is filed, we offer contested hearing representation at $300/hour. We recommend mediation first when possible to preserve family relationships and reduce costs.'
    },
    {
      q: 'Do you handle probate in all California counties?',
      a: 'Yes. We prepare documents for all 58 California counties and can appear remotely at hearings statewide. Whether your case is at Stanley Mosk (Los Angeles), Lamoreaux (Orange County), or any other courthouse, we\'ve got you covered.'
    }
  ];

  // Common IGN notes
  const ignNotes = [
    '"Notice of Hearing not filed for all required parties."',
    '"Proposed Order not submitted 5 days prior to hearing."',
    '"Bond amount does not cover personal property plus one year\'s income."'
  ];

  // Pricing comparison
  const pricingComparison = [
    { estateValue: '$500,000', statutory: '$13,000', ourFee: '$3,995', savings: '$9,005' },
    { estateValue: '$750,000', statutory: '$18,000', ourFee: '$3,995', savings: '$14,005' },
    { estateValue: '$1,000,000', statutory: '$23,000', ourFee: '$3,995', savings: '$19,005' }
  ];

  // California courthouses
  const courthouses = [
    'Stanley Mosk Courthouse (Los Angeles)',
    'San Diego Central Courthouse',
    'Lamoreaux Justice Center (Orange County)',
    'Hall of Justice (San Francisco)',
    'Sacramento Superior Court',
    'Plus 53 additional California county courts'
  ];

  // Schema markup for SEO
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LegalService",
        "@id": "https://myprobateca.com/#legalservice",
        "name": "MyProbateCA - California Probate Administration",
        "description": "Professional attorney-led probate administration service in California. Licensed attorney handles all 11 phases of probate for a flat $3,995 fee.",
        "url": "https://myprobateca.com/california-probate-administration",
        "telephone": "+1-818-291-6217",
        "email": "rozsagyenelaw@yahoo.com",
        "priceRange": "$3,995",
        "areaServed": {
          "@type": "State",
          "name": "California",
          "sameAs": "https://en.wikipedia.org/wiki/California"
        },
        "serviceType": [
          "Probate Administration",
          "Estate Administration",
          "Letters Testamentary",
          "Letters of Administration",
          "Probate Court Filing",
          "IGN Note Clearance"
        ],
        "provider": {
          "@type": "Attorney",
          "@id": "https://myprobateca.com/#attorney"
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "655 N Central Ave, Suite 1704",
          "addressLocality": "Glendale",
          "addressRegion": "CA",
          "postalCode": "91203",
          "addressCountry": "US"
        }
      },
      {
        "@type": "Attorney",
        "@id": "https://myprobateca.com/#attorney",
        "name": "Rozsa Gyene",
        "jobTitle": "Probate Attorney",
        "description": "California licensed attorney with 25+ years experience in estate and probate law. Over 500 probate cases completed.",
        "url": "https://myprobateca.com/california-probate-administration",
        "sameAs": "https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356",
        "knowsAbout": [
          "California Probate Law",
          "Estate Administration",
          "Letters Testamentary",
          "Intestate Succession",
          "Stanley Mosk Courthouse Procedures"
        ],
        "hasCredential": {
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": "license",
          "recognizedBy": {
            "@type": "Organization",
            "name": "State Bar of California"
          },
          "identifier": "208356"
        },
        "worksFor": {
          "@type": "LegalService",
          "@id": "https://myprobateca.com/#legalservice"
        }
      },
      {
        "@type": "Service",
        "@id": "https://myprobateca.com/#probateservice",
        "name": "Full Probate Administration",
        "serviceType": "Probate Administration",
        "provider": {
          "@type": "LegalService",
          "@id": "https://myprobateca.com/#legalservice"
        },
        "offers": {
          "@type": "Offer",
          "price": "3995",
          "priceCurrency": "USD",
          "description": "Complete probate administration including all 11 phases, attorney drafting and review, publication coordination, bond assistance, IGN note clearance, and remote court appearances if needed."
        },
        "description": "Complete probate administration service covering all 11 phases from initial petition to final distribution."
      },
      {
        "@type": "FAQPage",
        "@id": "https://myprobateca.com/california-probate-administration#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How long does probate take in California?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Most probate cases take 9-18 months depending on complexity. Simple estates with no disputes can sometimes complete in 6-9 months. Contested cases or those with real estate sales may take longer."
            }
          },
          {
            "@type": "Question",
            "name": "What is the difference between Letters Testamentary and Letters of Administration?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Letters Testamentary are issued when there is a valid will naming an Executor. Letters of Administration are issued when there is no will (intestate) or the named Executor cannot serve. Both grant the same legal authority to manage estate assets."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need probate if there's a will?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Usually yes. A will does not avoid probate in California. The will must be 'proved' in probate court before assets can be transferred. The only way to avoid probate is with a living trust, joint ownership, or beneficiary designations."
            }
          },
          {
            "@type": "Question",
            "name": "Can I be executor if I live out of state?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. California allows out-of-state executors. However, you may need to post a bond and appoint a California agent for service of process."
            }
          },
          {
            "@type": "Question",
            "name": "What are IGN notes and how do you clear them?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "IGN stands for 'Incomplete/Needs' — notes posted by court examiners identifying deficiencies in your filing. Common issues include missing notices, incorrect bond calculations, or incomplete declarations. We monitor the court portal and file Verified Supplements to address each concern."
            }
          },
          {
            "@type": "Question",
            "name": "What court fees are not included in your flat fee?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Court filing fees (~$435-500), newspaper publication (~$200-300), probate referee fees (0.1% of assets), and bond premium (if required) are paid separately. These are third-party costs that vary by county and estate size."
            }
          },
          {
            "@type": "Question",
            "name": "What if heirs disagree about the estate?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Disputes among heirs can complicate probate. Our $3,995 flat fee covers uncontested cases. If a formal objection is filed, we offer contested hearing representation at $300/hour."
            }
          },
          {
            "@type": "Question",
            "name": "Do you handle probate in all California counties?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. We prepare documents for all 58 California counties and can appear remotely at hearings statewide."
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://myprobateca.com/california-probate-administration#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://myprobateca.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "California Probate Administration",
            "item": "https://myprobateca.com/california-probate-administration"
          }
        ]
      },
      {
        "@type": "WebPage",
        "@id": "https://myprobateca.com/california-probate-administration#webpage",
        "url": "https://myprobateca.com/california-probate-administration",
        "name": "California Probate Administration | Attorney-Led Service | $3,995 Flat Fee",
        "description": "Professional attorney-led probate administration in California. Licensed attorney handles all 11 phases of probate for a flat $3,995 fee. Save $10,000+ vs statutory fees.",
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://myprobateca.com/#website",
          "name": "MyProbateCA",
          "url": "https://myprobateca.com"
        },
        "breadcrumb": {
          "@id": "https://myprobateca.com/california-probate-administration#breadcrumb"
        },
        "mainEntity": {
          "@id": "https://myprobateca.com/#legalservice"
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>California Probate Administration | Attorney-Led Service | $3,995 Flat Fee | MyProbateCA</title>
        <meta name="description" content="Professional attorney-led probate administration in California. Licensed attorney handles all 11 phases of probate for a flat $3,995 fee. Save $10,000+ compared to statutory fees." />
        <meta name="keywords" content="California probate, probate administration, probate attorney, Letters Testamentary, Letters of Administration, Stanley Mosk Courthouse, probate lawyer, estate administration, IGN notes, probate court" />
        <link rel="canonical" href="https://myprobateca.com/california-probate-administration" />

        {/* Open Graph */}
        <meta property="og:title" content="California Probate Administration | Attorney-Led Service | $3,995 Flat Fee" />
        <meta property="og:description" content="Professional attorney-led probate administration in California. Licensed attorney handles all 11 phases for a flat $3,995 fee." />
        <meta property="og:url" content="https://myprobateca.com/california-probate-administration" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MyProbateCA" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="California Probate Administration | $3,995 Flat Fee" />
        <meta name="twitter:description" content="Professional attorney-led probate administration. Save $10,000+ vs statutory fees." />

        {/* Schema Markup */}
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

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                <button onClick={() => scrollToSection('phases')} className="hover:text-blue-200 transition-colors">
                  11 Phases
                </button>
                <button onClick={() => scrollToSection('ign-notes')} className="hover:text-blue-200 transition-colors">
                  IGN Notes
                </button>
                <button onClick={() => scrollToSection('pricing')} className="hover:text-blue-200 transition-colors">
                  Pricing
                </button>
                <Link to="/probate-court-locations-california" className="hover:text-blue-200 transition-colors">
                  Locations
                </Link>
                <Link to="/probate-faq-california" className="hover:text-blue-200 transition-colors">
                  FAQ
                </Link>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center space-x-1 hover:text-blue-200"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center space-x-1 hover:text-blue-200"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 hover:text-blue-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigate('/login')}
                      className="flex items-center space-x-1 hover:text-blue-200"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </button>
                    <button
                      onClick={handleStartCase}
                      className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-blue-800">
                <div className="flex flex-col space-y-3">
                  <button onClick={() => scrollToSection('phases')} className="text-left hover:text-blue-200">
                    11 Phases
                  </button>
                  <button onClick={() => scrollToSection('ign-notes')} className="text-left hover:text-blue-200">
                    IGN Notes
                  </button>
                  <button onClick={() => scrollToSection('pricing')} className="text-left hover:text-blue-200">
                    Pricing
                  </button>
                  <Link to="/probate-court-locations-california" className="hover:text-blue-200">Locations</Link>
                  <Link to="/probate-faq-california" className="hover:text-blue-200">FAQ</Link>
                  {user ? (
                    <>
                      <button onClick={() => navigate('/dashboard')} className="text-left hover:text-blue-200">
                        Dashboard
                      </button>
                      <button onClick={handleLogout} className="text-left hover:text-blue-200">
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => navigate('/login')} className="text-left hover:text-blue-200">
                        Login
                      </button>
                      <button
                        onClick={handleStartCase}
                        className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg font-semibold text-center"
                      >
                        Get Started
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Professional Attorney-Led Probate Administration: Beyond the Paperwork
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Licensed California attorney handles all 11 phases of probate for a flat $3,995.
                <span className="font-semibold text-amber-400"> Save $10,000+ compared to statutory fees.</span>
              </p>
              <button
                onClick={handleStartCase}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 inline-flex items-center"
              >
                Check My Eligibility - Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <p className="mt-4 text-blue-200 text-sm">
                No payment required until you're ready to proceed
              </p>
            </div>
          </div>
        </section>

        {/* Attorney-First Difference Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
                The Attorney-First Difference
              </h2>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-8">
                <p className="text-gray-800">
                  Many "online probate services" are mere document preparation companies. They are not licensed
                  to provide legal advice, they cannot represent you in court, and they cannot clear notes
                  when a judge issues a deficiency.
                </p>
              </div>
              <p className="text-xl font-semibold text-blue-900 mb-6">We are different:</p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-blue-900" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Attorney-Drafted & Reviewed</h3>
                  <p className="text-gray-600 text-sm">
                    Every petition (DE-111), inventory, and accounting is drafted or reviewed by a licensed California lawyer.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-blue-900" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Stanley Mosk Specialists</h3>
                  <p className="text-gray-600 text-sm">
                    We have specialized our workflows to match the exact requirements of the Central District's probate examiners.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardCheck className="h-6 w-6 text-blue-900" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Full Accountability</h3>
                  <p className="text-gray-600 text-sm">
                    From arranging publication in local newspapers to coordinating with the Probate Referee for appraisals, we handle the logistics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11 Phases Section */}
        <section id="phases" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                The 11 Phases of California Probate
              </h2>
              <p className="text-center text-gray-600 mb-12">
                We guide you through every step of the probate process
              </p>
              <div className="space-y-4">
                {phases.map((phase) => (
                  <div
                    key={phase.num}
                    className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold mr-4">
                        {phase.num}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{phase.title}</h3>
                        <p className="text-gray-600 text-sm">{phase.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stanley Mosk IGN Note Clearance Section */}
        <section id="ign-notes" className="py-16 bg-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-6">
                Stanley Mosk IGN Note Clearance
              </h2>
              <p className="text-blue-100 text-center mb-8">
                The Stanley Mosk Courthouse is known for its rigorous Probate Examiners. For many
                self-represented executors, receiving a list of "Probate Notes" (IGN - Incomplete/Needs)
                is the moment the process stalls.
              </p>
              <div className="bg-blue-800 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-lg mb-4">Common notes include:</h3>
                <ul className="space-y-3">
                  {ignNotes.map((note, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-blue-100 italic">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-500 rounded-xl p-6 text-blue-900">
                <div className="flex items-start">
                  <CheckCircle className="h-8 w-8 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      Our "Note Clearance" service is included in your $3,995 fee
                    </h3>
                    <p>
                      We monitor the court portal, identify the examiners' concerns, and file the
                      Verified Supplements needed to clear the notes. This often results in your
                      petition being granted on the first hearing, avoiding the "three-month continuance" cycle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Credentials Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Trust & Credentials
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mr-4">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">Rozsa Gyene, Esq.</h3>
                      <p className="text-gray-600">Probate Attorney</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <Check className="h-5 w-5 text-green-600 mr-3" />
                      California State Bar #208356
                    </li>
                    <li className="flex items-center text-gray-700">
                      <Check className="h-5 w-5 text-green-600 mr-3" />
                      25+ Years Experience in Estate & Probate Law
                    </li>
                    <li className="flex items-center text-gray-700">
                      <Check className="h-5 w-5 text-green-600 mr-3" />
                      500+ Probate Cases Completed
                    </li>
                  </ul>
                  <a
                    href="https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-6 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Verify Attorney License
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </div>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-xl text-gray-900 mb-6">Office & Courthouse</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-blue-900 mr-3 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Our Office</p>
                        <p className="text-gray-600">Law Offices of Rozsa Gyene</p>
                        <p className="text-gray-600">655 N Central Ave, Suite 1704</p>
                        <p className="text-gray-600">Glendale, CA 91203</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Building2 className="h-5 w-5 text-blue-900 mr-3 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Primary Courthouse</p>
                        <a
                          href="https://www.lacourt.org/courthouse/info/smm"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Stanley Mosk Courthouse
                        </a>
                        <p className="text-gray-600">111 N. Hill St., Los Angeles</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                Transparent Flat Fee Pricing
              </h2>
              <p className="text-center text-gray-600 mb-12">
                Save thousands compared to statutory attorney fees
              </p>

              {/* Main Pricing Card */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 text-white mb-8">
                <div className="text-center mb-6">
                  <p className="text-blue-200 text-lg">Full Probate Administration</p>
                  <div className="flex items-center justify-center mt-2">
                    <span className="text-5xl font-bold">$3,995</span>
                    <span className="text-blue-200 ml-2">flat fee</span>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-amber-400 mr-2" />
                      All 11 phases of administration
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-amber-400 mr-2" />
                      Attorney drafting and review
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-amber-400 mr-2" />
                      Publication coordination
                    </li>
                  </ul>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-amber-400 mr-2" />
                      Bond assistance
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-amber-400 mr-2" />
                      IGN note clearance
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-amber-400 mr-2" />
                      Court appearance (remote) if needed
                    </li>
                  </ul>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Compare to Statutory Fees</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Estate Value</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Statutory Fee</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Our Fee</th>
                        <th className="text-left py-3 px-4 font-semibold text-green-600">You Save</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingComparison.map((row, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900">{row.estateValue}</td>
                          <td className="py-3 px-4 text-gray-500 line-through">{row.statutory}</td>
                          <td className="py-3 px-4 text-blue-900 font-semibold">{row.ourFee}</td>
                          <td className="py-3 px-4 text-green-600 font-bold">{row.savings}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Based on{' '}
                  <a
                    href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=10810"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    California Probate Code §10810
                  </a>
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={handleStartCase}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all inline-flex items-center"
                >
                  Check My Eligibility - Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-center text-gray-600 mb-12">
                Get answers to common questions about California probate
              </p>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-600">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* California Courthouse Coverage Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                California Courthouse Coverage
              </h2>
              <p className="text-gray-600 mb-8">
                We Handle Probate in All California Courts
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {courthouses.map((courthouse, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 flex items-center justify-center"
                  >
                    <Building2 className="h-5 w-5 text-blue-900 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{courthouse}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-blue-100 text-lg mb-8">
                Complete the free intake questionnaire in about 30 minutes.
                No payment required until you're ready.
              </p>
              <button
                onClick={handleStartCase}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 inline-flex items-center"
              >
                Check My Eligibility - Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
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
                  <li><Link to="/california-probate-administration" className="hover:text-white">Full Probate Administration</Link></li>
                  <li><Link to="/probate-court-locations-california" className="hover:text-white">All Locations</Link></li>
                  <li><Link to="/probate-faq-california" className="hover:text-white">Probate FAQ</Link></li>
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

export default CaliforniaProbateAdministration;
