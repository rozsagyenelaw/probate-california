const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

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

// Emails: written to Firestore mailOutbox; the portal's onMailOutbox function renders them with the
// shared templates (myprobateca-portal/functions/emails) and sends them from rozsa@myprobateca.com.
// The same job stops the client's marketing emails (payment stops the drip).
async function queuePaymentEmails({ customerEmail, customerName, serviceType, probateType, accountingAddon, paymentPlan, amount, orderNumber, sessionId, uid }) {
  if (!initializeFirebase()) {
    console.error('Firebase not available: payment emails not queued');
    return;
  }
  const data = {
    customerName: customerName || '',
    customerEmail: customerEmail.toLowerCase(),
    serviceType,
    probateType: probateType || null,
    accountingAddon: accountingAddon || null,
    paymentPlan,
    amount,
    orderNumber: orderNumber || '',
    stripeSessionId: sessionId
  };
  const now = admin.firestore.FieldValue.serverTimestamp();
  const outbox = db.collection('mailOutbox');
  await outbox.doc(`pay-client-${sessionId}`).set({ template: 'paymentConfirmation', to: data.customerEmail, uid: uid || null, data, stopDripFor: data.customerEmail, source: 'stripe-webhook', createdAt: now });
  await outbox.doc(`pay-office-${sessionId}`).set({ template: 'paymentAlert', to: 'office', replyTo: data.customerEmail, data, source: 'stripe-webhook', createdAt: now });
  console.log('Payment emails queued for session', sessionId);
}

// Generate order number
function generateOrderNumber() {
  return '#PCA' + Date.now().toString().slice(-8);
}

// Update user payment status in Firebase
async function updateUserPaymentStatus(customerEmail, serviceType, probateType, accountingAddon, paymentPlan, sessionMetadata, amount) {
  console.log('=== updateUserPaymentStatus called ===');
  console.log('Email:', customerEmail, 'ServiceType:', serviceType, 'ProbateType:', probateType, 'AccountingAddon:', accountingAddon);

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

    const orderNumber = generateOrderNumber();

    // Build the payment record
    const paymentRecord = {
      email: customerEmail.toLowerCase(),
      serviceType: serviceType,
      probateType: probateType || null,
      addOns: {
        accounting: accountingAddon || null,
      },
      paymentPlan: paymentPlan,
      totalPaid: amount,
      paymentStatus: paymentPlan === 'installments' ? 'installments_active' : 'paid',
      orderNumber: orderNumber,
      stripeSessionId: sessionMetadata.sessionId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (userSnapshot.empty) {
      console.warn('User not found for email:', customerEmail);
      // Create a payment record anyway
      await db.collection('payments').add(paymentRecord);
      // Ask the portal to create the client's account (one per email) and send the welcome email
      await db.collection('accountRequests').add({
        email: customerEmail.toLowerCase(),
        name: sessionMetadata.customerName || '',
        source: 'payment',
        orderNumber,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, orderNumber: orderNumber, action: 'payment_recorded' };
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Update user record with payment info
    await userDoc.ref.update({
      paymentStatus: paymentPlan === 'installments' ? 'installments_active' : 'paid',
      serviceType: serviceType,
      probateType: probateType || null,
      addOns: {
        accounting: accountingAddon || null,
      },
      paymentPlan: paymentPlan,
      amountPaid: amount,
      orderNumber: orderNumber,
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      stripeSessionId: sessionMetadata.sessionId,
      installmentsRemaining: paymentPlan === 'installments' ? 2 : 0,
    });

    console.log('User payment status updated for:', customerEmail);

    // Payment record tied to the client's account, so it shows in their dashboard
    await db.collection('payments').add({ ...paymentRecord, userId: userDoc.id });

    // Paid without a case yet (e.g. paid from the pricing page): open one for them
    if (!sessionMetadata.caseId) {
      const existingCases = await db.collection('cases').where('userId', '==', userDoc.id).limit(1).get();
      if (existingCases.empty) {
        await db.collection('cases').add({
          userId: userDoc.id,
          clientEmail: customerEmail.toLowerCase(),
          status: 'intake_pending',
          paymentStatus: paymentPlan === 'installments' ? 'installments_active' : 'paid',
          serviceType,
          probateType: probateType || null,
          addOns: { accounting: accountingAddon || null },
          orderNumber,
          source: 'payment',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          paidAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        await existingCases.docs[0].ref.update({
          paymentStatus: paymentPlan === 'installments' ? 'installments_active' : 'paid',
          serviceType,
          paidAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    // Also update the case if caseId was provided
    if (sessionMetadata.caseId) {
      const caseRef = db.collection('cases').doc(sessionMetadata.caseId);
      const caseDoc = await caseRef.get();
      if (caseDoc.exists) {
        await caseRef.update({
          paymentStatus: paymentPlan === 'installments' ? 'installments_active' : 'paid',
          serviceType: serviceType,
          probateType: probateType || null,
          addOns: {
            accounting: accountingAddon || null,
          },
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('Case payment status updated:', sessionMetadata.caseId);
      }
    }

    return {
      success: true,
      orderNumber: orderNumber,
      customerName: [userData.firstName, userData.lastName].filter(Boolean).join(' ') || userData.displayName || userData.name || null,
      uid: userDoc.id,
      action: 'updated'
    };
  } catch (error) {
    console.error('Error updating user payment status:', error.message);
    return { success: false, error: error.message };
  }
}

// Handle subscription payment for installments
async function handleSubscriptionPayment(customerEmail) {
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

  // Every event must carry a valid Stripe signature; nothing is processed otherwise
  if (!webhookSecret || !sig) {
    console.error('Rejected webhook: missing', !webhookSecret ? 'STRIPE_WEBHOOK_SECRET' : 'stripe-signature header');
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Webhook Error: missing signature' }),
    };
  }

  let stripeEvent;

  try {
    const rawBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
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

    // Only process payments for the probate app
    if (metadata.app !== 'probate') {
      console.log('Skipping non-probate payment (app:', metadata.app || 'not set', ')');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ received: true, skipped: 'not a probate payment' }),
      };
    }

    if (customerEmail) {
      const serviceType = metadata.serviceType || 'full';
      const probateType = metadata.probateType || null;
      const accountingAddon = metadata.accountingAddon || null;
      const paymentPlan = metadata.paymentPlan || 'full';
      let customerName = null;
      let orderNumber = null;
      let paymentUid = null;

      // Update user payment status in Firebase
      console.log('=== Starting Firebase update ===');
      try {
        const updateResult = await updateUserPaymentStatus(
          customerEmail,
          serviceType,
          probateType,
          accountingAddon,
          paymentPlan,
          {
            sessionId: session.id,
            caseId: metadata.caseId,
          },
          amountTotal
        );

        if (updateResult.success) {
          customerName = updateResult.customerName;
          orderNumber = updateResult.orderNumber;
          paymentUid = updateResult.uid || null;
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

      // Client confirmation and office alert (sent by the portal; also stops the drip)
      try {
        await queuePaymentEmails({
          customerEmail,
          customerName: (session.customer_details && session.customer_details.name) || metadata.customerName || customerName,
          serviceType, probateType, accountingAddon, paymentPlan,
          amount: amountTotal,
          orderNumber,
          sessionId: session.id,
          uid: paymentUid
        });
      } catch (emailError) {
        console.error('Failed to queue payment emails:', emailError.message);
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
