// public/js/profile.js

document.addEventListener('DOMContentLoaded', () => {
    initProfile();
});

async function initProfile() {
    // 1. Get User from Session
    const email = localStorage.getItem('userEmail');
    
    // Security check is already handled by main.js, but double check:
    if (!email) return; 

    // 2. Update UI
    document.getElementById('display-email').textContent = email;
    // We try to be smart and guess the name from the email (or fetch it if we stored it)
    const name = email.split('@')[0].replace('.', ' ').toUpperCase(); 
    document.getElementById('display-name').textContent = name;

    const notifArea = document.getElementById('notifications');
    const historyArea = document.getElementById('order-history');

    try {
        // 3. Fetch Orders
        const response = await fetch('/api/orders/my-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const orders = await response.json();
        historyArea.innerHTML = '';
        notifArea.innerHTML = '';

        if (orders.length === 0) {
            historyArea.innerHTML = '<p style="text-align:center; padding:20px;">No purchases yet. <a href="catalog.html">Go Shopping!</a></p>';
            return;
        }

        orders.forEach(order => {
            // Notifications
            if (order.status === 'ready_for_pickup') {
                const alert = document.createElement('div');
                alert.className = 'alert-box';
                alert.innerHTML = `
                    <div style="font-size:24px; margin-right:15px;">🔔</div>
                    <div>
                        <strong>READY FOR PICK-UP</strong>
                        Order #${order.id} (₱${order.total_amount}) is ready at the bookstore.
                    </div>
                `;
                notifArea.appendChild(alert);
            }

            // History Card
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.textAlign = 'left';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';
            card.style.marginBottom = '10px';
            
            let statusColor = '#666';
            if(order.status === 'ready_for_pickup') statusColor = '#004aad';
            if(order.status === 'completed') statusColor = 'green';

            card.innerHTML = `
                <div>
                    <h3>Order #${order.id}</h3>
                    <p>Total: ₱${order.total_amount}</p>
                    <p style="font-size: 0.8em; color: #888;">${new Date(order.created_at).toDateString()}</p>
                </div>
                <div style="text-align: right;">
                    <span style="font-weight: bold; color: ${statusColor}; text-transform: uppercase;">
                        ${order.status.replace(/_/g, ' ')}
                    </span>
                </div>
            `;
            historyArea.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        historyArea.innerHTML = '<p>Error loading profile.</p>';
    }
}