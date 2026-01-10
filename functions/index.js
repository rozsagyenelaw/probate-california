require('dotenv').config();
const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const axios = require('axios');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Create Gmail transporter using environment variables
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// ClickSend credentials from environment variables
const CLICKSEND_USERNAME = process.env.CLICKSEND_USERNAME;
const CLICKSEND_API_KEY = process.env.CLICKSEND_API_KEY;

// Helper function to send SMS using ClickSend REST API
async function sendSMS(phoneNumber, message) {
  try {
    console.log('=== STARTING SMS SEND ===');
    console.log('Phone Number:', phoneNumber);
    console.log('Message Length:', message.length);

    // Format phone number (remove any non-digits and ensure it has country code)
    let formattedPhone = phoneNumber.replace(/\D/g, '');

    if (!formattedPhone.startsWith('1') && formattedPhone.length === 10) {
      formattedPhone = '1' + formattedPhone;
    }

    console.log('Formatted Phone:', formattedPhone);

    // Create Basic Auth token
    const authToken = Buffer.from(`${CLICKSEND_USERNAME}:${CLICKSEND_API_KEY}`).toString('base64');

    // ClickSend API payload
    const payload = {
      messages: [
        {
          to: `+${formattedPhone}`,
          body: message,
          source: 'probate-app'
        }
      ]
    };

    // Make API call
    const response = await axios.post('https://rest.clicksend.com/v3/sms/send', payload, {
      headers: {
        'Authorization': `Basic ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('SMS sent successfully to', formattedPhone);
    return { success: true, data: response.data };

  } catch (error) {
    console.error('SMS Send Error:', error.message);
    if (error.response) {
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, error: error.message, details: error.response?.data };
  }
}

// ============================================================
// Send Signature Request Notification
// ============================================================
exports.sendSignatureRequestNotification = functions.https.onCall({
  cors: ['https://probate.livingtrust-attorneys.com', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
}, async (request) => {
  const {
    requestId,
    clientName,
    clientEmail,
    clientPhone,
    documentTitle,
    message,
    sendViaEmail,
    sendViaSMS
  } = request.data;

  if (!clientName || !clientEmail || !documentTitle) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Client name, email, and document title are required'
    );
  }

  if (!sendViaEmail && !sendViaSMS) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'At least one notification method (email or SMS) must be selected'
    );
  }

  try {
    console.log('===== SIGNATURE REQUEST NOTIFICATION =====');
    console.log('Request ID:', requestId);
    console.log('Sending TO:', clientEmail);
    console.log('Client Name:', clientName);
    console.log('Document:', documentTitle);
    console.log('Send via Email:', sendViaEmail);
    console.log('Send via SMS:', sendViaSMS);

    const results = {
      email: { attempted: sendViaEmail, success: false, error: null },
      sms: { attempted: sendViaSMS, success: false, error: null }
    };

    // Send email notification
    if (sendViaEmail) {
      try {
        console.log('Attempting to send email notification...');
        const signatureUrl = `https://probate.livingtrust-attorneys.com/sign/${requestId}`;
        console.log('Signature URL:', signatureUrl);

        const emailContent = {
          from: '"California Probate Services" <rozsagyenelaw1@gmail.com>',
          to: clientEmail,
          subject: `Signature Requested: ${documentTitle}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                .document-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a8a; }
                .btn-sign { display: inline-block; background-color: #1e3a8a; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
                .message-box { background-color: #eff6ff; border: 2px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">Signature Requested</h1>
                </div>
                <div class="content">
                  <h2 style="color: #1e3a8a;">Dear ${clientName},</h2>
                  <p>You have been requested to review and sign the following document for your probate case:</p>

                  <div class="document-box">
                    <h3 style="color: #1e3a8a; margin-top: 0;">${documentTitle}</h3>
                  </div>

                  ${message ? `
                  <div class="message-box">
                    <h4 style="color: #1e40af; margin-top: 0;">Message from Attorney:</h4>
                    <p style="color: #1e40af; margin: 0;">${message}</p>
                  </div>
                  ` : ''}

                  <div style="text-align: center;">
                    <a href="${signatureUrl}" class="btn-sign" style="color: #ffffff !important; text-decoration: none;">Review & Sign Document</a>
                  </div>

                  <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                    Please click the button above to review the document and add your signature. If you have any questions, please contact our office.
                  </p>
                </div>
                <div class="footer">
                  <p style="margin: 5px 0;"><strong>California Probate Services</strong></p>
                  <p style="margin: 5px 0;">Law Offices of Rozsa Gyene</p>
                  <p style="margin: 5px 0;">rozsagyenelaw1@gmail.com</p>
                  <p style="margin-top: 15px; color: #9ca3af;">${new Date().getFullYear()} California Probate Services. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `
        };

        console.log('Sending email to:', clientEmail);
        await gmailTransporter.sendMail(emailContent);
        console.log('EMAIL notification sent successfully');
        results.email.success = true;
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        results.email.error = emailError.message;
      }
    }

    // Send SMS notification
    if (sendViaSMS && clientPhone && clientPhone.trim() !== '') {
      try {
        console.log('Attempting to send SMS notification...');
        const smsMessage = `California Probate: Document ready to sign. Check your email for the secure link. Reply STOP to opt out.`;

        const smsResult = await sendSMS(clientPhone, smsMessage);
        if (smsResult.success) {
          console.log('SMS notification sent successfully');
          results.sms.success = true;
        } else {
          console.error('SMS notification failed:', smsResult.error);
          results.sms.error = smsResult.error;
        }
      } catch (smsError) {
        console.error('SMS notification failed:', smsError);
        results.sms.error = smsError.message;
      }
    } else if (sendViaSMS && (!clientPhone || clientPhone.trim() === '')) {
      console.log('SMS requested but no phone number provided');
      results.sms.error = 'No phone number provided';
    }

    // Check if at least one notification succeeded
    const anySuccess = (sendViaEmail && results.email.success) || (sendViaSMS && results.sms.success);

    console.log('=== NOTIFICATION RESULTS ===');
    console.log('Email:', results.email);
    console.log('SMS:', results.sms);

    if (!anySuccess) {
      const errorMessage = `Failed to send signature request notification: ${
        sendViaEmail && results.email.error ? `Email: ${results.email.error}` : ''
      }${sendViaEmail && sendViaSMS && results.email.error && results.sms.error ? ', ' : ''}${
        sendViaSMS && results.sms.error ? `SMS: ${results.sms.error}` : ''
      }`.trim();

      throw new functions.https.HttpsError(
        'internal',
        errorMessage,
        results
      );
    }

    console.log('Signature request notification completed');

    return {
      success: true,
      message: 'Signature request notification sent',
      results: results
    };

  } catch (error) {
    console.error('Error sending signature request notification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send signature request notification: ' + error.message);
  }
});

