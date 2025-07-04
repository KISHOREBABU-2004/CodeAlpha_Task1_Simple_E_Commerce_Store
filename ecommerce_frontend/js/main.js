// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}
let isFetching = false;
// Fetch and display featured products
async function fetchFeaturedProducts() {
    if (isFetching) return;
    isFetching = true;
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/products/', {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        const products = await response.json();
        renderProducts(products.slice(0, 4));
    } catch (error) {
        console.error("Fetch failed:", error);
        setTimeout(fetchFeaturedProducts, 3000); // Retry after 3s
    } finally {
        isFetching = false;
    }
}

function addToCart(event) {
    const productId = parseInt(event.target.getAttribute('data-id'));
    const product = cart.find(item => item.id === productId);
    
    if (product) {
        product.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = 'Item added to cart!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Show loading state
        document.body.style.visibility = 'hidden';
        
        // Fetch products
        const response = await fetch('http://127.0.0.1:8000/api/products/');
        if (!response.ok) throw new Error('API request failed');
        
        const products = await response.json();
        renderProducts(products.slice(0, 4)); // Show first 4 products
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('featured-products').innerHTML = `
            <div class="error">
                <p>Couldn't load products. Try refreshing.</p>
                <button onclick="window.location.reload()">Retry</button>
            </div>
        `;
    } finally {
        // Always show content (even if empty)
        document.body.style.visibility = 'visible';
    }
});
function renderProducts(products) {
    const container = document.getElementById('featured-products');
    container.innerHTML = '';
    
    products.slice(0, 4).forEach(product => {
        // Sanitize product data
        const name = product.name || 'Unnamed Product';
        const description = product.description ? 
            product.description.substring(0, 60) : 'No description available';
        const price = product.price ? `$${product.price}` : '$0.00';

        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/300'}" 
                     alt="${name}"
                     onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
            </div>
            <div class="product-info">
                <h3>${name}</h3>
                <p>${description}...</p>
                <span class="price">${price}</span>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        container.appendChild(productCard);
    });
}