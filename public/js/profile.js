// public/js/profile.js

document.addEventListener('DOMContentLoaded', () => {
    initProfile();
});

async function initProfile() {
    const email = localStorage.getItem('userEmail');
    if (!email) return; 

    // --- 1. FIX: Define savedName properly ---
    let savedName = localStorage.getItem('userName');
    
    // Fallback: If no name is saved, generate it from email
    if (!savedName) {
        let namePart = email.split('@')[0];
        savedName = namePart.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    // ------------------------------------------

    // Update Email
    document.getElementById('display-email').textContent = email;
    
    // --- 2. FIX: Display Name with Edit Button ---
    const nameContainer = document.getElementById('display-name');
    if (nameContainer) {
        nameContainer.innerHTML = `
            <span id="name-text">${savedName}</span> 
            <span onclick="enableEdit()" style="cursor:pointer; font-size:0.6rem; color:#004aad; vertical-align:middle; margin-left:10px;">✎ Edit</span>
        `;
    }

    // --- 3. FIX: Display Grade & Strand ---
    const savedGrade = localStorage.getItem('userGrade') || 'Grade 12';
    // If the strand is missing or literally says "undefined", default to "Student"
    let savedStrand = localStorage.getItem('userStrand');
    if (!savedStrand || savedStrand === 'undefined') {
        savedStrand = 'Student';
    }

    const badge = document.getElementById('display-badge');
    if (badge) {
        badge.textContent = `${savedGrade} - ${savedStrand}`;
    }
    // ---------------------------------------

    // --- 4. Fetch Order History ---
    const notifArea = document.getElementById('notifications');
    const historyArea = document.getElementById('order-history');

    try {
        const response = await fetch('/api/orders/my-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const orders = await response.json();
        
        if (historyArea) historyArea.innerHTML = '';
        if (notifArea) notifArea.innerHTML = '';

        if (!orders || orders.length === 0) {
            if (historyArea) historyArea.innerHTML = '<p style="text-align:center; padding:20px;">No purchases yet.</p>';
            return;
        }

        orders.forEach(order => {
            // Notifications (Ready for Pickup)
            if (order.status === 'ready_for_pickup') {
                const alert = document.createElement('div');
                alert.className = 'alert-box';
                alert.innerHTML = `
                    <div style="font-size:24px; margin-right:15px;">🔔</div>
                    <div><strong>READY FOR PICK-UP</strong><br>Order #${order.id}</div>
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
            
            // Status Color Logic
            let color = '#666';
            if (order.status === 'ready_for_pickup') color = '#004aad'; // Blue
            if (order.status === 'completed') color = '#27ae60'; // Green

            card.innerHTML = `
                <div>
                    <strong>Order #${order.id}</strong>
                    <br><span style="font-size:0.9em; color:#888;">${new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:bold;">₱${order.total_amount}</div>
                    <div style="font-size:0.8em; color:${color}; text-transform:uppercase;">${order.status.replace(/_/g, ' ')}</div>
                </div>
            `;
            historyArea.appendChild(card);
        });

    } catch (error) {
        console.error("Profile Error:", error);
    }
}

// === Edit Name Functions ===
function enableEdit() {
    const nameSpan = document.getElementById('name-text');
    const currentName = nameSpan.textContent;
    const container = document.getElementById('display-name');

    container.innerHTML = `
        <input type="text" id="edit-name-input" value="${currentName}" style="font-size:1rem; padding:5px; width:60%;">
        <button onclick="saveName()" style="background:#004aad; color:white; border:none; padding:5px 10px; cursor:pointer;">Save</button>
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
            alert("Error updating name");
        }
    } catch (error) { console.error(error); }
}