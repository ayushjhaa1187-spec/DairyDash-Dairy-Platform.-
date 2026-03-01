/**
 * @jest-environment jsdom
 */

// Mock alert
global.alert = jest.fn();

// Import script.js functions
const fs = require('fs');
const path = require('path');
const scriptCode = fs.readFileSync(path.resolve(__dirname, '../../script.js'), 'utf8');

// We need to evaluate the script code in the jsdom environment
// Let's modify the code slightly so we don't hit the JS DOM's location error
const mockedScriptCode = scriptCode.replace(
  "window.location.href = 'success.html';",
  "window._mockLocationHref = 'success.html';"
);
eval(mockedScriptCode);

describe('placeOrder', () => {

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    window._mockLocationHref = '';

    // Clear document body
    document.body.innerHTML = '';
  });

  it('should alert if cart is empty', () => {
    // We start with an empty cart
    localStorage.setItem('seniorCart', JSON.stringify([]));

    // Create a mock event to pass to placeOrder
    const mockEvent = { preventDefault: jest.fn() };

    // Call the function
    placeOrder(mockEvent);

    // Check if the event.preventDefault was called
    expect(mockEvent.preventDefault).toHaveBeenCalled();

    // Check if alert was called with the correct message
    expect(global.alert).toHaveBeenCalledWith("Your cart is empty!");
  });

  it('should process the order when cart is not empty', () => {
    // Mock the UI elements that placeOrder uses
    const totalPriceEl = document.createElement('div');
    totalPriceEl.id = 'total-price';
    totalPriceEl.innerText = '$45.00';
    document.body.appendChild(totalPriceEl);

    // Setup the cart with some items
    const mockCart = [
      { name: 'Milk', price: 5.0, img: 'milk.jpg' },
      { name: 'Bread', price: 4.0, img: 'bread.jpg' }
    ];
    localStorage.setItem('seniorCart', JSON.stringify(mockCart));

    // Create a mock event
    const mockEvent = { preventDefault: jest.fn() };

    // Call the function
    placeOrder(mockEvent);

    // Assertions
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(global.alert).not.toHaveBeenCalled();

    // Check if history was saved
    const history = JSON.parse(localStorage.getItem('seniorOrderHistory'));
    expect(history).toBeDefined();
    expect(history.length).toBe(1);
    expect(history[0].items).toEqual(mockCart);
    expect(history[0].total).toBe('$45.00');
    expect(history[0].status).toBe('Shipped');

    // Check if last order was saved
    const lastOrder = JSON.parse(localStorage.getItem('seniorLastOrder'));
    expect(lastOrder).toEqual(history[0]);

    // Check if cart was cleared
    expect(localStorage.getItem('seniorCart')).toBeNull();

    // Check if redirected
    expect(window._mockLocationHref).toBe('success.html');
  });

  it('should handle missing total-price element gracefully', () => {
    // Setup the cart with some items
    const mockCart = [
      { name: 'Milk', price: 5.0, img: 'milk.jpg' }
    ];
    localStorage.setItem('seniorCart', JSON.stringify(mockCart));

    // Create a mock event
    const mockEvent = { preventDefault: jest.fn() };

    // Call the function
    placeOrder(mockEvent);

    // Assertions
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(global.alert).not.toHaveBeenCalled();

    // Check if history was saved with fallback total
    const history = JSON.parse(localStorage.getItem('seniorOrderHistory'));
    expect(history[0].total).toBe('$99.99');

    // Check if redirected
    expect(window._mockLocationHref).toBe('success.html');
  });

  it('should generate a 6-digit order ID', () => {
    // Setup the cart with some items
    const mockCart = [
      { name: 'Milk', price: 5.0, img: 'milk.jpg' }
    ];
    localStorage.setItem('seniorCart', JSON.stringify(mockCart));

    // Create a mock event
    const mockEvent = { preventDefault: jest.fn() };

    // Call the function
    placeOrder(mockEvent);

    // Check if order ID is 6 digits
    const history = JSON.parse(localStorage.getItem('seniorOrderHistory'));
    expect(history[0].id).toBeGreaterThanOrEqual(100000);
    expect(history[0].id).toBeLessThanOrEqual(999999);
  });
});

