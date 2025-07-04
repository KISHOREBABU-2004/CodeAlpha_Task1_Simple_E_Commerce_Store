document.addEventListener('DOMContentLoaded', () => {
    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();
    
    // Display order summary
    renderOrderSummary(cart);

    // Setup step navigation
    setupStepNavigation();
    loadCartItems();
    setupFormNavigation();
});
document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', togglePaymentMethod);
});
document.getElementById('payment-form').addEventListener('submit', processOrder);


function renderOrderSummary(cart) {
    const orderItemsContainer = document.getElementById('order-items');
    orderItemsContainer.innerHTML = '';
    
    let subtotal = 0;
    
    // First fetch all products from API
    fetch('http://127.0.0.1:8000/api/products/')
        .then(response => response.json())
        .then(products => {
            cart.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    const price = parseProductPrice(product.price);
                    const itemTotal = price * item.quantity;
                    subtotal += itemTotal;
                    
                    orderItemsContainer.innerHTML += `
                        <div class="order-item">
                            <span>${product.name} × ${item.quantity}</span>
                            <span>$${itemTotal.toFixed(2)}</span>
                        </div>
                    `;
                }
            });
            
            // Update totals after all items processed
            updateOrderTotals(subtotal);
        })
        .catch(error => {
            console.error("Error loading products:", error);
            orderItemsContainer.innerHTML = '<p class="error">Could not load order details</p>';
        });
}

function parseProductPrice(price) {
    // Handle both string ("100.00") and number (100.00) prices
    return typeof price === 'string' ? parseFloat(price) : price;
}

function updateOrderTotals(subtotal) {
    const shipping = 5.00; // Flat rate shipping
    const total = subtotal + shipping;
    
    document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkout-shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
}


function setupStepNavigation() {
    // Next button (Shipping → Payment)
    document.querySelector('.btn-next').addEventListener('click', () => {
        if (validateShippingForm()) {
            switchStep('shipping', 'payment');
        }
    });
    
    // Back button (Payment → Shipping)
    document.querySelector('.btn-back').addEventListener('click', () => {
        switchStep('payment', 'shipping');
    });
    
    // Place Order button
    document.querySelector('.btn-confirm').addEventListener('click', () => {
        if (validatePaymentForm()) {
            alert('Order placed successfully!');
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
        }
    });
}

function validateShippingForm() {
    // Simple validation - expand this in production
    const requiredFields = ['full-name', 'address', 'city', 'zip'];
    let isValid = true;
    
    requiredFields.forEach(id => {
        const field = document.getElementById(id);
        if (!field.value.trim()) {
            field.style.borderColor = 'red';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        alert('Please fill all required fields');
    }
    
    return isValid;
}

function validatePaymentForm() {
    // Basic validation - expand this
    const cardNumber = document.getElementById('card-number').value;
    if (cardNumber.length < 16) {
        alert('Please enter a valid card number');
        return false;
    }
    return true;
}

function switchStep(current, next) {
    // Hide current step
    document.querySelector(`.checkout-step[data-step="${current}"]`).style.display = 'none';
    // Show next step
    document.querySelector(`.checkout-step[data-step="${next}"]`).style.display = 'block';
    
    // Update step indicators
    document.querySelector(`.step[data-step="${current}"]`).classList.remove('active');
    document.querySelector(`.step[data-step="${next}"]`).classList.add('active');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function checkCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        window.location.href = 'cart.html';
    }
}

async function processOrder(e) {
    e.preventDefault();
    
    // Validate form
    if (!validatePaymentForm()) return;
    
    // Show loading state
    document.getElementById('payment-form').classList.add('processing');
    
    try {
        // Get payment method
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        
        // Process order
        const orderData = {
            items: JSON.parse(localStorage.getItem('cart')),
            shipping: getShippingData(),
            payment: getPaymentData(),
            total: document.getElementById('checkout-total').textContent
        };
        
        // In a real app, you would send this to your backend
        console.log('Order data:', orderData);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Clear cart and redirect
        localStorage.removeItem('cart');
        window.location.href = 'order-confirmation.html';
        
    } catch (error) {
        console.error('Order failed:', error);
        alert('Payment failed. Please try again.');
    } finally {
        document.getElementById('payment-form').classList.remove('processing');
    }
}

function getShippingData() {
    return {
        name: document.getElementById('full-name').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        zip: document.getElementById('zip').value
    };
}

function getPaymentData() {
    const method = document.querySelector('input[name="payment"]:checked').value;
    
    if (method === 'card') {
        return {
            type: 'card',
            name: document.getElementById('card-name').value,
            last4: document.getElementById('card-number').value.slice(-4)
        };
    } else {
        return { type: 'paypal' };
    }
}

function validatePaymentForm() {
    const method = document.querySelector('input[name="payment"]:checked').value;
    let isValid = true;
    
    if (method === 'card') {
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
            alert('Please enter a valid 16-digit card number');
            isValid = false;
        }
        
        // Add more validation as needed
    }
    
    return isValid;
}