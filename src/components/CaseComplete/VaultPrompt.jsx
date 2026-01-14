import React from 'react';
import { Link } from 'react-router-dom';
import {
  PartyPopper,
  Lock,
  CheckCircle,
  Shield,
  ExternalLink
} from 'lucide-react';

const VaultPrompt = ({ caseId }) => {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Celebration Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <PartyPopper className="h-10 w-10 text-green-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Congratulations! Your Probate is Complete
        </h2>
        <p className="text-gray-600 mb-8">
          Your case has been successfully closed. All your important documents are now stored in your Digital Vault.
        </p>

        {/* Features List */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Your Digital Vault Includes:
          </h3>
          <ul className="space-y-3">
            {[
              'Order of Final Distribution',
              'Letters Testamentary',
              'Inventory & Appraisal',
              'All Court Documents',
              'Secure Forever Access'
            ].map((item, index) => (
              <li key={index} className="flex items-center text-green-700">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <Link
          to="/vault"
          className="inline-flex items-center justify-center gap-2 bg-blue-900 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-800 transition-colors mb-8 w-full sm:w-auto"
        >
          <Lock className="h-5 w-5" />
          Access Your Digital Vault
        </Link>

        {/* Estate Planning Promo */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="h-6 w-6 text-amber-600" />
            <h3 className="text-lg font-bold text-amber-900">
              Don't Let This Happen to Your Family
            </h3>
          </div>
          <p className="text-amber-800 mb-4">
            You've seen how complex probate can be. Protect your loved ones with a Living Trust — avoid probate entirely.
          </p>
          <a
            href="https://livingtrustcalifornia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
          >
            Create Your Living Trust — From $400
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default VaultPrompt;
