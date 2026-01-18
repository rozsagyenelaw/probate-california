import React from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';

// Blog articles data
const ARTICLES = [
  {
    id: 1,
    slug: 'clear-ign-notes-stanley-mosk',
    title: 'How to Clear IGN Notes at Stanley Mosk Courthouse',
    description: 'The 5-step process for clearing probate examiner notes before your hearing—and avoiding 3-month continuances.',
    category: 'Court Procedures',
    image: '/images/courthouses/stanley-mosk-courthouse.jpg',
    date: 'January 2026',
    readTime: '12 min read',
    featured: true
  },
  {
    id: 2,
    slug: 'california-probate-fees-statutory-vs-flat',
    title: 'California Probate Fees Exposed: Statutory vs Flat Fee',
    description: 'Why a $1M home with a $900K mortgage still costs $23,000 in statutory fees—and how to pay $3,995 instead.',
    category: 'Fees & Costs',
    image: '/images/attorney/rozsa-gyene-probate-attorney.jpg',
    date: 'January 2026',
    readTime: '10 min read',
    featured: false
  },
  {
    id: 3,
    slug: 'letters-testamentary-california-guide',
    title: 'Letters Testamentary California: Your Golden Ticket Explained',
    description: 'What Letters Testamentary are, why you need certified copies, and how to use them to access estate assets.',
    category: 'Forms & Documents',
    image: '/images/office/glendale-office-exterior.jpg',
    date: 'January 2026',
    readTime: '8 min read',
    featured: false
  },
  {
    id: 4,
    slug: 'what-is-probate-referee-california',
    title: 'What is a Probate Referee in California?',
    description: 'How court-appointed appraisers value estate assets and what to expect from the appraisal process.',
    category: 'Expert Guide',
    image: '/images/courthouses/lamoreaux-justice-center.jpg',
    date: 'January 2026',
    readTime: '7 min read',
    featured: false
  },
  {
    id: 5,
    slug: 'probate-bond-requirements-california',
    title: 'Probate Bond Requirements in California: When You Need One',
    description: 'When bonds are required, how much they cost, and when they can be waived by the court.',
    category: 'Executor Guide',
    image: '/images/courthouses/sf-civic-center-courthouse.jpg',
    date: 'January 2026',
    readTime: '6 min read',
    featured: false
  },
  {
    id: 6,
    slug: 'how-to-file-probate-california',
    title: 'How to File Probate in California: Step-by-Step Guide',
    description: 'Complete guide to filing for probate in California, from gathering documents to attending your first hearing.',
    category: 'Getting Started',
    image: '/images/blog/estate-planning-attorney.jpg',
    date: 'January 2025',
    readTime: '14 min read',
    featured: false
  },
  {
    id: 7,
    slug: 'small-estate-affidavit-california',
    title: 'Small Estate Affidavit California: When You Don\'t Need Probate',
    description: 'Learn when California estates under $184,500 can skip probate entirely using the simplified affidavit process.',
    category: 'Avoid Probate',
    image: '/images/blog/avoid-probate1.jpg',
    date: 'January 2025',
    readTime: '10 min read',
    featured: false
  },
  {
    id: 8,
    slug: 'probate-timeline-california-what-to-expect',
    title: 'Probate Timeline California: What to Expect Each Month',
    description: 'Month-by-month breakdown of the California probate process, from filing to final distribution.',
    category: 'Timeline',
    image: '/images/blog/best-online-living-trust-california.jpg',
    date: 'January 2025',
    readTime: '15 min read',
    featured: false
  },
  {
    id: 9,
    slug: 'dying-without-will-california-intestate-succession',
    title: 'What Happens If You Die Without a Will in California?',
    description: 'Learn how California distributes your estate through intestate succession laws when there is no will.',
    category: 'Intestate Succession',
    image: '/images/blog/dying-without-will.jpg',
    date: 'January 2026',
    readTime: '12 min read',
    featured: false
  },
  {
    id: 10,
    slug: 'executor-duties-california-probate',
    title: 'Executor Duties in California Probate: Complete Guide',
    description: 'Comprehensive guide to executor responsibilities, timeline, compensation, and how to avoid personal liability.',
    category: 'Executor Guide',
    image: '/images/blog/executor-duties.jpg',
    date: 'January 2026',
    readTime: '14 min read',
    featured: false
  }
];

