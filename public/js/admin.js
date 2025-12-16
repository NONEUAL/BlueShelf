document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
        // Uncomment lines below to force redirect non-admins
        // alert("Access Denied: You are not an admin.");
        // window.location.href = 'index.html';
    }

    loadOrders();
    loadUsers();
});

async function loadOrders() {
    const tableBody = document.getElementById('order-rows');

    try {
        const response = await fetch('/api/orders/all');
        const orders = await response.json();

        tableBody.innerHTML = '';

        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">No active orders found.</td></tr>';
            return;
        }

        orders.forEach(order => {
            const tr = document.createElement('tr');
            const date = new Date(order.created_at).toLocaleString();

            let statusClass = '';
            switch(order.status) {
                case 'pending': statusClass = 'status-pending'; break;
                case 'ready_for_pickup': statusClass = 'status-ready'; break;
                case 'completed': statusClass = 'status-completed'; break;
                default: statusClass = 'status-cancelled';
            }
            
            let statusText = order.status.replace(/_/g, ' ').toUpperCase();
            let statusBadge = `<span class="badge ${statusClass}">${statusText}</span>`;

            let buttons = '';
            if (order.status === 'pending') {
                buttons = `<button class="btn-action btn-ready" onclick="updateStatus(${order.id}, 'ready_for_pickup')">Mark Ready 📦</button>`;
            } else if (order.status === 'ready_for_pickup') {
                buttons = `<button class="btn-action btn-complete" onclick="updateStatus(${order.id}, 'completed')">Complete ✅</button>`;
            } else {
                buttons = '<span style="color:#aaa;">No actions</span>';
            }

            tr.innerHTML = `
                <td><strong>#${order.id}</strong></td>
                <td>${order.user_email}</td>
                <td>₱${order.total_amount.toFixed(2)}</td>
                <td style="font-size: 0.9em; color: #555;">${date}</td>
                <td>${statusBadge}</td>
                <td>${buttons}</td>
            `;

            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="6" style="color:red; text-align:center;">Error loading orders. Is the server running?</td></tr>';
    }
}

async function updateStatus(orderId, newStatus) {
    let confirmMsg = newStatus === 'ready_for_pickup' 
        ? "Is this order packed and ready?" 
        : "Has the student picked up the item?";

    if (!confirm(confirmMsg)) return;

    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadOrders();
        } else {
            alert("Error: " + data.message);
        }

    } catch (error) {
        console.error(error);
        alert("System Error. Check console.");
    }
}

async function loadUsers() {
    const userBody = document.getElementById('user-rows');
    userBody.innerHTML = '<tr><td colspan="5">Loading users...</td></tr>';

    try {
        const response = await fetch('/api/auth/all');
        
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const users = await response.json();

        if (!Array.isArray(users)) {
            console.error("Expected array but got:", users);
            userBody.innerHTML = '<tr><td colspan="5">Error: Invalid data format.</td></tr>';
            return;
        }

        userBody.innerHTML = '';

        if (users.length === 0) {
            userBody.innerHTML = '<tr><td colspan="5">No users found.</td></tr>';
            return;
        }

        users.forEach(user => {
            const tr = document.createElement('tr');
            
            let deleteBtn = `<button class="btn-action" style="background:red; color:white;" onclick="deleteUser(${user.id})">Delete</button>`;
            if(user.role === 'admin') deleteBtn = '<span style="color:#666; font-style:italic;">Admin</span>';

            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.full_name || 'N/A'}</td>
                <td>${user.email}</td>
                <td><span class="badge" style="background:${user.role === 'admin' ? '#2c3e50' : '#95a5a6'}">${user.role}</span></td>
                <td>${deleteBtn}</td>
            `;
            userBody.appendChild(tr);
        });

    } catch (error) {
        console.error(error);
        userBody.innerHTML = '<tr><td colspan="5">Error loading users. Check console.</td></tr>';
    }
}

async function deleteUser(id, email) {
    if(!confirm(`⚠️ WARNING: Are you sure you want to delete user ${email}?\n\nThis cannot be undone.`)) return;

    try {
        const response = await fetch(`/api/auth/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
            alert("User removed successfully.");
            loadUsers();
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("System Error during deletion.");
    }
}

document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('p-name').value;
    const category = document.getElementById('p-cat').value;
    const price = document.getElementById('p-price').value;
    const stock = document.getElementById('p-stock').value;

    const res = await fetch('/api/products/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, category, price, stock })
    });
    
    if(res.ok) {
        alert("Product Added!");
        e.target.reset();
        // You might want to reload a product table here if you had one
    } else {
        alert("Error adding product");
    }
});