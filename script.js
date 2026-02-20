/* =========================================
   1. ACCESSIBILITY & STYLES
   ========================================= */
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    /* Toast Notification */
    #toast { visibility: hidden; min-width: 250px; margin-left: -125px; background-color: #1B5E5F; color: #fff; text-align: center; border-radius: 8px; padding: 16px; position: fixed; z-index: 100; left: 50%; bottom: 30px; font-size: 17px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    #toast.show { visibility: visible; animation: fadein 0.5s, fadeout 0.5s 2.5s; }
    @keyframes fadein { from {bottom: 0; opacity: 0;} to {bottom: 30px; opacity: 1;} }
    @keyframes fadeout { from {bottom: 30px; opacity: 1;} to {bottom: 0; opacity: 0;} }
`;
document.head.appendChild(styleSheet);

const toast = document.createElement("div");
toast.id = "toast";
document.body.appendChild(toast);

// API URL
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

// MOCK DATA (Fallback)
const MOCK_PRODUCTS = [
    { id: 1, name: "Fresh Cow Milk", price: 45, category: "milk", image: "https://placehold.co/300x300?text=Cow+Milk", description: "1L Pure Farm Fresh Milk" },
    { id: 2, name: "Buffalo Milk", price: 60, category: "milk", image: "https://placehold.co/300x300?text=Buffalo+Milk", description: "1L Creamy Buffalo Milk" },
    { id: 3, name: "Malai Paneer", price: 85, category: "paneer", image: "https://placehold.co/300x300?text=Paneer", description: "200g Soft Malai Paneer" },
    { id: 4, name: "Fresh Curd", price: 30, category: "curd", image: "https://placehold.co/300x300?text=Curd", description: "500g Thick Curd" },
    { id: 5, name: "Desi Ghee", price: 550, category: "butter", image: "https://placehold.co/300x300?text=Ghee", description: "500ml Pure Desi Ghee" },
    { id: 6, name: "Butter", price: 50, category: "butter", image: "https://placehold.co/300x300?text=Butter", description: "100g Table Butter" },
    { id: 7, name: "Lassi", price: 25, category: "beverages", image: "https://placehold.co/300x300?text=Lassi", description: "200ml Sweet Lassi" },
    { id: 8, name: "Greek Yogurt", price: 40, category: "curd", image: "https://placehold.co/300x300?text=Greek+Yogurt", description: "100g High Protein Yogurt" }
];

// ON PAGE LOAD
window.onload = function() {
    updateCartCount();
    if (window.location.pathname.includes('cart.html')) renderCartPage();
    if (window.location.pathname.includes('tracking.html')) loadTrackingInfo();
    if (window.location.pathname.includes('orders.html')) loadOrderHistory();
    if (window.location.pathname.includes('shop.html')) loadProducts();
};

/* =========================================
   2. PRODUCTS LOGIC
   ========================================= */
async function loadProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    try {
        // Try fetching from API
        const response = await fetch(`${API_URL}/products/all`);
        const data = await response.json();

        if (data.success && data.products.length > 0) {
            renderProducts(data.products);
        } else {
            renderProducts(MOCK_PRODUCTS);
        }
    } catch (error) {
        console.log("Using mock data due to API error:", error);
        renderProducts(MOCK_PRODUCTS);
    }
}

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.innerHTML = products.map(product => `
        <div class="product-card bg-white rounded-xl overflow-hidden relative group">
            <div class="absolute top-4 left-4 z-10">
                <span class="price-badge text-white px-3 py-1 rounded-full text-sm font-bold">₹${product.price}</span>
            </div>
            <div class="h-64 overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover transform group-hover:scale-110 transition duration-500">
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="text-xs font-bold text-[#1B5E5F] uppercase tracking-wider">${product.category}</span>
                        <h3 class="text-xl font-bold text-gray-900 mb-1">${product.name}</h3>
                    </div>
                </div>
                <p class="text-gray-600 text-sm mb-4">${product.description || ''}</p>
                <div class="flex gap-2">
                    <button onclick="addToCart('${product.name}', ${product.price}, '${product.image}')" class="flex-1 btn-primary text-white py-3 rounded-lg font-bold shadow-md flex items-center justify-center gap-2">
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProducts(category) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    let products = MOCK_PRODUCTS; // In real app, we'd filter the fetched data
    if (category !== 'all') {
        products = products.filter(p => p.category === category);
    }
    renderProducts(products);
}

