/**
 * E-signature service
 * Integrates with existing e-signature service from law-firm-client-portal
 */

const ESIGN_API_URL = import.meta.env.VITE_ESIGN_API_URL ||
  'https://law-firm-client-portal.netlify.app/.netlify/functions/esign';

/**
 * Create a signature request
 * @param {Object} options - Signature request options
 */
export async function createSignatureRequest({
  documentUrl,
  documentName,
  signerEmail,
  signerName,
  caseId,
  callbackUrl
}) {
  try {
    const response = await fetch(`${ESIGN_API_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentUrl,
        documentName,
        signerEmail,
        signerName,
        caseId,
        callbackUrl: callbackUrl || `${window.location.origin}/documents`,
        source: 'probate-app'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create signature request');
    }

    return await response.json();
  } catch (error) {
    console.error('E-sign error:', error);
    throw error;
  }
}

/**
 * Get signature request status
 */
export async function getSignatureStatus(requestId) {
  try {
    const response = await fetch(`${ESIGN_API_URL}/status/${requestId}`);

    if (!response.ok) {
      throw new Error('Failed to get signature status');
    }

    return await response.json();
  } catch (error) {
    console.error('E-sign status error:', error);
    throw error;
  }
}

/**
 * Cancel a signature request
 */
export async function cancelSignatureRequest(requestId) {
  try {
    const response = await fetch(`${ESIGN_API_URL}/cancel/${requestId}`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Failed to cancel signature request');
    }

    return await response.json();
  } catch (error) {
    console.error('E-sign cancel error:', error);
    throw error;
  }
}

/**
 * Signature status types
 */
export const SIGNATURE_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  VIEWED: 'viewed',
  SIGNED: 'signed',
  COMPLETED: 'completed',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

/**
 * Documents that typically require signatures
 */
export const SIGNABLE_DOCUMENTS = [
  { id: 'heir-waiver', name: 'Heir Bond Waiver', requiresWitness: false },
  { id: 'heir-consent', name: 'Heir Consent to Distribution', requiresWitness: false },
  { id: 'de-147', name: 'Duties and Liabilities Acknowledgment', requiresWitness: false },
  { id: 'distribution-receipt', name: 'Distribution Receipt', requiresWitness: false }
];
