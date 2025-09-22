// Product page functionality
let currentProduct = null;
let selectedVariant = null;
let currentQuantity = 1;

// Initialize product page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeProductPage();
});

function initializeProductPage() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        loadProduct(parseInt(productId));
    } else {
        // Redirect to catalog if no product ID
        window.location.href = 'catalog.html';
        return;
    }

    setupProductEventListeners();
}

function loadProduct(productId) {
    // Find product by ID
    currentProduct = getProductById(productId);

    if (!currentProduct) {
        // Product not found, redirect to catalog
        window.location.href = 'catalog.html';
        return;
    }

    // Populate product data
    populateProductData();
    generateImageGallery();
    generateVariantOptions();
    loadRelatedProducts();
}

function populateProductData() {
    // Update page title
    document.title = `${currentProduct.title} - D2R Murals`;

    // Update breadcrumb
    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    const breadcrumbProduct = document.getElementById('breadcrumbProduct');

    if (breadcrumbCategory) {
        breadcrumbCategory.textContent = getCategoryDisplayName(currentProduct.category);
    }

    if (breadcrumbProduct) {
        breadcrumbProduct.textContent = currentProduct.title;
    }

    // Update product details
    const productCategory = document.getElementById('productCategory');
    const productTitle = document.getElementById('productTitle');
    const productPrice = document.getElementById('productPrice');
    const productDescription = document.getElementById('productDescription');

    if (productCategory) {
        productCategory.textContent = getCategoryDisplayName(currentProduct.category);
    }

    if (productTitle) {
        productTitle.textContent = currentProduct.title;
    }

    if (productPrice) {
        productPrice.textContent = `$${currentProduct.price}`;
    }

    if (productDescription) {
        productDescription.textContent = currentProduct.description;
    }

    // Set default selected variant
    selectedVariant = currentProduct.variants[0];
}

