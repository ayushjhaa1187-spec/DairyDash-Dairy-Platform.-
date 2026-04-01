/**
 * @jest-environment jsdom
 */

const { placeOrder } = require('../script.js');

describe('placeOrder', () => {
    let mockEvent;

    // Save original location
    const originalLocation = window.location;

    beforeEach(() => {
        // Mock DOM elements and properties
        document.body.innerHTML = `
            <div id="total-price">$15.99</div>
        `;

        // Mock event object
        mockEvent = {
            preventDefault: jest.fn()
        };

        // Clear and mock localStorage
        localStorage.clear();

        // Mock window.alert
        window.alert = jest.fn();

        // Mock Math.random to make ID deterministic
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        // Mock new Date().toLocaleDateString()
        const mockDate = new Date('2023-10-15T12:00:00Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        // Handle innerText vs textContent in jsdom
        Object.defineProperty(HTMLElement.prototype, 'innerText', {
            get: function() {
                return this.textContent;
            },
            set: function(val) {
                this.textContent = val;
            },
            configurable: true
        });

        // Suppress console.error specifically for jsdom Not Implemented errors
        jest.spyOn(console, 'error').mockImplementation((err) => {
            if (err && err.message && err.message.includes('Not implemented: navigation')) {
                return; // ignore jsdom navigation error
            }
            console.error(err);
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should prevent default event behavior', () => {
        try { placeOrder(mockEvent); } catch(e) {}
        expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    test('should alert and return if cart is empty', () => {
        localStorage.setItem('seniorCart', JSON.stringify([]));

        try { placeOrder(mockEvent); } catch(e) {}

        expect(window.alert).toHaveBeenCalledWith("Your cart is empty!");
        expect(localStorage.getItem('seniorOrderHistory')).toBeNull();
        expect(localStorage.getItem('seniorLastOrder')).toBeNull();
    });

    test('should alert and return if cart does not exist', () => {
        try { placeOrder(mockEvent); } catch(e) {}

        expect(window.alert).toHaveBeenCalledWith("Your cart is empty!");
        expect(localStorage.getItem('seniorOrderHistory')).toBeNull();
    });

    test('should process order when cart has items', () => {
        const mockCart = [{ name: 'Milk', price: 4.99 }, { name: 'Bread', price: 2.99 }];
        localStorage.setItem('seniorCart', JSON.stringify(mockCart));

        // placeOrder tries to assign window.location.href which causes jsdom to throw
        // an uncatchable virtual console error that we suppressed above. It doesn't
        // throw a regular JS error we can catch, it just logs it and stops the execution if we don't handle it
        // actually JSDOM logs it via virtualConsole but throws synchronously? No, virtualConsole logs it.
        try {
            placeOrder(mockEvent);
        } catch(e) {}

        // Check if order was added to history
        const history = JSON.parse(localStorage.getItem('seniorOrderHistory'));
        expect(history).toBeDefined();
        expect(history.length).toBe(1);

        const order = history[0];
        // Math.floor(100000 + 0.5 * 900000) = 550000
        expect(order.id).toBe(550000);
        expect(order.date).toBeDefined();
        expect(order.status).toBe("Shipped");
        expect(order.items).toEqual(mockCart);
        expect(order.total).toBe("$15.99");

        // Check if saved as last order
        const lastOrder = JSON.parse(localStorage.getItem('seniorLastOrder'));
        expect(lastOrder).toEqual(order);

        // Check if cart was cleared
        expect(localStorage.getItem('seniorCart')).toBeNull();
    });

    test('should prepend new order to existing history', () => {
        const existingOrder = { id: 123456, items: [] };
        localStorage.setItem('seniorOrderHistory', JSON.stringify([existingOrder]));

        const mockCart = [{ name: 'Eggs', price: 3.99 }];
        localStorage.setItem('seniorCart', JSON.stringify(mockCart));

        try { placeOrder(mockEvent); } catch(e) {}

        const history = JSON.parse(localStorage.getItem('seniorOrderHistory'));
        expect(history.length).toBe(2);
        expect(history[0].id).toBe(550000); // The new order
        expect(history[1].id).toBe(123456); // The existing order
    });

    test('should use default total if total-price element is missing', () => {
        document.body.innerHTML = ''; // Remove total-price element

        const mockCart = [{ name: 'Cheese', price: 5.99 }];
        localStorage.setItem('seniorCart', JSON.stringify(mockCart));

        try { placeOrder(mockEvent); } catch(e) {}

        const lastOrder = JSON.parse(localStorage.getItem('seniorLastOrder'));
        expect(lastOrder.total).toBe("$99.99");
    });
});
