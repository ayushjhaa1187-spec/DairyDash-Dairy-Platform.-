/**
 * @jest-environment jsdom
 */

const { placeOrder } = require('./script.js');

describe('placeOrder', () => {
    let originalAlert;
    let mockEvent;

    beforeEach(() => {
        // Mock localStorage
        const store = {};
        const mockStorage = {
            getItem: jest.fn(key => store[key] || null),
            setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
            removeItem: jest.fn(key => { delete store[key]; }),
            clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); })
        };
        Object.defineProperty(window, 'localStorage', { value: mockStorage, writable: true });

        // Mock alert
        originalAlert = window.alert;
        window.alert = jest.fn();

        // Mock event
        mockEvent = {
            preventDefault: jest.fn()
        };

        // Clear local storage manually to ensure clean state
        localStorage.clear();
        jest.clearAllMocks();
    });

    afterEach(() => {
        window.alert = originalAlert;
    });

    test('should alert and return early when cart is empty', () => {
        // Set an empty cart
        localStorage.setItem('seniorCart', JSON.stringify([]));

        // Call the function
        placeOrder(mockEvent);

        // Verify that preventDefault was called
        expect(mockEvent.preventDefault).toHaveBeenCalled();

        // Verify that alert was called with the correct message
        expect(window.alert).toHaveBeenCalledWith("Your cart is empty!");

        // Verify that order history was not updated
        expect(localStorage.getItem('seniorOrderHistory')).toBeNull();
        expect(localStorage.getItem('seniorLastOrder')).toBeNull();
    });

    test('should alert and return early when cart is null', () => {
        // Set an empty cart (null)
        localStorage.removeItem('seniorCart');

        // Call the function
        placeOrder(mockEvent);

        // Verify that preventDefault was called
        expect(mockEvent.preventDefault).toHaveBeenCalled();

        // Verify that alert was called with the correct message
        expect(window.alert).toHaveBeenCalledWith("Your cart is empty!");

        // Verify that order history was not updated
        expect(localStorage.getItem('seniorOrderHistory')).toBeNull();
        expect(localStorage.getItem('seniorLastOrder')).toBeNull();
    });
});
