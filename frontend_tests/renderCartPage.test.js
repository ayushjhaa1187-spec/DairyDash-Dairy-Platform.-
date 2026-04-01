const fs = require('fs');
const path = require('path');

// Read the script content
const scriptPath = path.resolve(__dirname, '../script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Evaluate the script in the global context
// Because jsdom is set up by jest, document and window are available
eval(scriptContent);

describe('renderCartPage', () => {
    beforeEach(() => {
        // Clear DOM
        document.body.innerHTML = `
            <div id="cart-items-container"></div>
            <div id="empty-cart-msg">Your cart is empty</div>
            <div id="cart-summary">Cart Summary</div>
            <div id="total-price"></div>
            <div class="cart-count-display"></div>
        `;

        // Mock localStorage
        let store = {};
        const localStorageMock = {
            getItem: jest.fn(key => store[key] || null),
            setItem: jest.fn((key, value) => {
                store[key] = value.toString();
            }),
            removeItem: jest.fn(key => {
                delete store[key];
            }),
            clear: jest.fn(() => {
                store = {};
            })
        };
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });
        localStorage.clear();
    });

    test('renders empty cart correctly', () => {
        // Arrange
        localStorage.setItem('seniorCart', JSON.stringify([]));

        // Act
        renderCartPage();

        // Assert
        const emptyMsg = document.getElementById('empty-cart-msg');
        const container = document.getElementById('cart-items-container');
        const summary = document.getElementById('cart-summary');

        expect(emptyMsg.style.display).toBe('block');
        expect(container.style.display).toBe('none');
        expect(summary.style.display).toBe('none');
    });

    test('handles missing localStorage (returns null)', () => {
        // Arrange
        // localStorage.getItem will return null by default in our mock if key not set

        // Act
        renderCartPage();

        // Assert
        const emptyMsg = document.getElementById('empty-cart-msg');
        const container = document.getElementById('cart-items-container');
        const summary = document.getElementById('cart-summary');

        expect(emptyMsg.style.display).toBe('block');
        expect(container.style.display).toBe('none');
        expect(summary.style.display).toBe('none');
    });

    test('renders cart items correctly with total price', () => {
        // Arrange
        const cartData = [
            { name: 'Product A', price: 10.50, img: 'img1.jpg' },
            { name: 'Product B', price: 20.00, img: 'img2.jpg' },
            { name: 'Product C', price: '5.99', img: 'img3.jpg' } // Testing string price parse
        ];
        localStorage.setItem('seniorCart', JSON.stringify(cartData));

        // Act
        renderCartPage();

        // Assert
        const emptyMsg = document.getElementById('empty-cart-msg');
        const container = document.getElementById('cart-items-container');
        const summary = document.getElementById('cart-summary');
        const totalPrice = document.getElementById('total-price');

        expect(emptyMsg.style.display).toBe('none');
        expect(container.style.display).toBe('block');
        expect(summary.style.display).toBe('block');

        // Check items are in DOM
        expect(container.innerHTML).toContain('Product A');
        expect(container.innerHTML).toContain('$10.5');
        expect(container.innerHTML).toContain('img1.jpg');

        expect(container.innerHTML).toContain('Product B');
        expect(container.innerHTML).toContain('$20');
        expect(container.innerHTML).toContain('img2.jpg');

        expect(container.innerHTML).toContain('Product C');
        expect(container.innerHTML).toContain('$5.99');
        expect(container.innerHTML).toContain('img3.jpg');

        // Check remove button calls removeItem with correct index
        expect(container.innerHTML).toContain('onclick="removeItem(0)"');
        expect(container.innerHTML).toContain('onclick="removeItem(1)"');
        expect(container.innerHTML).toContain('onclick="removeItem(2)"');

        // Check total price (10.50 + 20.00 + 5.99 = 36.49)
        expect(totalPrice.innerText).toBe('$36.49');
    });

    test('handles missing DOM elements gracefully', () => {
        // Arrange
        document.body.innerHTML = `
            <div id="cart-items-container"></div>
        `; // Missing empty-msg, cart-summary, and total-price
        const cartData = [
            { name: 'Product A', price: 10.50, img: 'img1.jpg' }
        ];
        localStorage.setItem('seniorCart', JSON.stringify(cartData));

        // Act & Assert - should not throw
        expect(() => {
            renderCartPage();
        }).not.toThrow();

        // But the item should still be rendered in the container
        const container = document.getElementById('cart-items-container');
        expect(container.innerHTML).toContain('Product A');
    });

    test('clears existing container content before rendering', () => {
        // Arrange
        const container = document.getElementById('cart-items-container');
        container.innerHTML = '<div id="old-content">Old Stuff</div>';

        const cartData = [
            { name: 'Product A', price: 10.50, img: 'img1.jpg' }
        ];
        localStorage.setItem('seniorCart', JSON.stringify(cartData));

        // Act
        renderCartPage();

        // Assert
        expect(container.innerHTML).not.toContain('Old Stuff');
        expect(container.innerHTML).toContain('Product A');
    });
});
