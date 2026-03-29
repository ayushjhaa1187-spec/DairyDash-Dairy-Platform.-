/**
 * @jest-environment jsdom
 */

const { addToCart, updateCartCount, showToast } = require('./script');

describe('Cart Logic - addToCart', () => {
    beforeEach(() => {
        // Clear DOM and localStorage before each test
        document.body.innerHTML = `
            <div class="cart-count-display">Cart (0)</div>
            <div id="toast"></div>
        `;
        localStorage.clear();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('should add a new item to an empty cart', () => {
        addToCart('Test Product', '10.00', 'test.jpg');

        const cart = JSON.parse(localStorage.getItem('seniorCart'));
        expect(cart).toBeDefined();
        expect(cart.length).toBe(1);
        expect(cart[0]).toEqual({
            name: 'Test Product',
            price: '10.00',
            img: 'test.jpg'
        });
    });

    test('should append an item to an existing cart', () => {
        // Pre-populate cart
        localStorage.setItem('seniorCart', JSON.stringify([{ name: 'Existing Item', price: '5.00', img: 'exist.jpg' }]));

        addToCart('New Product', '20.00', 'new.jpg');

        const cart = JSON.parse(localStorage.getItem('seniorCart'));
        expect(cart.length).toBe(2);
        expect(cart[1]).toEqual({
            name: 'New Product',
            price: '20.00',
            img: 'new.jpg'
        });
    });

    test('should update cart count in the DOM', () => {
        addToCart('Test Product', '10.00', 'test.jpg');

        const countElements = document.querySelectorAll('.cart-count-display');
        expect(countElements[0].innerText).toBe('Cart (1)');
    });

    test('should display toast notification', () => {
        addToCart('Test Product', '10.00', 'test.jpg');

        const toast = document.getElementById('toast');
        expect(toast.innerText).toBe('✅ Test Product added to cart!');
        expect(toast.className).toBe('show');
    });

    test('should hide toast notification after 3 seconds', () => {
        addToCart('Test Product', '10.00', 'test.jpg');

        const toast = document.getElementById('toast');
        expect(toast.className).toBe('show');

        // Fast-forward time by 3 seconds
        jest.advanceTimersByTime(3000);

        expect(toast.className).toBe('');
    });
});
