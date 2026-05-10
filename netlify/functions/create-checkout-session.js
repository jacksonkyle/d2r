// Netlify Function: build a Stripe Checkout Session from cart contents and
// return its hosted URL so the browser can redirect the customer to Stripe.
//
// Required Netlify environment variables:
//   STRIPE_SECRET_KEY        - sk_live_... or sk_test_...
//   STRIPE_PRICE_CLOGS       - Stripe Price ID for product id 1
//   STRIPE_PRICE_CONVERSE    - Stripe Price ID for product id 2
//   STRIPE_PRICE_PHONE_CASE_1- Stripe Price ID for product id 3
//   STRIPE_PRICE_PHONE_CASE_2- Stripe Price ID for product id 4
//   STRIPE_PRICE_SHIRT       - Stripe Price ID for product id 5
//   STRIPE_PRICE_MURAL       - Stripe Price ID for product id 6

const Stripe = require('stripe');

// Server-side mapping: product id -> Stripe Price ID. Prices live in Stripe;
// the client never sends amounts, so a tampered cart cannot change what is
// charged.
const PRICE_MAP = {
    1: process.env.STRIPE_PRICE_CLOGS,
    2: process.env.STRIPE_PRICE_CONVERSE,
    3: process.env.STRIPE_PRICE_PHONE_CASE_1,
    4: process.env.STRIPE_PRICE_PHONE_CASE_2,
    5: process.env.STRIPE_PRICE_SHIRT,
    6: process.env.STRIPE_PRICE_MURAL,
};

const json = (statusCode, body) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return json(405, { error: 'Method not allowed' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
        return json(500, { error: 'Stripe is not configured on the server.' });
    }

    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch (e) {
        return json(400, { error: 'Invalid JSON' });
    }

    const items = Array.isArray(payload.items) ? payload.items : [];
    if (items.length === 0) {
        return json(400, { error: 'Cart is empty.' });
    }

    const line_items = [];
    const variantSummary = [];
    for (const it of items) {
        const productId = parseInt(it.id, 10);
        const quantity = Math.min(99, Math.max(1, parseInt(it.quantity, 10) || 1));
        const priceId = PRICE_MAP[productId];
        if (!priceId) {
            return json(400, { error: `Unknown or unconfigured product: ${it.id}` });
        }
        line_items.push({ price: priceId, quantity });
        if (it.variant) {
            variantSummary.push(`${quantity}x #${productId} (${String(it.variant).slice(0, 60)})`);
        } else {
            variantSummary.push(`${quantity}x #${productId}`);
        }
    }

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    const proto = event.headers['x-forwarded-proto'] || 'https';
    const host = event.headers.host || 'www.d2rmurals.com';
    const origin = event.headers.origin || `${proto}://${host}`;

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items,
            shipping_address_collection: { allowed_countries: ['US', 'CA'] },
            phone_number_collection: { enabled: true },
            allow_promotion_codes: true,
            success_url: `${origin}/thanks.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/catalog.html`,
            metadata: {
                cart_summary: variantSummary.join(' | ').slice(0, 480),
            },
        });

        return json(200, { url: session.url, id: session.id });
    } catch (err) {
        console.error('Stripe error:', err && err.message);
        return json(502, { error: 'Could not start checkout. Please try again.' });
    }
};
