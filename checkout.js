// Review page: render the cart, let the user adjust quantities or remove
// items, and hand off to Stripe Checkout.

document.addEventListener('DOMContentLoaded', initializeCheckout);

function initializeCheckout() {
    renderReview();

    const reviewItems = document.getElementById('reviewItems');
    if (reviewItems) {
        reviewItems.addEventListener('click', handleItemAction);
    }

    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePayClick);
    }
}

function renderReview() {
    const emptyCart = document.getElementById('emptyCart');
    const reviewCard = document.getElementById('reviewCard');
    const orderSummary = document.getElementById('orderSummary');
    const reviewItems = document.getElementById('reviewItems');
    const itemCount = document.getElementById('itemCount');
    const subtotalEl = document.getElementById('subtotal');
    const finalTotalEl = document.getElementById('finalTotal');

    if (!emptyCart || !reviewCard || !orderSummary || !reviewItems) return;

    if (!Array.isArray(cart) || cart.length === 0) {
        emptyCart.classList.remove('hidden');
        reviewCard.style.display = 'none';
        orderSummary.style.display = 'none';
        return;
    }

    emptyCart.classList.add('hidden');
    reviewCard.style.display = '';
    orderSummary.style.display = '';

    reviewItems.innerHTML = cart.map(renderReviewItem).join('');

    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (itemCount) itemCount.textContent = totalQty;
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (finalTotalEl) finalTotalEl.textContent = `$${subtotal.toFixed(2)}`;
}

function renderReviewItem(item) {
    const variantAttr = (item.variant || '').replace(/"/g, '&quot;');
    const lineTotal = (item.price * item.quantity).toFixed(2);
    return `
        <div class="review-item" data-id="${item.id}" data-variant="${variantAttr}">
            <div class="review-item-image">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
            </div>
            <div class="review-item-body">
                <div class="review-item-title">${item.title}</div>
                ${item.variant ? `<div class="review-item-variant">${item.variant}</div>` : ''}
                <div class="review-item-controls">
                    <button type="button" class="qty-btn" data-action="decrease" aria-label="Decrease quantity">−</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button type="button" class="qty-btn" data-action="increase" aria-label="Increase quantity">+</button>
                    <button type="button" class="remove-btn" data-action="remove" aria-label="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="review-item-price">$${lineTotal}</div>
        </div>
    `;
}

function handleItemAction(e) {
    const button = e.target.closest('[data-action]');
    if (!button) return;

    const row = button.closest('.review-item');
    if (!row) return;

    const id = parseInt(row.dataset.id, 10);
    const variant = row.dataset.variant;
    const item = cart.find(c => c.id === id && (c.variant || '') === variant);
    if (!item) return;

    const action = button.dataset.action;
    if (action === 'increase') {
        updateCartQuantity(id, item.variant, item.quantity + 1);
    } else if (action === 'decrease') {
        updateCartQuantity(id, item.variant, item.quantity - 1);
    } else if (action === 'remove') {
        removeFromCart(id, item.variant);
    }

    renderReview();
}

function handlePayClick() {
    const errorEl = document.getElementById('checkoutError');
    if (errorEl) errorEl.classList.remove('show');

    if (!Array.isArray(cart) || cart.length === 0) {
        showError('Your cart is empty.');
        return;
    }

    if (typeof startStripeCheckout === 'function') {
        startStripeCheckout();
    } else {
        showError('Checkout is not ready. Please refresh the page.');
    }
}

function showError(message) {
    const errorEl = document.getElementById('checkoutError');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    } else if (typeof showNotification === 'function') {
        showNotification(message, 'error');
    }
}
