const Anthropic = require('@anthropic-ai/sdk');
const admin = require('firebase-admin');

const MAX_DOCUMENT_CHARS = 200000;

function getAdminApp() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
  }
  return admin;
}

// Admin = `admin` custom claim on a verified email (same check as the security rules)
function isAdminToken(decoded) {
  return decoded.admin === true && decoded.email_verified === true;
}

// Returns the decoded Firebase ID token, or null when missing or invalid
async function verifyRequest(event) {
  const header = event.headers.authorization || event.headers.Authorization || '';
  const match = header.match(/^Bearer (.+)$/);
  if (!match) return null;
  try {
    return await getAdminApp().auth().verifyIdToken(match[1]);
  } catch (err) {
    console.error('ID token verification failed:', err.message);
    return null;
  }
}

async function userOwnsCase(uid, caseId) {
  if (!caseId || typeof caseId !== 'string') return false;
  const snap = await getAdminApp().firestore().collection('cases').doc(caseId).get();
  return snap.exists && snap.data().userId === uid;
}

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': 'https://myprobateca.com',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  // Only a signed-in client analyzing their own case, or the attorney
  const decoded = await verifyRequest(event);
  if (!decoded) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Sign-in required' }) };
  }

  try {
    const { documentText, documentType, documentName, caseId } = JSON.parse(event.body);

    if (!isAdminToken(decoded) && !(await userOwnsCase(decoded.uid, caseId))) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Not allowed for this case' }) };
    }

    if (typeof documentText === 'string' && documentText.length > MAX_DOCUMENT_CHARS) {
      return { statusCode: 413, headers, body: JSON.stringify({ error: 'Document is too large to analyze' }) };
    }

    if (!documentText) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No document text provided' })
      };
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const prompt = `You are an expert estate planning assistant analyzing financial documents to discover potential assets for probate administration.

You are analyzing a ${documentType || 'financial document'}: "${documentName || 'Unknown'}"

Analyze the following document text and identify ALL potential assets. Based on the document type, look for:

**For Tax Returns:**
- Schedule B interest income (bank accounts)
- Schedule B dividend income (investments)
- Schedule D capital gains/losses (brokerage accounts)
- Form 1099-R distributions (retirement accounts)
- Schedule E rental income (real estate)
- Schedule C business income
- Schedule K-1 partnership/S-corp income
- Mortgage interest deductions
- Property tax deductions

**For Bank Statements:**
- Account numbers and types (checking, savings, money market)
- Bank name and branch
- Average balance or ending balance
- Linked accounts mentioned
- Automatic transfers to/from other institutions
- Direct deposits from employers or pensions

**For Investment/Brokerage Statements:**
- Account numbers
- Brokerage firm name
- Holdings (stocks, bonds, mutual funds, ETFs)
- Account value/balance
- Dividend and interest income
- Cost basis information

**For Retirement Account Statements (401k, IRA, Pension):**
- Account type (Traditional IRA, Roth IRA, 401k, 403b, pension)
- Custodian/administrator name
- Account balance
- Beneficiary information if shown
- Employer name (for 401k/pension)
- Vesting information

**For Property Documents:**
- Property addresses
- Ownership type (sole, joint, trust)
- Assessed value or market value
- Mortgage holder if any
- Property tax information

**For Life Insurance Statements:**
- Policy number
- Insurance company
- Policy type (term, whole life, universal)
- Death benefit amount
- Cash value if applicable
- Beneficiary information

**For Any Financial Document:**
- Institution names
- Account numbers (partial is fine)
- Balances or values
- Other accounts mentioned or referenced
- Contact information for institutions

DOCUMENT TEXT:
${documentText}

Respond in this exact JSON format:
{
  "assets": [
    {
      "type": "Bank Account|Investment|Retirement|Real Estate|Business|Life Insurance|Vehicle|Other",
      "institution": "Name of bank/company/entity",
      "accountNumber": "Full or partial account number if visible, otherwise null",
      "description": "Brief description of what was found",
      "evidence": "The specific text that indicates this asset",
      "estimatedValue": "Dollar amount if shown, otherwise null",
      "actionRequired": "What the executor should do to investigate this"
    }
  ],
  "documentSummary": {
    "documentType": "What type of document this appears to be",
    "institution": "Primary institution this document is from",
    "dateRange": "Date range covered if visible",
    "keyFindings": "Brief summary of what was found"
  }
}

Be thorough. It's better to flag a potential asset that turns out to be nothing than to miss a real asset. Extract every financial institution name, account reference, and monetary value you can find.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].text;

    // Parse the JSON response
    let analysisResult;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // If parsing fails, return the raw text
      analysisResult = {
        assets: [],
        documentSummary: {
          documentType: documentType || 'Unknown',
          institution: 'Unknown',
          dateRange: 'Unknown',
          keyFindings: 'Manual review required - AI could not parse document'
        },
        rawResponse: responseText
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        documentName: documentName,
        documentType: documentType,
        analysis: analysisResult
      })
    };

  } catch (error) {
    console.error('Error analyzing document:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to analyze document',
        details: error.message
      })
    };
  }
};