const ARTICLES_PER_PAGE = 12;

const LearnHub = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = Math.ceil(ARTICLES.length / ARTICLES_PER_PAGE);

  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentArticles = ARTICLES.slice(startIndex, endIndex);

  const featuredArticle = ARTICLES.find(a => a.featured);
  const regularArticles = currentPage === 1
    ? currentArticles.filter(a => !a.featured)
    : currentArticles;

  const handlePageChange = (page) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        }
      },
      {
        "@type": "LegalService",
        "@id": "https://myprobateca.com/#organization",
        "name": "MyProbateCA - Law Offices of Rozsa Gyene",
        "url": "https://myprobateca.com/",
        "telephone": "+1-818-291-6217",
        "email": "rozsa@myprobateca.com",
        "priceRange": "$3,995"
      },
      {
        "@type": "Blog",
        "@id": "https://myprobateca.com/learn-california-probate/#blog",
        "name": "The California Probate Insider",
        "description": "Expert tips on navigating California probate courts, clearing examiner notes, understanding fees, and protecting yourself as executor.",
        "url": "https://myprobateca.com/learn-california-probate/",
        "blogPost": ARTICLES.map(article => ({
          "@type": "BlogPosting",
          "headline": article.title,
          "url": `https://myprobateca.com/learn-california-probate/${article.slug}/`,
          "author": { "@id": "https://myprobateca.com/#attorney" }
        }))
      }
    ]
  };

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

        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-blue-600">
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

        {/* Hero Section with Featured Article */}
        {currentPage === 1 && featuredArticle && (
          <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  California Probate Learning Center
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                  Attorney-verified guides and resources for California executors
                </p>
              </div>

              {/* Featured Article Card */}
              <Link
                to={`/learn-california-probate/${featuredArticle.slug}`}
                className="block bg-blue-700/50 rounded-2xl p-6 md:p-8 hover:bg-blue-700/70 transition-all"
              >
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="md:w-1/2">
                    <img
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      className="w-full h-64 md:h-80 object-cover rounded-xl"
                    />
                  </div>
                  <div className="md:w-1/2 text-white">
                    <span className="inline-block bg-blue-500 text-white text-sm font-semibold px-4 py-1 rounded-full mb-4">
                      {featuredArticle.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-blue-100 text-lg mb-6">
                      {featuredArticle.description}
                    </p>
                    <div className="flex items-center text-blue-200 mb-6">
                      <span>{featuredArticle.date}</span>
                      <span className="mx-2">•</span>
                      <span>{featuredArticle.readTime}</span>
                    </div>
                    <span className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
                      Read Article <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Page Title for subsequent pages */}
        {currentPage > 1 && (
          <section className="py-12 px-4">
            <div className="max-w-6xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                California Probate Learning Center
              </h1>
              <p className="text-blue-100">Page {currentPage} of {totalPages}</p>
            </div>
          </section>
        )}

        {/* Article Cards Grid */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/learn-california-probate/${article.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    {/* Article Image */}
                    <div className="relative overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Article Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Category Badge */}
                      <span className="inline-block self-start bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                        {article.category}
                      </span>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 mb-4 flex-grow">
                        {article.description}
                      </p>

                      {/* Date and Read Time */}
                      <div className="text-sm text-gray-500">
                        <span>{article.date}</span>
                        <span className="mx-2">•</span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                    currentPage === 1
                      ? 'bg-blue-500/30 text-blue-300 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg font-bold transition ${
                      page === currentPage
                        ? 'bg-white text-blue-600'
                        : 'bg-blue-500/30 text-white hover:bg-blue-500/50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                    currentPage === totalPages
                      ? 'bg-blue-500/30 text-blue-300 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-blue-700">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Probate Case?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Our free intake questionnaire takes about 30 minutes. Get started for a flat $3,995 fee.
            </p>
            <button
              onClick={handleStartCase}
              className="inline-flex items-center bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-bold transition"
            >
              Start Your Case - Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
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
                <h4 className="font-semibold text-white mb-4">Contact</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    (818) 291-6217
                  </li>
                  <li className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    rozsa@myprobateca.com
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
