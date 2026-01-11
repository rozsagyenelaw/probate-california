const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Firebase initialization for promo code validation
let db = null;
let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) return true;

  try {
    if (!admin.apps.length) {
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

      if (!serviceAccountJson) {
        console.log('FIREBASE_SERVICE_ACCOUNT not set - promo codes will not be validated server-side');
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
    }

    db = admin.firestore();
    firebaseInitialized = true;
    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
    return false;
  }
}

// Validate promo code and get Stripe coupon ID
async function validatePromoCode(code) {
  if (!code || !initializeFirebase()) {
    return { valid: false };
  }

  try {
    const normalizedCode = code.toUpperCase().trim();
    const snapshot = await db.collection('promoCodes')
      .where('code', '==', normalizedCode)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return { valid: false };
    }

    const promoData = snapshot.docs[0].data();

    // Check expiration
    if (promoData.expirationDate) {
      const now = new Date();
      const expiration = promoData.expirationDate.toDate();
      if (now > expiration) {
        return { valid: false };
      }
    }

    // Check max uses
    if (promoData.maxUses && promoData.usageCount >= promoData.maxUses) {
      return { valid: false };
    }

    return {
      valid: true,
      stripeCouponId: promoData.stripeCouponId || null,
      code: promoData.code
    };
  } catch (error) {
    console.error('Promo code validation error:', error);
    return { valid: false };
  }
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const {
      serviceType,      // 'simplified', 'full', or 'accounting_only'
      probateType,      // 'simplified' or 'full' (null for accounting_only)
      accountingAddon,  // null, 'simple', or 'complex'
      paymentPlan,      // 'full' or 'installments' (3 payments)
      customerEmail,
      caseId,
      promoCode
    } = JSON.parse(event.body);

    console.log('Checkout request:', { serviceType, probateType, accountingAddon, paymentPlan, customerEmail, caseId, promoCode });

    // Validate service type
    const validServiceTypes = ['simplified', 'full', 'accounting_only'];
    if (!validServiceTypes.includes(serviceType)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid service type selected' }),
      };
    }

    // For accounting_only, must have an accounting addon
    if (serviceType === 'accounting_only' && !accountingAddon) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Please select an accounting service' }),
      };
    }

    // Validate accounting addon if provided
    if (accountingAddon && !['simple', 'complex'].includes(accountingAddon)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid accounting service selected' }),
      };
    }

    // Validate payment plan
    const validPlans = ['full', 'installments'];
    if (!validPlans.includes(paymentPlan)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid payment plan selected' }),
      };
    }

    // Price IDs from Stripe Dashboard - One-time payments
    const oneTimePriceIds = {
      simplified: process.env.STRIPE_PRICE_SIMPLIFIED_PROBATE || 'price_REPLACE_ME',
      full: process.env.STRIPE_PRICE_FULL_PROBATE || 'price_REPLACE_ME',
      simple_accounting: process.env.STRIPE_PRICE_SIMPLE_ACCOUNTING || 'price_REPLACE_ME',
      complex_accounting: process.env.STRIPE_PRICE_COMPLEX_ACCOUNTING || 'price_REPLACE_ME',
    };

    // Prices in cents for calculating dynamic installment amounts
    const pricesInCents = {
      simplified: 249500,     // $2,495
      full: 399500,           // $3,995
      simple_accounting: 99500,   // $995
      complex_accounting: 199500, // $1,995
    };

    // Calculate total amount
    let totalAmountCents = 0;

    if (serviceType !== 'accounting_only') {
      totalAmountCents += pricesInCents[serviceType];
    }

    if (accountingAddon === 'simple') {
      totalAmountCents += pricesInCents.simple_accounting;
    } else if (accountingAddon === 'complex') {
      totalAmountCents += pricesInCents.complex_accounting;
    }

    // Build line items array for one-time payment
    const line_items = [];

    if (paymentPlan === 'full') {
      // One-time payment - use Stripe price IDs
      if (serviceType !== 'accounting_only') {
        const priceId = oneTimePriceIds[serviceType];
        if (priceId.includes('REPLACE_ME')) {
          console.error('Stripe probate price ID not configured!');
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              error: 'Payment system not configured. Please contact us at (818) 291-6217.'
            }),
          };
        }
        line_items.push({
          price: priceId,
          quantity: 1,
        });
      }

      if (accountingAddon) {
        const accountingPriceId = accountingAddon === 'simple'
          ? oneTimePriceIds.simple_accounting
          : oneTimePriceIds.complex_accounting;

        if (accountingPriceId.includes('REPLACE_ME')) {
          console.error('Stripe accounting price ID not configured!');
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              error: 'Payment system not configured. Please contact us at (818) 291-6217.'
            }),
          };
        }
        line_items.push({
          price: accountingPriceId,
          quantity: 1,
        });
      }
    } else {
      // Installment payment - create dynamic price for the installment amount
      const installmentAmountCents = Math.ceil(totalAmountCents / 3);

      // Build description
      let description = '';
      if (serviceType !== 'accounting_only') {
        description = serviceType === 'simplified' ? 'Simplified Probate' : 'Full Probate';
      }
      if (accountingAddon) {
        const accountingName = accountingAddon === 'simple' ? 'Simple Accounting' : 'Complex Accounting';
        description = description ? `${description} + ${accountingName}` : accountingName;
      }
      description += ' (Payment 1 of 3)';

      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: description,
            description: `Monthly payment for probate services. Total: $${(totalAmountCents / 100).toLocaleString()}`,
          },
          unit_amount: installmentAmountCents,
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
        },
        quantity: 1,
      });
    }

    console.log('Creating Stripe session with line items:', JSON.stringify(line_items, null, 2));

    // Determine success and cancel URLs
    const baseUrl = process.env.URL || 'https://probate-california.com';
    const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/payment?canceled=true`;

    // Validate promo code and get Stripe coupon if applicable
    let discounts = [];
    let validatedPromoCode = null;

    if (promoCode) {
      console.log('Validating promo code:', promoCode);
      const promoValidation = await validatePromoCode(promoCode);
      console.log('Promo validation result:', JSON.stringify(promoValidation));

      if (promoValidation.valid && promoValidation.stripeCouponId) {
        discounts = [{ coupon: promoValidation.stripeCouponId }];
        validatedPromoCode = promoValidation.code;
        console.log('Promo code valid, applying Stripe coupon ID:', promoValidation.stripeCouponId);
      }
    }

    // Determine mode based on payment plan
    const mode = paymentPlan === 'full' ? 'payment' : 'subscription';

    // Create Stripe Checkout Session
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: line_items,
      mode: mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail || undefined,
      metadata: {
        serviceType: serviceType,
        probateType: probateType || '',
        accountingAddon: accountingAddon || '',
        paymentPlan: paymentPlan,
        caseId: caseId || '',
        customerEmail: customerEmail || '',
        promoCode: validatedPromoCode || '',
        totalAmountCents: String(totalAmountCents),
      },
    };

    // For one-time payment, add receipt email
    if (mode === 'payment') {
      sessionConfig.payment_intent_data = {
        receipt_email: customerEmail || undefined,
      };
    }

    // For subscriptions (installments), set up to cancel after 3 payments
    if (mode === 'subscription') {
      sessionConfig.subscription_data = {
        metadata: {
          serviceType: serviceType,
          probateType: probateType || '',
          accountingAddon: accountingAddon || '',
          paymentPlan: paymentPlan,
          caseId: caseId || '',
          customerEmail: customerEmail || '',
          totalPayments: '3',
          totalAmountCents: String(totalAmountCents),
        },
      };
    }

    // Apply discount coupon if promo code was validated
    if (discounts.length > 0) {
      sessionConfig.discounts = discounts;
    } else {
      // Only allow manual promotion codes if no promo was pre-applied
      sessionConfig.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Stripe session created:', session.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        url: session.url,
        sessionId: session.id
      }),
    };

  } catch (error) {
    console.error('Stripe checkout error:', error);
    console.error('Error type:', error.type);
    console.error('Error message:', error.message);

    let errorMessage = 'An error occurred processing your request. Please try again or contact us at (818) 291-6217.';

    if (error.type === 'StripeInvalidRequestError') {
      if (error.message && error.message.includes('coupon')) {
        errorMessage = 'Promo code configuration error. Please try without the promo code or contact us at (818) 291-6217.';
      } else {
        errorMessage = 'Invalid payment configuration. Please contact us at (818) 291-6217.';
      }
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        details: error.message
      }),
    };
  }
};
