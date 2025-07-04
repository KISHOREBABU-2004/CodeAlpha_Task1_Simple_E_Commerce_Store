let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

async function loadCart() {
    try {
        // First check if cart exists in localStorage
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }
        
        const response = await fetch('http://127.0.0.1:8000/api/products/');
        if (!response.ok) throw new Error('Network response was not ok');
        
        products = await response.json();
        renderCartItems();
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage();
    }
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';

    let subtotal = 0;
    
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (product) {
            const price = parseFloat(product.price);
            const itemTotal = price * cartItem.quantity;
            subtotal += itemTotal;

            container.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${product.name}</h3>
                    <p>$${price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-id="${product.id}">−</button>
                        <span class="quantity">${cartItem.quantity}</span>
                        <button class="quantity-btn plus" data-id="${product.id}">+</button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <p>$${itemTotal.toFixed(2)}</p>
                    <button class="remove-item" data-id="${product.id}">Remove</button>
                </div>
            </div>
            `;
        }
    });

    // Add event listeners after rendering
    document.querySelectorAll('.minus').forEach(btn => {
        btn.addEventListener('click', decreaseQuantity);
    });
    document.querySelectorAll('.plus').forEach(btn => {
        btn.addEventListener('click', increaseQuantity);
    });
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', removeItem);
    });

    updateSummary(subtotal);
}
function updateSummary(subtotal) {
    const shipping = 5.00; // Fixed shipping cost
    const total = subtotal + shipping;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    updateCartCount();
}
function decreaseQuantity(event) {
    const productId = parseInt(event.target.getAttribute('data-id'));
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }
        saveCart();
    }
}

function increaseQuantity(event) {
    const productId = parseInt(event.target.getAttribute('data-id'));
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    saveCart();
}

function removeItem(event) {
    const productId = parseInt(event.target.getAttribute('data-id'));
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

function showErrorMessage() {
    const container = document.getElementById('cart-items');
    container.innerHTML = `
        <div class="error-message">
            <p>Failed to load cart. Please check:</p>
            <ul>
                <li>Your internet connection</li>
                <li>Backend server status</li>
            </ul>
            <button id="retry-btn">Retry</button>
        </div>
    `;
    document.getElementById('retry-btn').addEventListener('click', loadCart);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    loadCart();
    
    document.querySelector('.checkout-btn').addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Checkout functionality would be implemented here!\nTotal: $' + 
                  document.getElementById('total').textContent.slice(1));
        } else {
            alert('Your cart is empty!');
        }
    });
});