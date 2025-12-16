document.addEventListener('DOMContentLoaded', () => {
    initProfile();
});

async function initProfile() {
    const email = localStorage.getItem('userEmail');
    if (!email) return; 

    // Load user data
    let savedName = localStorage.getItem('userName');
    if (!savedName) {
        let namePart = email.split('@')[0];
        savedName = namePart.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    const savedGrade = localStorage.getItem('userGrade') || 'Grade ?';
    const savedStrand = localStorage.getItem('userStrand') || 'Dept';

    // Update profile info
    document.getElementById('display-email').textContent = email;
    document.getElementById('display-badge').textContent = `${savedGrade} - ${savedStrand}`;

    const nameContainer = document.getElementById('display-name');
    nameContainer.innerHTML = `
        <span id="name-text">${savedName}</span> 
        <span onclick="enableEdit()" class="profile-edit-icon">✎ Edit</span>
    `;

    // Load orders
    await loadOrders(email);
}

async function loadOrders(email) {
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
            historyArea.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <p class="empty-state-text">No purchases yet. Start shopping!</p>
                </div>
            `;
            return;
        }

        // Display notifications for ready orders
        const readyOrders = orders.filter(order => order.status === 'ready_for_pickup');
        if (readyOrders.length > 0) {
            readyOrders.forEach(order => {
                const alert = document.createElement('div');
                alert.className = 'alert-box';
                alert.innerHTML = `
                    <div class="alert-box-icon">🎉</div>
                    <div class="alert-box-content">
                        <strong>READY FOR PICK-UP!</strong>
                        <small>Order #${order.id} is waiting for you at the bookstore.</small>
                    </div>
                `;
                notifArea.appendChild(alert);
            });
        }

        // Display order history
        orders.forEach(order => {
            let statusClass = 'status-pending';
            let statusText = order.status.replace(/_/g, ' ').toUpperCase();
            
            if (order.status === 'ready_for_pickup') {
                statusClass = 'status-ready';
            } else if (order.status === 'completed') {
                statusClass = 'status-completed';
            }

            const card = document.createElement('div');
            card.className = 'order-card';
            
            card.innerHTML = `
                <div class="order-card-left">
                    <div class="order-card-id">Order #${order.id}</div>
                    <div class="order-card-date">${new Date(order.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</div>
                </div>
                <div class="order-card-right">
                    <div class="order-card-price">₱${order.total_amount.toFixed(2)}</div>
                    <span class="order-status-badge ${statusClass}">${statusText}</span>
                </div>
            `;
            historyArea.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        historyArea.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <p class="empty-state-text">Error loading orders. Please try again.</p>
            </div>
        `;
    }
}

function enableEdit() {
    const nameSpan = document.getElementById('name-text');
    const currentName = nameSpan.textContent;
    const container = document.getElementById('display-name');
    
    container.innerHTML = `
        <div class="profile-name-edit">
            <input type="text" id="edit-name-input" class="profile-name-input" value="${currentName}">
            <button onclick="saveName()" class="btn-save">Save</button>
            <button onclick="initProfile()" class="btn-cancel">Cancel</button>
        </div>
    `;
    
    // Focus on input
    document.getElementById('edit-name-input').focus();
}

async function saveName() {
    const newName = document.getElementById('edit-name-input').value.trim();
    
    if (!newName) {
        alert('Name cannot be empty');
        return;
    }
    
    const email = localStorage.getItem('userEmail');
    
    try {
        const response = await fetch('/api/auth/update-profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, newName: newName })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('userName', newName); 
            initProfile(); 
            
            // Show success message
            showToast('Name updated successfully!');
        } else {
            alert("Error updating name: " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Server error. Please try again.");
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    toast.className = 'show';
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}