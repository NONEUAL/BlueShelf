// public/js/cart.js

// 1. Load Cart Logic
document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
});

// Helper: Get cart from LocalStorage
function getCart() {
    return JSON.parse(localStorage.getItem('blueShelfCart')) || [];
}

// Helper: Save cart
function saveCart(cart) {
    localStorage.setItem('blueShelfCart', JSON.stringify(cart));
    updateCartDisplay();
}

// Function called by Catalog Page
function addToCart(id, name, price) {
    let cart = getCart();
    let existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }

    saveCart(cart);
    alert(`${name} added to cart!`);
}

// Function called by Cart Page
function updateCartDisplay() {
    const cart = getCart();
    const cartContainer = document.getElementById('cart-items');
    const totalSpan = document.getElementById('total-price');
    const countSpan = document.getElementById('cart-count');

    // Update count in menu
    if(countSpan) countSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    // If we are not on the cart page, stop here
    if (!cartContainer) return;

    // Render items
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        totalSpan.textContent = '0.00';
        return;
    }

    cartContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <h3>${item.name}</h3>
                <p>₱${item.price} x ${item.quantity}</p>
            </div>
            <div>
                <strong style="color: #004aad;">₱${item.price * item.quantity}</strong>
                <button class="btn-remove" onclick="removeItem(${index})">Remove</button>
            </div>
        `;
        cartContainer.appendChild(div);
    });

    totalSpan.textContent = total.toFixed(2);
}

function removeItem(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
}

// CHECKOUT FUNCTION
async function checkout() {
    const cart = getCart();
    if (cart.length === 0) return alert("Cart is empty!");

    const userEmail = prompt("Please confirm your SMA Email to order:", "student@sma.edu.ph");
    if (!userEmail) return;

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user_email: userEmail, 
                cartItems: cart 
            })
        });

        const data = await response.json();

        if (data.success) {
            alert("✅ Order Placed! Order ID: " + data.orderId);
            localStorage.removeItem('blueShelfCart'); // Clear cart
            window.location.reload();
        } else {
            alert("❌ Error: " + data.message);
        }

    } catch (error) {
        console.error(error);
        alert("System Error. Check console.");
    }
}