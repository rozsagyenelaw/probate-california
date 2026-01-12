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

  // Schema markup
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
        "telephone": "+1-818-334-2021",
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

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="California Probate Locations | 35 Cities" />

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
              <span className="text-gray-900">California Probate Locations</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-6">
                California Probate Court Locations
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
                Check My Eligibility - Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Locations by Region */}
        <section className="py-16 bg-white">
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
                Check My Eligibility - Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Footer with Service Areas */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-8">
              <h4 className="font-semibold text-white mb-6 text-lg">Service Areas</h4>
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
                <div>
                  <p className="font-medium text-white mb-2">Los Angeles County</p>
                  <ul className="space-y-1 text-sm">
                    <li><Link to="/locations/los-angeles-probate-attorney" className="hover:text-white">Los Angeles</Link></li>
                    <li><Link to="/locations/glendale-probate-attorney" className="hover:text-white">Glendale</Link></li>
                    <li><Link to="/locations/burbank-probate-attorney" className="hover:text-white">Burbank</Link></li>
                    <li><Link to="/locations/pasadena-probate-attorney" className="hover:text-white">Pasadena</Link></li>
                    <li><Link to="/locations/santa-monica-probate-attorney" className="hover:text-white">Santa Monica</Link></li>
                    <li><Link to="/locations/long-beach-probate-attorney" className="hover:text-white">Long Beach</Link></li>
                    <li><Link to="/locations/santa-clarita-probate-attorney" className="hover:text-white">Santa Clarita</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-white mb-2">San Fernando Valley</p>
                  <ul className="space-y-1 text-sm">
                    <li><Link to="/locations/encino-probate-attorney" className="hover:text-white">Encino</Link></li>
                    <li><Link to="/locations/sherman-oaks-probate-attorney" className="hover:text-white">Sherman Oaks</Link></li>
                    <li><Link to="/locations/woodland-hills-probate-attorney" className="hover:text-white">Woodland Hills</Link></li>
                    <li><Link to="/locations/tarzana-probate-attorney" className="hover:text-white">Tarzana</Link></li>
                    <li><Link to="/locations/calabasas-probate-attorney" className="hover:text-white">Calabasas</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-white mb-2">Orange County</p>
                  <ul className="space-y-1 text-sm">
                    <li><Link to="/locations/anaheim-probate-attorney" className="hover:text-white">Anaheim</Link></li>
                    <li><Link to="/locations/irvine-probate-attorney" className="hover:text-white">Irvine</Link></li>
                    <li><Link to="/locations/newport-beach-probate-attorney" className="hover:text-white">Newport Beach</Link></li>
                    <li><Link to="/locations/huntington-beach-probate-attorney" className="hover:text-white">Huntington Beach</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-white mb-2">Santa Barbara County</p>
                  <ul className="space-y-1 text-sm">
                    <li><Link to="/locations/santa-barbara-probate-attorney" className="hover:text-white">Santa Barbara</Link></li>
                    <li><Link to="/locations/montecito-probate-attorney" className="hover:text-white">Montecito</Link></li>
                    <li><Link to="/locations/goleta-probate-attorney" className="hover:text-white">Goleta</Link></li>
                    <li><Link to="/locations/carpinteria-probate-attorney" className="hover:text-white">Carpinteria</Link></li>
                    <li><Link to="/locations/isla-vista-probate-attorney" className="hover:text-white">Isla Vista</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-white mb-2">Bay Area</p>
                  <ul className="space-y-1 text-sm">
                    <li><Link to="/locations/san-francisco-probate-attorney" className="hover:text-white">San Francisco</Link></li>
                    <li><Link to="/locations/san-jose-probate-attorney" className="hover:text-white">San Jose</Link></li>
                    <li><Link to="/locations/oakland-probate-attorney" className="hover:text-white">Oakland</Link></li>
                    <li><Link to="/locations/fremont-probate-attorney" className="hover:text-white">Fremont</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-white mb-2">Other Regions</p>
                  <ul className="space-y-1 text-sm">
                    <li><Link to="/locations/san-diego-probate-attorney" className="hover:text-white">San Diego</Link></li>
                    <li><Link to="/locations/sacramento-probate-attorney" className="hover:text-white">Sacramento</Link></li>
                    <li><Link to="/locations/riverside-probate-attorney" className="hover:text-white">Riverside</Link></li>
                    <li><Link to="/locations/fresno-probate-attorney" className="hover:text-white">Fresno</Link></li>
                    <li><Link to="/locations/bakersfield-probate-attorney" className="hover:text-white">Bakersfield</Link></li>
                    <li><Link to="/probate-court-locations-california" className="text-amber-400 hover:text-amber-300">View All 35 Locations</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8">
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
                    <li><Link to="/" className="hover:text-white">Simplified Probate</Link></li>
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
                      (818) 334-2021
                    </li>
                    <li className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      admin@myprobateca.com
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
          </div>
        </footer>
      </div>
    </>
  );
};

export default ProbateCourtLocations;
