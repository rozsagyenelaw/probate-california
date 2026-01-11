const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Firebase initialization
let db = null;
let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) return true;

  try {
    if (!admin.apps.length) {
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

      if (!serviceAccountJson) {
        console.error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
        return false;
      }

      let serviceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountJson);
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseError.message);
        return false;
      }

      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        console.error('Service account JSON is missing required fields');
        return false;
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || 'probate-california-38cf9'
      });

      console.log('Firebase Admin initialized successfully');
    }

    db = admin.firestore();
    firebaseInitialized = true;
    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
    return false;
  }
}

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'rozsagyenelaw1@gmail.com',
    pass: process.env.EMAIL_PASS
  }
});

// Send email notification to admin
async function sendAdminNotification(customerEmail, customerName, probateType, paymentPlan, amount) {
  const adminEmail = 'rozsagyenelaw@yahoo.com';
  const probateLabel = probateType === 'simplified' ? 'Simplified Probate ($2,495)' : 'Full Probate ($3,995)';
  const planLabel = paymentPlan === 'installments' ? '3 Monthly Installments' : 'Paid in Full';

  const mailOptions = {
    from: '"Probate California" <rozsagyenelaw1@gmail.com>',
    to: adminEmail,
    subject: `New Payment Received - ${probateLabel}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .highlight { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Probate Payment Received!</h1>
          </div>
          <div class="content">
            <p>A new payment has been completed on Probate California.</p>

            <div class="highlight">
              <p><strong>Customer Name:</strong> ${customerName || 'Not provided'}</p>
              <p><strong>Customer Email:</strong> ${customerEmail}</p>
              <p><strong>Service Type:</strong> ${probateLabel}</p>
              <p><strong>Payment Plan:</strong> ${planLabel}</p>
              <p><strong>Amount Paid:</strong> $${(amount / 100).toFixed(2)}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}</p>
            </div>

            <p><strong>Action Required:</strong> Please log into the <a href="https://probate-california.com/admin">Admin Panel</a> to view the case details.</p>
          </div>
          <div class="footer">
            <p>Probate California - Automated Notification</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification sent to:', adminEmail);
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}

// Send confirmation email to customer
async function sendCustomerConfirmation(customerEmail, customerName, probateType, paymentPlan) {
  const probateLabel = probateType === 'simplified' ? 'Simplified Probate' : 'Full Probate';
  const planLabel = paymentPlan === 'installments' ? '(3-payment plan)' : '';

  const mailOptions = {
    from: '"Probate California" <rozsagyenelaw1@gmail.com>',
    to: customerEmail,
    subject: 'Payment Confirmed - Your Probate Case Has Been Activated',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 40px 30px; }
          .content h2 { color: #1a202c; margin: 0 0 20px 0; }
          .content p { margin: 0 0 15px 0; color: #4a5568; }
          .highlight { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .highlight p { margin: 0; color: #065f46; }
          .steps { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .steps h3 { margin: 0 0 15px 0; color: #374151; }
          .steps ol { margin: 0; padding-left: 20px; }
          .steps li { margin-bottom: 10px; color: #4a5568; }
          .button { display: inline-block; padding: 14px 28px; background: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { margin: 5px 0; font-size: 13px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Thank you for choosing us, ${customerName || 'Valued Client'}!</h2>

            <div class="highlight">
              <p><strong>Your ${probateLabel} case ${planLabel} has been activated and assigned to Attorney Rozsa Gyene.</strong></p>
            </div>

            <div class="steps">
              <h3>What Happens Next?</h3>
              <ol>
                <li><strong>Case Review</strong> - Our attorney will review your case information within 24-48 business hours.</li>
                <li><strong>Document Preparation</strong> - We'll prepare all necessary court filings and documents for each phase.</li>
                <li><strong>You'll Be Notified</strong> - You'll receive notifications at each step through your dashboard.</li>
                <li><strong>Court Filings</strong> - We handle all 11 phases of the probate process on your behalf.</li>
              </ol>
            </div>

            <p>You can track the progress of your case anytime by logging into your dashboard:</p>

            <a href="https://probate-california.com/dashboard" class="button">View My Dashboard</a>

            <p>If you have any questions, please don't hesitate to contact us:</p>
            <p><strong>Phone:</strong> (818) 291-6217<br>
            <strong>Email:</strong> rozsagyenelaw@yahoo.com</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Law Offices of Rozsa Gyene. All rights reserved.</p>
            <p>Attorney Rozsa Gyene | California State Bar #208356</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Customer confirmation sent to:', customerEmail);
  } catch (error) {
    console.error('Error sending customer confirmation:', error);
  }
}

// Generate order number
function generateOrderNumber() {
  return '#PCA' + Date.now().toString().slice(-8);
}

// Update user payment status in Firebase
async function updateUserPaymentStatus(customerEmail, probateType, paymentPlan, sessionMetadata, amount) {
  console.log('=== updateUserPaymentStatus called ===');
  console.log('Email:', customerEmail, 'Type:', probateType, 'Plan:', paymentPlan);

  if (!initializeFirebase()) {
    console.error('Firebase not available');
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    // Find user by email
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef
      .where('email', '==', customerEmail.toLowerCase())
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      console.warn('User not found for email:', customerEmail);
      // Create a payment record anyway
      const orderNumber = generateOrderNumber();
      await db.collection('payments').add({
        email: customerEmail.toLowerCase(),
        probateType: probateType,
        paymentPlan: paymentPlan,
        amount: amount,
        status: 'completed',
        orderNumber: orderNumber,
        stripeSessionId: sessionMetadata.sessionId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { success: true, orderNumber: orderNumber, action: 'payment_recorded' };
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const orderNumber = generateOrderNumber();

    // Update user record with payment info
    await userDoc.ref.update({
      paymentStatus: paymentPlan === 'installments' ? 'installments_active' : 'paid',
      probateType: probateType,
      paymentPlan: paymentPlan,
      amountPaid: amount,
      orderNumber: orderNumber,
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      stripeSessionId: sessionMetadata.sessionId,
      installmentsRemaining: paymentPlan === 'installments' ? 2 : 0, // 2 more after first
    });

    console.log('User payment status updated for:', customerEmail);

    // Also update the case if caseId was provided
    if (sessionMetadata.caseId) {
      const caseRef = db.collection('cases').doc(sessionMetadata.caseId);
      const caseDoc = await caseRef.get();
      if (caseDoc.exists) {
        await caseRef.update({
          paymentStatus: paymentPlan === 'installments' ? 'installments_active' : 'paid',
          probateType: probateType,
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('Case payment status updated:', sessionMetadata.caseId);
      }
    }

    return {
      success: true,
      orderNumber: orderNumber,
      customerName: userData.displayName || userData.name || null,
      action: 'updated'
    };
  } catch (error) {
    console.error('Error updating user payment status:', error.message);
    return { success: false, error: error.message };
  }
}

// Handle subscription payment for installments
async function handleSubscriptionPayment(customerEmail, paymentNumber) {
  if (!initializeFirebase()) {
    console.error('Firebase not available');
    return;
  }

  try {
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef
      .where('email', '==', customerEmail.toLowerCase())
      .limit(1)
      .get();

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      const remaining = (userData.installmentsRemaining || 2) - 1;

      await userDoc.ref.update({
        installmentsRemaining: remaining,
        lastInstallmentAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentStatus: remaining <= 0 ? 'paid' : 'installments_active',
      });

      console.log(`Installment payment recorded. Remaining: ${remaining}`);
    }
  } catch (error) {
    console.error('Error handling subscription payment:', error.message);
  }
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    // Verify the webhook signature
    if (webhookSecret && sig) {
      stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
    } else {
      // For testing without signature verification
      stripeEvent = JSON.parse(event.body);
      console.warn('Warning: Webhook signature not verified');
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  console.log('Received Stripe event:', stripeEvent.type);

  // Handle the checkout.session.completed event
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    console.log('Checkout session completed:', session.id);
    console.log('Customer email:', session.customer_email);
    console.log('Amount total:', session.amount_total);
    console.log('Metadata:', session.metadata);

    const customerEmail = session.customer_email || session.customer_details?.email;
    const amountTotal = session.amount_total;
    const metadata = session.metadata || {};

    if (customerEmail) {
      const probateType = metadata.probateType || 'full';
      const paymentPlan = metadata.paymentPlan || 'full';
      let customerName = null;

      // Update user payment status in Firebase
      console.log('=== Starting Firebase update ===');
      try {
        const updateResult = await updateUserPaymentStatus(
          customerEmail,
          probateType,
          paymentPlan,
          {
            sessionId: session.id,
            caseId: metadata.caseId,
          },
          amountTotal
        );

        if (updateResult.success) {
          customerName = updateResult.customerName;
          console.log('Firebase update successful. Order:', updateResult.orderNumber);
        } else {
          console.warn('Firebase update failed:', updateResult.error);
        }

        // Track promo code usage if one was used
        if (metadata.promoCode && metadata.promoCode.trim() !== '') {
          try {
            const promoSnapshot = await db.collection('promoCodes')
              .where('code', '==', metadata.promoCode.toUpperCase())
              .limit(1)
              .get();

            if (!promoSnapshot.empty) {
              const promoDoc = promoSnapshot.docs[0];
              await promoDoc.ref.update({
                usageCount: admin.firestore.FieldValue.increment(1),
                lastUsedAt: admin.firestore.FieldValue.serverTimestamp()
              });
              console.log('Promo code usage tracked:', metadata.promoCode);
            }
          } catch (promoError) {
            console.error('Error tracking promo code:', promoError.message);
          }
        }
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError.message);
      }

      // Send email notifications
      console.log('Sending email notifications...');

      try {
        await sendAdminNotification(
          customerEmail,
          customerName,
          probateType,
          paymentPlan,
          amountTotal
        );
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError.message);
      }

      try {
        await sendCustomerConfirmation(
          customerEmail,
          customerName,
          probateType,
          paymentPlan
        );
      } catch (emailError) {
        console.error('Failed to send customer confirmation:', emailError.message);
      }

      console.log('Payment processing complete for:', customerEmail);
    }
  }

  // Handle subscription invoice paid (for installment payments)
  if (stripeEvent.type === 'invoice.paid') {
    const invoice = stripeEvent.data.object;
    const customerEmail = invoice.customer_email;

    if (invoice.billing_reason === 'subscription_cycle') {
      console.log('Subscription payment received for:', customerEmail);
      await handleSubscriptionPayment(customerEmail);
    }
  }

  // Handle subscription completed (all 3 payments made)
  if (stripeEvent.type === 'customer.subscription.updated') {
    const subscription = stripeEvent.data.object;

    // Check if subscription should be cancelled after 3 payments
    if (subscription.metadata?.totalPayments === '3') {
      const invoicesCount = await stripe.invoices.list({
        subscription: subscription.id,
        status: 'paid',
        limit: 10
      });

      if (invoicesCount.data.length >= 3) {
        console.log('All 3 installments completed, canceling subscription');
        await stripe.subscriptions.cancel(subscription.id);
      }
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ received: true }),
  };
};
