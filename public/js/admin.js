document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});

async function loadOrders() {
    const tableBody = document.getElementById('order-rows');
    tableBody.innerHTML = '<tr><td colspan="6">Loading orders...</td></tr>';

    try {
        const response = await fetch('/api/orders/all');
        const orders = await response.json();

        tableBody.innerHTML = '';

        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">No orders found.</td></tr>';
            return;
        }

        orders.forEach(order => {
            const tr = document.createElement('tr');
            
            // Format Date
            const date = new Date(order.created_at).toLocaleDateString() + ' ' + new Date(order.created_at).toLocaleTimeString();

            // Status Badge Logic
            let statusBadge = '';
            if (order.status === 'pending') statusBadge = '<span class="badge status-pending">Pending</span>';
            else if (order.status === 'ready_for_pickup') statusBadge = '<span class="badge status-ready">Ready for Pickup</span>';
            else if (order.status === 'completed') statusBadge = '<span class="badge status-completed">Completed</span>';

            // Action Buttons Logic
            let buttons = '';
            if (order.status === 'pending') {
                buttons = `<button class="btn-action btn-ready" onclick="updateStatus(${order.id}, 'ready_for_pickup')">Mark Ready</button>`;
            } else if (order.status === 'ready_for_pickup') {
                buttons = `<button class="btn-action btn-complete" onclick="updateStatus(${order.id}, 'completed')">Mark Completed</button>`;
            } else {
                buttons = '<span style="color:grey;">Archived</span>';
            }

            tr.innerHTML = `
                <td>#${order.id}</td>
                <td>${order.user_email}</td>
                <td>₱${order.total_amount}</td>
                <td>${date}</td>
                <td>${statusBadge}</td>
                <td>${buttons}</td>
            `;

            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="6">Error loading data.</td></tr>';
    }
}

async function updateStatus(orderId, newStatus) {
    if (!confirm(`Are you sure you want to mark Order #${orderId} as ${newStatus}?`)) return;

    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            loadOrders(); // Refresh table
        } else {
            alert("Error: " + data.message);
        }

    } catch (error) {
        console.error(error);
        alert("System Error");
    }
}