// Global variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// D2R Murals product catalog
const products = [
    {
        id: 1,
        title: "Black D2R Clogs",
        price: 89.99,
        image: "Images/Catalog/Black D2R Clogs.png",
        category: "footwear",
        description: "Comfortable and stylish black clogs featuring the D2R logo. Perfect for everyday wear with superior comfort and durability.",
        variants: ["Size 6", "Size 7", "Size 8", "Size 9", "Size 10", "Size 11", "Size 12"]
    },
    {
        id: 2,
        title: "Black D2R Converse",
        price: 129.99,
        image: "Images/Catalog/Black D2R Converse.png",
        category: "footwear",
        description: "Classic black Converse sneakers with custom D2R branding. Timeless style meets modern comfort for the perfect everyday shoe.",
        variants: ["Size 6", "Size 7", "Size 8", "Size 9", "Size 10", "Size 11", "Size 12"]
    },
    {
        id: 3,
        title: "Black D2R Phone Case - Design 1",
        price: 24.99,
        image: "Images/Catalog/Black D2R Phone Case (1).png",
        category: "accessories",
        description: "Premium black phone case featuring sleek D2R design. Provides excellent protection while showcasing your style.",
        variants: ["iPhone 13", "iPhone 14", "iPhone 15", "Samsung Galaxy S23", "Samsung Galaxy S24"]
    },
    {
        id: 4,
        title: "Black D2R Phone Case - Design 2",
        price: 24.99,
        image: "Images/Catalog/Black D2R Phone Case (2).png",
        category: "accessories",
        description: "Alternative black phone case design with distinctive D2R branding. Durable protection with premium materials.",
        variants: ["iPhone 13", "iPhone 14", "iPhone 15", "Samsung Galaxy S23", "Samsung Galaxy S24"]
    },
    {
        id: 5,
        title: "Black D2R Shirt",
        price: 39.99,
        image: "Images/Catalog/Black D2R Shirt.png",
        category: "apparel",
        description: "Premium black t-shirt featuring the D2R logo. Made from high-quality cotton blend for maximum comfort and style.",
        variants: ["Small", "Medium", "Large", "X-Large", "XX-Large"]
    },
    {
        id: 6,
        title: "Custom D2R Wall Mural",
        price: 299.99,
        image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
        category: "wall-murals",
        description: "Custom D2R branded wall mural perfect for businesses, studios, or personal spaces. Professional installation available.",
        variants: ["Small (3x2ft)", "Medium (6x4ft)", "Large (9x6ft)", "Custom Size"]
    }
];

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateCartUI();
    updateUserUI();
    loadFeaturedProducts();
    setupEventListeners();
    setupSearch();
}

// Event Listeners Setup
function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Cart toggle
    const cartToggle = document.getElementById('cartToggle');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');

    if (cartToggle) {
        cartToggle.addEventListener('click', function(e) {
            e.preventDefault();
            openCart();
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', closeCartSidebar);
    }

    if (overlay) {
        overlay.addEventListener('click', function() {
            closeCartSidebar();
            closeModal();
        });
    }

    // Account link
    const accountLink = document.getElementById('accountLink');
    if (accountLink) {
        accountLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (isLoggedIn) {
                // Show user dashboard or logout
                showUserMenu();
            } else {
                openAuthModal();
            }
        });
    }

    // Auth modal
    setupAuthModal();

    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            if (email) {
                alert('Thank you for subscribing to our newsletter!');
                this.reset();
            }
        });
    }

    // Product card clicks
    document.addEventListener('click', function(e) {
        if (e.target.closest('.product-card')) {
            const productCard = e.target.closest('.product-card');
            const productId = productCard.dataset.productId;
            if (productId && !e.target.closest('.btn-add-cart')) {
                // Navigate to product page
                window.location.href = `product.html?id=${productId}`;
            }
        }
    });
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const searchForm = document.getElementById('searchForm');

    if (searchInput && searchSuggestions) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();

            if (query.length > 0) {
                const filteredProducts = products.filter(product =>
                    product.title.toLowerCase().includes(query) ||
                    product.description.toLowerCase().includes(query) ||
                    product.category.toLowerCase().includes(query)
                );

                showSearchSuggestions(filteredProducts.slice(0, 5));
            } else {
                hideSearchSuggestions();
            }
        });

        searchInput.addEventListener('blur', function() {
            // Delay hiding to allow click on suggestions
            setTimeout(hideSearchSuggestions, 200);
        });
    }

    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
            }
        });
    }
}

function showSearchSuggestions(suggestions) {
    const searchSuggestions = document.getElementById('searchSuggestions');
    if (!searchSuggestions) return;

    if (suggestions.length === 0) {
        hideSearchSuggestions();
        return;
    }

    const suggestionHTML = suggestions.map(product => `
        <div class="search-suggestion" onclick="navigateToProduct(${product.id})">
            <strong>${product.title}</strong>
            <div style="font-size: 0.875rem; color: #666;">$${product.price}</div>
        </div>
    `).join('');

    searchSuggestions.innerHTML = suggestionHTML;
    searchSuggestions.style.display = 'block';
}