// ============================================================
// Generate Signed PDF
// ============================================================
exports.generateSignedPdf = functions.https.onCall({
  cors: ['https://probate.livingtrust-attorneys.com', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
}, async (request) => {
  const { PDFDocument } = require('pdf-lib');

  const {
    originalPdfUrl,
    signatures,
    signatureFields,
    requestId
  } = request.data;

  if (!originalPdfUrl || !signatures || !signatureFields || !requestId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required parameters'
    );
  }

  try {
    console.log('===== GENERATING SIGNED PDF =====');
    console.log('Request ID:', requestId);
    console.log('Original PDF:', originalPdfUrl);
    console.log('Signatures count:', signatures.length);

    // Download the original PDF
    const pdfResponse = await axios.get(originalPdfUrl, {
      responseType: 'arraybuffer'
    });

    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfResponse.data);
    const pages = pdfDoc.getPages();

    // Embed each signature
    for (let i = 0; i < signatures.length; i++) {
      const signatureData = signatures[i];
      const field = signatureFields[i];

      if (!signatureData || !field) continue;

      console.log(`Embedding signature ${i + 1} on page ${field.page}`);

      // Convert base64 to PNG image
      const imageBytes = Buffer.from(signatureData.split(',')[1], 'base64');
      const signatureImage = await pdfDoc.embedPng(imageBytes);

      const page = pages[field.page - 1]; // Pages are 0-indexed
      const { width, height } = page.getSize();

      // Calculate position (field.x and field.y are percentages)
      const x = (field.x / 100) * width - 75; // Center the 150px wide signature
      const y = height - ((field.y / 100) * height) - 25; // Flip Y axis and center 50px high signature

      // Draw the signature on the page
      page.drawImage(signatureImage, {
        x: x,
        y: y,
        width: 150,
        height: 50,
      });
    }

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const fileName = `signed-documents/${requestId}/signed-${Date.now()}.pdf`;
    const file = bucket.file(fileName);

    await file.save(Buffer.from(pdfBytes), {
      metadata: {
        contentType: 'application/pdf',
      },
    });

    // Make the file publicly accessible
    await file.makePublic();

    // Get the public URL
    const signedPdfUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    console.log('Signed PDF generated successfully');
    console.log('Signed PDF URL:', signedPdfUrl);

    return {
      success: true,
      signedPdfUrl: signedPdfUrl
    };

  } catch (error) {
    console.error('Error generating signed PDF:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate signed PDF: ' + error.message);
  }
});

