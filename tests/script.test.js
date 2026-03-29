const { updateCartCount } = require('../script.js');

describe('updateCartCount', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        // Clear DOM and localStorage before each test
        document.body.innerHTML = '';
        localStorage.clear();
        jest.restoreAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    test('updates cart count display correctly when cart is empty', () => {
        // Setup DOM
        document.body.innerHTML = `
            <div class="cart-count-display">Cart (10)</div>
            <div class="cart-count-display">Cart (5)</div>
        `;

        // Ensure cart is empty
        localStorage.setItem('seniorCart', JSON.stringify([]));

        // Call the function
        updateCartCount();

        // Check if all elements are updated
        const countElements = document.querySelectorAll('.cart-count-display');
        expect(countElements.length).toBe(2);
        countElements.forEach(el => {
            expect(el.innerText).toBe('Cart (0)');
        });
    });

    test('updates cart count display correctly with items in cart', () => {
        // Setup DOM
        document.body.innerHTML = `
            <span class="cart-count-display">Cart (0)</span>
            <button class="cart-count-display">Cart (0)</button>
        `;

        // Add 3 items to cart
        const mockCart = [
            { name: 'Item 1', price: 10, img: 'img1.jpg' },
            { name: 'Item 2', price: 20, img: 'img2.jpg' },
            { name: 'Item 3', price: 30, img: 'img3.jpg' }
        ];
        localStorage.setItem('seniorCart', JSON.stringify(mockCart));

        // Call the function
        updateCartCount();

        // Check if all elements are updated
        const countElements = document.querySelectorAll('.cart-count-display');
        expect(countElements.length).toBe(2);
        countElements.forEach(el => {
            expect(el.innerText).toBe('Cart (3)');
        });
    });

    test('handles missing seniorCart key in localStorage gracefully', () => {
        // Setup DOM
        document.body.innerHTML = `
            <div class="cart-count-display">Cart (99)</div>
        `;

        // Do NOT set 'seniorCart' in localStorage (it will be null)

        // Call the function
        updateCartCount();

        // Check if elements show 0
        const countElements = document.querySelectorAll('.cart-count-display');
        expect(countElements[0].innerText).toBe('Cart (0)');
    });

    test('does not throw errors if no cart-count-display elements exist', () => {
        // Setup DOM with NO cart-count-display elements
        document.body.innerHTML = `
            <div>Some other element</div>
        `;

        // Add some items to cart
        localStorage.setItem('seniorCart', JSON.stringify([{ name: 'Item 1' }]));

        // Call the function and ensure no error is thrown
        expect(() => {
            updateCartCount();
        }).not.toThrow();
    });

    test('handles invalid JSON in localStorage gracefully without crashing', () => {
        // Setup DOM
        document.body.innerHTML = `
            <div class="cart-count-display">Cart (5)</div>
        `;

        // Set invalid JSON in localStorage
        localStorage.setItem('seniorCart', '{invalid json]');

        // Now, updateCartCount should catch the error and default to empty array (0 items)
        expect(() => {
            updateCartCount();
        }).not.toThrow();

        // Check if elements show 0
        const countElements = document.querySelectorAll('.cart-count-display');
        expect(countElements[0].innerText).toBe('Cart (0)');

        // Verify that console.error was called
        expect(consoleErrorSpy).toHaveBeenCalled();
    });
});
