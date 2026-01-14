/**
 * Email notification service
 * Integrates with existing email service from law-firm-client-portal
 */

const EMAIL_API_URL = import.meta.env.VITE_EMAIL_API_URL ||
  'https://law-firm-client-portal.netlify.app/.netlify/functions/send-email';

/**
 * Send email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Email template name
 * @param {Object} options.data - Template data
 */
export async function sendEmail({ to, subject, template, data }) {
  try {
    const response = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        template,
        data
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

/**
 * Email templates for probate notifications
 */
export const EMAIL_TEMPLATES = {
  // Case created notification
  CASE_CREATED: 'probate-case-created',

  // Phase completion notifications
  INTAKE_COMPLETE: 'probate-intake-complete',
  PETITION_GENERATED: 'probate-petition-generated',
  PUBLICATION_COMPLETE: 'probate-publication-complete',
  HEARING_SCHEDULED: 'probate-hearing-scheduled',
  LETTERS_ISSUED: 'probate-letters-issued',
  INVENTORY_DUE: 'probate-inventory-due',
  CASE_CLOSED: 'probate-case-closed',

  // Reminder notifications
  DEADLINE_REMINDER: 'probate-deadline-reminder',
  HEARING_REMINDER: 'probate-hearing-reminder',

  // Admin notifications
  NEW_CASE_ADMIN: 'admin-new-case',
  DOCUMENT_UPLOADED: 'admin-document-uploaded'
};

/**
 * Send case created notification
 */
export async function sendCaseCreatedEmail(userEmail, caseData) {
  return sendEmail({
    to: userEmail,
    subject: `Probate Case Created - ${caseData.estateName}`,
    template: EMAIL_TEMPLATES.CASE_CREATED,
    data: {
      estateName: caseData.estateName,
      caseId: caseData.id,
      filingCounty: caseData.filingCounty,
      probateType: caseData.probateType,
      dashboardUrl: `${window.location.origin}/dashboard`
    }
  });
}

/**
 * Send hearing reminder
 */
export async function sendHearingReminder(userEmail, hearingData) {
  return sendEmail({
    to: userEmail,
    subject: `Hearing Reminder - ${hearingData.estateName}`,
    template: EMAIL_TEMPLATES.HEARING_REMINDER,
    data: {
      estateName: hearingData.estateName,
      hearingDate: hearingData.date,
      hearingTime: hearingData.time,
      courtAddress: hearingData.courtAddress,
      department: hearingData.department
    }
  });
}

/**
 * Send deadline reminder
 */
export async function sendDeadlineReminder(userEmail, deadline) {
  return sendEmail({
    to: userEmail,
    subject: `Deadline Reminder - ${deadline.title}`,
    template: EMAIL_TEMPLATES.DEADLINE_REMINDER,
    data: {
      title: deadline.title,
      dueDate: deadline.dueDate,
      description: deadline.description,
      dashboardUrl: `${window.location.origin}/dashboard`
    }
  });
}

/**
 * Notify admin of new case
 */
export async function notifyAdminNewCase(caseData) {
  const adminEmail = 'rozsa@myprobateca.com';
  return sendEmail({
    to: adminEmail,
    subject: `New Probate Case - ${caseData.estateName}`,
    template: EMAIL_TEMPLATES.NEW_CASE_ADMIN,
    data: {
      estateName: caseData.estateName,
      clientName: `${caseData.petitioner?.firstName} ${caseData.petitioner?.lastName}`,
      clientEmail: caseData.petitioner?.email,
      filingCounty: caseData.filingCounty,
      probateType: caseData.probateType,
      adminUrl: `${window.location.origin}/admin`
    }
  });
}
