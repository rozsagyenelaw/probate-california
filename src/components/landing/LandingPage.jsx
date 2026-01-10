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
  X
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      a: 'Court filing fees (approximately $500) and newspaper publication costs (approximately $200) are paid directly to third parties. Our $3,995 covers all our professional services, form preparation, and attorney oversight.'
    },
    {
      q: 'What if the estate is small?',
      a: 'Estates under $184,500 (2024 threshold) may qualify for simplified "small estate" procedures that avoid formal probate. We\'ll assess this during intake and recommend the most efficient path.'
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
              <button
                onClick={handleStartCase}
                className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800 font-medium transition-colors"
              >
                Start Your Case
              </button>
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
                <button
                  onClick={handleStartCase}
                  className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800 font-medium w-full"
                >
                  Start Your Case
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              California Probate Made Simple
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Complete your loved one's probate case for a flat fee of $3,995.<br className="hidden md:block" />
              Attorney-guided, step-by-step process through all 11 phases.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10">
              <div className="flex items-center bg-blue-800/50 px-4 py-2 rounded-full">
                <Shield className="h-5 w-5 mr-2 text-blue-300" />
                <span className="text-sm font-medium">CA Bar #208356</span>
              </div>
              <div className="flex items-center bg-blue-800/50 px-4 py-2 rounded-full">
                <Award className="h-5 w-5 mr-2 text-blue-300" />
                <span className="text-sm font-medium">25+ Years Experience</span>
              </div>
              <div className="flex items-center bg-blue-800/50 px-4 py-2 rounded-full">
                <Users className="h-5 w-5 mr-2 text-blue-300" />
                <span className="text-sm font-medium">500+ Cases Completed</span>
              </div>
              <div className="flex items-center bg-blue-800/50 px-4 py-2 rounded-full">
                <DollarSign className="h-5 w-5 mr-2 text-blue-300" />
                <span className="text-sm font-medium">Flat Fee - No Surprises</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartCase}
                className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
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
      </section>

      {/* Is Probate Required Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Is Probate Required?</h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8">
            <p className="text-lg text-gray-700 mb-6">
              When someone passes away in California, their assets may need to go through probate court before they can be transferred to heirs. Probate is typically required when:
            </p>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start">
                <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                  <Check className="h-4 w-4 text-blue-900" />
                </div>
                <span className="text-gray-700">The deceased owned real estate in their name alone</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                  <Check className="h-4 w-4 text-blue-900" />
                </div>
                <span className="text-gray-700">Total assets exceed $184,500 (2024 threshold)</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                  <Check className="h-4 w-4 text-blue-900" />
                </div>
                <span className="text-gray-700">There's no living trust in place</span>
              </li>
            </ul>
            <p className="text-gray-600 border-t pt-6">
              <strong className="text-gray-900">Our service guides you through the entire process with attorney oversight at every step.</strong> Complete the intake questionnaire to find out if probate is needed for your situation.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to start your probate case</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-xl shadow-sm p-8 border-t-4 border-blue-900">
              <div className="bg-blue-900 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Intake</h3>
              <p className="text-gray-600 mb-4">
                Answer questions about the deceased, their assets, and heirs. We'll determine if probate is needed and which forms are required.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                About 30 minutes
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl shadow-sm p-8 border-t-4 border-blue-900">
              <div className="bg-blue-900 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">We Prepare Everything</h3>
              <p className="text-gray-600 mb-4">
                Our system generates all required court forms, petitions, and notices. Attorney reviews before each filing.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <FileText className="h-4 w-4 mr-2" />
                All forms included
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl shadow-sm p-8 border-t-4 border-blue-900">
              <div className="bg-blue-900 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Follow the Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Track your case through all 11 phases. Upload documents, get reminders, and see exactly what's needed next.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 mr-2" />
                Step-by-step guidance
              </div>
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

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Our Flat Fee Makes Sense</h2>
            <p className="text-xl text-gray-600">Compare your options</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* DIY Option */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">DIY (Forms Yourself)</h3>
              <p className="text-3xl font-bold text-gray-900 mb-4">$500-1,000<span className="text-lg font-normal text-gray-500"> in fees</span></p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <span>High risk of errors</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <span>Rejected filings delay case</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <span>No professional guidance</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <span>Miss deadlines = penalties</span>
                </li>
              </ul>
            </div>

            {/* Attorney Option */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hire a Probate Attorney</h3>
              <p className="text-3xl font-bold text-gray-900 mb-4">$8,000-15,000<span className="text-lg font-normal text-gray-500">+</span></p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Full professional service</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                  <span>Hourly billing adds up</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                  <span>Final cost unpredictable</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                  <span>May charge % of estate</span>
                </li>
              </ul>
            </div>

            {/* Our Option */}
            <div className="bg-blue-900 rounded-xl shadow-lg p-6 text-white relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white text-sm font-bold px-4 py-1 rounded-full">BEST VALUE</span>
              </div>
              <h3 className="text-lg font-bold mb-2 mt-2">California Probate (Us)</h3>
              <p className="text-3xl font-bold mb-4">$3,995<span className="text-lg font-normal text-blue-200"> flat fee</span></p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                  <span>Attorney-guided process</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                  <span>All forms prepared</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                  <span>Dashboard tracking</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                  <span>No surprise fees</span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-8">
            <strong>Note:</strong> Court filing fees (~$500) and publication costs (~$200) are additional and paid directly to third parties.
          </p>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What's Included</h2>
            <p className="text-xl text-gray-600">Everything you need for $3,995</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Complete case management dashboard',
              'All required court forms prepared (Petition, Inventory, Accounting, etc.)',
              'Step-by-step guidance through all 11 phases',
              'Newspaper publication coordination',
              'Document upload & secure storage',
              'Attorney review at key milestones',
              'Deadline tracking & reminders',
              'Heir notification letters',
              'Final distribution documents',
              'Unlimited email support'
            ].map((item, index) => (
              <div key={index} className="flex items-start bg-white p-4 rounded-lg shadow-sm">
                <div className="bg-green-100 rounded-full p-1 mr-3 mt-0.5">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
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
