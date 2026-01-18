import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from './ArticleLayout';
import { Check, X, AlertTriangle, Users, Home, DollarSign, FileText, HelpCircle } from 'lucide-react';

const IntestateSuccession = () => {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "What Happens If You Die Without a Will in California? Intestate Succession Explained",
    "description": "Learn how California distributes your estate if you die without a will. Understand intestate succession laws, who inherits, and why probate is still required.",
    "author": {
      "@type": "Person",
      "@id": "https://myprobateca.com/#attorney",
      "name": "Rozsa Gyene",
      "jobTitle": "Lead Probate Attorney"
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://myprobateca.com/#organization",
      "name": "MyProbateCA"
    },
    "datePublished": "2026-01-18",
    "dateModified": "2026-01-18",
    "mainEntityOfPage": "https://myprobateca.com/learn-california-probate/dying-without-will-california-intestate-succession",
    "image": "https://myprobateca.com/images/blog/dying-without-will.jpg"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What happens to my property if I die without a will in California?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "California's intestate succession laws determine who inherits your property. Generally, your spouse and children inherit first. If you have no spouse or children, your parents, siblings, or more distant relatives may inherit in a specific order defined by law."
        }
      },
      {
        "@type": "Question",
        "name": "Does my spouse automatically inherit everything if I die without a will?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Not necessarily. Your spouse's share depends on whether you have children and how property is titled. Community property generally goes to your spouse, but separate property may be split between your spouse and children or other relatives."
        }
      },
      {
        "@type": "Question",
        "name": "Do I still need probate if there's no will?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Dying without a will doesn't avoid probate. In fact, intestate estates often require MORE court involvement because the court must determine rightful heirs and appoint an administrator without the guidance of a will."
        }
      },
      {
        "@type": "Question",
        "name": "What if the deceased had no family at all?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If no living relatives can be found after a diligent search, the estate 'escheats' to the State of California. This is relatively rare, as the law recognizes very distant relatives before the state inherits."
        }
      }
    ]
  };

  const relatedArticles = [
    { title: "How to File Probate in California", url: "/learn-california-probate/how-to-file-probate-california", category: "Step-by-Step Guide" },
    { title: "Letters Testamentary California Guide", url: "/learn-california-probate/letters-testamentary-california-guide", category: "Forms & Documents" },
    { title: "Probate Timeline California", url: "/learn-california-probate/probate-timeline-california-what-to-expect", category: "Timeline" }
  ];

  return (
    <ArticleLayout
      title="What Happens If You Die Without a Will in California? Intestate Succession Explained"
      metaDescription="Learn how California distributes your estate if you die without a will. Understand intestate succession laws, who inherits, and why probate is still required."
      canonicalUrl="https://myprobateca.com/learn-california-probate/dying-without-will-california-intestate-succession"
      publishDate="January 18, 2026"
      readTime="12"
      category="Intestate Succession"
      schemaMarkup={schemaMarkup}
      image="https://myprobateca.com/images/blog/dying-without-will.jpg"
      relatedArticles={relatedArticles}
    >
      {/* FAQ Schema */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      <p className="text-xl text-gray-600 mb-8">
        When someone dies without a valid will in California, their estate doesn't simply go to whoever wants it. Instead, <strong>California's intestate succession laws</strong> dictate exactly who inherits — and the results often surprise families.
      </p>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800">Common Misconception</p>
            <p className="text-amber-900">Many people believe that dying without a will means "the state takes everything." This is almost never true. California has a detailed system for distributing assets to relatives — the state only inherits when absolutely no family can be found.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What is Intestate Succession?</h2>
      <p className="text-gray-700 mb-4">
        "Intestate" means dying without a valid will. When this happens, <a href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=6400" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">California Probate Code Section 6400</a> and subsequent sections determine who inherits. This body of law is called <strong>intestate succession</strong>.
      </p>
      <p className="text-gray-700 mb-4">
        The rules create a strict hierarchy of inheritance based on family relationships. Your closest relatives inherit first, and more distant relatives only inherit if closer relatives don't exist.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Who Inherits Under California Intestate Succession?</h2>
      <p className="text-gray-700 mb-4">
        The distribution depends on your family situation. Here's how California law prioritizes heirs:
      </p>

      <div className="bg-white border-2 border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-blue-900 text-xl mb-4 flex items-center">
          <Users className="h-6 w-6 mr-2" />
          If You're Married (With or Without Children)
        </h3>
        <p className="text-gray-700 mb-4">California distinguishes between <strong>community property</strong> and <strong>separate property</strong>:</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-bold text-green-800 mb-2">Community Property</h4>
            <p className="text-green-900 text-sm mb-2">Property acquired during marriage</p>
            <p className="text-green-700 font-medium">100% goes to surviving spouse</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold text-blue-800 mb-2">Separate Property</h4>
            <p className="text-blue-900 text-sm mb-2">Property owned before marriage or received as gift/inheritance</p>
            <p className="text-blue-700 font-medium">Split depends on children/relatives (see table below)</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Separate Property Distribution</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Family Situation</th>
              <th className="px-4 py-3 text-left font-semibold">Spouse Receives</th>
              <th className="px-4 py-3 text-left font-semibold">Others Receive</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3">Spouse + 1 child</td>
              <td className="px-4 py-3 font-medium text-green-600">1/2</td>
              <td className="px-4 py-3">Child gets 1/2</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3">Spouse + 2+ children</td>
              <td className="px-4 py-3 font-medium text-green-600">1/3</td>
              <td className="px-4 py-3">Children share 2/3 equally</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3">Spouse + no children, but parents</td>
              <td className="px-4 py-3 font-medium text-green-600">1/2</td>
              <td className="px-4 py-3">Parents get 1/2</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3">Spouse + no children, but siblings</td>
              <td className="px-4 py-3 font-medium text-green-600">1/2</td>
              <td className="px-4 py-3">Siblings share 1/2</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Spouse only (no children, parents, or siblings)</td>
              <td className="px-4 py-3 font-medium text-green-600">100%</td>
              <td className="px-4 py-3">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white border-2 border-purple-200 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-purple-900 text-xl mb-4">If You're NOT Married</h3>
        <p className="text-gray-700 mb-4">Without a spouse, inheritance follows this order:</p>

        <ol className="space-y-3">
          <li className="flex items-start">
            <span className="bg-purple-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5">1</span>
            <div>
              <p className="font-bold text-gray-900">Children (and descendants of deceased children)</p>
              <p className="text-gray-600 text-sm">Divided equally among children. If a child died, their children inherit their share.</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-purple-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5">2</span>
            <div>
              <p className="font-bold text-gray-900">Parents</p>
              <p className="text-gray-600 text-sm">If no children, parents inherit equally (or surviving parent gets all).</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-purple-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5">3</span>
            <div>
              <p className="font-bold text-gray-900">Siblings (and descendants of deceased siblings)</p>
              <p className="text-gray-600 text-sm">If no children or parents, siblings share equally.</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-purple-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5">4</span>
            <div>
              <p className="font-bold text-gray-900">Grandparents, aunts, uncles, cousins</p>
              <p className="text-gray-600 text-sm">The law continues through increasingly distant relatives.</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-gray-400 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5">∞</span>
            <div>
              <p className="font-bold text-gray-900">State of California (Escheat)</p>
              <p className="text-gray-600 text-sm">Only if absolutely no relatives can be found after diligent search.</p>
            </div>
          </li>
        </ol>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Important Rules to Know</h2>

      <div className="space-y-4 mb-8">
        <div className="flex items-start bg-gray-50 p-4 rounded-lg">
          <Check className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-900">Half-Relatives Inherit Equally</p>
            <p className="text-gray-600 text-sm">Half-siblings are treated the same as full siblings under California law.</p>
          </div>
        </div>
        <div className="flex items-start bg-gray-50 p-4 rounded-lg">
          <Check className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-900">Adopted Children Have Full Rights</p>
            <p className="text-gray-600 text-sm">Legally adopted children inherit exactly like biological children.</p>
          </div>
        </div>
        <div className="flex items-start bg-gray-50 p-4 rounded-lg">
          <Check className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-900">Stepchildren Do NOT Inherit</p>
            <p className="text-gray-600 text-sm">Unless legally adopted, stepchildren have no inheritance rights under intestate succession.</p>
          </div>
        </div>
        <div className="flex items-start bg-gray-50 p-4 rounded-lg">
          <X className="h-6 w-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-900">Unmarried Partners Inherit NOTHING</p>
            <p className="text-gray-600 text-sm">Domestic partners registered with the state are treated like spouses, but unmarried couples have zero inheritance rights.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Do You Still Need Probate Without a Will?</h2>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
        <p className="font-bold text-red-800">Yes — Probate is Still Required</p>
        <p className="text-red-900">A common myth is that having no will means no probate. In reality, intestate estates almost always require probate, and the process is often <strong>more complicated</strong> because:</p>
      </div>

      <ul className="space-y-2 mb-6 text-gray-700">
        <li className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
          <span>The court must determine who the rightful heirs are</span>
        </li>
        <li className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
          <span>An administrator must be appointed (instead of an executor named in a will)</span>
        </li>
        <li className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
          <span>A <Link to="/learn-california-probate/probate-bond-requirements-california" className="text-blue-600 hover:underline">probate bond</Link> is usually required (often waived when there's a will)</span>
        </li>
        <li className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
          <span>Finding and notifying all potential heirs takes more time</span>
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What Assets Pass Outside of Intestate Succession?</h2>
      <p className="text-gray-700 mb-4">
        Not all assets are distributed through intestate succession. These assets pass directly to named beneficiaries:
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-bold text-green-800 mb-2">Pass to Named Beneficiaries</h4>
          <ul className="text-green-900 text-sm space-y-1">
            <li>• Life insurance policies</li>
            <li>• Retirement accounts (401k, IRA)</li>
            <li>• Payable-on-death bank accounts</li>
            <li>• Transfer-on-death securities</li>
            <li>• Property in a living trust</li>
            <li>• Joint tenancy property</li>
          </ul>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-bold text-blue-800 mb-2">Subject to Intestate Succession</h4>
          <ul className="text-blue-900 text-sm space-y-1">
            <li>• Bank accounts in decedent's name only</li>
            <li>• Real estate in decedent's name only</li>
            <li>• Vehicles titled solely to decedent</li>
            <li>• Personal property (furniture, jewelry)</li>
            <li>• Business interests</li>
            <li>• Investment accounts without TOD</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Real-World Example</h2>
      <div className="bg-gray-100 p-6 rounded-lg my-6">
        <p className="font-bold text-gray-900 mb-3">Scenario: John dies without a will</p>
        <p className="text-gray-700 mb-3">
          John was married to Maria and had two adult children from a previous marriage. His estate includes:
        </p>
        <ul className="text-gray-700 mb-4 space-y-1">
          <li>• Family home (community property with Maria): <strong>$800,000</strong></li>
          <li>• Inheritance from his mother (separate property): <strong>$300,000</strong></li>
          <li>• 401(k) with Maria as beneficiary: <strong>$200,000</strong></li>
        </ul>
        <p className="font-bold text-gray-900 mb-2">How it's distributed:</p>
        <ul className="text-gray-700 space-y-1">
          <li>• <strong>Family home:</strong> 100% to Maria (community property)</li>
          <li>• <strong>401(k):</strong> 100% to Maria (named beneficiary)</li>
          <li>• <strong>$300,000 inheritance:</strong> Maria gets 1/3 ($100,000), children split 2/3 ($100,000 each)</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Frequently Asked Questions</h2>

      <div className="space-y-6 mb-8">
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-900 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
            What if the deceased was separated but not divorced?
          </h4>
          <p className="text-gray-600 mt-2">Legally, they're still married. The separated spouse has full inheritance rights under intestate succession until the divorce is finalized.</p>
        </div>
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-900 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
            Can I inherit if I killed the deceased?
          </h4>
          <p className="text-gray-600 mt-2">No. California's "slayer statute" (Probate Code § 250) prevents anyone who feloniously kills the decedent from inheriting from them.</p>
        </div>
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-900 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
            What about children born outside of marriage?
          </h4>
          <p className="text-gray-600 mt-2">They have full inheritance rights as long as paternity was legally established (through acknowledgment, court order, or genetic testing).</p>
        </div>
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-bold text-gray-900 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
            How long does intestate probate take?
          </h4>
          <p className="text-gray-600 mt-2">Typically 12-18 months — sometimes longer if heir identification is complicated. See our <Link to="/learn-california-probate/probate-timeline-california-what-to-expect" className="text-blue-600 hover:underline">probate timeline guide</Link> for details.</p>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg my-8">
        <h3 className="font-bold text-gray-900 text-lg mb-3">Need Help With an Intestate Estate?</h3>
        <p className="text-gray-700 mb-4">
          Administering an estate without a will can be complicated. Our experienced probate attorneys can guide you through the process for a <Link to="/learn-california-probate/california-probate-fees-statutory-vs-flat" className="text-blue-600 hover:underline">flat fee of $3,995</Link> — saving you thousands compared to traditional attorneys.
        </p>
        <Link to="/register" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
          Start Your Case Today
        </Link>
      </div>
    </ArticleLayout>
  );
};

export default IntestateSuccession;
