/**
 * @jest-environment jsdom
 */

const { placeOrder } = require('./script.js');

describe('placeOrder', () => {
    let mockEvent;

    beforeEach(() => {
        // Clear DOM and LocalStorage before each test
        document.body.innerHTML = '';
        localStorage.clear();

        // Mock window.alert
        window.alert = jest.fn();

        // Mock window.location
        delete window.location;
        window.location = { href: '' };

        // Mock event object
        mockEvent = {
            preventDefault: jest.fn()
        };
    });

    test('should show alert and return if cart is empty', () => {
        localStorage.setItem('seniorCart', JSON.stringify([]));

        placeOrder(mockEvent);

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith("Your cart is empty!");
        expect(localStorage.getItem('seniorOrderHistory')).toBeNull();
    });

    test('should place order when cart has items', () => {
        const mockCart = [
            { name: "Product 1", price: "10.00", img: "img1.jpg" },
            { name: "Product 2", price: "20.00", img: "img2.jpg" }
        ];

        localStorage.setItem('seniorCart', JSON.stringify(mockCart));

        // Add total price element and mock innerText (jsdom doesn't support innerText natively)
        document.body.innerHTML = '<div id="total-price">$30.00</div>';
        const totalPriceEl = document.getElementById('total-price');
        Object.defineProperty(totalPriceEl, 'innerText', {
            get() { return this.textContent; }
        });

        placeOrder(mockEvent);

        // Assert event was prevented
        expect(mockEvent.preventDefault).toHaveBeenCalled();

        // Assert cart is cleared
        expect(localStorage.getItem('seniorCart')).toBeNull();

        // Assert order history is updated
        const history = JSON.parse(localStorage.getItem('seniorOrderHistory'));
        expect(history).toHaveLength(1);
        expect(history[0].items).toEqual(mockCart);
        expect(history[0].total).toBe('$30.00');
        expect(history[0].status).toBe('Shipped');
        expect(history[0].id).toBeDefined();
        expect(history[0].date).toBeDefined();

        // Assert last order is saved
        const lastOrder = JSON.parse(localStorage.getItem('seniorLastOrder'));
        expect(lastOrder).toEqual(history[0]);

        // Assert redirect
        expect(window.location.href).toBe('success.html');
    });

    test('should handle missing total-price element gracefully', () => {
        const mockCart = [
            { name: "Product 1", price: "10.00", img: "img1.jpg" }
        ];

        localStorage.setItem('seniorCart', JSON.stringify(mockCart));

        // Deliberately not adding total-price element to DOM

        placeOrder(mockEvent);

        const history = JSON.parse(localStorage.getItem('seniorOrderHistory'));
        expect(history[0].total).toBe('$99.99'); // Fallback total
    });

    test('should append to existing order history', () => {
        const existingHistory = [
            { id: 123, total: '$10.00' }
        ];
        localStorage.setItem('seniorOrderHistory', JSON.stringify(existingHistory));

        const mockCart = [
            { name: "Product 1", price: "10.00", img: "img1.jpg" }
        ];
        localStorage.setItem('seniorCart', JSON.stringify(mockCart));

        placeOrder(mockEvent);

        const history = JSON.parse(localStorage.getItem('seniorOrderHistory'));
        expect(history).toHaveLength(2);
        // New order should be at the top (index 0)
        expect(history[0].items).toEqual(mockCart);
        expect(history[1]).toEqual(existingHistory[0]);
    });
});
