// public/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    // Check if the user is actually an admin (Optional Security)
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
        // alert("Access Denied: You are not an admin.");
        // window.location.href = 'index.html';
        // Note: Uncomment lines above if you want to force redirect non-admins
    }

    // Load Data
    loadOrders();
    loadUsers();
});

// =================================================
// 1. ORDER MANAGEMENT FUNCTIONS
// =================================================

async function loadOrders() {
    const tableBody = document.getElementById('order-rows');
    // Don't clear immediately to avoid flickering, maybe show a spinner icon if desired

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
            
            // Format Date (e.g., "10/24/2025, 2:30 PM")
            const date = new Date(order.created_at).toLocaleString();

            // Status Badge Logic
            let statusBadge = '';
            let statusClass = '';
            
            switch(order.status) {
                case 'pending': statusClass = 'status-pending'; break;
                case 'ready_for_pickup': statusClass = 'status-ready'; break;
                case 'completed': statusClass = 'status-completed'; break;
                default: statusClass = 'status-cancelled';
            }
            
            // Format status text (remove underscores)
            let statusText = order.status.replace(/_/g, ' ').toUpperCase();
            statusBadge = `<span class="badge ${statusClass}">${statusText}</span>`;

            // Action Buttons Logic
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
            // alert(data.message); // Optional: Popups can be annoying
            loadOrders(); // Refresh table immediately
        } else {
            alert("Error: " + data.message);
        }

    } catch (error) {
        console.error(error);
        alert("System Error. Check console.");
    }
}

// =================================================
// 2. USER MANAGEMENT FUNCTIONS
// =================================================

async function loadUsers() {
    const userBody = document.getElementById('user-rows');
    userBody.innerHTML = '<tr><td colspan="5">Loading users...</td></tr>';

    try {
        const response = await fetch('/api/auth/all');
        
        // Check if the server reported an error (like 500 or 404)
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const users = await response.json();

        // Safety check: Is 'users' actually a list?
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
            
            // Prevent deleting the Admin logic
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
            loadUsers(); // Refresh the list
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("System Error during deletion.");
    }
}