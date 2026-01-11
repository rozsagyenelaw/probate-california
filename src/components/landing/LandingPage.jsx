import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  LayoutDashboard
} from 'lucide-react';

const LandingPage = () => {
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
    }
  ];

  return (
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
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
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
            backgroundImage: 'url(/lady-justice.jpg)',
            filter: 'brightness(0.85)'
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-900/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            {/* Glassmorphic Box */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 md:p-10 shadow-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                California Probate Made Simple
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                Every form prepared by a licensed California <strong className="text-white">attorney</strong>. Every filing reviewed before submission.
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white mb-8">
                Flat fee of $3,995 — no percentage of estate, no hourly billing, no surprises.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Shield className="h-4 w-4 mr-2 text-white" />
                  <span className="text-sm font-medium text-white">CA Bar #208356</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Award className="h-4 w-4 mr-2 text-white" />
                  <span className="text-sm font-medium text-white">25+ Years Experience</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Users className="h-4 w-4 mr-2 text-white" />
                  <span className="text-sm font-medium text-white">500+ Cases Completed</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <DollarSign className="h-4 w-4 mr-2 text-white" />
                  <span className="text-sm font-medium text-white">Flat Fee - No Surprises</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleStartCase}
                  className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors flex items-center justify-center shadow-lg"
                >
                  Start Your Probate Case
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
                >
                  See How It Works
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {/* 5000+ Families */}
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <Users className="h-8 w-8 mx-auto mb-3 text-amber-700" />
              <p className="font-bold text-gray-900">5000+ Families Served</p>
              <p className="text-sm text-gray-500">Since 2001</p>
            </div>

            {/* CA State Bar */}
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <Award className="h-8 w-8 mx-auto mb-3 text-amber-700" />
              <p className="font-bold text-gray-900">California State Bar #208356</p>
              <a
                href="https://www.calbar.ca.gov/Attorneys/Find-Lawyer/Member-Profile?memberId=208356"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-blue-600 flex items-center justify-center"
              >
                Licensed & Verified
                <svg className="h-3 w-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* A+ Rated */}
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <svg className="h-8 w-8 mx-auto mb-3 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <p className="font-bold text-gray-900">A+ Rated</p>
              <p className="text-sm text-gray-500">Better Business Bureau</p>
            </div>

            {/* 25+ Years */}
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <svg className="h-8 w-8 mx-auto mb-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <p className="font-bold text-gray-900">25+ Years Experience</p>
              <p className="text-sm text-gray-500">Estate Planning Experts</p>
            </div>

            {/* 100% Confidential */}
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <Shield className="h-8 w-8 mx-auto mb-3 text-amber-700" />
              <p className="font-bold text-gray-900">100% Confidential</p>
              <p className="text-sm text-gray-500">Attorney-Client Privilege</p>
            </div>
          </div>
        </div>
      </section>

      {/* Is Probate Required Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Is Probate Required?</h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8">
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

            <div className="text-center pt-4 border-t">
              <p className="text-gray-600 mb-4">
                <strong className="text-gray-900">Not sure which applies?</strong> Complete our intake questionnaire and we'll evaluate your situation.
              </p>
            </div>
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
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Simplified Probate */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200">
              <div className="bg-green-600 text-white p-4 text-center">
                <h3 className="text-xl font-bold">SIMPLIFIED PROBATE</h3>
                <p className="text-green-100 text-sm">For primary residences under $750,000</p>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-gray-900">$2,495</p>
                  <p className="text-gray-500">flat fee</p>
                  <p className="text-sm text-green-600 mt-1">or 3 payments of $832 — no extra charge</p>
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

                <div className="mb-6">
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
                  Start Simplified Process
                </button>
              </div>
            </div>

            {/* Full Probate */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-blue-900 relative mt-4">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">MOST COMMON</span>
              </div>
              <div className="bg-blue-900 text-white p-4 pt-5 text-center">
                <h3 className="text-xl font-bold">FULL PROBATE</h3>
                <p className="text-blue-200 text-sm">For estates over $750,000 or complex situations</p>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-gray-900">$3,995</p>
                  <p className="text-gray-500">flat fee</p>
                  <p className="text-sm text-blue-600 mt-1">or 3 payments of $1,332 — no extra charge</p>
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

                <div className="mb-6">
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
                  Start Full Probate
                </button>
              </div>
            </div>
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
              Get Started — We'll Help You Decide
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

      {/* Trust Signals Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 bg-blue-900 p-8 flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 bg-blue-800 rounded-full flex items-center justify-center mb-4">
                  <Scale className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Rozsa Gyene, Esq.</h3>
                <p className="text-blue-200 mt-1">California State Bar #208356</p>
                <p className="text-blue-300 text-sm mt-2">25+ years in estate & probate law</p>
              </div>
              <div className="md:w-2/3 p-8">
                <blockquote className="text-xl text-gray-700 italic mb-6">
                  "Probate doesn't have to be overwhelming. Our system breaks it into manageable steps so you always know exactly what to do next. I've helped hundreds of families through this process, and I've designed this service to give you professional guidance at a price that makes sense."
                </blockquote>
                <p className="text-gray-600">
                  Practicing estate and probate law for over 25 years in Los Angeles County. Our office has successfully completed over 500 probate cases.
                </p>
              </div>
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Probate Case?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Complete the intake questionnaire in about 30 minutes.<br />
            No payment required until you're ready to proceed.
          </p>
          <button
            onClick={handleStartCase}
            className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-flex items-center"
          >
            Start Your Case Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <p className="text-blue-200 mt-6">
            Questions? Call <a href="tel:+18182916217" className="underline">(818) 291-6217</a> or email{' '}
            <a href="mailto:rozsagyenelaw@yahoo.com" className="underline">rozsagyenelaw@yahoo.com</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Scale className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-bold">California Probate</span>
              </div>
              <p className="text-gray-400 mb-4">
                Professional probate services for California residents. Flat fee pricing with attorney oversight at every step.
              </p>
              <p className="text-gray-500 text-sm">
                Law Offices of Rozsa Gyene<br />
                California State Bar #208356
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href="tel:+18182916217" className="hover:text-white">(818) 291-6217</a>
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href="mailto:rozsagyenelaw@yahoo.com" className="hover:text-white">rozsagyenelaw@yahoo.com</a>
                </li>
                <li className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1" />
                  <span>Los Angeles, California</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white">How It Works</button></li>
                <li><button onClick={() => scrollToSection('phases')} className="hover:text-white">The 11 Phases</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white">Pricing</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-white">FAQ</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-white">Client Login</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Law Offices of Rozsa Gyene. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-white text-sm">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
