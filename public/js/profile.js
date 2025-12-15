// public/js/profile.js

// Check if we remembered the email from the last checkout?
document.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('lastEmail');
    if (savedEmail) {
        document.getElementById('confirm-email').value = savedEmail;
    }
});

async function loadProfile() {
    const emailInput = document.getElementById('confirm-email').value;
    
    if (!emailInput.endsWith('@sma.edu.ph')) {
        alert("Please enter a valid SMA email.");
        return;
    }

    // Save for next time
    localStorage.setItem('lastEmail', emailInput);

    // Switch UI
    document.getElementById('login-check').style.display = 'none';
    document.getElementById('profile-content').style.display = 'block';
    document.getElementById('display-email').textContent = emailInput;

    const notifArea = document.getElementById('notifications');
    const historyArea = document.getElementById('order-history');

    notifArea.innerHTML = '';
    historyArea.innerHTML = '<p>Loading records...</p>';

    try {
        const response = await fetch('/api/orders/my-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput })
        });

        const orders = await response.json();
        historyArea.innerHTML = '';

        if (orders.length === 0) {
            historyArea.innerHTML = '<p>No purchases yet.</p>';
            return;
        }

        orders.forEach(order => {
            // 1. Check for NOTIFICATIONS (Is it Ready?)
            if (order.status === 'ready_for_pickup') {
                const alert = document.createElement('div');
                alert.className = 'alert-box';
                alert.innerHTML = `
                    <div class="icon">🛍️</div>
                    <div>
                        <strong>READY FOR PICK-UP</strong>
                        Your order #${order.id} (₱${order.total_amount}) is ready at the bookstore.
                    </div>
                `;
                notifArea.appendChild(alert);
            }

            // 2. Build History Card
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.textAlign = 'left';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';
            
            // Color code the status text
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
                    <br>
                    <button class="add-btn" style="margin-top: 5px; padding: 5px 10px; font-size: 0.8em;" onclick="alert('Receipt downloading...')">
                        Receipt 📄
                    </button>
                </div>
            `;
            historyArea.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        alert("Error loading profile");
    }
}