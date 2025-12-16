document.addEventListener('DOMContentLoaded', () => {
    checkAuth();       
    updateNavigation();
    checkNotifications(); 
    
    if(document.getElementById('product-list')) {
        fetchProducts();
    }
});

function checkAuth() {
    const userEmail = localStorage.getItem('userEmail');
    const currentPage = window.location.pathname;
    const protectedPages = ['catalog.html', 'cart.html', 'profile.html', 'admin.html', 'checkout.html'];
    const isProtected = protectedPages.some(page => currentPage.includes(page));

    if (!userEmail && isProtected) window.location.href = 'index.html';

    if (userEmail && (currentPage.endsWith('index.html') || currentPage === '/')) {
        const role = localStorage.getItem('userRole');
        if (role === 'admin') window.location.href = 'admin.html';
        else window.location.href = 'catalog.html';
    }
}

function updateNavigation() {
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    const menu = document.querySelector('.menu');

    if (userEmail && menu) {
        const loginLink = menu.querySelector('a[href="index.html"]');
        if (loginLink) loginLink.remove();
        if (userRole !== 'admin' && !document.getElementById('nav-bell')) {
            const bellBtn = document.createElement('a');
            bellBtn.id = 'nav-bell';
            bellBtn.href = 'profile.html'; 
            bellBtn.className = 'nav-icon';
            bellBtn.innerHTML = `
                🔔
                <span id="notif-dot" class="notification-dot"></span>
            `;
            menu.appendChild(bellBtn);
        }

        let profileLink = 'profile.html';
        let profileText = 'My Account';

        if (userRole === 'admin') {
            profileLink = 'admin.html';
            profileText = 'Admin Panel';
        }

        if (!document.getElementById('nav-profile')) {
            const profileBtn = document.createElement('a');
            profileBtn.id = 'nav-profile';
            profileBtn.href = profileLink;
            profileBtn.innerHTML = `👤 ${profileText}`;
            profileBtn.style.fontWeight = "bold";
            profileBtn.style.marginLeft = "15px";
            menu.appendChild(profileBtn);
        }
    }
}

async function checkNotifications() {
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    try {
        const response = await fetch('/api/orders/my-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const orders = await response.json();
        const dot = document.getElementById('notif-dot');

        if(dot) {
            const hasNotification = orders.some(order => order.status === 'ready_for_pickup');
            
            if (hasNotification) {
                dot.style.display = 'block';
            } else {
                dot.style.display = 'none';
            }
        }
    } catch (error) {
        console.error("Notif check failed", error);
    }
}

function logout() {
    localStorage.clear(); 
    window.location.href = 'index.html'; 
}

async function fetchProducts() {
    const productList = document.getElementById('product-list');
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        productList.innerHTML = '';
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');
            card.setAttribute('data-category', product.category);

            card.innerHTML = `
                <h3>${product.name}</h3>
                <p class="category">${product.category}</p>
                <p class="price">₱${product.price}</p>
                <p class="stock">${product.stock_quantity} In Stock</p>
                <button class="add-btn" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                    Add to Cart 
                </button>`;
            productList.appendChild(card);
        });
    } catch (error) { console.error('Error fetching products:', error); }
}

function filterItems(category, buttonElement) {
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (category === 'All') {
            card.style.display = 'block';
        } else if (cardCategory === category) {
            card.style.display = 'block'; 
        } else {
            card.style.display = 'none';  
        }
    });
}

function searchProducts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        if (productName.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}