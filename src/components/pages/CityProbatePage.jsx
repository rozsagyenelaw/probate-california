import React, { useState } from 'react';
import { useNavigate, Link, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { getCityBySlug, calculateStatutoryFee, CITY_DATA } from '../../data/cityData';
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
  Award,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Clock,
  FileText,
  Users,
  Home
} from 'lucide-react';

const CityProbatePage = () => {
  const { citySlug } = useParams();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Remove "-probate-attorney" suffix to get the city slug
  const cleanSlug = citySlug?.replace('-probate-attorney', '') || '';
  const city = getCityBySlug(cleanSlug);

  // Redirect if city not found
  if (!city) {
    return <Navigate to="/probate-court-locations-california" replace />;
  }

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

  // Calculate estate example
  const homeValue = city.medianHomeValue;
  const bankAccounts = 50000;
  const investments = 100000;
  const totalEstate = homeValue + bankAccounts + investments;
  const statutoryFee = calculateStatutoryFee(totalEstate);
  const savings = statutoryFee - 3995;

  // FAQs specific to this city
  const faqs = [
    {
      q: `Where do ${city.name} probate cases get filed?`,
      a: `${city.name} probate cases are filed at the ${city.courthouse} at ${city.courthouseAddress}${city.district ? `. This is the ${city.county} County Superior Court ${city.district}.` : '.'}`
    },
    {
      q: `How long does probate take in ${city.name}?`,
      a: `Most ${city.name} probate cases take 9-18 months. The ${city.courthouse} typically schedules initial hearings within ${city.waitTime} weeks of filing.`
    },
    {
      q: `How much does probate cost in ${city.name}?`,
      a: `Our flat fee is $3,995 for full probate or $2,495 for simplified. Court filing fees (~$435-500), publication (~$200-300), and probate referee fees (0.1% of assets) are separate.`
    },
    {
      q: `Do I need probate if I own a home in ${city.name}?`,
      a: `With ${city.name}'s median home price of ${city.medianHome}, most estates require full probate unless the property was held in a living trust, joint tenancy, or has a transfer-on-death deed.`
    },
    {
      q: `Can you appear in court for me in ${city.name}?`,
      a: `Yes. Attorney Rozsa Gyene can appear remotely at ${city.courthouse} hearings for $500. Most ${city.county} County probate hearings allow remote appearances.`
    }
  ];

  // Schema markup
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://myprobateca.com/" },
          { "@type": "ListItem", "position": 2, "name": "Locations", "item": "https://myprobateca.com/probate-court-locations-california/" },
          { "@type": "ListItem", "position": 3, "name": `${city.name} Probate Attorney`, "item": `https://myprobateca.com/locations/${city.slug}-probate-attorney/` }
        ]
      },
      {
        "@type": "LegalService",
        "name": `${city.name} Probate Attorney - MyProbateCA`,
        "description": `Attorney-led probate administration for ${city.name}, ${city.county} County residents. Flat $3,995 fee includes all 11 phases of probate.`,
        "url": `https://myprobateca.com/locations/${city.slug}-probate-attorney/`,
        "telephone": "+1-818-291-6217",
        "priceRange": "$3,995",
        "areaServed": {
          "@type": "City",
          "name": city.name,
          "containedInPlace": {
            "@type": "State",
            "name": "California"
          }
        },
        "provider": {
          "@type": "Person",
          "name": "Rozsa Gyene",
          "jobTitle": "Probate Attorney",
          "identifier": "208356"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{city.name} Probate Attorney | Flat Fee $3,995 | MyProbateCA</title>
        <meta name="description" content={`${city.name} probate attorney services. Flat $3,995 fee includes all 11 phases. Cases filed at ${city.courthouse}. Bar #208356. Save $10,000+ vs statutory fees.`} />
        <link rel="canonical" href={`https://myprobateca.com/locations/${city.slug}-probate-attorney/`} />

        <meta property="og:title" content={`${city.name} Probate Attorney | Flat Fee $3,995`} />
        <meta property="og:description" content={`Attorney-led probate for ${city.name} residents. All documents prepared, court appearances available. Flat $3,995.`} />
        <meta property="og:url" content={`https://myprobateca.com/locations/${city.slug}-probate-attorney/`} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${city.name} Probate Attorney | Flat Fee $3,995`} />

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

        {/* Breadcrumb */}
        <div className="bg-gray-100 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="text-sm text-gray-600">
              <Link to="/" className="hover:text-blue-900">Home</Link>
              <span className="mx-2">&gt;</span>
              <Link to="/probate-court-locations-california" className="hover:text-blue-900">Locations</Link>
              <span className="mx-2">&gt;</span>
              <span className="text-gray-900">{city.name} Probate Attorney</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-6">
                {city.name} Probate Attorney | Flat Fee Probate Administration
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Licensed California attorney handles {city.name} probate cases for a flat $3,995.
                All documents prepared. Court appearances available. Save $10,000+ vs statutory fees.
              </p>
              <button
                onClick={handleStartCase}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all inline-flex items-center"
              >
                Check My Eligibility - Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Local Courthouse Info */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Where {city.name} Probate Cases Are Filed
              </h2>
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="flex items-start">
                  <Building2 className="h-8 w-8 text-blue-900 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{city.courthouse}</h3>
                    <p className="text-gray-600 mb-2">{city.courthouseAddress}</p>
                    <p className="text-gray-600">{city.county} County Superior Court{city.district && ` - ${city.district}`}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-blue-900 mr-2" />
                    <span className="font-semibold text-gray-900">Filing Fee</span>
                  </div>
                  <p className="text-gray-600">~$435-500</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-blue-900 mr-2" />
                    <span className="font-semibold text-gray-900">Wait for Hearing</span>
                  </div>
                  <p className="text-gray-600">{city.waitTime} weeks</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-blue-900 mr-2" />
                    <span className="font-semibold text-gray-900">IGN Notes Posted</span>
                  </div>
                  <p className="text-gray-600">5-10 days before hearing</p>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                <p className="text-gray-800">
                  We monitor the {city.courthouse} portal for examiner notes and file Verified Supplements
                  to clear any deficiencies before your hearing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Local Market Context */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Probate Thresholds & {city.name} Real Estate
              </h2>
              <p className="text-gray-600 mb-8">
                With {city.name}'s median home price of <span className="font-bold text-blue-900">{city.medianHome}</span>,
                most estates will exceed California's simplified probate threshold.
              </p>

              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h3 className="font-bold text-lg text-gray-900 mb-4">California Probate Thresholds (2025)</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span><strong>Simplified Probate:</strong> Primary residence under $750,000 + personal property under $208,850</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span><strong>Full Probate:</strong> All other estates</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="bg-blue-900 text-white p-4">
                  <h3 className="font-bold text-lg">{city.name} Estate Example</h3>
                </div>
                <div className="p-6">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">{city.name} Home</td>
                        <td className="py-2 text-right font-medium">{city.medianHome}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Bank Accounts</td>
                        <td className="py-2 text-right font-medium">$50,000</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Investments</td>
                        <td className="py-2 text-right font-medium">$100,000</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="py-2 font-bold text-gray-900">Total Estate</td>
                        <td className="py-2 text-right font-bold text-gray-900">${totalEstate.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fee Comparison Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="bg-gray-800 text-white p-4">
                  <h3 className="font-bold text-lg text-center">Fee Comparison: Traditional vs MyProbateCA</h3>
                </div>
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2">
                        <th className="py-2 text-left text-gray-600">Fee Type</th>
                        <th className="py-2 text-center text-gray-600">Traditional Attorney</th>
                        <th className="py-2 text-center text-blue-900 font-bold">MyProbateCA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 text-gray-600">Attorney Fee</td>
                        <td className="py-3 text-center text-red-600 font-bold">$23,000</td>
                        <td className="py-3 text-center text-green-600 font-bold">$3,995</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 text-gray-600">Executor Fee (if waived)</td>
                        <td className="py-3 text-center text-gray-500">$0 (typically waived)</td>
                        <td className="py-3 text-center text-gray-500">$0</td>
                      </tr>
                      <tr className="bg-amber-50">
                        <td className="py-3 font-bold text-gray-900">Total Attorney Cost</td>
                        <td className="py-3 text-center">
                          <span className="text-red-600 font-bold text-xl line-through">$23,000</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="text-green-600 font-bold text-xl">$3,995</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                  <p className="text-sm text-red-600 mb-1">Statutory Attorney Fee</p>
                  <p className="text-xl font-bold text-red-500 line-through">$23,000</p>
                  <p className="text-xs text-gray-500 mt-1">(Based on $1M estate)</p>
                </div>
                <div className="bg-blue-900 text-white rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-200 mb-1">Our Flat Fee</p>
                  <p className="text-xl font-bold">$3,995</p>
                  <p className="text-xs text-blue-200 mt-1">Same quality, fixed price</p>
                </div>
                <div className="bg-green-100 rounded-lg p-4 text-center border border-green-200">
                  <p className="text-sm text-green-600 mb-1">You Save</p>
                  <p className="text-xl font-bold text-green-700">$19,005+</p>
                  <p className="text-xs text-gray-500 mt-1">83% less than statutory</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us for This City */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {city.name} Probate Expertise
              </h2>
              <p className="text-gray-600 mb-6">
                {city.localHook}. With property values in {city.name} typically at {city.medianHome} and above,
                most estates require full probate administration. Our flat-fee service provides the same
                quality representation as traditional law firms at a fraction of the cost.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Our {city.name} service includes:</h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Attorney prepares all 11 phases of documents
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Coordination with {city.county} County Probate Referee
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Publication in {city.county} County newspapers
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    IGN note clearance at {city.courthouse}
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Remote court appearances ($500 add-on)
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Dashboard tracking until case closes
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby Areas */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Also Serving {city.nearby.slice(0, 3).join(', ')}
              </h2>
              <p className="text-gray-600 mb-8">
                We handle probate cases throughout {city.county} County, including:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {city.nearbySlug.map((slug) => {
                  const nearbyCity = CITY_DATA[slug];
                  if (!nearbyCity) return null;
                  return (
                    <Link
                      key={slug}
                      to={`/locations/${slug}-probate-attorney`}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <p className="font-medium text-gray-900">{nearbyCity.name}</p>
                      <p className="text-sm text-gray-500">{nearbyCity.county} County</p>
                    </Link>
                  );
                })}
              </div>
              <p className="text-gray-600 mt-6">
                All {city.county} County cases are filed at the same courthouse, so our expertise transfers seamlessly across the region.
              </p>
            </div>
          </div>
        </section>

        {/* Local FAQ */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                {city.name} Probate FAQ
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-100"
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

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Start Your {city.name} Probate Case</h2>
              <p className="text-blue-100 text-lg mb-8">
                Complete the free intake questionnaire in about 30 minutes. We'll evaluate whether you
                qualify for simplified probate ($2,495) or need full administration ($3,995).
              </p>
              <button
                onClick={handleStartCase}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all inline-flex items-center"
              >
                Check My Eligibility - Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Credentials */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-blue-900" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Rozsa Gyene, Esq.</h3>
              <ul className="flex flex-wrap justify-center gap-4 text-gray-600 mb-4">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-1" />
                  California State Bar #208356
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-1" />
                  25+ Years Experience
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-1" />
                  500+ Cases
                </li>
              </ul>
              <a
                href="https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                Verify License <ExternalLink className="h-4 w-4 ml-1" />
              </a>
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
                  <li><Link to="/california-probate-administration" className="hover:text-white">Full Probate</Link></li>
                  <li><Link to="/" className="hover:text-white">Simplified Probate</Link></li>
                  <li><Link to="/probate-court-locations-california" className="hover:text-white">All Locations</Link></li>
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

export default CityProbatePage;
