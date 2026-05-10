# Adding a Product to the Site and Stripe

Every product lives in two places:

1. **Stripe** — the source of truth for the price the customer is charged.
2. **`script.js`** — the catalog displayed on the site (title, image, description).

The Netlify function `netlify/functions/create-checkout-session.js` connects
them by mapping each site product `id` to a Stripe **Price ID** (loaded from
environment variables). The browser never sends prices; it only sends the
product `id` and quantity. This means a tampered cart cannot lower what
Stripe charges.

---

## 1. Create the product in Stripe

1. Log in to https://dashboard.stripe.com.
2. Go to **Catalog → Products → + Add product**.
3. Fill in **Name**, **Description**, and upload the same image that the
   site will show (this is what customers see on the Stripe checkout page).
4. Under **Pricing**:
   - Choose **One-time**.
   - Set the price (USD).
   - Save the product.
5. After saving, open the product. Under **Pricing**, copy the **Price ID**
   (it starts with `price_...`). **Not** the Product ID (`prod_...`) — you
   want the Price ID.

> Tip: If you sell variants at different prices (e.g. mural sizes), create
> one Price per variant. The current code charges one Price per product, so
> let me know if you need multi-price-per-product variants and I'll wire
> them up.

---

## 2. Add the Price ID to Netlify

1. Open the Netlify site settings → **Site configuration → Environment
   variables**.
2. Add a new variable. Pick the next free `STRIPE_PRICE_*` name. The
   existing slots are:

   | Site product `id` | Env var                    | Used for      |
   |-------------------|----------------------------|---------------|
   | 1                 | `STRIPE_PRICE_CLOGS`       | Black D2R Clogs |
   | 2                 | `STRIPE_PRICE_CONVERSE`    | Black D2R Converse |
   | 3                 | `STRIPE_PRICE_PHONE_CASE_1`| Phone case design 1 |
   | 4                 | `STRIPE_PRICE_PHONE_CASE_2`| Phone case design 2 |
   | 5                 | `STRIPE_PRICE_SHIRT`       | Black D2R Shirt |
   | 6                 | `STRIPE_PRICE_MURAL`       | Wall Mural |

3. For a **new** product, make up a new env var name (e.g.
   `STRIPE_PRICE_HOODIE`) and paste the Price ID as its value.
4. **Important:** also set `STRIPE_SECRET_KEY` (`sk_live_...` or
   `sk_test_...`) once. This is the master key the function uses to talk to
   Stripe.
5. Save. Netlify rebuilds automatically; if not, trigger a redeploy.

---

## 3. Add the product to `script.js`

Open `script.js` and find the `products` array near the top. Append a new
entry, picking the next unused integer `id`:

```js
{
    id: 7,                                          // next free id
    title: "D2R Hoodie",
    price: 64.99,                                   // for display only
    image: "Images/Catalog/D2R Hoodie.webp",
    category: "apparel",                            // footwear | apparel | accessories | wall-murals
    description: "Heavyweight black hoodie with embroidered D2R logo.",
    variants: ["Small", "Medium", "Large", "X-Large"]
}
```

Notes:

- `price` here is **display only**. Stripe charges what its Price ID says.
  Keep them in sync manually so customers don't see a different number on
  the Stripe page.
- `image` should be a path under `Images/Catalog/` (commit the new file
  too).
- `category` must match one of the catalog filters in `catalog.html` —
  add a new checkbox there if you need a new category.
- `variants` are shown in the cart but are not sent to Stripe as separate
  prices. Stripe will charge the one Price ID for any variant.

---

## 4. Map the new id to the env var (one-line code change)

Open `netlify/functions/create-checkout-session.js` and add a line to the
`PRICE_MAP` object using the same `id` you used in `script.js`:

```js
const PRICE_MAP = {
    1: process.env.STRIPE_PRICE_CLOGS,
    2: process.env.STRIPE_PRICE_CONVERSE,
    3: process.env.STRIPE_PRICE_PHONE_CASE_1,
    4: process.env.STRIPE_PRICE_PHONE_CASE_2,
    5: process.env.STRIPE_PRICE_SHIRT,
    6: process.env.STRIPE_PRICE_MURAL,
    7: process.env.STRIPE_PRICE_HOODIE,    // <-- new
};
```

Without this line the function will return `Unknown or unconfigured
product` when someone tries to check out the new product.

---

## 5. Commit and deploy

```bash
git add script.js netlify/functions/create-checkout-session.js Images/Catalog/D2R\ Hoodie.webp
git commit -m "Add D2R Hoodie to catalog"
git push
```

Netlify will redeploy. Once it's live:

1. Open `/catalog.html` and confirm the new product shows up.
2. Add it to the cart, click **Checkout with Stripe**, and verify the
   Stripe page shows the correct product, image, and amount.
3. If you used `sk_test_...`, run a test purchase with card
   `4242 4242 4242 4242`, any future date, any CVC.

---

## Quick reference: required Netlify env vars

```
STRIPE_SECRET_KEY            sk_test_...  or  sk_live_...
STRIPE_PRICE_CLOGS           price_...
STRIPE_PRICE_CONVERSE        price_...
STRIPE_PRICE_PHONE_CASE_1    price_...
STRIPE_PRICE_PHONE_CASE_2    price_...
STRIPE_PRICE_SHIRT           price_...
STRIPE_PRICE_MURAL           price_...
```

Add a new `STRIPE_PRICE_*` var for every new product.

---

## Removing a product

1. Delete its entry from the `products` array in `script.js`.
2. Delete its line in `PRICE_MAP` in
   `netlify/functions/create-checkout-session.js`.
3. (Optional) Archive the product in Stripe so it can't be checked out.
4. Commit and push.