describe('cart functions', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="toast"></div>
      <div class="cart-count-display"></div>
      <div class="cart-count-display"></div>
    `;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('addToCart should add an item and update count', () => {
    // Start with empty cart
    expect(localStorage.getItem('seniorCart')).toBeNull();

    // Add first item
    addToCart('Milk', 5.0, 'milk.jpg');

    let cart = JSON.parse(localStorage.getItem('seniorCart'));
    expect(cart.length).toBe(1);
    expect(cart[0].name).toBe('Milk');

    // Check if cart counts updated
    const counts = document.querySelectorAll('.cart-count-display');
    expect(counts[0].innerText).toBe('Cart (1)');
    expect(counts[1].innerText).toBe('Cart (1)');

    // Add second item
    addToCart('Bread', 4.0, 'bread.jpg');

    cart = JSON.parse(localStorage.getItem('seniorCart'));
    expect(cart.length).toBe(2);
    expect(counts[0].innerText).toBe('Cart (2)');
  });

  it('showToast should display message and hide after 3 seconds', () => {
    showToast('Test Message');

    const toast = document.getElementById('toast');
    expect(toast.innerText).toBe('✅ Test Message');
    expect(toast.className).toBe('show');

    // Fast-forward 3 seconds
    jest.advanceTimersByTime(3000);

    expect(toast.className).toBe('');
  });
});

describe('renderCartPage', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="cart-items-container"></div>
      <div id="empty-cart-msg"></div>
      <div id="cart-summary"></div>
      <span id="total-price"></span>
    `;
  });

  it('should render empty cart correctly', () => {
    localStorage.setItem('seniorCart', JSON.stringify([]));
    renderCartPage();

    expect(document.getElementById('empty-cart-msg').style.display).toBe('block');
    expect(document.getElementById('cart-items-container').style.display).toBe('none');
    expect(document.getElementById('cart-summary').style.display).toBe('none');
  });

  it('should render items correctly', () => {
    const mockCart = [
      { name: 'Milk', price: 5.50, img: 'milk.jpg' },
      { name: 'Bread', price: 4.00, img: 'bread.jpg' }
    ];
    localStorage.setItem('seniorCart', JSON.stringify(mockCart));

    renderCartPage();

    expect(document.getElementById('empty-cart-msg').style.display).toBe('none');
    expect(document.getElementById('cart-items-container').style.display).toBe('block');
    expect(document.getElementById('cart-summary').style.display).toBe('block');

    const containerHTML = document.getElementById('cart-items-container').innerHTML;
    expect(containerHTML).toContain('Milk');
    expect(containerHTML).toContain('Bread');
    expect(containerHTML).toContain('$5.5');

    expect(document.getElementById('total-price').innerText).toBe('$9.50');
  });
});

describe('removeItem', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="cart-items-container"></div>
      <div id="empty-cart-msg"></div>
      <div id="cart-summary"></div>
      <span id="total-price"></span>
      <div class="cart-count-display"></div>
    `;
  });

  it('should remove item and re-render', () => {
    const mockCart = [
      { name: 'Milk', price: 5.50, img: 'milk.jpg' },
      { name: 'Bread', price: 4.00, img: 'bread.jpg' },
      { name: 'Eggs', price: 3.00, img: 'eggs.jpg' }
    ];
    localStorage.setItem('seniorCart', JSON.stringify(mockCart));

    removeItem(1); // Remove Bread

    const updatedCart = JSON.parse(localStorage.getItem('seniorCart'));
    expect(updatedCart.length).toBe(2);
    expect(updatedCart[0].name).toBe('Milk');
    expect(updatedCart[1].name).toBe('Eggs');

    const containerHTML = document.getElementById('cart-items-container').innerHTML;
    expect(containerHTML).toContain('Milk');
    expect(containerHTML).not.toContain('Bread');
    expect(containerHTML).toContain('Eggs');

    expect(document.getElementById('total-price').innerText).toBe('$8.50');
    expect(document.querySelector('.cart-count-display').innerText).toBe('Cart (2)');
  });
});

describe('loadOrderHistory', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="orders-container"></div>
      <div id="no-orders-msg"></div>
    `;
  });

  it('should render empty history correctly', () => {
    localStorage.setItem('seniorOrderHistory', JSON.stringify([]));
    loadOrderHistory();

    expect(document.getElementById('no-orders-msg').style.display).toBe('block');
    expect(document.getElementById('orders-container').style.display).toBe('none');
  });

  it('should render orders correctly', () => {
    const mockHistory = [
      {
        id: '123456',
        date: '10/26/2023',
        status: 'Shipped',
        items: [{ name: 'Milk' }, { name: 'Bread' }]
      }
    ];
    localStorage.setItem('seniorOrderHistory', JSON.stringify(mockHistory));

    loadOrderHistory();

    expect(document.getElementById('no-orders-msg').style.display).toBe('none');
    expect(document.getElementById('orders-container').style.display).toBe('block');

    const containerHTML = document.getElementById('orders-container').innerHTML;
    expect(containerHTML).toContain('123456');
    expect(containerHTML).toContain('10/26/2023');
    expect(containerHTML).toContain('Shipped');
    expect(containerHTML).toContain('Milk, Bread');
  });
});
