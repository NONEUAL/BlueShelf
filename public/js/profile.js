document.addEventListener('DOMContentLoaded', () => {
    initProfile();
});

async function initProfile() {
    const email = localStorage.getItem('userEmail');
    if (!email) return; 

    let savedName = localStorage.getItem('userName');
    if (!savedName) {
        let namePart = email.split('@')[0];
        savedName = namePart.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    const savedGrade = localStorage.getItem('userGrade') || 'Grade ?';
    const savedStrand = localStorage.getItem('userStrand') || 'Dept';

    document.getElementById('display-email').textContent = email;
    document.getElementById('display-badge').textContent = `${savedGrade} - ${savedStrand}`;

    const nameContainer = document.getElementById('display-name');
    nameContainer.innerHTML = `
        <span id="name-text">${savedName}</span> 
        <span onclick="enableEdit()" style="cursor:pointer; font-size:0.6em; color:#004aad; margin-left:10px;">✎ Edit</span>
    `;

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
            
            let statusColor = '#666';
            if(order.status === 'ready_for_pickup') statusColor = '#004aad';
            if(order.status === 'completed') statusColor = 'green';

            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.textAlign='left'; 
            card.style.marginBottom='10px';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            
            card.innerHTML = `
                <div>
                    <strong>Order #${order.id}</strong><br>
                    <span style="font-size:0.8em; color:#888;">${new Date(order.created_at).toDateString()}</span>
                </div>
                <div style="text-align:right;">
                    ₱${order.total_amount}<br>
                    <span style="font-weight:bold; color:${statusColor}; font-size:0.8em;">${order.status.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
            `;
            historyArea.appendChild(card);
        });
    } catch (error) {
        console.error(error);
    }
}

function enableEdit() {
    const nameSpan = document.getElementById('name-text');
    const currentName = nameSpan.textContent;
    const container = document.getElementById('display-name');
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
            localStorage.setItem('userName', newName); 
            initProfile(); 
        } else {
            alert("Error updating name.");
        }
    } catch (error) {
        console.error(error);
    }
}