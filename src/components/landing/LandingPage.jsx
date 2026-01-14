import React, { useState } from 'react';
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
  Clock,
  Shield,
  Award,
  DollarSign,
  FileText,
  Users,
  Home,
  CreditCard,
  Calendar,
  ClipboardList,
  Gavel,
  BookOpen,
  Send,
  CheckCircle,
  AlertCircle,
  Menu,
  X,
  LogIn,
  LogOut,
  LayoutDashboard,
  Building2,
  Calculator,
  ExternalLink,
  Search,
  Lock,
  BarChart3
} from 'lucide-react';

// California Statutory Fee Calculator (Probate Code §10810)
const calculateStatutoryFee = (estateValue) => {
  let fee = 0;
  let remaining = estateValue;

  // 4% of first $100,000
  if (remaining > 0) {
    const bracket = Math.min(remaining, 100000);
    fee += bracket * 0.04;
    remaining -= bracket;
  }

  // 3% of next $100,000
  if (remaining > 0) {
    const bracket = Math.min(remaining, 100000);
    fee += bracket * 0.03;
    remaining -= bracket;
  }

  // 2% of next $800,000
  if (remaining > 0) {
    const bracket = Math.min(remaining, 800000);
    fee += bracket * 0.02;
    remaining -= bracket;
  }

  // 1% of next $9,000,000
  if (remaining > 0) {
    const bracket = Math.min(remaining, 9000000);
    fee += bracket * 0.01;
    remaining -= bracket;
  }

  // 0.5% of next $15,000,000
  if (remaining > 0) {
    const bracket = Math.min(remaining, 15000000);
    fee += bracket * 0.005;
    remaining -= bracket;
  }

  return Math.round(fee);
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [estateValue, setEstateValue] = useState(750000);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Navigate to intake if logged in, otherwise to register
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

  const phases = [
    { num: 1, title: 'Initial Filing', desc: 'File petition with the Superior Court and receive your case number. We prepare the DE-111 Petition for Probate and all supporting documents.' },
    { num: 2, title: 'Bond (if required)', desc: 'Arrange surety bond to protect the estate. Required unless waived in the will or by all heirs. We help you find competitive bond rates.' },
    { num: 3, title: 'Notice to Creditors', desc: 'Publish notice in a court-approved newspaper for 3 consecutive weeks. We coordinate with local publications and track deadlines.' },
    { num: 4, title: 'Letters Testamentary', desc: 'Receive official court authority to act on behalf of the estate. This document lets you access bank accounts, sell property, and manage assets.' },
    { num: 5, title: 'Inventory & Appraisal', desc: 'Catalog all estate assets with the court-appointed Probate Referee. We prepare the DE-160 Inventory and Appraisal form.' },
    { num: 6, title: 'Creditor Claims Period', desc: '4-month waiting period for creditors to file claims against the estate. We help you evaluate and respond to any claims received.' },
    { num: 7, title: 'Pay Debts & Taxes', desc: 'Settle valid claims, pay final taxes, and clear estate obligations. We provide guidance on priority of payments.' },
    { num: 8, title: 'Preliminary Distribution', desc: 'Distribute some assets to heirs if approved by court. Useful for large estates or when heirs need immediate access.' },
    { num: 9, title: 'Final Accounting', desc: 'Prepare complete financial report of all estate transactions. We generate the accounting documents required by the court.' },
    { num: 10, title: 'Petition for Distribution', desc: 'Request court approval to close the estate and make final distributions. We prepare the DE-161 Final Petition.' },
    { num: 11, title: 'Final Distribution', desc: 'Transfer remaining assets to heirs and file discharge papers. Your duties as executor are complete.' }
  ];

  const faqs = [
    {
      q: 'How long does probate take in California?',
      a: 'Most cases take 9-18 months. Simple estates with no disputes may finish in 9 months; complex estates with real property in multiple counties or contested claims can take longer. Our dashboard helps you track progress and stay on schedule.'
    },
    {
      q: 'Do I need probate if there\'s a will?',
      a: 'Usually yes. A will still needs to go through probate court to be validated and executed. Only assets in a living trust, jointly-owned property, or accounts with beneficiary designations avoid probate. We\'ll assess your specific situation during intake.'
    },
    {
      q: 'Can I be the executor if I live out of state?',
      a: 'Yes, California allows out-of-state executors. However, you may need to post a bond even if the will waives it. Our service is fully online, making it easy to manage your case from anywhere.'
    },
    {
      q: 'What if there are disputes among heirs?',
      a: 'Our flat fee covers standard uncontested probate. If heirs contest the will or disputes arise, additional attorney representation may be needed. We\'ll advise you if your case becomes contested.'
    },
    {
      q: 'What court fees are not included?',
      a: 'Court filing fees (~$435-500), newspaper publication (~$200-300), probate referee fees (0.1% of assets), and bond premiums (if required) are paid directly to third parties. Our flat fees ($2,495 simplified or $3,995 full probate) cover all attorney services, form preparation, and case management.'
    },
    {
      q: 'What if the estate is small?',
      a: 'Estates with personal property under $208,850 may qualify for a small estate affidavit (no court required). Primary residences valued under $750,000 may qualify for our simplified probate process ($2,495). We\'ll evaluate your situation during intake and recommend the most cost-effective approach.'
    },
    {
      q: 'What payment options do you offer?',
      a: 'We offer several ways to pay: Pay in full ($2,495 or $3,995), split into 3 monthly payments at no extra cost, or use Klarna for 4 interest-free payments (subject to approval). You can select your preferred payment method at checkout. Klarna approval is instant and doesn\'t affect your credit score for the initial check.'
    }
  ];

  // Schema markup for homepage with Sitelinks Searchbox
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://myprobateca.com/#website",
        "name": "MyProbateCA",
        "url": "https://myprobateca.com",
        "description": "California probate services for a flat $3,995 fee",
        "publisher": {
          "@id": "https://myprobateca.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://myprobateca.com/probate-court-locations-california?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "WebPage",
        "@id": "https://myprobateca.com/#webpage",
        "url": "https://myprobateca.com",
        "name": "California Probate Services | Attorney-Led | Flat $3,995 Fee | MyProbateCA",
        "description": "California probate for $3,995 flat fee. Full attorney service includes AI asset discovery, automated death notifications, all court documents, and progress dashboard. Save $42,000+ vs traditional attorneys.",
        "isPartOf": {
          "@id": "https://myprobateca.com/#website"
        },
        "about": {
          "@id": "https://myprobateca.com/#organization"
        },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [".hero-headline", ".hero-subheadline", ".pricing-highlight"]
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>California Probate Services | Attorney-Led | Flat $3,995 Fee | MyProbateCA</title>
        <meta name="description" content="California probate for $3,995 flat fee — not DIY forms. Full attorney service includes AI asset discovery, automated death notifications, all court documents, and progress dashboard. Save $42,000+ vs traditional attorneys." />
        <meta name="keywords" content="California probate, probate attorney, probate lawyer, estate administration, flat fee probate, Los Angeles probate, Glendale probate attorney" />
        <link rel="canonical" href="https://myprobateca.com/" />

        {/* Open Graph */}
        <meta property="og:title" content="Don't Pay $46,000 for California Probate | We Do It for $3,995" />
        <meta property="og:description" content="Not DIY forms. Full attorney service includes AI asset discovery, automated death notifications, all court documents. Save $42,000+ vs traditional attorneys." />
        <meta property="og:url" content="https://myprobateca.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MyProbateCA" />
        <meta property="og:image" content="https://myprobateca.com/images/office/glendale-office-exterior.jpg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Don't Pay $46,000 for California Probate | We Do It for $3,995" />
        <meta name="twitter:description" content="Not DIY forms. Full attorney service includes AI asset discovery, automated death notifications, all court documents. Save $42,000+." />
        <meta name="twitter:image" content="https://myprobateca.com/images/office/glendale-office-exterior.jpg" />

        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      </Helmet>

    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Scale className="h-8 w-8 text-blue-900" />
              <span className="ml-2 text-xl font-bold text-blue-900">California Probate</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="tel:8182916217" className="flex items-center text-blue-900 font-semibold hover:text-blue-700">
                <Phone className="h-4 w-4 mr-1" />
                (818) 291-6217
              </a>
              <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-blue-900 font-medium">
                How It Works
              </button>
              <button onClick={() => scrollToSection('phases')} className="text-gray-600 hover:text-blue-900 font-medium">
                The 11 Phases
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-blue-900 font-medium">
                Pricing
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-blue-900 font-medium">
                FAQ
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-600 hover:text-blue-900 font-medium">
                Contact
              </button>
              <button onClick={() => navigate('/learn-california-probate')} className="text-amber-600 hover:text-amber-700 font-medium">
                Learn
              </button>

              {user ? (
                <>
                  {isAdmin && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="text-gray-600 hover:text-blue-900 font-medium flex items-center"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-1" />
                      Admin
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-600 hover:text-blue-900 font-medium"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 font-medium transition-colors flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-600 hover:text-blue-900 font-medium flex items-center"
                  >
                    <LogIn className="h-4 w-4 mr-1" />
                    Login
                  </button>
                  <button
                    onClick={handleStartCase}
                    className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800 font-medium transition-colors"
                  >
                    Start Your Case
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <a href="tel:8182916217" className="flex items-center text-blue-900 font-semibold">
                  <Phone className="h-4 w-4 mr-2" />
                  (818) 291-6217
                </a>
                <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-blue-900 font-medium text-left">
                  How It Works
                </button>
                <button onClick={() => scrollToSection('phases')} className="text-gray-600 hover:text-blue-900 font-medium text-left">
                  The 11 Phases
                </button>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-blue-900 font-medium text-left">
                  Pricing
                </button>
                <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-blue-900 font-medium text-left">
                  FAQ
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-gray-600 hover:text-blue-900 font-medium text-left">
                  Contact
                </button>
                <button onClick={() => { setMobileMenuOpen(false); navigate('/learn-california-probate'); }} className="text-amber-600 hover:text-amber-700 font-medium text-left">
                  Learn
                </button>

                {user ? (
                  <>
                    {isAdmin && (
                      <button
                        onClick={() => { setMobileMenuOpen(false); navigate('/admin'); }}
                        className="text-gray-600 hover:text-blue-900 font-medium text-left flex items-center"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Admin
                      </button>
                    )}
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                      className="text-gray-600 hover:text-blue-900 font-medium text-left"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                      className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 font-medium w-full flex items-center justify-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                      className="text-gray-600 hover:text-blue-900 font-medium text-left flex items-center"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </button>
                    <button
                      onClick={handleStartCase}
                      className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800 font-medium w-full"
                    >
                      Start Your Case
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/lady-justice.webp)',
            filter: 'brightness(0.85)'
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-900/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            {/* Glassmorphic Box */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 md:p-10 shadow-2xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white leading-tight hero-headline">
                Don't Pay $46,000 for California Probate
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-amber-300 mb-6">
                We Do It for $3,995 — Full Attorney Service
              </p>
              <p className="text-lg md:text-xl text-white/90 mb-8 hero-subheadline">
                Not DIY forms. Not a document generator. <strong className="text-white">Real attorney-prepared probate</strong> from first filing to final distribution.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center bg-blue-900/80 px-3 py-1.5 rounded-full">
                  <Shield className="h-4 w-4 mr-2 text-white" />
                  <span className="text-sm font-medium text-white">CA Bar #208356</span>
                </div>
                <div className="flex items-center bg-blue-900/80 px-3 py-1.5 rounded-full">
                  <Award className="h-4 w-4 mr-2 text-white" />
                  <span className="text-sm font-medium text-white">25+ Years Experience</span>
                </div>
                <div className="flex items-center bg-amber-600/90 px-3 py-1.5 rounded-full">
                  <CheckCircle className="h-4 w-4 mr-2 text-white" />
                  <span className="text-sm font-medium text-white">Not a Form Generator — Real Legal Service</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleStartCase}
                  className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors flex items-center justify-center shadow-lg"
                >
                  Start Your Case - Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
                >
                  View Pricing
                </button>
              </div>

              {/* Payment flexibility note */}
              <p className="text-white/80 text-sm mt-4">
                Payment plans available — pay over time with no extra fees
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need — One Flat Fee
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We don't just file forms. We handle the entire probate process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: All Court Documents */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-3xl mb-4">📋</div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">All Court Documents</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We prepare every form: DE-111 Petition, DE-120 Notice, DE-140 Order, DE-150 Letters, DE-160 Inventory, DE-161 Final Distribution — all attorney-reviewed.
              </p>
            </div>

            {/* Feature 2: AI Asset Discovery - HIGHLIGHT */}
            <div className="bg-blue-50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border-2 border-blue-200 relative">
              <div className="absolute -top-3 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                NEW
              </div>
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">AI Asset Discovery</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Upload tax returns and our AI finds hidden assets — forgotten 401(k)s, old bank accounts, life insurance policies. Never miss an asset.
              </p>
            </div>

            {/* Feature 3: Death Notifications */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-3xl mb-4">📨</div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Automated Death Notifications</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We notify Social Security, DMV, credit bureaus (Equifax, Experian, TransUnion), and other agencies. You don't make the calls.
              </p>
            </div>

            {/* Feature 4: Bank Communication Kit */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-3xl mb-4">🏦</div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Bank Communication Kit</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Step-by-step scripts, letter templates, and checklists for dealing with banks and financial institutions. Know exactly what to say.
              </p>
            </div>

            {/* Feature 5: Hearing Preparation */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-3xl mb-4">⚖️</div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Hearing Preparation</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We prepare you for your court hearing — what to expect, what to bring, how to respond to the examiner's questions.
              </p>
            </div>

            {/* Feature 6: Creditor Management */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Creditor Management</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We track the 4-month creditor period, help you evaluate claims, and prepare rejection letters for invalid claims.
              </p>
            </div>

            {/* Feature 7: Digital Vault */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-3xl mb-4">🔐</div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Digital Vault</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Once probate closes, store all your documents securely forever — Order of Final Distribution, Letters, death certificates, everything.
              </p>
            </div>

            {/* Feature 8: Progress Dashboard */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Progress Dashboard</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Track every phase of your probate in real-time. Always know where you are, what's next, and what's needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We're Different - Comparison Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Families Choose MyProbateCA
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-4 text-left font-semibold text-gray-700 bg-gray-50 rounded-tl-lg">Feature</th>
                  <th className="py-4 px-4 text-center font-semibold text-gray-700 bg-gray-50">Traditional Attorney</th>
                  <th className="py-4 px-4 text-center font-semibold text-gray-700 bg-gray-50">DIY / LegalZoom</th>
                  <th className="py-4 px-4 text-center font-semibold text-white bg-blue-900 rounded-tr-lg">MyProbateCA</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-800">Cost ($1M Estate)</td>
                  <td className="py-4 px-4 text-center text-red-600 font-semibold">$46,000+</td>
                  <td className="py-4 px-4 text-center text-gray-600">$200-500</td>
                  <td className="py-4 px-4 text-center text-green-600 font-bold bg-blue-50">$3,995</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-800">Attorney Prepared</td>
                  <td className="py-4 px-4 text-center text-green-600">✓</td>
                  <td className="py-4 px-4 text-center text-red-600">✗</td>
                  <td className="py-4 px-4 text-center text-green-600 font-bold bg-blue-50">✓</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-800">Attorney Guidance</td>
                  <td className="py-4 px-4 text-center text-green-600">✓</td>
                  <td className="py-4 px-4 text-center text-red-600">✗</td>
                  <td className="py-4 px-4 text-center text-green-600 font-bold bg-blue-50">✓</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-800">AI Asset Discovery</td>
                  <td className="py-4 px-4 text-center text-red-600">✗</td>
                  <td className="py-4 px-4 text-center text-red-600">✗</td>
                  <td className="py-4 px-4 text-center text-green-600 font-bold bg-blue-50">✓</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-800">Death Notifications</td>
                  <td className="py-4 px-4 text-center text-gray-500">Sometimes</td>
                  <td className="py-4 px-4 text-center text-red-600">✗</td>
                  <td className="py-4 px-4 text-center text-green-600 font-bold bg-blue-50">✓ Automated</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-800">Progress Dashboard</td>
                  <td className="py-4 px-4 text-center text-red-600">✗</td>
                  <td className="py-4 px-4 text-center text-gray-500">Basic</td>
                  <td className="py-4 px-4 text-center text-green-600 font-bold bg-blue-50">✓ 11 Phases</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-800">Bank Guidance Kit</td>
                  <td className="py-4 px-4 text-center text-gray-500">Verbal only</td>
                  <td className="py-4 px-4 text-center text-red-600">✗</td>
                  <td className="py-4 px-4 text-center text-green-600 font-bold bg-blue-50">✓ Templates</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-800 rounded-bl-lg">Digital Vault</td>
                  <td className="py-4 px-4 text-center text-red-600">✗</td>
                  <td className="py-4 px-4 text-center text-red-600">✗</td>
                  <td className="py-4 px-4 text-center text-green-600 font-bold bg-blue-50 rounded-br-lg">✓ Forever</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center mt-10">
            <p className="text-lg text-gray-600 mb-6">
              Get full attorney service at a fraction of the cost.
            </p>
            <button
              onClick={handleStartCase}
              className="bg-blue-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors inline-flex items-center"
            >
              Start Your Probate — Free Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Attorney Trust Badge Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Attorney Photo */}
              <div className="flex-shrink-0">
                <img
                  src="/Rozsa-Gyene.webp"
                  alt="California Probate Attorney Rozsa Gyene, State Bar #208356"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  width="128"
                  height="128"
                  fetchpriority="high"
                />
              </div>

              {/* Credentials */}
              <div className="text-center md:text-left flex-grow">
                <h2 className="text-2xl font-bold text-gray-900">Rozsa Gyene, Esq.</h2>
                <p className="text-lg text-blue-900 font-medium mt-1">Licensed California Probate Attorney</p>

                <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                  <a
                    href="https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-blue-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-800 transition-colors"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    CA State Bar #208356
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                    <Award className="h-4 w-4 mr-2" />
                    25+ Years Experience
                  </div>
                  <div className="inline-flex items-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                    <Users className="h-4 w-4 mr-2" />
                    500+ Cases Completed
                  </div>
                </div>

                <p className="text-gray-600 mt-4 text-sm">
                  Every document prepared by a licensed attorney. Every filing reviewed before submission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-8 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {/* 5000+ Families */}
            <div className="bg-white rounded-xl p-5 text-center shadow-sm">
              <Users className="h-7 w-7 mx-auto mb-2 text-amber-700" />
              <p className="font-bold text-gray-900 text-sm">5000+ Families</p>
              <p className="text-xs text-gray-500">Served Since 2001</p>
            </div>

            {/* CA State Bar */}
            <div className="bg-white rounded-xl p-5 text-center shadow-sm">
              <Award className="h-7 w-7 mx-auto mb-2 text-amber-700" />
              <a
                href="https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-gray-900 hover:text-blue-600 text-sm"
              >
                State Bar #208356
              </a>
              <p className="text-xs text-gray-500">Licensed & Verified</p>
            </div>

            {/* A+ Rated */}
            <div className="bg-white rounded-xl p-5 text-center shadow-sm">
              <svg className="h-7 w-7 mx-auto mb-2 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <p className="font-bold text-gray-900 text-sm">A+ Rated</p>
              <p className="text-xs text-gray-500">Better Business Bureau</p>
            </div>

            {/* 25+ Years */}
            <div className="bg-white rounded-xl p-5 text-center shadow-sm">
              <svg className="h-7 w-7 mx-auto mb-2 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <p className="font-bold text-gray-900 text-sm">25+ Years</p>
              <p className="text-xs text-gray-500">Estate Law Experience</p>
            </div>

            {/* 100% Confidential */}
            <div className="bg-white rounded-xl p-5 text-center shadow-sm">
              <Shield className="h-7 w-7 mx-auto mb-2 text-amber-700" />
              <p className="font-bold text-gray-900 text-sm">100% Confidential</p>
              <p className="text-xs text-gray-500">Attorney-Client Privilege</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statutory Fee Calculator Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See How Much You'll Save
            </h2>
            <p className="text-xl text-gray-600">
              Compare our flat fee vs. California's statutory attorney fees
            </p>
          </div>

          {/* Interactive Calculator */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
            <div className="flex items-center justify-center mb-6">
              <Calculator className="h-6 w-6 text-blue-900 mr-2" />
              <h3 className="text-xl font-bold text-gray-900">Fee Savings Calculator</h3>
            </div>

            {/* Slider Input */}
            <div className="mb-8">
              <label htmlFor="estate-value-slider" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Enter your estimated estate value:
              </label>
              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-blue-900">
                  ${estateValue.toLocaleString()}
                </span>
              </div>
              <input
                id="estate-value-slider"
                type="range"
                min="100000"
                max="5000000"
                step="50000"
                value={estateValue}
                onChange={(e) => setEstateValue(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                aria-valuemin={100000}
                aria-valuemax={5000000}
                aria-valuenow={estateValue}
                aria-valuetext={`$${estateValue.toLocaleString()}`}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>$100K</span>
                <span>$1M</span>
                <span>$2.5M</span>
                <span>$5M</span>
              </div>
            </div>

            {/* Comparison Results */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Traditional Fee */}
              <div className="bg-red-50 rounded-xl p-6 text-center border-2 border-red-200">
                <p className="text-sm font-medium text-red-700 mb-2">Traditional Attorney Fee</p>
                <p className="text-sm text-gray-500 mb-1">(Probate Code §10810)</p>
                <p className="text-3xl font-bold text-red-600">
                  ${calculateStatutoryFee(estateValue).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">Percentage-based</p>
              </div>

              {/* Our Fee */}
              <div className="bg-green-50 rounded-xl p-6 text-center border-2 border-green-300">
                <p className="text-sm font-medium text-green-700 mb-2">Our Flat Fee</p>
                <p className="text-sm text-gray-500 mb-1">(Full Probate)</p>
                <p className="text-3xl font-bold text-green-600">$3,995</p>
                <p className="text-xs text-gray-500 mt-2">Fixed price</p>
              </div>

              {/* Savings */}
              <div className="bg-blue-900 rounded-xl p-6 text-center">
                <p className="text-sm font-medium text-blue-200 mb-2">YOU SAVE</p>
                <p className="text-sm text-blue-300 mb-1">&nbsp;</p>
                <p className="text-3xl font-bold text-white">
                  ${Math.max(0, calculateStatutoryFee(estateValue) - 3995).toLocaleString()}
                </p>
                <p className="text-xs text-blue-300 mt-2">
                  {Math.round((1 - 3995 / calculateStatutoryFee(estateValue)) * 100)}% less
                </p>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              * California Probate Code §10810 allows attorneys to charge: 4% of first $100K, 3% of next $100K, 2% of next $800K, 1% of next $9M.{' '}
              <a href="/learn-california-probate/california-probate-fees-statutory-vs-flat" className="text-blue-600 hover:underline">Learn more about probate fees →</a>
            </p>
          </div>

          {/* Static Comparison Table */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 text-center mb-4">Common Estate Value Comparisons</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Estate Value</th>
                    <th className="px-4 py-3 text-center font-semibold text-red-600">Statutory Fee</th>
                    <th className="px-4 py-3 text-center font-semibold text-green-600">Our Fee</th>
                    <th className="px-4 py-3 text-center font-semibold text-blue-900">Your Savings</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b">
                    <td className="px-4 py-3 font-medium">$500,000</td>
                    <td className="px-4 py-3 text-center text-red-600">$13,000</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">$3,995</td>
                    <td className="px-4 py-3 text-center text-blue-900 font-bold">$9,005</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-medium">$750,000</td>
                    <td className="px-4 py-3 text-center text-red-600">$18,000</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">$3,995</td>
                    <td className="px-4 py-3 text-center text-blue-900 font-bold">$14,005</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-medium">$1,000,000</td>
                    <td className="px-4 py-3 text-center text-red-600">$23,000</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">$3,995</td>
                    <td className="px-4 py-3 text-center text-blue-900 font-bold">$19,005</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">$2,000,000</td>
                    <td className="px-4 py-3 text-center text-red-600">$33,000</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">$3,995</td>
                    <td className="px-4 py-3 text-center text-blue-900 font-bold">$29,005</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={handleStartCase}
              className="bg-blue-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors inline-flex items-center shadow-lg"
            >
              Start Your Case - Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section - Two Tiers */}
      <section id="pricing" className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Choose Your Service</h2>
            <p className="text-xl text-gray-600">Transparent flat-fee pricing with payment plans available</p>
          </div>

          {/* Two-Tier Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12 items-stretch">
            {/* Simplified Probate */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 mt-8 flex flex-col">
              <div className="bg-green-600 text-white p-4 pt-6 text-center">
                <h3 className="text-xl font-bold">SIMPLIFIED PROBATE</h3>
                <p className="text-green-100 text-sm">For primary residences under $750,000</p>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-gray-900">$2,495</p>
                  <p className="text-gray-500">flat fee</p>
                  <p className="text-sm text-green-600 mt-1">or 3 payments of $832 — no extra charge</p>
                  <p className="text-sm text-gray-600 mt-2">
                    or 4 interest-free payments of $624 with <span className="font-bold text-pink-600">Klarna</span>
                  </p>
                </div>

                <div className="mb-6">
                  <p className="font-semibold text-gray-900 mb-2">Best for:</p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Primary home valued under $750,000</li>
                    <li>• Personal property under $208,850</li>
                    <li>• All heirs agree on distribution</li>
                    <li>• No complex assets or disputes</li>
                  </ul>
                </div>

                <div className="mb-6 flex-grow">
                  <p className="font-semibold text-gray-900 mb-2">What's included:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span><strong>Attorney</strong> prepares Petition to Determine Succession</span></li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span><strong>Attorney</strong> prepares all supporting declarations</span></li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>Coordinate probate referee appraisal</span></li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>Court hearing preparation</span></li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>Final order for property transfer</span></li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>Unlimited email support</span></li>
                  </ul>
                </div>

                <div className="mt-auto">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      Timeline: 3-6 months typical
                    </div>
                  </div>

                  <button
                    onClick={handleStartCase}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Start Your Case - Free
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    <span className="inline-flex items-center">
                      <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded text-xs font-medium mr-1">Buy now, pay later</span>
                      available at checkout
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Full Probate */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-blue-900 relative mt-8 flex flex-col">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-orange-500 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg whitespace-nowrap">MOST COMMON</span>
              </div>
              <div className="bg-blue-900 text-white p-4 pt-6 text-center rounded-t-lg">
                <h3 className="text-xl font-bold">FULL PROBATE</h3>
                <p className="text-blue-200 text-sm">For estates over $750,000 or complex situations</p>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-gray-900">$3,995</p>
                  <p className="text-gray-500">flat fee</p>
                  <p className="text-sm text-blue-600 mt-1">or 3 payments of $1,332 — no extra charge</p>
                  <p className="text-sm text-gray-600 mt-2">
                    or 4 interest-free payments of $999 with <span className="font-bold text-pink-600">Klarna</span>
                  </p>
                </div>

                <div className="mb-6">
                  <p className="font-semibold text-gray-900 mb-2">Best for:</p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Real estate over $750,000</li>
                    <li>• Multiple properties or rental/vacation homes</li>
                    <li>• Business interests</li>
                    <li>• Any situation not qualifying for simplified</li>
                  </ul>
                </div>

                <div className="mb-6 flex-grow">
                  <p className="font-semibold text-gray-900 mb-2">What's included:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>Everything in Simplified, <strong>PLUS:</strong></span></li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>Full 11-phase administration</span></li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>All probate forms prepared by <strong>attorney</strong></span></li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>Inventory & Appraisal preparation</span></li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>Creditor claim management</span></li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>Final Accounting preparation</span></li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>Petition for Final Distribution</span></li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>Dashboard tracking & deadline reminders</span></li>
                  </ul>
                </div>

                <div className="mt-auto">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      Timeline: 9-18 months typical
                    </div>
                  </div>

                  <button
                    onClick={handleStartCase}
                    className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                  >
                    Start Your Case - Free
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    <span className="inline-flex items-center">
                      <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded text-xs font-medium mr-1">Buy now, pay later</span>
                      available at checkout
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Options Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Options Available</h3>
              <p className="text-gray-600">Don't have the full amount today? No problem.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <CreditCard className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="font-semibold text-gray-900">3 Monthly Payments</p>
                <p className="text-sm text-gray-500">Split into 3 equal payments — no extra cost</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="h-6 flex items-center justify-center mb-2">
                  <span className="text-pink-500 font-bold text-sm">Klarna</span>
                </div>
                <p className="font-semibold text-gray-900">4 Interest-Free Payments</p>
                <p className="text-sm text-gray-500">Pay in 4 with Klarna — subject to approval</p>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">
              Select your preferred payment method at checkout. Klarna approval is instant and doesn't affect your credit score.
            </p>
          </div>

          {/* Not Sure CTA */}
          <div className="text-center bg-gray-100 rounded-xl p-6">
            <p className="text-lg text-gray-700 mb-4">
              <strong>Not sure which you need?</strong> Complete the intake questionnaire and we'll evaluate your situation at no charge.
            </p>
            <button
              onClick={handleStartCase}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Your case is handled by a licensed California <strong>attorney</strong> through all 11 phases of probate.</p>
          </div>

          <div className="space-y-6">
            {/* Phase 1 */}
            <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-900">
              <div className="flex items-center mb-4">
                <div className="bg-blue-900 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-4">1</div>
                <h3 className="text-xl font-bold text-gray-900">Case Evaluation</h3>
              </div>
              <ul className="space-y-2 ml-14">
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Complete intake questionnaire (30 min)</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700"><strong>Attorney</strong> reviews your situation</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Identify all required forms for your specific case</span></li>
              </ul>
            </div>

            {/* Phase 2-3 */}
            <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-600">
              <div className="flex items-center mb-4">
                <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4">2-3</div>
                <h3 className="text-xl font-bold text-gray-900">Petition & Filing</h3>
              </div>
              <ul className="space-y-2 ml-14">
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700"><strong>Attorney</strong> prepares Petition for Probate (DE-111)</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700"><strong>Attorney</strong> prepares all supporting declarations</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Prepare Letters Testamentary/Administration request</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Calculate bond requirements (if needed)</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">You file at courthouse or we coordinate filing</span></li>
              </ul>
            </div>

            {/* Phase 4-5 */}
            <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-600">
              <div className="flex items-center mb-4">
                <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4">4-5</div>
                <h3 className="text-xl font-bold text-gray-900">Notices & Court Date</h3>
              </div>
              <ul className="space-y-2 ml-14">
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Coordinate legal newspaper publication</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Prepare Notice of Petition (DE-121)</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Mail notices to all heirs and beneficiaries</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Prepare proof of service documents</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Court hearing preparation guidance</span></li>
              </ul>
            </div>

            {/* Phase 6-8 */}
            <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-500">
              <div className="flex items-center mb-4">
                <div className="bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4">6-8</div>
                <h3 className="text-xl font-bold text-gray-900">Inventory & Creditors</h3>
              </div>
              <ul className="space-y-2 ml-14">
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700"><strong>Attorney</strong> prepares Inventory & Appraisal (DE-160)</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Coordinate with probate referee for appraisals</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Prepare creditor claim responses</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Track 4-month creditor period</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Guidance on paying valid debts</span></li>
              </ul>
            </div>

            {/* Phase 9-11 */}
            <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-600">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4">9-11</div>
                <h3 className="text-xl font-bold text-gray-900">Accounting & Distribution</h3>
              </div>
              <ul className="space-y-2 ml-14">
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700"><strong>Attorney</strong> prepares Final Accounting</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700"><strong>Attorney</strong> prepares Petition for Final Distribution</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Calculate executor compensation (if claimed)</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Prepare receipts and releases</span></li>
                <li className="flex items-start"><Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Final order and estate closing documents</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom emphasis */}
          <div className="mt-10 text-center">
            <div className="inline-block bg-blue-900 text-white px-8 py-4 rounded-lg">
              <p className="text-lg font-semibold">Every document <strong>attorney</strong>-prepared. Every filing <strong>attorney</strong>-reviewed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courthouse Coverage Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Building2 className="h-8 w-8 text-blue-900" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              We Handle Probate in All California Courts
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether your case is in Los Angeles, San Diego, Orange County, or any California county,
              we prepare all your documents and can appear remotely at your hearing.
            </p>
          </div>

          {/* Major Courthouses Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {[
              { name: 'Stanley Mosk Courthouse', county: 'Los Angeles' },
              { name: 'San Diego Central', county: 'San Diego' },
              { name: 'Lamoreaux Justice Center', county: 'Orange County' },
              { name: 'Hall of Justice', county: 'San Francisco' },
              { name: 'Sacramento Superior', county: 'Sacramento' },
              { name: 'Riverside Hall of Justice', county: 'Riverside' },
              { name: 'San Bernardino Justice Center', county: 'San Bernardino' },
              { name: 'Santa Clara Superior', county: 'Santa Clara' },
              { name: 'Fresno County Courthouse', county: 'Fresno' },
              { name: 'Ventura Superior Court', county: 'Ventura' }
            ].map((court, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <Gavel className="h-5 w-5 mx-auto mb-2 text-blue-900" />
                <p className="font-medium text-gray-900 text-sm">{court.name}</p>
                <p className="text-xs text-gray-500">{court.county}</p>
              </div>
            ))}
          </div>

          {/* Additional Courts Note */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 text-center">
            <p className="text-lg text-blue-900 font-medium mb-2">
              Plus 48 additional California county courts
            </p>
            <p className="text-gray-600">
              Our flat-fee service covers probate filings in <strong>all 58 California counties</strong>.
              No matter where the decedent lived, we can help.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm">
              {['Alameda', 'Contra Costa', 'Kern', 'Monterey', 'Placer', 'San Joaquin', 'Santa Barbara', 'Solano', 'Sonoma', 'Stanislaus'].map((county, index) => (
                <span key={index} className="bg-white px-3 py-1 rounded-full text-gray-600 border border-gray-200">
                  {county}
                </span>
              ))}
              <span className="bg-blue-900 px-3 py-1 rounded-full text-white">
                + 38 more
              </span>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={handleStartCase}
              className="bg-blue-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors inline-flex items-center"
            >
              Start Your Case - Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 11 Phases Section */}
      <section id="phases" className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The 11 Phases of California Probate</h2>
            <p className="text-xl text-gray-600">We guide you through every step</p>
          </div>

          <div className="space-y-3">
            {phases.map((phase) => (
              <div key={phase.num} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedPhase(expandedPhase === phase.num ? null : phase.num)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="bg-blue-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">
                      {phase.num}
                    </span>
                    <span className="font-semibold text-gray-900">{phase.title}</span>
                  </div>
                  {expandedPhase === phase.num ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedPhase === phase.num && (
                  <div className="px-6 pb-4 pl-18">
                    <p className="text-gray-600 ml-12">{phase.desc}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center bg-blue-100 text-blue-900 px-6 py-3 rounded-full">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-medium">Average timeline: 9-18 months depending on complexity</span>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What You Get for $3,995</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Documents Prepared by Attorney */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                DOCUMENTS PREPARED BY <strong className="ml-1">ATTORNEY</strong>
              </h3>
              <ul className="space-y-3">
                {[
                  'Petition for Probate (DE-111)',
                  'Notice of Petition to Administer Estate (DE-121)',
                  'Duties and Liabilities of Personal Representative (DE-147)',
                  'Letters Testamentary / Letters of Administration',
                  'Inventory and Appraisal (DE-160)',
                  'Notice of Administration to Creditors (DE-157)',
                  'Final Accounting',
                  'Petition for Final Distribution',
                  'Order for Final Distribution',
                  'All required proofs of service',
                  'All supplemental declarations'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Included */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  SERVICES INCLUDED
                </h3>
                <ul className="space-y-3">
                  {[
                    'Attorney review at every phase',
                    'Newspaper publication coordination',
                    'Deadline tracking & reminders',
                    'Document upload & secure storage',
                    'Unlimited email support',
                    'Dashboard access until case closes'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not Included */}
              <div className="bg-gray-100 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-700 mb-4">NOT INCLUDED (paid separately)</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                    Court filing fees (~$435-500)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                    Newspaper publication (~$200-300)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                    Probate referee fees (0.1% of assets)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                    Bond premium (if required)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Your Attorney Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Your Probate Attorney</h2>
            <p className="text-xl text-gray-600">Every case reviewed and approved by a licensed California attorney</p>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Attorney Photo & Map */}
            <div className="md:w-1/3">
              <div className="rounded-lg overflow-hidden shadow-lg mb-4">
                <img
                  src="/images/attorney/rozsa-gyene-probate-attorney.webp"
                  alt="California Probate Attorney Rozsa Gyene, State Bar #208356, Glendale Office"
                  className="w-full"
                  loading="lazy"
                  width="255"
                  height="256"
                />
              </div>
              <div className="rounded-lg overflow-hidden shadow-md h-48">
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

            {/* Bio */}
            <div className="md:w-2/3">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Rozsa Gyene, Esq.</h3>
              <p className="text-gray-600 mb-4">California State Bar #208356 • 25+ Years Experience</p>
              <blockquote className="text-lg text-gray-700 italic mb-6 border-l-4 border-blue-900 pl-4">
                "Probate doesn't have to be overwhelming. Our system breaks it into manageable steps so you always know exactly what to do next. I've helped hundreds of families through this process, and I've designed this service to give you professional guidance at a price that makes sense."
              </blockquote>
              <p className="text-gray-700 mb-4">
                <strong>Rozsa Gyene</strong> has spent 25+ years navigating the California probate court system. She's appeared at the Stanley Mosk Courthouse hundreds of times and knows exactly what examiners look for.
              </p>
              <p className="text-gray-700 mb-6">
                Every document prepared through MyProbateCA is reviewed and approved by Rozsa personally—not a paralegal, not an AI, but a licensed California attorney with real courtroom experience.
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <a
                  href="https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:underline"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verify Bar License
                </a>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">655 N Central Ave, Suite 1704, Glendale, CA 91203</span>
              </div>

              <div className="flex flex-wrap gap-4">
                <a href="tel:8182916217" className="inline-flex items-center text-gray-700 hover:text-blue-600">
                  <Phone className="h-4 w-4 mr-2" />
                  (818) 291-6217
                </a>
                <a href="mailto:rozsa@myprobateca.com" className="inline-flex items-center text-gray-700 hover:text-blue-600">
                  <Mail className="h-4 w-4 mr-2" />
                  rozsa@myprobateca.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Reviews Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600">Real experiences from families we've helped</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map((star) => (
                  <svg key={star} className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "The online dashboard made everything so clear. I always knew exactly what step we were on and what needed to happen next. Rozsa was responsive to all my questions."
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">Maria G.</p>
                <p className="text-sm text-gray-500">Los Angeles County</p>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map((star) => (
                  <svg key={star} className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "As an out-of-state executor, I was worried about handling probate remotely. The flat fee gave me peace of mind and everything was handled professionally."
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">Robert T.</p>
                <p className="text-sm text-gray-500">Orange County (Executor from Texas)</p>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map((star) => (
                  <svg key={star} className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "After my mother passed, I had no idea where to start. The intake process was simple and within days I had all the paperwork ready to file. Highly recommend."
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">Jennifer K.</p>
                <p className="text-sm text-gray-500">San Bernardino County</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Is Probate Required Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Is Probate Required?</h2>
            <p className="text-gray-600">Not sure if you need probate? Here's a quick guide.</p>
          </div>
          <div className="bg-gray-50 rounded-xl shadow-sm p-8 border border-gray-200">
            <p className="text-lg text-gray-700 mb-6">
              When someone passes away in California, their assets may need to go through probate court before they can be transferred to heirs.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Full Probate */}
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-3">Full Probate is typically required when:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Real estate valued over $750,000</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Total personal property exceeds $208,850</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">No living trust in place</span>
                  </li>
                </ul>
              </div>

              {/* Simplified Process */}
              <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                <h3 className="font-bold text-green-800 mb-3">Simplified Process may be available when:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Primary residence valued under $750,000</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Personal property under $208,850</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Effective for deaths on or after April 1, 2025</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                <strong className="text-gray-900">Not sure which applies?</strong> Complete our intake questionnaire and we'll evaluate your situation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
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
          <p className="text-center mt-6">
            <button onClick={() => navigate('/probate-faq-california')} className="text-blue-600 hover:underline font-medium">
              View All 25+ Frequently Asked Questions →
            </button>
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Probate Case?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Complete the free intake questionnaire in about 30 minutes.<br />
            No payment required until you're ready to proceed.
          </p>
          <button
            onClick={handleStartCase}
            className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-flex items-center"
          >
            Start Your Case - Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <p className="text-blue-200 mt-6">
            Questions? Call <a href="tel:+18182916217" className="underline">(818) 291-6217</a> or email{' '}
            <a href="mailto:rozsa@myprobateca.com" className="underline">rozsa@myprobateca.com</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Logo & Description */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <Scale className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-bold">California Probate</span>
              </div>
              <p className="text-gray-400 mb-4 text-sm">
                Professional probate services for California residents. Flat fee pricing with attorney oversight at every step.
              </p>
              <p className="text-gray-500 text-sm">
                Law Offices of Rozsa Gyene<br />
                California State Bar #208356
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href="tel:+18182916217" className="hover:text-white">(818) 291-6217</a>
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href="mailto:rozsa@myprobateca.com" className="hover:text-white">rozsa@myprobateca.com</a>
                </li>
                <li className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1" />
                  <span>655 N Central Ave, Suite 1704<br />Glendale, CA 91203</span>
                </li>
              </ul>
            </div>

            {/* Los Angeles Area Locations */}
            <div>
              <h3 className="font-semibold mb-4">Los Angeles Area</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => navigate('/locations/glendale-probate-attorney')} className="hover:text-white">Glendale</button></li>
                <li><button onClick={() => navigate('/locations/los-angeles-probate-attorney')} className="hover:text-white">Los Angeles</button></li>
                <li><button onClick={() => navigate('/locations/burbank-probate-attorney')} className="hover:text-white">Burbank</button></li>
                <li><button onClick={() => navigate('/locations/pasadena-probate-attorney')} className="hover:text-white">Pasadena</button></li>
                <li><button onClick={() => navigate('/locations/encino-probate-attorney')} className="hover:text-white">Encino</button></li>
                <li><button onClick={() => navigate('/probate-court-locations-california')} className="hover:text-white text-blue-400">View All 35 Cities →</button></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white">How It Works</button></li>
                <li><button onClick={() => scrollToSection('phases')} className="hover:text-white">The 11 Phases</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white">Pricing</button></li>
                <li><button onClick={() => navigate('/probate-faq-california')} className="hover:text-white">Probate FAQ</button></li>
                <li><button onClick={() => navigate('/california-probate-administration')} className="hover:text-white">Probate Guide</button></li>
                <li><button onClick={() => navigate('/learn-california-probate')} className="hover:text-white">Learn Center</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-white">Client Login</button></li>
              </ul>
            </div>

            {/* Related Services & Legal */}
            <div>
              <h3 className="font-semibold mb-4">Related Services</h3>
              <ul className="space-y-2 text-gray-400 text-sm mb-6">
                <li>
                  <a href="https://livingtrustcalifornia.com" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center">
                    Living Trust California
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
                <li>
                  <a href="https://livingtrust-attorneys.com" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center">
                    Living Trust Attorneys
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
              </ul>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => navigate('/terms')} className="hover:text-white">Terms of Service</button></li>
                <li><button onClick={() => navigate('/privacy')} className="hover:text-white">Privacy Policy</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Law Offices of Rozsa Gyene. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white text-sm"
              >
                Verify CA State Bar #208356
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default LandingPage;
