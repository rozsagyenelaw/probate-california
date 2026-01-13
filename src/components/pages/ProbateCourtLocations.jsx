import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { ALL_CITIES, CITIES_BY_REGION, CITY_ITEM_LIST } from '../../data/cityData';
import {
  Scale,
  MapPin,
  ArrowRight,
  Phone,
  Mail,
  Menu,
  X,
  LogIn,
  LogOut,
  LayoutDashboard,
  Shield,
  Building2,
  Check,
  ExternalLink,
  Award
} from 'lucide-react';

const ProbateCourtLocations = () => {
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

  // Schema markup with FAQPage
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "name": "California Probate Service Areas",
        "description": "Attorney-led probate service locations across California",
        "numberOfItems": 35,
        "itemListElement": CITY_ITEM_LIST
      },
      {
        "@type": "LegalService",
        "@id": "https://myprobateca.com/#legalservice",
        "name": "MyProbateCA - California Probate Locations",
        "description": "Professional attorney-led probate administration across 35 California cities. Flat $3,995 fee.",
        "url": "https://myprobateca.com/probate-court-locations-california",
        "telephone": "+1-818-291-6217",
        "priceRange": "$3,995",
        "areaServed": {
          "@type": "State",
          "name": "California"
        },
        "provider": {
          "@type": "Attorney",
          "name": "Rozsa Gyene",
          "identifier": "208356"
        }
      },
      {
        "@type": "BreadcrumbList",
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
            "name": "California Probate Locations",
            "item": "https://myprobateca.com/probate-court-locations-california"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Which court handles probate in California?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "In California, probate cases are handled by the Superior Court in the county where the decedent resided at the time of death. Each county has specific divisions, such as the Central District's Stanley Mosk Courthouse for Los Angeles residents or the Civic Center Courthouse for San Francisco. Filing in the correct venue is mandatory."
            }
          },
          {
            "@type": "Question",
            "name": "Do I have to live in California to start probate for a California resident?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Many out-of-state executors handle California probate remotely. Attorney Rozsa Gyene can appear at court hearings on your behalf at venues like the Stanley Mosk Courthouse for a $500 flat fee."
            }
          },
          {
            "@type": "Question",
            "name": "What if the property is in a different city than where the decedent lived?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You must file in the county of the decedent's residence. Once the court grants your Letters Testamentary or Letters of Administration, you have authority to manage and sell property in any city across California."
            }
          },
          {
            "@type": "Question",
            "name": "Can you help if I already started the case and got stuck with court notes?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. We specialize in reviewing examiner IGN notes and filing the necessary Verified Supplements to clear them. This Note Clearance service is included in the $3,995 flat fee."
            }
          },
          {
            "@type": "Question",
            "name": "How much does probate cost in different California counties?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Court filing fees range from $435-500 depending on county. Our attorney flat fee of $3,995 is the same regardless of which county your case is filed in, covering all 58 California counties."
            }
          }
        ]
      }
    ]
  };

  const regions = [
    { name: 'Los Angeles County', key: 'Los Angeles County' },
    { name: 'San Fernando Valley', key: 'San Fernando Valley' },
    { name: 'Orange County', key: 'Orange County' },
    { name: 'Santa Barbara County', key: 'Santa Barbara County' },
    { name: 'Bay Area', key: 'Bay Area' },
    { name: 'Other Regions', key: 'Other Regions' }
  ];

  return (
    <>
      <Helmet>
        <title>California Probate Court Locations | 35 Service Areas | MyProbateCA</title>
        <meta name="description" content="Probate attorney services across 35 California cities. Los Angeles, San Diego, San Francisco, Orange County & more. Flat $3,995 fee. Bar #208356." />
        <meta name="keywords" content="California probate locations, probate attorney near me, Los Angeles probate, San Diego probate, Orange County probate, Bay Area probate" />
        <link rel="canonical" href="https://myprobateca.com/probate-court-locations-california" />

        <meta property="og:title" content="California Probate Court Locations | 35 Service Areas" />
        <meta property="og:description" content="Attorney-led probate services across 35 California cities. Flat $3,995 fee." />
        <meta property="og:url" content="https://myprobateca.com/probate-court-locations-california" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://myprobateca.com/images/california-probate-locations-og.jpg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="California Probate Locations | 35 Cities" />
        <meta name="twitter:description" content="Attorney-led probate service for all California counties. Same flat $3,995 fee statewide." />

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
                <Link to="/california-probate-administration" className="hover:text-blue-200 transition-colors">
                  Services
                </Link>
                <Link to="/probate-court-locations-california" className="text-amber-400 font-medium">
                  Locations
                </Link>
                <Link to="/probate-faq-california" className="hover:text-blue-200 transition-colors">
                  FAQ
                </Link>
                <Link to="/learn-california-probate" className="text-amber-300 transition-colors">
                  Learn
                </Link>
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
                    <button onClick={handleStartCase} className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg font-semibold transition-colors">
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
                  <Link to="/probate-court-locations-california" className="text-amber-400">Locations</Link>
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
                      <button onClick={handleStartCase} className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg font-semibold text-center">
                        Get Started
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Breadcrumb */}
        <div className="bg-gray-100 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="text-sm text-gray-600">
              <Link to="/" className="hover:text-blue-900">Home</Link>
              <span className="mx-2">&gt;</span>
              <span className="text-gray-900">Probate Court Locations</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-6">
                California Probate Court Locations & Regional Administration Guides
              </h1>
              <p className="text-xl text-blue-100 mb-4">
                Attorney-led probate services across <span className="text-amber-400 font-semibold">35 California cities</span>
              </p>
              <p className="text-lg text-blue-200 mb-8">
                Flat $3,995 fee. All documents prepared. Court appearances available.
              </p>
              <button
                onClick={handleStartCase}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all inline-flex items-center"
              >
                Start Your Case - Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Featured Snippet Section */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
              <h2 className="text-xl font-bold text-blue-900 mb-3">Which court handles probate in California?</h2>
              <p className="text-gray-700">
                In California, probate cases are handled by the Superior Court in the county where the decedent resided at the time of death. Each county has specific divisions, such as the Central District's{' '}
                <a href="https://www.lacourt.org/courthouse/info/smm" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Stanley Mosk Courthouse
                </a>{' '}
                for Los Angeles residents or the Civic Center Courthouse for San Francisco. Filing in the correct venue is mandatory to avoid case dismissal and additional filing fees.
              </p>
            </div>
          </div>
        </section>

        {/* Locations by Region */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Find Your Location
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Select your city to learn about local courthouse procedures and get started
            </p>

            <div className="space-y-12">
              {regions.map((region) => (
                <div key={region.key} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {region.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {CITIES_BY_REGION[region.key]?.map((city) => (
                      <Link
                        key={city.slug}
                        to={`/locations/${city.slug}-probate-attorney`}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                      >
                        <p className="font-medium text-gray-900 group-hover:text-blue-900">
                          {city.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {city.county} County
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Statewide Coverage, Local Expertise
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-6 w-6 text-blue-900" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">58 Counties Covered</h3>
                  <p className="text-gray-600 text-sm">
                    We handle probate filings in every California county courthouse
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Scale className="h-6 w-6 text-blue-900" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Remote Appearances</h3>
                  <p className="text-gray-600 text-sm">
                    Attorney can appear at hearings remotely for $500 add-on
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-6 w-6 text-blue-900" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">IGN Note Clearance</h3>
                  <p className="text-gray-600 text-sm">
                    We monitor court portals and clear examiner notes before hearings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">Do I have to live in California to start probate for a California resident?</h3>
                  <p className="text-gray-600">No. We represent many out-of-state executors. Our app allows you to handle everything remotely, and our attorney handles required court appearances at venues like the Stanley Mosk Courthouse on your behalf for just $500.</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">What if the property is in a different city than where the decedent lived?</h3>
                  <p className="text-gray-600">You must file in the county of the decedent's residence. Once the court grants your Letters Testamentary or Letters of Administration, you have authority to manage and sell property in any city across California.</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">Can you help if I already started the case and got stuck with court notes?</h3>
                  <p className="text-gray-600">Absolutely. This is a common request. We can step in, review the examiner's notes, and file the necessary Supplements to get the judge to sign your order. Our "Note Clearance" service is included in the $3,995 flat fee.</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">How much does probate cost in different California counties?</h3>
                  <p className="text-gray-600">
                    Court filing fees range from $435-500 depending on county. Our attorney flat fee of $3,995 is the same regardless of which county your case is filed in. See the{' '}
                    <a href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=10810" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      California Probate Code §10810
                    </a>{' '}
                    for statutory fee calculations.
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">Which California counties have the longest probate backlogs?</h3>
                  <p className="text-gray-600">Los Angeles County (Stanley Mosk) and San Francisco typically have the longest wait times for hearing dates, often 8-12 weeks. Smaller counties like Santa Barbara or Monterey may schedule hearings within 4-6 weeks.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Learn More Section - Internal Links */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Learn About California Probate</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Link to="/learn-california-probate/california-probate-fees-statutory-vs-flat" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200">
                  <h3 className="font-bold text-lg text-green-600 mb-2">Save $19,000+ on Fees</h3>
                  <p className="text-gray-600 text-sm">Why statutory fees cost $23,000 and how our flat fee saves you money.</p>
                </Link>
                <Link to="/learn-california-probate/clear-ign-notes-stanley-mosk" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200">
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Clear IGN Notes</h3>
                  <p className="text-gray-600 text-sm">The 5-step process to clear examiner notes at Stanley Mosk Courthouse.</p>
                </Link>
                <Link to="/probate-faq-california" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200">
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Probate FAQ</h3>
                  <p className="text-gray-600 text-sm">50+ questions answered by Attorney Rozsa Gyene.</p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Related Services Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Related Services</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <a href="https://livingtrustcalifornia.com/" target="_blank" rel="noopener noreferrer" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200">
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Create a Living Trust — $400</h3>
                  <p className="text-gray-600">Avoid probate entirely with a flat-fee living trust. Prepared and reviewed by a licensed California attorney.</p>
                </a>
                <a href="https://livingtrust-attorneys.com/" target="_blank" rel="noopener noreferrer" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200">
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Full-Service Estate Planning</h3>
                  <p className="text-gray-600">Comprehensive attorney consultation for complex estates, trust administration, and advanced planning strategies.</p>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Attorney Credentials */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Rozsa Gyene, Esq.</h2>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  California State Bar #208356
                </li>
                <li className="flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  25+ Years Experience
                </li>
                <li className="flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  500+ Probate Cases Completed
                </li>
              </ul>
              <a
                href="https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                Verify Attorney License
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
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
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all inline-flex items-center"
              >
                Start Your Case - Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Column 1: Services */}
              <div>
                <h4 className="font-bold text-lg mb-4">Services</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                  <li><Link to="/california-probate-administration" className="hover:text-white transition">Probate Administration</Link></li>
                  <li><Link to="/probate-faq-california" className="hover:text-white transition">Probate FAQ</Link></li>
                  <li><Link to="/learn-california-probate" className="hover:text-white transition">Learn Center</Link></li>
                  <li><Link to="/register" className="hover:text-white transition">Start Your Case</Link></li>
                </ul>
              </div>

              {/* Column 2: Los Angeles Area */}
              <div>
                <h4 className="font-bold text-lg mb-4">Los Angeles Area</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/locations/los-angeles-probate-attorney" className="hover:text-white transition">Los Angeles</Link></li>
                  <li><Link to="/locations/glendale-probate-attorney" className="hover:text-white transition">Glendale</Link></li>
                  <li><Link to="/locations/burbank-probate-attorney" className="hover:text-white transition">Burbank</Link></li>
                  <li><Link to="/locations/pasadena-probate-attorney" className="hover:text-white transition">Pasadena</Link></li>
                  <li><Link to="/locations/santa-monica-probate-attorney" className="hover:text-white transition">Santa Monica</Link></li>
                  <li><Link to="/locations/calabasas-probate-attorney" className="hover:text-white transition">Calabasas</Link></li>
                  <li><Link to="/locations/long-beach-probate-attorney" className="hover:text-white transition">Long Beach</Link></li>
                </ul>
              </div>

              {/* Column 3: California Regions */}
              <div>
                <h4 className="font-bold text-lg mb-4">California Regions</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/locations/san-diego-probate-attorney" className="hover:text-white transition">San Diego</Link></li>
                  <li><Link to="/locations/san-francisco-probate-attorney" className="hover:text-white transition">San Francisco</Link></li>
                  <li><Link to="/locations/san-jose-probate-attorney" className="hover:text-white transition">San Jose</Link></li>
                  <li><Link to="/locations/sacramento-probate-attorney" className="hover:text-white transition">Sacramento</Link></li>
                  <li><Link to="/locations/santa-barbara-probate-attorney" className="hover:text-white transition">Santa Barbara</Link></li>
                  <li><Link to="/locations/irvine-probate-attorney" className="hover:text-white transition">Irvine</Link></li>
                  <li><Link to="/probate-court-locations-california" className="hover:text-white transition font-medium text-amber-400">View All 35 Locations</Link></li>
                </ul>
              </div>

              {/* Column 4: Related & Legal */}
              <div>
                <h4 className="font-bold text-lg mb-4">Related Services</h4>
                <ul className="space-y-2 text-gray-400 mb-6">
                  <li><a href="https://livingtrustcalifornia.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Living Trust California ($400)</a></li>
                  <li><a href="https://livingtrust-attorneys.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Full-Service Estate Planning</a></li>
                </ul>
                <h4 className="font-bold text-lg mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                  <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p className="mb-2">Law Offices of Rozsa Gyene | California State Bar #208356</p>
              <p className="mb-2">
                <a href="tel:8182916217" className="hover:text-white">(818) 291-6217</a>
                {' | '}
                <a href="mailto:rozsagyenelaw@yahoo.com" className="hover:text-white">rozsagyenelaw@yahoo.com</a>
              </p>
              <p className="text-sm">&copy; {new Date().getFullYear()} MyProbateCA. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ProbateCourtLocations;
