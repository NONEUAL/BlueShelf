// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

async function fetchProducts() {
    const productList = document.getElementById('product-list');

    try {
        const response = await fetch('/api/products');
        const products = await response.json();

        productList.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            // --- THE FIX IS IN THIS BLOCK BELOW ---
            // We use .replace(/'/g, "\\'") to handle names with apostrophes (like "Student's Pen")
            const safeName = product.name.replace(/'/g, "\\'"); 
            
            card.innerHTML = `
                <h3>${product.name}</h3>
                <p class="category">${product.category}</p>
                <p class="price">₱${product.price}</p>
                <p class="stock">${product.stock_quantity} In Stock</p>
                
                <button class="add-btn" 
                    onclick="addToCart(${product.id}, '${safeName}', ${product.price})">
                    Add to Cart 
                </button>
            `;
            // --------------------------------------

            productList.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        productList.innerHTML = '<p>Error loading products.</p>';
    }
}