function hideSearchSuggestions() {
    const searchSuggestions = document.getElementById('searchSuggestions');
    if (searchSuggestions) {
        searchSuggestions.style.display = 'none';
    }
}

function navigateToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Load featured products
function loadFeaturedProducts() {
    const featuredProductsContainer = document.getElementById('featuredProducts');
    if (!featuredProductsContainer) return;

    const featuredProducts = products.slice(0, 3); // Show first 3 products

    const productsHTML = featuredProducts.map(product => createProductCard(product)).join('');
    featuredProductsContainer.innerHTML = productsHTML;

    // Add event listeners to "Add to Cart" buttons
    featuredProductsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-add-cart')) {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(e.target.dataset.productId);
            addToCart(productId);
        }
    });
}

function createProductCard(product) {
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">$${product.price}</div>
                <div class="product-actions">
                    <button class="btn-add-cart" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Cart functionality
function addToCart(productId, variant = null, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const cartItem = {
        id: productId,
        title: product.title,
        price: product.price,
        image: product.image,
        variant: variant || product.variants[0],
        quantity: quantity
    };

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item =>
        item.id === productId && item.variant === cartItem.variant
    );

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }

    updateCartStorage();
    updateCartUI();
    showCartNotification();
}

function removeFromCart(productId, variant) {
    cart = cart.filter(item => !(item.id === productId && item.variant === variant));
    updateCartStorage();
    updateCartUI();
}

function updateCartQuantity(productId, variant, newQuantity) {
    const item = cart.find(item => item.id === productId && item.variant === variant);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId, variant);
        } else {
            item.quantity = newQuantity;
            updateCartStorage();
            updateCartUI();
        }
    }
}

function updateCartStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">Your cart is empty</div>';
        } else {
            cartItems.innerHTML = cart.map(item => createCartItemHTML(item)).join('');
        }
    }

    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
    }
}

function createCartItemHTML(item) {
    return `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-variant">${item.variant}</div>
                <div class="cart-item-price">$${item.price}</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, '${item.variant}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, '${item.variant}', ${item.quantity + 1})">+</button>
                    <button class="quantity-btn" onclick="removeFromCart(${item.id}, '${item.variant}')" style="margin-left: 0.5rem; color: #e74c3c;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function openCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');

    if (cartSidebar && overlay) {
        cartSidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');

    if (cartSidebar && overlay) {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showCartNotification() {
    // Simple notification - could be enhanced with a toast library
    const notification = document.createElement('div');
    notification.textContent = 'Item added to cart!';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #2c3e50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Authentication
function setupAuthModal() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const closeAuthModal = document.getElementById('closeAuthModal');

    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabType = this.dataset.tab;

            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            if (tabType === 'login') {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
                document.getElementById('authModalTitle').textContent = 'Login';
            } else {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
                document.getElementById('authModalTitle').textContent = 'Register';
            }
        });
    });

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', closeModal);
    }
}

function openAuthModal() {
    const authModal = document.getElementById('authModal');
    const overlay = document.getElementById('overlay');

    if (authModal && overlay) {
        authModal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.querySelector('.modal.active');
    const overlay = document.getElementById('overlay');

    if (modal && overlay) {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    // Simple validation (in real app, this would be server-side)
    if (email && password) {
        isLoggedIn = true;
        currentUser = { email: email, name: email.split('@')[0] };

        localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        updateUserUI();
        closeModal();
        showNotification('Successfully logged in!');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const firstName = e.target.querySelector('input[placeholder="First Name"]').value;
    const lastName = e.target.querySelector('input[placeholder="Last Name"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[placeholder="Password"]').value;
    const confirmPassword = e.target.querySelector('input[placeholder="Confirm Password"]').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (firstName && lastName && email && password) {
        isLoggedIn = true;
        currentUser = {
            email: email,
            name: `${firstName} ${lastName}`,
            firstName: firstName,
            lastName: lastName
        };

        localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        updateUserUI();
        closeModal();
        showNotification('Account created successfully!');
    }
}

function updateUserUI() {
    const accountLink = document.getElementById('accountLink');
    if (accountLink) {
        if (isLoggedIn && currentUser) {
            accountLink.innerHTML = `<i class="fas fa-user"></i> Hello, ${currentUser.name}`;
        } else {
            accountLink.innerHTML = `<i class="fas fa-user"></i> Account`;
        }
    }
}

function showUserMenu() {
    const options = confirm('Choose an option:\nOK = View Account\nCancel = Logout');
    if (options) {
        // Navigate to account page
        window.location.href = 'account.html';
    } else {
        logout();
    }
}

function logout() {
    isLoggedIn = false;
    currentUser = null;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    updateUserUI();
    showNotification('Successfully logged out!');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Utility functions
function getProductById(id) {
    return products.find(product => product.id === parseInt(id));
}

function getProductsByCategory(category) {
    if (!category || category === 'all') return products;
    return products.filter(product => product.category === category);
}

function searchProducts(query) {
    if (!query) return products;
    const searchTerm = query.toLowerCase();
    return products.filter(product =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Export functions for global access
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.navigateToProduct = navigateToProduct;
window.getProductById = getProductById;
window.getProductsByCategory = getProductsByCategory;
window.searchProducts = searchProducts;