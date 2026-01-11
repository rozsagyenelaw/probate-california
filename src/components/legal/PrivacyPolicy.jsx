import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <div className="flex items-center">
              <div className="bg-blue-900 p-2 rounded-lg mr-2">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">California Probate</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Law Offices of Rozsa Gyene | Last Updated: January 2026</p>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">We collect the following types of information to provide our probate services:</p>

              <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Personal Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Name, email address, phone number, and mailing address</li>
                <li>Information about the decedent (name, date of death, Social Security Number last 4 digits)</li>
                <li>Information about heirs and beneficiaries</li>
                <li>Estate asset and liability information</li>
                <li>Will and trust documents</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Payment Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Credit card or payment method details (processed securely by Stripe)</li>
                <li>Billing address</li>
                <li>Transaction history</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Technical Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>IP address and browser type</li>
                <li>Device information</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Provide probate document preparation services</li>
                <li>Communicate with you about your case</li>
                <li>Process payments and send receipts</li>
                <li>Generate court documents for filing</li>
                <li>Send deadline reminders and case updates</li>
                <li>Improve our services and website</li>
                <li>Comply with legal and professional obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                <strong>We do not sell your personal information.</strong> We only share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Stripe:</strong> Payment processing (PCI-compliant)</li>
                <li><strong>Firebase/Google Cloud:</strong> Secure data storage</li>
                <li><strong>Courts:</strong> As required for filing probate documents</li>
                <li><strong>Newspaper publishers:</strong> For required legal notices</li>
                <li><strong>Legal requirements:</strong> When required by law, subpoena, or court order</li>
              </ul>
              <p className="text-gray-700 mb-4">
                All information shared with you is protected by attorney-client privilege, which we maintain in accordance with California Rules of Professional Conduct.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">We protect your information using:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Encrypted storage at rest</li>
                <li>Secure authentication with email verification</li>
                <li>Regular security audits and monitoring</li>
                <li>Limited access to personal information on a need-to-know basis</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your case files and documents as required by California State Bar rules for attorney record retention:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Active case files: Maintained throughout the case and for 5 years after case closure</li>
                <li>Closed case records: Retained for minimum 5 years per State Bar requirements</li>
                <li>Payment records: Retained for 7 years for tax and accounting purposes</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You may request deletion of your account and data after your case is closed, subject to our legal retention requirements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">Under California law (CCPA/CPRA), you have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Access:</strong> Request a copy of personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
              </ul>
              <p className="text-gray-700 mb-4">
                To exercise these rights, contact us at <a href="mailto:rozsagyenelaw@yahoo.com" className="text-blue-600 hover:underline">rozsagyenelaw@yahoo.com</a> or call <a href="tel:8182916217" className="text-blue-600 hover:underline">(818) 291-6217</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies and Analytics</h2>
              <p className="text-gray-700 mb-4">We use the following technologies:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Google Analytics:</strong> To understand how visitors use our website</li>
                <li><strong>Microsoft Clarity:</strong> To improve user experience through session recordings and heatmaps</li>
                <li><strong>Essential cookies:</strong> For authentication and security</li>
              </ul>
              <p className="text-gray-700 mb-4">
                These tools help us improve our services but do not identify you personally. You can manage cookie preferences in your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Third-Party Links</h2>
              <p className="text-gray-700 mb-4">
                Our website may contain links to third-party websites (e.g., court websites, legal resources). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Material changes will be communicated via email.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact for Privacy Questions</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="font-semibold text-gray-900 mb-2">Law Offices of Rozsa Gyene</p>
                <p className="text-gray-700">California State Bar #208356</p>
                <p className="text-gray-700">Phone: <a href="tel:8182916217" className="text-blue-600 hover:underline">(818) 291-6217</a></p>
                <p className="text-gray-700">Email: <a href="mailto:rozsagyenelaw@yahoo.com" className="text-blue-600 hover:underline">rozsagyenelaw@yahoo.com</a></p>
                <p className="text-gray-700 mt-4 text-sm">
                  For privacy-related inquiries, please include "Privacy Request" in the subject line.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
