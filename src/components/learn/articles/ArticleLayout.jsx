import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
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
  ArrowLeft,
  ExternalLink,
  Award,
  Clock,
  Calendar
} from 'lucide-react';

const ArticleLayout = ({
  title,
  metaDescription,
  canonicalUrl,
  publishDate,
  readTime,
  category,
  schemaMarkup,
  children,
  relatedArticles = []
}) => {
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

  return (
    <>
      <Helmet>
        <title>{title} | MyProbateCA</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />

        {schemaMarkup && (
          <script type="application/ld+json">
            {JSON.stringify(schemaMarkup)}
          </script>
        )}
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
          <div className="max-w-4xl mx-auto px-4">
            <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
              <ol className="flex items-center space-x-2">
                <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
                <li><span className="mx-2">&gt;</span></li>
                <li><Link to="/learn-california-probate" className="hover:text-blue-600">Learn</Link></li>
                <li><span className="mx-2">&gt;</span></li>
                <li className="text-gray-900 font-medium truncate max-w-xs">{title}</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          {/* Article Header */}
          <header className="mb-8">
            <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full mb-4">{category}</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4">
              <span className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                By Rozsa Gyene, Esq.
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {publishDate}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {readTime} min read
              </span>
            </div>
          </header>

          {/* Article Body */}
          <div className="prose prose-lg max-w-none">
            {children}
          </div>

          {/* Author Bio */}
          <div className="bg-gray-50 p-6 rounded-lg mt-12">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex-shrink-0 flex items-center justify-center">
                <Award className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Rozsa Gyene, Esq.</p>
                <p className="text-sm text-gray-600 mb-2">California State Bar #208356 • 25+ Years Experience</p>
                <p className="text-sm text-gray-700">Rozsa Gyene specializes in California probate administration, with extensive experience at the Stanley Mosk Courthouse in Los Angeles.</p>
                <a
                  href="https://apps.calbar.ca.gov/attorney/Licensee/Detail/208356"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-indigo-600 hover:underline mt-2"
                >
                  Verify License <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-lg mt-8 text-center">
            <h3 className="text-xl font-bold mb-2">Need Help With Your Probate Case?</h3>
            <p className="text-green-100 mb-4">Get attorney oversight for a flat $3,995 fee—save $19,000+ compared to statutory fees.</p>
            <button onClick={handleStartCase} className="bg-white text-green-700 px-6 py-3 rounded-lg font-bold hover:bg-green-50 transition">
              Check My Eligibility - Free
            </button>
          </div>

          {/* Quick Service Links - Internal Linking Hierarchy */}
          <div className="mt-12 bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Explore Our Probate Services</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <Link to="/california-probate-administration" className="text-blue-700 hover:text-blue-900 hover:underline">
                → How Our Process Works
              </Link>
              <Link to="/probate-faq-california" className="text-blue-700 hover:text-blue-900 hover:underline">
                → Probate FAQ (50+ Questions)
              </Link>
              <Link to="/probate-court-locations-california" className="text-blue-700 hover:text-blue-900 hover:underline">
                → 35 California Locations
              </Link>
              <Link to="/locations/los-angeles-probate-attorney" className="text-blue-700 hover:text-blue-900 hover:underline">
                → Los Angeles Probate
              </Link>
              <Link to="/locations/san-francisco-probate-attorney" className="text-blue-700 hover:text-blue-900 hover:underline">
                → San Francisco Probate
              </Link>
              <Link to="/locations/san-diego-probate-attorney" className="text-blue-700 hover:text-blue-900 hover:underline">
                → San Diego Probate
              </Link>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {relatedArticles.map((article, index) => (
                  <Link
                    key={index}
                    to={article.url}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <span className="text-xs text-gray-500 uppercase">{article.category}</span>
                    <h4 className="font-bold text-gray-900 mt-1 hover:text-indigo-600">{article.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to Learning Center */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link to="/learn-california-probate" className="inline-flex items-center text-indigo-600 hover:underline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learning Center
            </Link>
          </div>
        </article>

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
                  <li><Link to="/probate-faq-california" className="hover:text-white">FAQ</Link></li>
                  <li><Link to="/learn-california-probate" className="hover:text-white">Learning Center</Link></li>
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
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} Law Offices of Rozsa Gyene. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ArticleLayout;
