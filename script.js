/* =========================================
   1. ACCESSIBILITY & STYLES
   ========================================= */
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    /* Toast Notification */
    #toast { visibility: hidden; min-width: 250px; margin-left: -125px; background-color: #2ECC71; color: #fff; text-align: center; border-radius: 8px; padding: 16px; position: fixed; z-index: 100; left: 50%; bottom: 30px; font-size: 17px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    #toast.show { visibility: visible; animation: fadein 0.5s, fadeout 0.5s 2.5s; }
    @keyframes fadein { from {bottom: 0; opacity: 0;} to {bottom: 30px; opacity: 1;} }
    @keyframes fadeout { from {bottom: 30px; opacity: 1;} to {bottom: 0; opacity: 0;} }
`;
document.head.appendChild(styleSheet);

const toast = document.createElement("div");
toast.id = "toast";
document.body.appendChild(toast);

// API URL
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://dairydash-backend.vercel.app/api'; // TODO: Update with your Vercel URL

// MOCK DATA (Fallback) - Updated with new fields
const MOCK_PRODUCTS = [
    { id: 1, name: "Fresh Cow Milk", price: 45, discountPrice: 40, unit: "1L", category: "milk", image: "https://placehold.co/300x300?text=Cow+Milk", description: "Pure Farm Fresh Milk", isBestSeller: true },
    { id: 2, name: "Buffalo Milk", price: 60, discountPrice: 55, unit: "1L", category: "milk", image: "https://placehold.co/300x300?text=Buffalo+Milk", description: "Creamy Buffalo Milk", isBestSeller: false },
    { id: 3, name: "Malai Paneer", price: 85, discountPrice: 75, unit: "200g", category: "paneer", image: "https://placehold.co/300x300?text=Paneer", description: "Soft Malai Paneer", isBestSeller: true },
    { id: 4, name: "Fresh Curd", price: 30, discountPrice: 28, unit: "500g", category: "curd", image: "https://placehold.co/300x300?text=Curd", description: "Thick Curd", isBestSeller: false },
    { id: 5, name: "Desi Ghee", price: 550, discountPrice: 520, unit: "500ml", category: "butter", image: "https://placehold.co/300x300?text=Ghee", description: "Pure Desi Ghee", isBestSeller: true },
    { id: 6, name: "Table Butter", price: 50, discountPrice: 48, unit: "100g", category: "butter", image: "https://placehold.co/300x300?text=Butter", description: "Delicious Table Butter", isBestSeller: false },
    { id: 7, name: "Sweet Lassi", price: 25, discountPrice: 20, unit: "200ml", category: "beverages", image: "https://placehold.co/300x300?text=Lassi", description: "Refreshing Sweet Lassi", isBestSeller: true },
    { id: 8, name: "Greek Yogurt", price: 40, discountPrice: 35, unit: "100g", category: "curd", image: "https://placehold.co/300x300?text=Greek+Yogurt", description: "High Protein Yogurt", isBestSeller: false }
];

// ON PAGE LOAD
window.onload = function() {
    updateCartCount();
    if (window.location.pathname.includes('cart.html')) renderCartPage();
    if (window.location.pathname.includes('tracking.html')) loadTrackingInfo();
    if (window.location.pathname.includes('orders.html')) loadOrderHistory();
    if (window.location.pathname.includes('shop.html')) loadProducts();
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' ) loadBestSellers();
};

/* =========================================
   2. PRODUCTS LOGIC
   ========================================= */
async function loadProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    // Check URL params for category filter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        filterProducts(categoryParam);
        return; // filterProducts will handle rendering
    }

    try {
        const response = await fetch(`${API_URL}/products/all`);
        const data = await response.json();

        if (data.success && data.products.length > 0) {
            window.allProducts = data.products; // Cache for filtering
            renderProducts(data.products);
        } else {
            window.allProducts = MOCK_PRODUCTS;
            renderProducts(MOCK_PRODUCTS);
        }
    } catch (error) {
        console.log("Using mock data due to API error:", error);
        window.allProducts = MOCK_PRODUCTS;
        renderProducts(MOCK_PRODUCTS);
    }
}

async function loadBestSellers() {
    const grid = document.getElementById('best-sellers-grid');
    if (!grid) return;

    // Use mock data for homepage best sellers for now
    const bestSellers = MOCK_PRODUCTS.filter(p => p.isBestSeller).slice(0, 4);
    
    grid.innerHTML = bestSellers.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    const discountPercent = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
    const currentPrice = product.discountPrice || product.price;

    return `
        <div class="product-card bg-white rounded-xl overflow-hidden relative group card-hover">
            ${discountPercent > 0 ? `<div class="absolute top-3 left-3 z-10"><span class="badge-discount">${discountPercent}% OFF</span></div>` : ''}

            <div class="h-48 overflow-hidden bg-gray-100 relative">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">

                <!-- Overlay Add Button -->
                <button onclick="addToCart(${product.id}, '${product.name}', ${currentPrice}, '${product.image}')" class="absolute bottom-3 right-3 bg-white text-green-600 w-10 h-10 rounded-full shadow-md flex items-center justify-center font-bold text-xl hover:bg-green-600 hover:text-white transition duration-300">+</button>
            </div>

            <div class="p-4">
                <div class="text-xs text-gray-500 mb-1">${product.unit}</div>
                <h3 class="font-bold text-gray-800 mb-1 truncate">${product.name}</h3>

                <div class="flex items-center gap-2 mt-2">
                    <span class="font-bold text-gray-900">₹${currentPrice}</span>
                    ${product.discountPrice ? `<span class="text-xs text-gray-400 line-through">₹${product.price}</span>` : ''}
                </div>

                <!-- Quantity Selector (Hidden by default, shown when added - Simplified for demo) -->
            </div>
        </div>
    `;
}

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    // Update Title if category filter is active
    const titleEl = document.getElementById('category-title');
    if(titleEl && window.currentCategory) {
        titleEl.innerText = window.currentCategory.charAt(0).toUpperCase() + window.currentCategory.slice(1);
    } else if (titleEl) {
        titleEl.innerText = "All Products";
    }

    grid.innerHTML = products.map(product => createProductCard(product)).join('');
}

function filterProducts(category) {
    window.currentCategory = category;

    // Update active button state
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Find button with this category (simple check)
    buttons.forEach(btn => {
        if(btn.innerText.toLowerCase().includes(category) || (category === 'all' && btn.innerText.includes('All'))) {
            btn.classList.add('active');
        }
    });

    let products = window.allProducts || MOCK_PRODUCTS;
    if (category !== 'all') {
        products = products.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
    }
    renderProducts(products);
}

/* =========================================
   3. CART LOGIC
   ========================================= */
function addToCart(id, productName, price, image) {
    let cart = JSON.parse(localStorage.getItem('dairyDashCart')) || [];

    // Check if item exists
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name: productName, price: price, img: image, quantity: 1 });
    }

    localStorage.setItem('dairyDashCart', JSON.stringify(cart));
    updateCartCount();
    showToast(productName + " added!");
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('dairyDashCart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const countElements = document.querySelectorAll('.cart-count-display');
    countElements.forEach(el => el.innerText = `Cart (${totalItems})`);
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
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const itemHTML = `
                <div class="flex flex-col md:flex-row items-center gap-6 bg-white p-4 rounded-xl shadow border border-gray-200 mb-4">
                    <img src="${item.img}" class="w-20 h-20 object-cover rounded-lg bg-gray-100">
                    <div class="flex-grow text-center md:text-left">
                        <h3 class="text-lg font-bold text-gray-800">${item.name}</h3>
                        <p class="text-gray-600 text-sm">₹${item.price} x ${item.quantity}</p>
                    </div>

                    <div class="flex items-center gap-3">
                         <button onclick="updateQuantity(${index}, -1)" class="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200">-</button>
                         <span class="font-bold w-4 text-center">${item.quantity}</span>
                         <button onclick="updateQuantity(${index}, 1)" class="w-8 h-8 rounded-full bg-primary text-white font-bold hover:bg-green-600">+</button>
                    </div>

                    <div class="font-bold text-gray-800 w-20 text-right">₹${itemTotal}</div>

                    <button onclick="removeItem(${index})" class="text-red-500 hover:text-red-700 ml-2">
                        🗑️
                    </button>
                </div>
            `;
            container.innerHTML += itemHTML;
        });
        if(document.getElementById('total-price'))
            document.getElementById('total-price').innerText = '₹' + total.toFixed(2);
    }
}

function updateQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem('dairyDashCart')) || [];

    if (cart[index].quantity + change > 0) {
        cart[index].quantity += change;
    } else {
        // If reducing below 1, confirm removal? Or just stop at 1?
        // Let's remove if it goes to 0
        cart.splice(index, 1);
    }

    localStorage.setItem('dairyDashCart', JSON.stringify(cart));
    renderCartPage();
    updateCartCount();
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

    const totalAmount = document.getElementById('total-price') ? document.getElementById('total-price').innerText : '0';

    const newOrder = {
        id: Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString(),
        status: "Confirmed",
        items: cart,
        total: totalAmount
    };

    // Try API
    try {
        await fetch(`${API_URL}/orders/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart.map(i => ({ productName: i.name, price: i.price, quantity: i.quantity })),
                totalPrice: parseFloat(totalAmount.replace('₹', '')),
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

    if (!history || history.length === 0) {
        if(container) container.style.display = 'none';
        if(emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if(container) {
        container.innerHTML = '';
        history.forEach(order => {
            const itemNames = order.items.map(i => `${i.quantity}x ${i.name}`).join(", ");
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
        document.getElementById('item-count-display').innerText = lastOrder.items.reduce((sum, i) => sum + i.quantity, 0) + " Items";
    }
}
