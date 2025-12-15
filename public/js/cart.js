// public/js/cart.js

document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
});

function getCart() {
    return JSON.parse(localStorage.getItem('blueShelfCart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('blueShelfCart', JSON.stringify(cart));
    updateCartDisplay();
}

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

function updateCartDisplay() {
    const cart = getCart();
    const cartContainer = document.getElementById('cart-items');
    const totalSpan = document.getElementById('total-price');
    const countSpan = document.getElementById('cart-count'); // Needs to exist in HTML

    // Update Header Count
    if (document.querySelector('.menu')) {
         // This assumes you added specific IDs to your nav, if not it just skips
    }

    if (!cartContainer) return;

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

// === AUTOMATIC CHECKOUT ===
async function checkout() {
    const cart = getCart();
    if (cart.length === 0) return alert("Cart is empty!");

    // 1. GET EMAIL FROM SESSION (No more prompt!)
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
        alert("You are not logged in!");
        window.location.href = 'index.html';
        return;
    }

    if(!confirm(`Place order for ₱${document.getElementById('total-price').textContent} as ${userEmail}?`)) return;

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
            window.location.href = 'profile.html'; // Go to profile to see order
        } else {
            alert("❌ Error: " + data.message);
        }

    } catch (error) {
        console.error(error);
        alert("System Error.");
    }
}