/**
 * @jest-environment jsdom
 */

const { updateCartCount } = require('./script.js');

describe('updateCartCount', () => {
  beforeEach(() => {
    // Clear localStorage and DOM before each test
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('should update innerText to "Cart (0)" when cart is empty or null', () => {
    // Setup DOM
    document.body.innerHTML = `
      <div class="cart-count-display"></div>
      <div class="cart-count-display"></div>
    `;

    // Ensure localStorage is empty
    expect(localStorage.getItem('seniorCart')).toBeNull();

    // Call function
    updateCartCount();

    // Assert
    const elements = document.querySelectorAll('.cart-count-display');
    expect(elements.length).toBe(2);
    elements.forEach(el => {
      expect(el.innerText).toBe('Cart (0)');
    });
  });

  it('should update innerText to reflect the number of items in the cart', () => {
    // Setup DOM
    document.body.innerHTML = `
      <div class="cart-count-display">Cart (0)</div>
      <span class="cart-count-display"></span>
    `;

    // Setup localStorage
    const mockCart = [
      { name: 'Product 1', price: 10, img: 'img1.png' },
      { name: 'Product 2', price: 20, img: 'img2.png' },
      { name: 'Product 3', price: 30, img: 'img3.png' }
    ];
    localStorage.setItem('seniorCart', JSON.stringify(mockCart));

    // Call function
    updateCartCount();

    // Assert
    const elements = document.querySelectorAll('.cart-count-display');
    expect(elements.length).toBe(2);
    elements.forEach(el => {
      expect(el.innerText).toBe('Cart (3)');
    });
  });

  it('should not throw an error if no .cart-count-display elements exist in the DOM', () => {
    // Setup DOM (empty body)
    document.body.innerHTML = `<div>Some other content</div>`;

    // Setup localStorage
    localStorage.setItem('seniorCart', JSON.stringify([{ name: 'Product 1' }]));

    // Call function and expect it not to throw
    expect(() => {
      updateCartCount();
    }).not.toThrow();
  });

  it('should handle malformed JSON in localStorage gracefully, defaulting to array length 0', () => {
      localStorage.setItem('seniorCart', 'malformed { json');

      // Setup DOM
      document.body.innerHTML = `
        <div class="cart-count-display">Cart (5)</div>
      `;

      // Call function and expect it not to throw, and the element should reset to 0
      expect(() => {
          updateCartCount();
      }).not.toThrow();

      const elements = document.querySelectorAll('.cart-count-display');
      expect(elements[0].innerText).toBe('Cart (0)');
  });
});
