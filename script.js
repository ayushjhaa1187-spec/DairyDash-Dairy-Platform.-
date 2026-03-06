/* =========================================
   1. ACCESSIBILITY & STYLES
   ========================================= */
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    /* Toast Notification */
    #toast { visibility: hidden; min-width: 250px; margin-left: -125px; background-color: #208090; color: #fff; text-align: center; border-radius: 8px; padding: 16px; position: fixed; z-index: 100; left: 50%; bottom: 30px; font-size: 17px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    #toast.show { visibility: visible; animation: fadein 0.5s, fadeout 0.5s 2.5s; }
    @keyframes fadein { from {bottom: 0; opacity: 0;} to {bottom: 30px; opacity: 1;} }
    @keyframes fadeout { from {bottom: 30px; opacity: 1;} to {bottom: 0; opacity: 0;} }
`;
document.head.appendChild(styleSheet);

const toast = document.createElement("div");
toast.id = "toast";
document.body.appendChild(toast);

// ON PAGE LOAD
window.onload = function() {
    updateCartCount(); // Update header count
    if (window.location.pathname.includes('cart.html')) renderCartPage();
    if (window.location.pathname.includes('tracking.html')) loadTrackingInfo();
    if (window.location.pathname.includes('orders.html')) loadOrderHistory();
};

/* =========================================
   2. CART LOGIC (FIX FOR ADD TO CART)
   ========================================= */
function addToCart(productName, price, image) {
    // 1. Get existing cart
    let cart = JSON.parse(localStorage.getItem('seniorCart')) || [];
    
    // 2. Add new item
    cart.push({ name: productName, price: price, img: image });
    
    // 3. Save back to storage
    localStorage.setItem('seniorCart', JSON.stringify(cart));
    
    // 4. Update Header Count
    updateCartCount();
    
    // 5. Show Success Message
    showToast(productName + " added to cart!");
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('seniorCart')) || [];
    const countElements = document.querySelectorAll('.cart-count-display');
    countElements.forEach(el => el.innerText = `Cart (${cart.length})`);
}

function showToast(message) {
    const x = document.getElementById("toast");
    x.innerText = "✅ " + message;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function renderCartPage() {
    const cart = JSON.parse(localStorage.getItem('seniorCart')) || [];
    const container = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const summary = document.getElementById('cart-summary');
    
    if(container) container.innerHTML = '';

    if (cart.length === 0) {
        if(emptyMsg) emptyMsg.style.display = 'block';
        if(container) container.style.display = 'none';
        if(summary) summary.style.display = 'none';
    } else {
        if(emptyMsg) emptyMsg.style.display = 'none';
        if(container) container.style.display = 'block';
        if(summary) summary.style.display = 'block';

        let total = 0;
        cart.forEach((item, index) => {
            total += parseFloat(item.price);
            const itemHTML = `
                <div class="flex flex-col md:flex-row items-center gap-6 bg-white p-4 rounded-xl shadow border border-gray-200 mb-4">
                    <img src="${item.img}" class="w-24 h-24 object-cover rounded-lg bg-gray-100 border border-gray-300">
                    <div class="flex-grow text-center md:text-left">
                        <h3 class="text-xl font-bold text-gray-800">${item.name}</h3>
                        <p class="text-gray-600 text-lg">$${item.price}</p>
                    </div>
                    <button onclick="removeItem(${index})" class="text-red-600 font-bold underline px-4 py-2 hover:bg-red-50 rounded text-lg">Remove</button>
                </div>
            `;
            container.innerHTML += itemHTML;
        });
        document.getElementById('total-price').innerText = '$' + total.toFixed(2);
    }
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('seniorCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('seniorCart', JSON.stringify(cart));
    renderCartPage();
    updateCartCount();
}

/* =========================================
   3. ORDER HISTORY LOGIC (NEW FEATURE)
   ========================================= */
function placeOrder(event) {
    event.preventDefault(); 
    
    const cart = JSON.parse(localStorage.getItem('seniorCart')) || [];
    if(cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // Create the New Order
    const newOrder = {
        id: Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString(),
        status: "Shipped", // We simulate it being shipped immediately
        items: cart,
        total: document.getElementById('total-price') ? document.getElementById('total-price').innerText : '$99.99' // Grab total from page if possible
    };

    // 1. Get Existing History (List of orders)
    let history = JSON.parse(localStorage.getItem('seniorOrderHistory')) || [];
    
    // 2. Add New Order to the TOP of the list
    history.unshift(newOrder);
    
    // 3. Save History back to browser memory
    localStorage.setItem('seniorOrderHistory', JSON.stringify(history));
    
    // 4. Also save as "Last Order" for the tracking page
    localStorage.setItem('seniorLastOrder', JSON.stringify(newOrder));

    // 5. Clear Cart & Redirect
    localStorage.removeItem('seniorCart');
    window.location.href = 'success.html';
}

function loadOrderHistory() {
    const history = JSON.parse(localStorage.getItem('seniorOrderHistory')) || [];
    const container = document.getElementById('orders-container');
    const emptyMsg = document.getElementById('no-orders-msg');

    if (history.length === 0) {
        if(container) container.style.display = 'none';
        if(emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if(container) {
        container.innerHTML = '';
        history.forEach(order => {
            // Build a string of item names (e.g., "Phone, Pills")
            const itemNames = order.items.map(i => i.name).join(", ");
            
            const card = `
                <div class="bg-white p-6 rounded-xl shadow-md border-2 border-gray-100 mb-6">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b pb-4">
                        <div>
                            <span class="text-sm text-gray-500 font-bold uppercase">Order #${order.id}</span>
                            <div class="text-xl font-bold text-gray-800">${order.date}</div>
                        </div>
                        <div class="mt-2 md:mt-0">
                            <span class="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-lg">
                                🚚 ${order.status}
                            </span>
                        </div>
                    </div>
                    <div class="mb-4">
                        <p class="text-gray-600 text-lg"><span class="font-bold">Items:</span> ${itemNames}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="font-bold text-gray-700">Status: On the way to your home.</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-4 mt-3">
                            <div class="bg-[#208090] h-4 rounded-full" style="width: 60%"></div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
        
        container.style.display = 'block';
        if(emptyMsg) emptyMsg.style.display = 'none';
    }
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { placeOrder };
}
