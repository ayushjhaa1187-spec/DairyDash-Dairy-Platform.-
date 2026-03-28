const { removeItem, addToCart, updateCartCount, renderCartPage, placeOrder, loadOrderHistory } = require('../script.js');

describe('removeItem', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Set up document body
    document.body.innerHTML = `
      <div id="cart-items-container"></div>
      <div id="empty-cart-msg"></div>
      <div id="cart-summary"></div>
      <span class="cart-count-display"></span>
      <div id="toast"></div>
      <div id="total-price"></div>
    `;
  });

  test('should remove an item from the cart by index', () => {
    // Arrange
    const initialCart = [
      { name: 'Item 1', price: '10.00', img: 'img1.png' },
      { name: 'Item 2', price: '20.00', img: 'img2.png' },
      { name: 'Item 3', price: '30.00', img: 'img3.png' }
    ];
    localStorage.setItem('seniorCart', JSON.stringify(initialCart));

    // Act
    removeItem(1); // Remove 'Item 2'

    // Assert
    const updatedCart = JSON.parse(localStorage.getItem('seniorCart'));
    expect(updatedCart).toHaveLength(2);
    expect(updatedCart[0].name).toBe('Item 1');
    expect(updatedCart[1].name).toBe('Item 3');
  });

  test('should handle removing from an empty cart safely', () => {
    // Arrange
    localStorage.setItem('seniorCart', JSON.stringify([]));

    // Act
    removeItem(0);

    // Assert
    const updatedCart = JSON.parse(localStorage.getItem('seniorCart'));
    expect(updatedCart).toHaveLength(0);
  });

  test('should handle removing with invalid index (out of bounds)', () => {
    // Arrange
    const initialCart = [{ name: 'Item 1', price: '10.00', img: 'img1.png' }];
    localStorage.setItem('seniorCart', JSON.stringify(initialCart));

    // Act
    removeItem(5); // Index out of bounds

    // Assert
    // splice with index out of bounds might not remove anything depending on JS engine, but typically it shouldn't crash
    const updatedCart = JSON.parse(localStorage.getItem('seniorCart'));
    expect(updatedCart).toHaveLength(1);
    expect(updatedCart[0].name).toBe('Item 1');
  });

  test('should handle when localStorage is null', () => {
    // Arrange - don't set anything in localStorage

    // Act
    removeItem(0);

    // Assert
    const updatedCart = JSON.parse(localStorage.getItem('seniorCart'));
    expect(updatedCart).toEqual([]);
  });

  test('should call renderCartPage and updateCartCount after removing an item', () => {
    // This is hard to unit test directly without mocking the global functions
    // but we can verify the side effects on the DOM
    const initialCart = [
      { name: 'Item 1', price: '10.00', img: 'img1.png' }
    ];
    localStorage.setItem('seniorCart', JSON.stringify(initialCart));

    // Act
    removeItem(0);

    // Assert
    // Check side effect of updateCartCount
    expect(document.querySelector('.cart-count-display').innerText).toBe('Cart (0)');
    // Check side effect of renderCartPage
    expect(document.getElementById('empty-cart-msg').style.display).toBe('block');
  });
});
