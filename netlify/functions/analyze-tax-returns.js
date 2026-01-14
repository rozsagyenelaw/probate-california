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
    const { taxReturnText, year } = JSON.parse(event.body);

    if (!taxReturnText) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No tax return text provided' })
      };
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const prompt = `You are an expert estate planning assistant analyzing tax returns to discover potential assets for probate administration.

Analyze the following tax return text and identify ALL potential assets. Look for:

1. **Bank Accounts** - Look for:
   - Schedule B interest income (Form 1099-INT)
   - Bank names and implied account types
   - Any interest over $10 suggests an account

2. **Investment/Brokerage Accounts** - Look for:
   - Schedule B dividend income (Form 1099-DIV)
   - Schedule D capital gains/losses
   - Brokerage firm names (Fidelity, Schwab, Vanguard, etc.)

3. **Retirement Accounts** - Look for:
   - Form 1099-R distributions (IRA, 401k, pension)
   - Employer names that might have old 401(k)s
   - Pension income sources

4. **Real Estate** - Look for:
   - Schedule E rental income/expenses
   - Property addresses
   - Mortgage interest deductions (Schedule A)
   - Property tax deductions

5. **Business Interests** - Look for:
   - Schedule C business income
   - Schedule K-1 partnership/S-corp income
   - Business names and EINs

6. **Life Insurance** - Look for:
   - Life insurance premium deductions
   - Employer-provided life insurance

7. **Other Assets** - Look for:
   - Royalty income (oil, gas, intellectual property)
   - Trust income
   - Annuity payments
   - Social Security (indicates possible survivor benefits)

TAX RETURN TEXT:
${taxReturnText}

Respond in this exact JSON format:
{
  "assets": [
    {
      "type": "Bank Account|Investment|Retirement|Real Estate|Business|Life Insurance|Other",
      "institution": "Name of bank/company/entity",
      "description": "Brief description of what was found",
      "evidence": "The specific line item or text that indicates this asset",
      "estimatedValue": "If determinable from the return, otherwise null",
      "actionRequired": "What the executor should do to investigate this"
    }
  ],
  "summary": {
    "totalAssetsFound": 0,
    "highPriorityItems": ["List items that need immediate attention"],
    "recommendations": ["General recommendations for the executor"]
  }
}

Be thorough. It's better to flag a potential asset that turns out to be nothing than to miss a real asset. If you see any financial institution name, flag it.`;

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
        summary: {
          totalAssetsFound: 0,
          highPriorityItems: [],
          recommendations: ['Manual review required - AI could not parse return']
        },
        rawResponse: responseText
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        year: year,
        analysis: analysisResult
      })
    };

  } catch (error) {
    console.error('Error analyzing tax return:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to analyze tax return',
        details: error.message
      })
    };
  }
};
