const { placeOrder } = require('../script.js');

describe('placeOrder', () => {
  let mockEvent;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';

    // Clear localStorage
    localStorage.clear();

    // Mock window.alert
    window.alert = jest.fn();

    // Mock event
    mockEvent = {
      preventDefault: jest.fn()
    };

    // Mock window.location
    delete window.location;
    window.location = { href: '' };
  });

  test('should show alert and return early if cart is empty', () => {
    localStorage.setItem('seniorCart', JSON.stringify([]));

    placeOrder(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith("Your cart is empty!");
    expect(localStorage.getItem('seniorOrderHistory')).toBeNull();
    expect(localStorage.getItem('seniorLastOrder')).toBeNull();
    expect(window.location.href).toBe('');
  });

  test('should process order, save to history/lastOrder, clear cart, and redirect to success.html', () => {
    const mockCart = [
      { name: 'Test Product', price: '19.99', img: 'test.jpg' }
    ];
    localStorage.setItem('seniorCart', JSON.stringify(mockCart));

    // Set up total price element, checking innerText as the code does
    const span = document.createElement('span');
    span.id = 'total-price';
    span.innerText = '$19.99';
    document.body.appendChild(span);

    // Mock Date.toLocaleDateString for deterministic testing
    const originalDateString = Date.prototype.toLocaleDateString;
    const mockDateString = '10/26/2023';
    Date.prototype.toLocaleDateString = jest.fn(() => mockDateString);

    // Mock Math.random to always return a deterministic ID
    const originalMathRandom = Math.random;
    Math.random = jest.fn(() => 0.5); // ID should be 100000 + (0.5 * 900000) = 550000

    placeOrder(mockEvent);

    // Verify preventDefault was called
    expect(mockEvent.preventDefault).toHaveBeenCalled();

    // Check localStorage items
    const history = JSON.parse(localStorage.getItem('seniorOrderHistory'));
    const lastOrder = JSON.parse(localStorage.getItem('seniorLastOrder'));
    const remainingCart = localStorage.getItem('seniorCart');

    // Expected Order structure
    const expectedOrder = {
      id: 550000,
      date: mockDateString,
      status: "Shipped",
      items: mockCart,
      total: '$19.99'
    };

    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(expectedOrder);
    expect(lastOrder).toEqual(expectedOrder);
    expect(remainingCart).toBeNull(); // Cart should be cleared

    // Verify redirect
    expect(window.location.href).toBe('success.html');

    // Restore original functions
    Date.prototype.toLocaleDateString = originalDateString;
    Math.random = originalMathRandom;
  });

  test('should use fallback total "$99.99" if total-price element is not found', () => {
    const mockCart = [
      { name: 'Test Product', price: '19.99', img: 'test.jpg' }
    ];
    localStorage.setItem('seniorCart', JSON.stringify(mockCart));

    // No total-price element in the DOM

    placeOrder(mockEvent);

    const lastOrder = JSON.parse(localStorage.getItem('seniorLastOrder'));
    expect(lastOrder.total).toBe('$99.99');
  });

  test('should prepend new order to existing history', () => {
    const mockCart = [{ name: 'New Product', price: '20.00', img: 'new.jpg' }];
    localStorage.setItem('seniorCart', JSON.stringify(mockCart));

    const existingHistory = [
      { id: 111111, date: '10/25/2023', status: 'Shipped', items: [], total: '$10.00' }
    ];
    localStorage.setItem('seniorOrderHistory', JSON.stringify(existingHistory));

    placeOrder(mockEvent);

    const history = JSON.parse(localStorage.getItem('seniorOrderHistory'));

    expect(history).toHaveLength(2);
    expect(history[0].items[0].name).toBe('New Product'); // New order is at the top
    expect(history[1].id).toBe(111111); // Old order is second
  });
});
