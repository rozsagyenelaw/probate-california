import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Terms of Service | California Probate Services | MyProbateCA</title>
        <meta name="description" content="Terms of Service for MyProbateCA flat-fee probate services. Learn about our limited scope representation, pricing, refund policy, and client responsibilities." />
        <link rel="canonical" href="https://myprobateca.com/terms" />
        <meta name="robots" content="index, follow" />
      </Helmet>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Law Offices of Rozsa Gyene | Last Updated: January 2026</p>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Service Description</h2>
              <p className="text-gray-700 mb-4">
                The Law Offices of Rozsa Gyene ("we," "us," or "our") provides flat-fee probate document preparation services with attorney review for California residents. Our services include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Preparation of probate petition and supporting documents</li>
                <li>Attorney review of all court filings</li>
                <li>Coordination of newspaper publication</li>
                <li>Preparation of inventory and appraisal forms</li>
                <li>Creditor claim management guidance</li>
                <li>Final accounting and distribution petition preparation</li>
                <li>Online dashboard access for case tracking</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Limited Scope Representation</h2>
              <p className="text-gray-700 mb-4">
                Our services constitute <strong>limited scope representation</strong> for document preparation. This means:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>We prepare court documents based on information you provide</li>
                <li>You are responsible for filing documents with the court</li>
                <li>You are responsible for appearing at court hearings (or purchasing our court appearance add-on)</li>
                <li>We do not represent you in contested matters without separate agreement</li>
                <li>This service is designed for uncontested probate cases where all heirs agree on distribution</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Our flat fee does not include court filing fees, newspaper publication costs, probate referee fees, or bond premiums, which are paid directly to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Pricing and Payment Terms</h2>
              <p className="text-gray-700 mb-4">Our services are offered at the following flat rates:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Simplified Probate:</strong> $2,495 (for primary residences under $750,000)</li>
                <li><strong>Full Probate:</strong> $3,995 (for all other estates)</li>
                <li><strong>Court Appearance (Remote):</strong> $500 per hearing</li>
                <li><strong>Court Appearance (Contested/Complex):</strong> $600 per hearing</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>Payment Options:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Pay in full at time of service</li>
                <li>Split into 3 monthly payments at no additional cost</li>
                <li>Klarna Pay in 4 (interest-free, subject to approval)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Refund Policy</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Before work begins:</strong> Full refund available if you request cancellation before we begin preparing your documents</li>
                <li><strong>After document preparation:</strong> No refund once documents have been prepared, as substantial legal work has been completed</li>
                <li><strong>Case disqualification:</strong> If your case is determined to not qualify for our service (e.g., contested matters), you will receive a full refund minus a $250 administrative fee</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Client Responsibilities</h2>
              <p className="text-gray-700 mb-4">As our client, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Provide accurate and complete information about the decedent, estate, heirs, and assets</li>
                <li>Respond to our requests for information or clarification within 10 business days</li>
                <li>File documents with the court as instructed (or notify us if you need filing assistance)</li>
                <li>Meet all court-imposed deadlines</li>
                <li>Notify us promptly of any disputes, objections, or changes to case circumstances</li>
                <li>Maintain confidentiality of your login credentials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the fullest extent permitted by law, the Law Offices of Rozsa Gyene shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
              </p>
              <p className="text-gray-700 mb-4">
                Our total liability shall not exceed the amount you paid for our services. We are not responsible for delays or errors caused by incorrect information provided by you, court scheduling issues, or circumstances beyond our reasonable control.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms of Service are governed by the laws of the State of California. Any disputes arising from these terms or our services shall be resolved in the courts of Los Angeles County, California.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective upon posting to this website. Your continued use of our services after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="font-semibold text-gray-900 mb-2">Law Offices of Rozsa Gyene</p>
                <p className="text-gray-700">California State Bar #208356</p>
                <p className="text-gray-700">Phone: <a href="tel:8182916217" className="text-blue-600 hover:underline">(818) 291-6217</a></p>
                <p className="text-gray-700">Email: <a href="mailto:rozsagyenelaw@yahoo.com" className="text-blue-600 hover:underline">rozsagyenelaw@yahoo.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default TermsOfService;
