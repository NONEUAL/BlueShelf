// public/js/main.js - COMPLETE VERSION

document.addEventListener('DOMContentLoaded', () => {
    // 1. Always check if user is logged in to update the top menu
    updateNavigation();

    // 2. If we are on the Catalog page (page with 'product-list'), load items
    if (document.getElementById('product-list')) {
        fetchProducts();
    }
});

// ==========================================
// PART 1: NAVIGATION & LOGIN STATUS
// ==========================================
function updateNavigation() {
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    const menu = document.querySelector('.menu');

    if (userEmail) {
        // Determine where the "Profile" button goes
        let profileLink = 'profile.html';
        let profileText = 'My Profile';

        if (userRole === 'admin') {
            profileLink = 'admin.html';
            profileText = 'Admin Panel';
        }

        // Remove "Login" link if it exists
        const loginLink = menu.querySelector('a[href="index.html"]');
        if (loginLink) {
            loginLink.remove();
        }

        // Add "Profile" Link (avoid adding duplicates)
        if (!document.getElementById('nav-profile-btn')) {
            const profileBtn = document.createElement('a');
            profileBtn.id = 'nav-profile-btn';
            profileBtn.href = profileLink;
            profileBtn.innerHTML = `👤 ${profileText}`; // innerHTML allows emoji
            profileBtn.style.fontWeight = "bold";
            profileBtn.style.marginLeft = "20px";
            menu.appendChild(profileBtn);

            // Add "Logout" Link
            const logoutBtn = document.createElement('a');
            logoutBtn.href = "#";
            logoutBtn.textContent = "Logout";
            logoutBtn.style.color = "#ffcccc"; 
            logoutBtn.style.marginLeft = "20px";
            logoutBtn.onclick = logout;
            menu.appendChild(logoutBtn);
        }
    }
}

function logout() {
    // Clear data and redirect to Login
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('lastEmail');
    window.location.href = 'index.html';
}

// ==========================================
// PART 2: CATALOG LOGIC (Fetching Products)
// ==========================================
async function fetchProducts() {
    const productList = document.getElementById('product-list');

    try {
        // Ask the server for data
        const response = await fetch('/api/products');
        const products = await response.json();

        // Clear the "Loading..." text
        productList.innerHTML = '';

        if (products.length === 0) {
            productList.innerHTML = '<p>No products found.</p>';
            return;
        }

        // Loop through the products and create HTML cards
        products.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            // NOTE: The 'addToCart' function is inside js/cart.js
            // Make sure you have <script src="js/cart.js"></script> in your catalog.html
            card.innerHTML = `
                <h3>${product.name}</h3>
                <p class="category">${product.category}</p>
                <img src="assets/products/${product.image_url || 'default.png'}" style="max-width:100px; display:block; margin:0 auto;">
                <p class="price">₱${product.price}</p>
                <p class="stock">${product.stock_quantity} In Stock</p>
                <button class="add-btn" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                    Add to Cart 🛒
                </button>
            `;

            productList.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        productList.innerHTML = '<p>Error loading products. Is the server running?</p>';
    }
}z