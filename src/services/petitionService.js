import { PROBATE_FORMS_URL } from './firebase';

/**
 * Probate petition generation service
 * Integrates with probatepetition.netlify.app for PDF form generation
 */

const FORMS_API_URL = `${PROBATE_FORMS_URL}/.netlify/functions/process-form`;

/**
 * Generate probate petition forms from case data
 * @param {Object} caseData - The probate case data
 * @returns {Promise<Object>} - The generated forms result
 */
export async function generatePetition(caseData) {
  const formData = transformCaseToFormData(caseData);

  try {
    const response = await fetch(FORMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Form generation failed: ${error}`);
    }

    // The response could be JSON with download URLs or a blob
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (contentType?.includes('application/pdf') || contentType?.includes('application/zip')) {
      const blob = await response.blob();
      return {
        type: contentType.includes('pdf') ? 'pdf' : 'zip',
        blob,
        filename: getFilenameFromResponse(response) || 'probate-forms.pdf'
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating petition:', error);
    throw error;
  }
}

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
  const totalLiabilities = (liabilities || []).reduce(
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
    totalLiabilities,
    netEstateValue: totalAssets - totalLiabilities,

    // Liabilities
    liabilities: (liabilities || []).map(l => ({
      creditor: l.creditorName || '',
      type: l.debtType || '',
      amount: l.amountOwed || 0
    })),

    // Filing info
    filingCounty: decedent?.lastAddress?.county || '',
    filingDate: new Date().toISOString().split('T')[0]
  };
}

/**
 * Get filename from response headers
 */
function getFilenameFromResponse(response) {
  const disposition = response.headers.get('content-disposition');
  if (disposition) {
    const match = disposition.match(/filename="?([^";\n]+)"?/);
    if (match) return match[1];
  }
  return null;
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Get list of forms to be generated based on case data
 */
export function getRequiredForms(caseData) {
  const forms = [];
  const { willExists, assets } = caseData;
  const hasRealProperty = assets?.realProperty?.length > 0;

  // DE-111 Petition for Probate (required)
  forms.push({
    id: 'de-111',
    name: 'DE-111',
    title: 'Petition for Probate',
    description: willExists
      ? 'Petition for Probate of Will and for Letters Testamentary'
      : 'Petition for Letters of Administration',
    required: true
  });

  // DE-121 Notice of Petition (required)
  forms.push({
    id: 'de-121',
    name: 'DE-121',
    title: 'Notice of Petition to Administer Estate',
    description: 'Notice to heirs and creditors of the probate filing',
    required: true
  });

  // Attachment 3 - Decedent's Residence
  forms.push({
    id: 'attachment-3',
    name: 'Attachment 3',
    title: 'Attachment to Petition',
    description: 'Additional information about the decedent',
    required: true
  });

  // Attachment 8 - Estate assets
  forms.push({
    id: 'attachment-8',
    name: 'Attachment 8',
    title: 'Property Attachment',
    description: 'List of estate assets',
    required: true
  });

  // DE-140 Order for Probate
  forms.push({
    id: 'de-140',
    name: 'DE-140',
    title: 'Order for Probate',
    description: 'Court order to be signed by judge',
    required: true
  });

  // DE-147 Duties and Liabilities
  forms.push({
    id: 'de-147',
    name: 'DE-147',
    title: 'Duties and Liabilities of Personal Representative',
    description: 'Acknowledgment of executor/administrator duties',
    required: true
  });

  // GC-348 Confidential Info
  forms.push({
    id: 'gc-348',
    name: 'GC-348',
    title: 'Confidential Supplemental Information',
    description: 'Confidential information not part of public record',
    required: true
  });

  return forms;
}
