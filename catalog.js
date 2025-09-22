// Catalog-specific functionality
let currentPage = 1;
let itemsPerPage = 9;
let currentView = 'grid';
let currentSort = 'default';
let filteredProducts = [];
let currentFilters = {
    categories: [],
    minPrice: null,
    maxPrice: null,
    search: ''
};

// Initialize catalog when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCatalog();
});

function initializeCatalog() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');

    // Set initial filters from URL
    if (category) {
        currentFilters.categories = [category];
        const checkbox = document.getElementById(category);
        if (checkbox) {
            checkbox.checked = true;
        }
    }

    if (search) {
        currentFilters.search = search;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = search;
        }
    }

    // Setup event listeners
    setupCatalogEventListeners();

    // Load and display products
    applyFiltersAndSort();
}

function setupCatalogEventListeners() {
    // View toggle buttons
    const gridViewBtn = document.getElementById('gridView');
    const listViewBtn = document.getElementById('listView');

    if (gridViewBtn && listViewBtn) {
        gridViewBtn.addEventListener('click', () => switchView('grid'));
        listViewBtn.addEventListener('click', () => switchView('list'));
    }

    // Sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            currentPage = 1;
            applyFiltersAndSort();
        });
    }

    // Category filters
    const categoryFilters = document.getElementById('categoryFilters');
    if (categoryFilters) {
        categoryFilters.addEventListener('change', function(e) {
            if (e.target.type === 'checkbox') {
                updateCategoryFilters();
            }
        });
    }

    // Price range filters
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');

    if (minPriceInput && maxPriceInput) {
        const debounceDelay = 500;
        let priceTimeout;

        [minPriceInput, maxPriceInput].forEach(input => {
            input.addEventListener('input', function() {
                clearTimeout(priceTimeout);
                priceTimeout = setTimeout(() => {
                    updatePriceFilters();
                }, debounceDelay);
            });
        });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

    // Product grid event delegation
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.addEventListener('click', function(e) {
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

function switchView(view) {
    currentView = view;
    const gridViewBtn = document.getElementById('gridView');
    const listViewBtn = document.getElementById('listView');
    const productsGrid = document.getElementById('productsGrid');

    if (gridViewBtn && listViewBtn && productsGrid) {
        // Update button states
        gridViewBtn.classList.toggle('active', view === 'grid');
        listViewBtn.classList.toggle('active', view === 'list');

        // Update grid class
        productsGrid.classList.toggle('list-view', view === 'list');

        // Re-render products with new view
        displayProducts();
    }
}

function updateCategoryFilters() {
    const checkboxes = document.querySelectorAll('#categoryFilters input[type="checkbox"]');
    currentFilters.categories = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    currentPage = 1;
    applyFiltersAndSort();
}

function updatePriceFilters() {
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;

    currentFilters.minPrice = minPrice ? parseFloat(minPrice) : null;
    currentFilters.maxPrice = maxPrice ? parseFloat(maxPrice) : null;

    currentPage = 1;
    applyFiltersAndSort();
}

function clearAllFilters() {
    // Reset filter state
    currentFilters = {
        categories: [],
        minPrice: null,
        maxPrice: null,
        search: ''
    };

    // Clear UI elements
    const checkboxes = document.querySelectorAll('#categoryFilters input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);

    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    // Reset sort and page
    currentSort = 'default';
    currentPage = 1;
    document.getElementById('sortSelect').value = 'default';

    // Update URL (remove parameters)
    const url = new URL(window.location);
    url.search = '';
    history.replaceState(null, '', url);

    // Reapply filters
    applyFiltersAndSort();
}

function applyFiltersAndSort() {
    // Start with all products
    let filtered = [...products];

    // Apply search filter
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filtered = filtered.filter(product =>
            product.title.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }

    // Apply category filters
    if (currentFilters.categories.length > 0) {
        filtered = filtered.filter(product =>
            currentFilters.categories.includes(product.category)
        );
    }

    // Apply price filters
    if (currentFilters.minPrice !== null) {
        filtered = filtered.filter(product => product.price >= currentFilters.minPrice);
    }

    if (currentFilters.maxPrice !== null) {
        filtered = filtered.filter(product => product.price <= currentFilters.maxPrice);
    }

    // Apply sorting
    filtered = sortProducts(filtered, currentSort);

    // Update filtered products
    filteredProducts = filtered;

    // Display products and update UI
    displayProducts();
    updateProductCount();
    updatePagination();
}

function sortProducts(products, sortType) {
    const sorted = [...products];

    switch (sortType) {
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name-asc':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'name-desc':
            return sorted.sort((a, b) => b.title.localeCompare(a.title));
        default:
            return sorted; // Keep original order for 'default'
    }
}

function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');

    if (!productsGrid || !noProducts) return;

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '';
        noProducts.classList.remove('hidden');
        return;
    }

    noProducts.classList.add('hidden');

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);

    // Generate HTML based on current view
    const productsHTML = pageProducts.map(product => {
        if (currentView === 'list') {
            return createListProductCard(product);
        } else {
            return createProductCard(product);
        }
    }).join('');

    productsGrid.innerHTML = productsHTML;
}

function createListProductCard(product) {
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-description">${product.description}</div>
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

function updateProductCount() {
    const productCount = document.getElementById('productCount');
    if (productCount) {
        productCount.textContent = filteredProducts.length;
    }
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    // Next button
    paginationHTML += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    if (page < 1 || page > totalPages) return;

    currentPage = page;
    displayProducts();
    updatePagination();

    // Scroll to top of products
    const catalogContent = document.querySelector('.catalog-content');
    if (catalogContent) {
        catalogContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Make changePage function available globally
window.changePage = changePage;