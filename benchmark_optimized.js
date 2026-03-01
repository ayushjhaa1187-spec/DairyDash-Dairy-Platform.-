const fs = require("fs");
const { JSDOM } = require("jsdom");

const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div id="cart-items-container"></div>
    <div id="empty-cart-msg"></div>
    <div id="cart-summary"></div>
    <div id="total-price"></div>
  </body>
  </html>
`, { url: "http://localhost/" });

const window = dom.window;
const document = window.document;

const storage = {};
window.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, value) => { storage[key] = value.toString(); },
  removeItem: (key) => { delete storage[key]; }
};

const largeCart = [];
for(let i = 0; i < 500; i++) {
  largeCart.push({ name: "Product " + i, price: "10.00", img: "test.jpg" });
}
window.localStorage.setItem('seniorCart', JSON.stringify(largeCart));

global.window = window;
global.document = document;
global.localStorage = window.localStorage;

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
        let htmlBuffer = '';
        cart.forEach((item, index) => {
            total += parseFloat(item.price);
            htmlBuffer += `
                <div class="flex flex-col md:flex-row items-center gap-6 bg-white p-4 rounded-xl shadow border border-gray-200 mb-4">
                    <img src="${item.img}" class="w-24 h-24 object-cover rounded-lg bg-gray-100 border border-gray-300">
                    <div class="flex-grow text-center md:text-left">
                        <h3 class="text-xl font-bold text-gray-800">${item.name}</h3>
                        <p class="text-gray-600 text-lg">$${item.price}</p>
                    </div>
                    <button onclick="removeItem(${index})" class="text-red-600 font-bold underline px-4 py-2 hover:bg-red-50 rounded text-lg">Remove</button>
                </div>
            `;
        });
        container.innerHTML = htmlBuffer;
        document.getElementById('total-price').innerText = '$' + total.toFixed(2);
    }
}

const start = performance.now();
renderCartPage();
const end = performance.now();

console.log(`Optimized render time: ${end - start} ms`);
