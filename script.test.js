const fs = require('fs');
const path = require('path');

const scriptCode = fs.readFileSync(path.resolve(__dirname, 'script.js'), 'utf8');

describe('addToCart', () => {
    beforeAll(() => {
        // Evaluate the script inside JSDOM environment so 'document' is available
        // Need to explicitly assign to global scope
        eval(`
            ${scriptCode};
            global.addToCart = addToCart;
            global.updateCartCount = updateCartCount;
            global.showToast = showToast;
        `);
    });

    beforeEach(() => {
        // Reset DOM for elements needed by functions
        document.body.innerHTML = `
            <div id="toast"></div>
            <div class="cart-count-display"></div>
            <div class="cart-count-display"></div>
            <div id="cart-items-container"></div>
            <div id="empty-cart-msg"></div>
            <div id="cart-summary"></div>
            <div id="total-price"></div>
        `;

        // Mock localStorage
        const localStorageMock = (() => {
            let store = {};
            return {
                getItem(key) {
                    return store[key] || null;
                },
                setItem(key, value) {
                    store[key] = value.toString();
                },
                removeItem(key) {
                    delete store[key];
                },
                clear() {
                    store = {};
                }
            };
        })();
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });
        localStorage.clear();

        // Also mock setTimeout so showToast doesn't leave hanging timers
        jest.spyOn(window, 'setTimeout').mockImplementation((cb) => cb());
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should add a new product to an empty cart in localStorage', () => {
        global.addToCart('Test Product', 10.99, 'test-image.jpg');

        const cart = JSON.parse(localStorage.getItem('seniorCart'));
        expect(cart).toBeDefined();
        expect(cart.length).toBe(1);
        expect(cart[0]).toEqual({
            name: 'Test Product',
            price: 10.99,
            img: 'test-image.jpg'
        });
    });

    it('should append a product to an existing cart in localStorage', () => {
        localStorage.setItem('seniorCart', JSON.stringify([
            { name: 'Existing Product', price: 5.99, img: 'existing.jpg' }
        ]));

        global.addToCart('New Product', 15.99, 'new.jpg');

        const cart = JSON.parse(localStorage.getItem('seniorCart'));
        expect(cart.length).toBe(2);
        expect(cart[1]).toEqual({
            name: 'New Product',
            price: 15.99,
            img: 'new.jpg'
        });
    });

    it('should update cart count display', () => {
        global.addToCart('Test Product', 10.99, 'test-image.jpg');

        const countElements = document.querySelectorAll('.cart-count-display');
        expect(countElements[0].innerText).toBe('Cart (1)');
        expect(countElements[1].innerText).toBe('Cart (1)');

        global.addToCart('Test Product 2', 20.99, 'test-image2.jpg');
        expect(countElements[0].innerText).toBe('Cart (2)');
        expect(countElements[1].innerText).toBe('Cart (2)');
    });

    it('should show success toast', () => {
        global.addToCart('Test Product', 10.99, 'test-image.jpg');

        const toast = document.getElementById('toast');
        expect(toast.innerText).toBe('✅ Test Product added to cart!');
    });
});