// ============================================================
// Send Document Notification Email
// ============================================================
exports.sendDocumentNotification = functions.https.onCall({
  cors: ['https://probate.livingtrust-attorneys.com', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
}, async (request) => {
  const {
    clientName,
    clientEmail,
    documentTitle,
    message,
    documentUrl
  } = request.data;

  if (!clientName || !clientEmail || !documentTitle) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Client name, email, and document title are required'
    );
  }

  try {
    console.log('===== SENDING DOCUMENT NOTIFICATION =====');
    console.log('Sending TO:', clientEmail);
    console.log('Client Name:', clientName);
    console.log('Document:', documentTitle);

    const portalUrl = 'https://probate.livingtrust-attorneys.com/documents';

    const emailContent = {
      from: '"California Probate Services" <rozsagyenelaw1@gmail.com>',
      to: clientEmail,
      subject: `New Document Available: ${documentTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .document-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a8a; }
            .btn { display: inline-block; background-color: #1e3a8a; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
            .message-box { background-color: #eff6ff; border: 2px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New Document Available</h1>
            </div>
            <div class="content">
              <h2 style="color: #1e3a8a;">Dear ${clientName},</h2>
              <p>A new document has been uploaded to your probate case:</p>

              <div class="document-box">
                <h3 style="color: #1e3a8a; margin-top: 0;">${documentTitle}</h3>
              </div>

              ${message ? `
              <div class="message-box">
                <h4 style="color: #1e40af; margin-top: 0;">Message from Attorney:</h4>
                <p style="color: #1e40af; margin: 0;">${message}</p>
              </div>
              ` : ''}

              <div style="text-align: center;">
                <a href="${portalUrl}" class="btn" style="color: #ffffff !important; text-decoration: none;">View in Portal</a>
              </div>

              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                Please log into your client portal to view and download the document. If you have any questions, please contact our office.
              </p>
            </div>
            <div class="footer">
              <p style="margin: 5px 0;"><strong>California Probate Services</strong></p>
              <p style="margin: 5px 0;">Law Offices of Rozsa Gyene</p>
              <p style="margin: 5px 0;">rozsagyenelaw1@gmail.com</p>
              <p style="margin-top: 15px; color: #9ca3af;">${new Date().getFullYear()} California Probate Services. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await gmailTransporter.sendMail(emailContent);
    console.log('Document notification sent successfully');

    return {
      success: true,
      message: 'Document notification sent'
    };

  } catch (error) {
    console.error('Error sending document notification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send document notification: ' + error.message);
  }
});
