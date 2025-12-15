// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();       // 1. Run Security Check
    updateNavigation(); // 2. Update Menu
    
    // 3. Run Product Fetcher only if on catalog page
    if(document.getElementById('product-list')) {
        fetchProducts();
    }
});

// === 1. THE SECURITY GUARD ===
function checkAuth() {
    const userEmail = localStorage.getItem('userEmail');
    const currentPage = window.location.pathname;

    // List of pages that require login
    const protectedPages = ['catalog.html', 'cart.html', 'profile.html', 'admin.html', 'checkout.html'];

    // If user is NOT logged in, but tries to visit a protected page
    // (We check if the current URL contains one of the protected filenames)
    const isProtected = protectedPages.some(page => currentPage.includes(page));

    if (!userEmail && isProtected) {
        window.location.href = 'index.html'; // Kick them out!
    }

    // If user IS logged in, but tries to visit Login page
    if (userEmail && (currentPage.endsWith('index.html') || currentPage === '/')) {
        const role = localStorage.getItem('userRole');
        if (role === 'admin') window.location.href = 'admin.html';
        else window.location.href = 'catalog.html';
    }
}

// === 2. NAVIGATION UPDATE ===
function updateNavigation() {
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    const menu = document.querySelector('.menu');

    if (userEmail && menu) {
        // Determine Profile Link
        let profileLink = 'profile.html';
        let profileText = 'My Profile';

        if (userRole === 'admin') {
            profileLink = 'admin.html';
            profileText = 'Admin Panel';
        }

        // Remove "Login" link if it exists
        const loginLink = menu.querySelector('a[href="index.html"]');
        if (loginLink) loginLink.remove();

        // Add Profile Link (Avoid duplicates)
        if (!document.getElementById('nav-profile')) {
            const profileBtn = document.createElement('a');
            profileBtn.id = 'nav-profile';
            profileBtn.href = profileLink;
            profileBtn.innerHTML = `👤 ${profileText}`;
            profileBtn.style.fontWeight = "bold";
            menu.appendChild(profileBtn);
        }

        // Add Logout Link (Avoid duplicates)
        if (!document.getElementById('nav-logout')) {
            const logoutBtn = document.createElement('a');
            logoutBtn.id = 'nav-logout';
            logoutBtn.href = "#";
            logoutBtn.innerHTML = "Logout";
            logoutBtn.style.color = "#ffcccc";
            logoutBtn.onclick = logout;
            menu.appendChild(logoutBtn);
        }
    }
}

// === 3. LOGOUT FUNCTION ===
function logout() {
    localStorage.clear(); // Wipe the session
    window.location.href = 'index.html'; // Go back to login
}

// === 4. CATALOG LOGIC (Kept from before) ===
async function fetchProducts() {
    const productList = document.getElementById('product-list');
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        productList.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');
            card.innerHTML = `
                <h3>${product.name}</h3>
                <p class="category">${product.category}</p>
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
    }
}