/* =========================================
   3. CART LOGIC
   ========================================= */
function addToCart(productName, price, image) {
    let cart = JSON.parse(localStorage.getItem('dairyDashCart')) || [];
    cart.push({ name: productName, price: price, img: image });
    localStorage.setItem('dairyDashCart', JSON.stringify(cart));
    updateCartCount();
    showToast(productName + " added to cart!");
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('dairyDashCart')) || [];
    const countElements = document.querySelectorAll('.cart-count-display');
    const countSpan = document.getElementById('cart-count');

    countElements.forEach(el => el.innerText = `Cart (${cart.length})`);
    if(countSpan) countSpan.innerText = cart.length;
}

function showToast(message) {
    const x = document.getElementById("toast");
    x.innerText = "✅ " + message;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function renderCartPage() {
    const cart = JSON.parse(localStorage.getItem('dairyDashCart')) || [];
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
                        <p class="text-gray-600 text-lg">₹${item.price}</p>
                    </div>
                    <button onclick="removeItem(${index})" class="text-red-600 font-bold underline px-4 py-2 hover:bg-red-50 rounded text-lg">Remove</button>
                </div>
            `;
            container.innerHTML += itemHTML;
        });
        if(document.getElementById('total-price'))
            document.getElementById('total-price').innerText = '₹' + total.toFixed(2);
    }
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('dairyDashCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('dairyDashCart', JSON.stringify(cart));
    renderCartPage();
    updateCartCount();
}

/* =========================================
   4. ORDER & TRACKING LOGIC
   ========================================= */
async function placeOrder(event) {
    if(event) event.preventDefault();
    
    const cart = JSON.parse(localStorage.getItem('dairyDashCart')) || [];
    if(cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const newOrder = {
        id: Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString(),
        status: "Confirmed",
        items: cart,
        total: document.getElementById('total-price') ? document.getElementById('total-price').innerText : '0'
    };

    // Try API
    try {
        const response = await fetch(`${API_URL}/orders/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart.map(i => ({ productName: i.name, price: i.price, quantity: 1 })),
                totalPrice: parseFloat(newOrder.total.replace('₹', '')),
                deliveryAddress: "Default Address"
            })
        });
    } catch (e) {
        console.log("API order failed, using local storage");
    }

    let history = JSON.parse(localStorage.getItem('dairyDashOrderHistory')) || [];
    history.unshift(newOrder);
    localStorage.setItem('dairyDashOrderHistory', JSON.stringify(history));
    localStorage.setItem('dairyDashLastOrder', JSON.stringify(newOrder));

    localStorage.removeItem('dairyDashCart');
    window.location.href = 'success.html';
}

function loadOrderHistory() {
    const history = JSON.parse(localStorage.getItem('dairyDashOrderHistory')) || [];
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
                        <p class="text-gray-800 font-bold mt-2">Total: ${order.total}</p>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
        container.style.display = 'block';
        if(emptyMsg) emptyMsg.style.display = 'none';
    }
}

function loadTrackingInfo() {
    const lastOrder = JSON.parse(localStorage.getItem('dairyDashLastOrder'));
    const container = document.getElementById('tracking-container');
    const noOrderMsg = document.getElementById('no-order-msg');

    if (!lastOrder) {
        if(container) container.style.display = 'none';
        if(noOrderMsg) noOrderMsg.style.display = 'block';
        return;
    }

    if(container) {
        container.style.display = 'block';
        if(noOrderMsg) noOrderMsg.style.display = 'none';

        document.getElementById('order-id-display').innerText = '#' + lastOrder.id;
        document.getElementById('order-date-display').innerText = lastOrder.date;
        document.getElementById('item-count-display').innerText = lastOrder.items.length + " Items";
    }
}

/* =========================================
   5. A11Y UTILS
   ========================================= */
function toggleMenu() {
    const menu = document.getElementById('a11y-menu');
    menu.classList.toggle('open');
}

function setContrast(mode) {
    if(mode === 'high') document.body.classList.add('contrast-high');
    else document.body.classList.remove('contrast-high');
}

function toggleLargeTargets() {
    document.body.classList.toggle('large-targets');
}

function toggleDyslexia() {
    document.body.classList.toggle('dyslexia-mode');
}
