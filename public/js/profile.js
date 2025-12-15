// public/js/profile.js

document.addEventListener('DOMContentLoaded', () => {
    initProfile();
});

async function initProfile() {
    const email = localStorage.getItem('userEmail');
    if (!email) return; 

    // 1. Get Name logic
    // We try to get the live name from the database via the API, 
    // but for now, let's use the one we saved in Login or default to email format.
    let savedName = localStorage.getItem('userName');
    
    // Fallback if local storage is empty (Safety)
    if (!savedName) {
        let namePart = email.split('@')[0];
        savedName = namePart.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    document.getElementById('display-email').textContent = email;
    
    // Inject the name with an Edit Button
    const nameContainer = document.getElementById('display-name');
    nameContainer.innerHTML = `
        <span id="name-text">${savedName}</span> 
        <span onclick="enableEdit()" style="cursor:pointer; font-size:0.6em; color:#004aad; margin-left:10px;">✎ Edit</span>
    `;

    // Fetch Orders (Remaining code is same as before...)
    const notifArea = document.getElementById('notifications');
    const historyArea = document.getElementById('order-history');

    try {
        const response = await fetch('/api/orders/my-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const orders = await response.json();
        historyArea.innerHTML = '';
        notifArea.innerHTML = '';

        if (orders.length === 0) {
            historyArea.innerHTML = '<p style="text-align:center; padding:20px;">No purchases yet.</p>';
            return;
        }

        orders.forEach(order => {
            if (order.status === 'ready_for_pickup') {
                const alert = document.createElement('div');
                alert.className = 'alert-box';
                alert.innerHTML = `
                    <div style="font-size:24px; margin-right:15px;">🔔</div>
                    <div><strong>READY FOR PICK-UP</strong><br>Order #${order.id}</div>
                `;
                notifArea.appendChild(alert);
            }
            // Simple History Item
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.textAlign='left'; card.style.marginBottom='10px';
            card.innerHTML = `<strong>Order #${order.id}</strong> - ₱${order.total_amount} <br> Status: ${order.status}`;
            historyArea.appendChild(card);
        });
    } catch (error) { console.error(error); }
}

// === NEW: Edit Name Functionality ===
function enableEdit() {
    const nameSpan = document.getElementById('name-text');
    const currentName = nameSpan.textContent;
    const container = document.getElementById('display-name');

    // Replace text with input box
    container.innerHTML = `
        <input type="text" id="edit-name-input" value="${currentName}" style="width:200px; padding:5px;">
        <button onclick="saveName()" class="add-btn" style="width:auto; padding:5px 10px; font-size:0.8rem;">Save</button>
        <button onclick="initProfile()" style="background:none; border:none; cursor:pointer; color:red;">Cancel</button>
    `;
}

async function saveName() {
    const newName = document.getElementById('edit-name-input').value;
    const email = localStorage.getItem('userEmail');

    try {
        const response = await fetch('/api/auth/update-profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, newName: newName })
        });

        const data = await response.json();
        if (data.success) {
            localStorage.setItem('userName', newName); // Update local storage
            initProfile(); // Reload the profile view
        } else {
            alert("Error updating name.");
        }
    } catch (error) {
        console.error(error);
        alert("Server Error");
    }
}