// Checkout functionality
let selectedShippingMethod = 'standard';
let selectedPaymentMethod = 'card';
let shippingCost = 0;
let taxRate = 0.08; // 8% tax rate

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
});

function initializeCheckout() {
    // Check if cart has items
    if (cart.length === 0) {
        showEmptyCart();
        return;
    }

    // Pre-fill user information if logged in
    prefillUserInfo();

    // Setup event listeners
    setupCheckoutEventListeners();

    // Update order summary
    updateOrderSummary();

    // Setup form validation
    setupFormValidation();
}

function showEmptyCart() {
    const checkoutContainer = document.getElementById('checkoutContainer');
    const emptyCart = document.getElementById('emptyCart');
    const checkoutForm = document.getElementById('checkoutForm');
    const orderSummary = document.getElementById('orderSummary');

    if (emptyCart && checkoutForm && orderSummary) {
        emptyCart.classList.remove('hidden');
        checkoutForm.style.display = 'none';
        orderSummary.style.display = 'none';
        checkoutContainer.style.gridTemplateColumns = '1fr';
    }
}

function prefillUserInfo() {
    if (isLoggedIn && currentUser) {
        const emailInput = document.getElementById('email');
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');

        if (emailInput && currentUser.email) {
            emailInput.value = currentUser.email;
        }

        if (firstNameInput && currentUser.firstName) {
            firstNameInput.value = currentUser.firstName;
        }

        if (lastNameInput && currentUser.lastName) {
            lastNameInput.value = currentUser.lastName;
        }
    }
}

function setupCheckoutEventListeners() {
    // Shipping method selection
    const shippingMethods = document.querySelectorAll('[data-method]');
    shippingMethods.forEach(method => {
        method.addEventListener('click', function() {
            selectShippingMethod(this.dataset.method);
        });
    });

    // Payment method selection
    const paymentMethods = document.querySelectorAll('[data-payment]');
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            selectPaymentMethod(this.dataset.payment);
        });
    });

    // Form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmission);
    }

    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }

    // Expiry date formatting
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiryDate);
    }

    // CVV formatting
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', formatCVV);
    }

    // Real-time validation
    const requiredInputs = document.querySelectorAll('input[required], select[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function selectShippingMethod(method) {
    // Update visual selection
    const shippingMethods = document.querySelectorAll('[data-method]');
    shippingMethods.forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-method="${method}"]`).classList.add('selected');

    // Update shipping cost
    selectedShippingMethod = method;
    switch (method) {
        case 'standard':
            shippingCost = 0;
            break;
        case 'express':
            shippingCost = 15.00;
            break;
        case 'overnight':
            shippingCost = 35.00;
            break;
    }

    updateOrderSummary();
}

function selectPaymentMethod(method) {
    // Update visual selection
    const paymentMethods = document.querySelectorAll('[data-payment]');
    paymentMethods.forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-payment="${method}"]`).classList.add('selected');

    selectedPaymentMethod = method;

    // Show/hide card payment fields
    const cardPayment = document.getElementById('cardPayment');
    if (cardPayment) {
        cardPayment.style.display = method === 'card' ? 'block' : 'none';
    }
}

function updateOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const finalTotalEl = document.getElementById('finalTotal');

    if (!orderItems || !subtotalEl || !shippingEl || !taxEl || !finalTotalEl) return;

    // Update order items
    const itemsHTML = cart.map(item => `
        <div class="order-item">
            <div class="item-image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="item-details">
                <div class="item-title">${item.title}</div>
                <div class="item-variant">${item.variant}</div>
                <div class="item-quantity">Qty: ${item.quantity}</div>
            </div>
            <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');

    orderItems.innerHTML = itemsHTML;

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + shippingCost + tax;

    // Update display
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    shippingEl.textContent = shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    finalTotalEl.textContent = `$${total.toFixed(2)}`;
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value;
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

function formatCVV(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
}

function setupFormValidation() {
    // Add custom validation styles
    const style = document.createElement('style');
    style.textContent = `
        .form-input.error, .form-select.error {
            border-color: #e74c3c;
            box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.1);
        }
        .error-message {
            color: #e74c3c;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        }
    `;
    document.head.appendChild(style);
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();

    // Clear previous errors
    clearFieldError(e);

    // Validate based on field type
    let isValid = true;
    let errorMessage = '';

    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (field.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
    } else if (field.id === 'cardNumber' && value && !isValidCardNumber(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid card number';
    } else if (field.id === 'expiry' && value && !isValidExpiry(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid expiry date (MM/YY)';
    } else if (field.id === 'cvv' && value && !isValidCVV(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid CVV';
    } else if (field.id === 'zipCode' && value && !isValidZipCode(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid ZIP code';
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');

    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function showFieldError(field, message) {
    field.classList.add('error');

    const errorEl = document.createElement('span');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    field.parentNode.appendChild(errorEl);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
}

function isValidExpiry(expiry) {
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiry)) return false;

    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);

    return expiryYear > currentYear || (expiryYear === currentYear && expiryMonth >= currentMonth);
}

function isValidCVV(cvv) {
    return cvv.length >= 3 && cvv.length <= 4 && /^\d+$/.test(cvv);
}

function isValidZipCode(zipCode) {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode);
}

function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        // Skip card fields if payment method is not card
        if (selectedPaymentMethod !== 'card' &&
            ['cardNumber', 'expiry', 'cvv', 'cardName'].includes(field.id)) {
            return;
        }

        const fieldValid = validateField({ target: field });
        if (!fieldValid) {
            isValid = false;
        }
    });

    return isValid;
}

function handleOrderSubmission(e) {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
        showNotification('Please fix the errors in the form before submitting.', 'error');
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('placeOrderBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    // Simulate order processing
    setTimeout(() => {
        processOrder();
    }, 2000);
}

function processOrder() {
    // Collect form data
    const orderData = {
        customer: {
            email: document.getElementById('email').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phone: document.getElementById('phone').value
        },
        shipping: {
            address: document.getElementById('address').value,
            apartment: document.getElementById('apartment').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value,
            method: selectedShippingMethod
        },
        payment: {
            method: selectedPaymentMethod
        },
        items: cart,
        totals: {
            subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            shipping: shippingCost,
            tax: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * taxRate,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + shippingCost + (cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * taxRate)
        },
        orderNumber: generateOrderNumber(),
        orderDate: new Date().toISOString()
    };

    // Store order in localStorage (in real app, send to server)
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart
    cart = [];
    updateCartStorage();
    updateCartUI();

    // Show success message and redirect
    showNotification('Order placed successfully! Redirecting to confirmation page...', 'success');

    setTimeout(() => {
        window.location.href = `order-confirmation.html?order=${orderData.orderNumber}`;
    }, 2000);
}

function generateOrderNumber() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `D2R-${timestamp}-${random}`.toUpperCase();
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}