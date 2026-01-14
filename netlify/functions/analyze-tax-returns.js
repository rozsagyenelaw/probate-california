const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { documentText, documentType, documentName } = JSON.parse(event.body);

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
