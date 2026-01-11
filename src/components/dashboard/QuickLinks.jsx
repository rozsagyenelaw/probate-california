import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  MessageSquare,
  Download,
  Calendar,
  Phone,
  HelpCircle,
  ExternalLink,
  Calculator
} from 'lucide-react';

const QuickLinks = ({ probateCase, unreadMessages = 0 }) => {
  const navigate = useNavigate();

  // Check if user already has accounting add-on
  const hasAccounting = probateCase?.addOns?.accounting;

  const links = [
    {
      icon: Upload,
      label: 'Upload Documents',
      description: 'Add death certificate, will, deeds',
      action: () => navigate('/documents'),
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Download,
      label: 'Download Forms',
      description: 'Get generated court forms',
      action: () => navigate('/petition'),
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      description: unreadMessages > 0 ? `${unreadMessages} unread` : 'Contact our team',
      action: () => navigate('/messages'),
      color: 'bg-purple-100 text-purple-600',
      badge: unreadMessages > 0 ? unreadMessages : null
    },
    {
      icon: Calendar,
      label: 'View Timeline',
      description: 'See all deadlines',
      action: () => navigate('/timeline'),
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const resources = [
    {
      icon: HelpCircle,
      label: 'FAQ & Help',
      href: '#help'
    },
    {
      icon: Phone,
      label: 'Call (818) 291-6217',
      href: 'tel:+18182916217'
    },
    {
      icon: ExternalLink,
      label: 'LA County Probate',
      href: 'https://www.lacourt.org/forms/probate',
      external: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {links.map((link, index) => {
            const Icon = link.icon;
            return (
              <button
                key={index}
                onClick={link.action}
                className="relative flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
              >
                {link.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
                <div className={`p-2 rounded-lg ${link.color} mb-2`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-gray-900">{link.label}</p>
                <p className="text-xs text-gray-500 mt-1">{link.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accounting Services */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Accounting Services</h3>
        {hasAccounting ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Calculator className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                {hasAccounting === 'complex' ? 'Complex' : 'Simple'} Accounting Included
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your case includes {hasAccounting} accounting services.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Need help with your probate accounting? Add our professional accounting services.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/request-accounting?type=simple')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-100 mr-3">
                    <Calculator className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Simple Accounting</p>
                    <p className="text-xs text-gray-500">Basic estate accounting</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">$995</span>
              </button>
              <button
                onClick={() => navigate('/request-accounting?type=complex')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100 mr-3">
                    <Calculator className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Complex Accounting</p>
                    <p className="text-xs text-gray-500">Detailed multi-asset accounting</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-blue-600">$1,995</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resources */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
        <div className="space-y-2">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <a
                key={index}
                href={resource.href}
                target={resource.external ? '_blank' : undefined}
                rel={resource.external ? 'noopener noreferrer' : undefined}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Icon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-700">{resource.label}</span>
                {resource.external && (
                  <ExternalLink className="h-3 w-3 text-gray-400 ml-auto" />
                )}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickLinks;
