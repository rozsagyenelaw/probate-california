import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Scale, Home, Phone, BookOpen, MapPin, HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | MyProbateCA</title>
        <meta name="description" content="The page you're looking for doesn't exist. Find California probate resources, court locations, and contact our probate attorney." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link to="/" className="flex items-center space-x-2">
              <Scale className="h-8 w-8" />
              <span className="font-bold text-xl">MyProbateCA</span>
            </Link>
          </div>
        </nav>

        {/* 404 Content */}
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-9xl font-bold text-blue-900 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-xl text-gray-600 mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>

          {/* Helpful Links */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            <Link
              to="/"
              className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="bg-blue-100 p-3 rounded-lg">
                <Home className="h-6 w-6 text-blue-900" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Homepage</h3>
                <p className="text-sm text-gray-600">Start your probate case</p>
              </div>
            </Link>

            <Link
              to="/california-probate-administration"
              className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-900" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Probate Guide</h3>
                <p className="text-sm text-gray-600">Learn about the 11 phases</p>
              </div>
            </Link>

            <Link
              to="/probate-court-locations-california"
              className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="bg-blue-100 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-900" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Court Locations</h3>
                <p className="text-sm text-gray-600">Find your local probate court</p>
              </div>
            </Link>

            <Link
              to="/probate-faq-california"
              className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="bg-blue-100 p-3 rounded-lg">
                <HelpCircle className="h-6 w-6 text-blue-900" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">FAQ</h3>
                <p className="text-sm text-gray-600">Common probate questions</p>
              </div>
            </Link>
          </div>

          {/* Contact CTA */}
          <div className="bg-blue-900 text-white rounded-xl p-8">
            <h3 className="text-xl font-bold mb-2">Need Help with California Probate?</h3>
            <p className="text-blue-100 mb-6">
              Our licensed attorney handles all 11 phases for a flat $3,995 fee.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started - Free Consultation
              </Link>
              <a
                href="tel:+18182916217"
                className="flex items-center justify-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                <Phone className="h-5 w-5" />
                (818) 291-6217
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Law Offices of Rozsa Gyene. All rights reserved.
            </p>
            <p className="text-sm mt-2">California State Bar #208356</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default NotFound;
