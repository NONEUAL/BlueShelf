// public/js/cart.js (Phase 3.5: Layout Update)

document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
});

// --- HELPER FUNCTIONS ---
function getCart() {
    return JSON.parse(localStorage.getItem('blueShelfCart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('blueShelfCart', JSON.stringify(cart));
    updateCartDisplay();
}

// Called by Catalog
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

// --- DISPLAY LOGIC (THE BIG CHANGE) ---
function updateCartDisplay() {
    const cart = getCart();
    const cartContainer = document.getElementById('cart-items');
    const totalSpan = document.getElementById('total-price');
    const headerCount = document.getElementById('header-count');
    const navCount = document.getElementById('cart-count'); // If exists in nav

    // Update Counts
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (headerCount) headerCount.textContent = totalQty;
    if (navCount) navCount.textContent = totalQty;

    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<div style="padding:40px; text-align:center;">Your cart is empty.</div>';
        totalSpan.textContent = '0.00';
        return;
    }

    cartContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        // Create Row Div
        const row = document.createElement('div');
        row.className = 'cart-row';
        
        row.innerHTML = `
            <!-- Column 1: Product Info -->
            <div class="item-info">
                <div class="item-img-placeholder">📘</div>
                <div>
                    <strong>${item.name}</strong><br>
                    <span style="font-size:0.8em; color:#666;">In Stock</span>
                </div>
            </div>

            <!-- Column 2: Unit Price -->
            <div class="col-price">₱${item.price}</div>

            <!-- Column 3: Quantity Stepper -->
            <div class="col-qty">
                <div class="qty-control">
                    <button class="btn-qty" onclick="decreaseQty(${index})">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="btn-qty" onclick="increaseQty(${index})">+</button>
                </div>
            </div>

            <!-- Column 4: Total -->
            <div class="col-total" style="font-weight:bold; color:#004aad;">₱${itemTotal}</div>

            <!-- Column 5: Trash -->
            <div class="col-action">
                <button class="btn-trash" onclick="removeItem(${index})">🗑️</button>
            </div>
        `;
        cartContainer.appendChild(row);
    });

    totalSpan.textContent = total.toFixed(2);
}

// --- NEW ACTION FUNCTIONS ---

function increaseQty(index) {
    let cart = getCart();
    cart[index].quantity += 1;
    saveCart(cart);
}

function decreaseQty(index) {
    let cart = getCart();
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        saveCart(cart);
    } else {
        // Optional: Ask to remove if it hits 0
        if(confirm("Remove item?")) {
            removeItem(index);
        }
    }
}

function removeItem(index) {
    let cart = getCart();
    cart.splice(index, 1); // Remove item at specific index
    saveCart(cart);
}

// --- CHECKOUT LOGIC (Maintains Session logic) ---
async function checkout() {
    const cart = getCart();
    if (cart.length === 0) return alert("Cart is empty!");

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        alert("Please login first.");
        window.location.href = 'index.html';
        return;
    }

    window.location.href = 'checkout.html'; 
}