function generateImageGallery() {
    const mainImageImg = document.getElementById('mainImageImg');
    const thumbnailGallery = document.getElementById('thumbnailGallery');

    if (mainImageImg) {
        mainImageImg.src = currentProduct.image;
        mainImageImg.alt = currentProduct.title;
    }

    if (thumbnailGallery) {
        // For demo purposes, we'll create multiple thumbnails using the same image
        // In a real application, you would have multiple images per product
        const thumbnailImages = [
            currentProduct.image,
            currentProduct.image.replace('w=400', 'w=500'), // Slightly different URL for demo
            currentProduct.image.replace('h=300', 'h=400'), // Slightly different URL for demo
            currentProduct.image.replace('fit=crop', 'fit=fill') // Slightly different URL for demo
        ];

        const thumbnailsHTML = thumbnailImages.map((imageSrc, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${imageSrc}">
                <img src="${imageSrc}" alt="${currentProduct.title} ${index + 1}">
            </div>
        `).join('');

        thumbnailGallery.innerHTML = thumbnailsHTML;
    }
}

function generateVariantOptions() {
    const variantOptions = document.getElementById('variantOptions');

    if (variantOptions && currentProduct.variants) {
        const variantsHTML = currentProduct.variants.map((variant, index) => `
            <div class="variant-option ${index === 0 ? 'selected' : ''}" data-variant="${variant}">
                ${variant}
            </div>
        `).join('');

        variantOptions.innerHTML = variantsHTML;
    }
}

function loadRelatedProducts() {
    const relatedProductsContainer = document.getElementById('relatedProducts');

    if (relatedProductsContainer) {
        // Get products from the same category, excluding current product
        const relatedProducts = products
            .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
            .slice(0, 3);

        // If not enough from same category, add from other categories
        if (relatedProducts.length < 3) {
            const additionalProducts = products
                .filter(p => p.id !== currentProduct.id && !relatedProducts.includes(p))
                .slice(0, 3 - relatedProducts.length);

            relatedProducts.push(...additionalProducts);
        }

        const relatedHTML = relatedProducts.map(product => createProductCard(product)).join('');
        relatedProductsContainer.innerHTML = relatedHTML;

        // Add event listeners for related products
        relatedProductsContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-add-cart')) {
                e.preventDefault();
                e.stopPropagation();
                const productId = parseInt(e.target.dataset.productId);
                addToCart(productId);
            } else if (e.target.closest('.product-card')) {
                const productCard = e.target.closest('.product-card');
                const productId = productCard.dataset.productId;
                if (productId && !e.target.closest('.btn-add-cart')) {
                    window.location.href = `product.html?id=${productId}`;
                }
            }
        });
    }
}

function setupProductEventListeners() {
    // Thumbnail gallery clicks
    const thumbnailGallery = document.getElementById('thumbnailGallery');
    if (thumbnailGallery) {
        thumbnailGallery.addEventListener('click', function(e) {
            const thumbnail = e.target.closest('.thumbnail');
            if (thumbnail) {
                switchMainImage(thumbnail);
            }
        });
    }

    // Variant selection
    const variantOptions = document.getElementById('variantOptions');
    if (variantOptions) {
        variantOptions.addEventListener('click', function(e) {
            const variantOption = e.target.closest('.variant-option');
            if (variantOption) {
                selectVariant(variantOption);
            }
        });
    }

    // Quantity controls
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    const quantityInput = document.getElementById('quantityInput');

    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => updateQuantity(-1));
    }

    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => updateQuantity(1));
    }

    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            const newQuantity = parseInt(this.value);
            if (newQuantity >= 1 && newQuantity <= 10) {
                currentQuantity = newQuantity;
            } else {
                this.value = currentQuantity;
            }
        });
    }

    // Add to cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            if (currentProduct && selectedVariant) {
                addToCart(currentProduct.id, selectedVariant, currentQuantity);

                // Show feedback
                this.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
                this.style.backgroundColor = '#27ae60';

                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
                    this.style.backgroundColor = '';
                }, 2000);
            }
        });
    }

    // Wishlist button
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', function() {
            // Toggle wishlist (simple implementation)
            const isInWishlist = this.classList.contains('in-wishlist');

            if (isInWishlist) {
                this.classList.remove('in-wishlist');
                this.innerHTML = '<i class="far fa-heart"></i>';
                this.style.backgroundColor = '';
                this.style.color = '#e74c3c';
                showNotification('Removed from wishlist');
            } else {
                this.classList.add('in-wishlist');
                this.innerHTML = '<i class="fas fa-heart"></i>';
                this.style.backgroundColor = '#e74c3c';
                this.style.color = 'white';
                showNotification('Added to wishlist');
            }
        });
    }

    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            switchTab(tabId);
        });
    });
}

function switchMainImage(thumbnail) {
    const mainImageImg = document.getElementById('mainImageImg');
    const currentActive = document.querySelector('.thumbnail.active');

    if (currentActive) {
        currentActive.classList.remove('active');
    }

    thumbnail.classList.add('active');

    if (mainImageImg) {
        mainImageImg.src = thumbnail.dataset.image;
    }
}

function selectVariant(variantOption) {
    const currentSelected = document.querySelector('.variant-option.selected');

    if (currentSelected) {
        currentSelected.classList.remove('selected');
    }

    variantOption.classList.add('selected');
    selectedVariant = variantOption.dataset.variant;
}

function updateQuantity(change) {
    const newQuantity = currentQuantity + change;

    if (newQuantity >= 1 && newQuantity <= 10) {
        currentQuantity = newQuantity;
        const quantityInput = document.getElementById('quantityInput');
        if (quantityInput) {
            quantityInput.value = currentQuantity;
        }
    }
}

function switchTab(tabId) {
    // Update button states
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.tab === tabId);
    });

    // Update content visibility
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

function getCategoryDisplayName(category) {
    const categoryNames = {
        'footwear': 'Footwear',
        'apparel': 'Apparel',
        'accessories': 'Accessories',
        'wall-murals': 'Wall Murals'
    };

    return categoryNames[category] || category;
}

// Global functions for cart integration
window.selectVariant = selectVariant;
window.updateQuantity = updateQuantity;