let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allProducts = [];

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

async function fetchAllProducts() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/products/');
        allProducts = await response.json();
        renderProducts(allProducts);
        
        // Setup event listeners
        document.getElementById('search-input').addEventListener('input', filterProducts);
        document.getElementById('price-filter').addEventListener('change', filterProducts);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('all-products').innerHTML = 
            '<p class="error">Failed to load products. Please refresh the page.</p>';
    }
}

function renderProducts(products) {
    const container = document.getElementById('all-products');
    container.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='https://via.placeholder.com/300'">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description.substring(0, 60)}...</p>
                <span class="product-price">$${product.price}</span>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                    <a href="product_detail.html?id=${product.id}" class="btn-details">Details</a>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });

    // Add cart event listeners
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', addToCart);
    });
}

function filterProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const priceRange = document.getElementById('price-filter').value;
    
    let filtered = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            product.description.toLowerCase().includes(searchTerm);
        
        let matchesPrice = true;
        if (priceRange) {
            const [min, max] = priceRange.split('-');
            const price = parseFloat(product.price);
            
            matchesPrice = (min ? price >= parseFloat(min) : true) && 
                          (max ? price <= parseFloat(max) : true);
        }
        
        return matchesSearch && matchesPrice;
    });
    
    renderProducts(filtered);
}

function addToCart(event) {
    const productId = parseInt(event.target.getAttribute('data-id'));
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Item added to cart!');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    fetchAllProducts();
});