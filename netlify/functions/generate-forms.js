/**
 * Proxy function for form generation to avoid CORS issues
 * Calls the external probate petition API server-side
 */

const FORMS_API_URL = process.env.PROBATE_FORMS_URL || 'https://probatepetition.netlify.app';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const caseData = JSON.parse(event.body);

    // Transform case data to form data format
    const formData = transformCaseToFormData(caseData);

    console.log('Generating forms for case:', caseData.estateName || 'Unknown');

    // Call the external API
    const response = await fetch(`${FORMS_API_URL}/.netlify/functions/process-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      throw new Error(`Form generation failed: ${errorText}`);
    }

    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
    } else if (contentType?.includes('application/pdf')) {
      const buffer = await response.arrayBuffer();
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${caseData.estateName || 'probate'}-forms.pdf"`,
        },
        body: Buffer.from(buffer).toString('base64'),
        isBase64Encoded: true,
      };
    } else if (contentType?.includes('application/zip')) {
      const buffer = await response.arrayBuffer();
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${caseData.estateName || 'probate'}-forms.zip"`,
        },
        body: Buffer.from(buffer).toString('base64'),
        isBase64Encoded: true,
      };
    }

    // Default to JSON response
    const data = await response.text();
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: data,
    };

  } catch (error) {
    console.error('Form generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Failed to generate forms',
        details: 'Please contact support at (818) 291-6217'
      }),
    };
  }
};

/**
 * Transform case data to the format expected by the forms generator
 */
function transformCaseToFormData(caseData) {
  const { decedent, petitioner, heirs, assets, liabilities, willExists, willDate, namedExecutor } = caseData;

  // Calculate total estate value
  const totalRealProperty = (assets?.realProperty || []).reduce(
    (sum, p) => sum + (parseFloat(p.estimatedValue) || 0), 0
  );
  const totalFinancial = (assets?.financialAccounts || []).reduce(
    (sum, a) => sum + (parseFloat(a.estimatedValue) || 0), 0
  );
  const totalVehicles = (assets?.vehicles || []).reduce(
    (sum, v) => sum + (parseFloat(v.estimatedValue) || 0), 0
  );
  const totalPersonalProperty = (assets?.personalProperty || []).reduce(
    (sum, p) => sum + (parseFloat(p.estimatedValue) || 0), 0
  );
  const totalAssets = totalRealProperty + totalFinancial + totalVehicles + totalPersonalProperty;
  const totalLiabilitiesAmount = (liabilities || []).reduce(
    (sum, l) => sum + (parseFloat(l.amountOwed) || 0), 0
  );

  return {
    // Decedent info
    decedentFirstName: decedent?.firstName || '',
    decedentMiddleName: decedent?.middleName || '',
    decedentLastName: decedent?.lastName || '',
    decedentFullName: [decedent?.firstName, decedent?.middleName, decedent?.lastName]
      .filter(Boolean).join(' '),
    dateOfDeath: decedent?.dateOfDeath || '',
    dateOfBirth: decedent?.dateOfBirth || '',
    placeOfDeath: decedent?.placeOfDeath || '',
    decedentStreet: decedent?.lastAddress?.street || '',
    decedentCity: decedent?.lastAddress?.city || '',
    decedentState: decedent?.lastAddress?.state || 'CA',
    decedentZip: decedent?.lastAddress?.zip || '',
    decedentCounty: decedent?.lastAddress?.county || '',
    maritalStatus: decedent?.maritalStatus || '',
    ssnLast4: decedent?.ssnLast4 || '',

    // Petitioner info
    petitionerFirstName: petitioner?.firstName || '',
    petitionerLastName: petitioner?.lastName || '',
    petitionerFullName: [petitioner?.firstName, petitioner?.lastName].filter(Boolean).join(' '),
    petitionerRelationship: petitioner?.relationship || '',
    petitionerPhone: petitioner?.phone || '',
    petitionerEmail: petitioner?.email || '',
    petitionerStreet: petitioner?.address?.street || '',
    petitionerCity: petitioner?.address?.city || '',
    petitionerState: petitioner?.address?.state || 'CA',
    petitionerZip: petitioner?.address?.zip || '',
    isCAResident: petitioner?.isCAResident ? 'Yes' : 'No',

    // Will info
    willExists: willExists ? 'Yes' : 'No',
    willDate: willDate || '',
    namedExecutor: namedExecutor || '',
    probateType: willExists ? 'Testate' : 'Intestate',

    // Heirs
    heirs: (heirs || []).map(heir => ({
      name: [heir.firstName, heir.lastName].filter(Boolean).join(' '),
      relationship: heir.relationship || '',
      age: heir.age || 'Adult',
      street: heir.address?.street || '',
      city: heir.address?.city || '',
      state: heir.address?.state || 'CA',
      zip: heir.address?.zip || '',
      sharePercentage: heir.sharePercentage || '',
      isDeceased: heir.isDeceased || false,
      waivedBond: heir.waivedBond || false
    })),

    // Assets
    realProperty: (assets?.realProperty || []).map(prop => ({
      address: prop.address || '',
      apn: prop.apn || '',
      value: prop.estimatedValue || 0,
      titleHolding: prop.titleHolding || '',
      mortgageBalance: prop.mortgageBalance || 0,
      lender: prop.lender || ''
    })),

    financialAccounts: (assets?.financialAccounts || []).map(acc => ({
      type: acc.accountType || '',
      institution: acc.institutionName || '',
      value: acc.estimatedValue || 0
    })),

    vehicles: (assets?.vehicles || []).map(v => ({
      description: [v.year, v.make, v.model].filter(Boolean).join(' '),
      value: v.estimatedValue || 0,
      vin: v.vin || '',
      lienHolder: v.lienHolder || '',
      lienAmount: v.lienAmount || 0
    })),

    personalProperty: (assets?.personalProperty || []).map(p => ({
      description: p.description || '',
      value: p.estimatedValue || 0
    })),

    // Totals
    totalRealProperty,
    totalPersonalProperty: totalFinancial + totalVehicles + totalPersonalProperty,
    totalAssets,
    totalLiabilities: totalLiabilitiesAmount,
    netEstateValue: totalAssets - totalLiabilitiesAmount,

    // Liabilities
    liabilities: (liabilities || []).map(l => ({
      creditor: l.creditorName || '',
      type: l.debtType || '',
      amount: l.amountOwed || 0
    })),

    // Filing info
    filingCounty: decedent?.lastAddress?.county || caseData.filingCounty || '',
    filingDate: new Date().toISOString().split('T')[0]
  };
}
