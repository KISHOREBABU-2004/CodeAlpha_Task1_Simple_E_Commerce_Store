let cart = JSON.parse(localStorage.getItem('cart')) || [];

async function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}/`);
        if (!response.ok) throw new Error('Product not found');
        
        const product = await response.json();
        renderProductDetail(product);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('product-detail-container').innerHTML = `
            <div class="error">
                <p>Product not found</p>
                <a href="products.html" class="btn">Back to Products</a>
            </div>
        `;
    }
}

function renderProductDetail(product) {
    const container = document.getElementById('product-detail-container');
    container.innerHTML = `
        <div class="product-image-container">
            <img src="${product.image}" alt="${product.name}" 
                 onerror="this.src='https://via.placeholder.com/500'">
        </div>
        <div class="product-info-container">
            <h1>${product.name}</h1>
            <p class="product-price">$${product.price}</p>
            <p class="product-description">${product.description}</p>
            <p class="product-stock">${product.stock > 0 ? 
                `${product.stock} available` : 'Out of stock'}</p>
            <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            <a href="products.html" class="btn-back">Back to Products</a>
        </div>
    `;

    // Add event listener to cart button
    document.querySelector('.add-to-cart-btn').addEventListener('click', addToCart);
}

function addToCart() {
    const productId = parseInt(document.querySelector('.add-to-cart-btn').getAttribute('data-id'));
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

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
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
    loadProductDetail();
});