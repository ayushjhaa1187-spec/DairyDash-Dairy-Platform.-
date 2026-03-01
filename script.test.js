/**
 * @jest-environment jsdom
 */

const { placeOrder } = require('./script.js');

describe('placeOrder', () => {
    let mockAlert;

    beforeAll(() => {
        // Safe delete
        // Instead of triggering navigate error by setting location object,
        // We will just let JSDOM throw its error and catch it where we need to
    });

    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = (() => {
            let store = {};
            return {
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
        })();
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });
        window.localStorage.clear();

        // Setup mock for window.alert
        mockAlert = jest.fn();
        window.alert = mockAlert;

        // Setup mock for Math.random to get predictable order ids
        jest.spyOn(Math, 'random').mockReturnValue(0.12345);

        // Mock new Date().toLocaleDateString()
        jest.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('1/1/2023');

        // Clear DOM
        document.body.innerHTML = '';

        // Mock jsdom's console.error temporarily to hide the "Not implemented" error
        jest.spyOn(console, 'error').mockImplementation((err) => {
            if (err && typeof err.message === 'string' && err.message.includes('Not implemented: navigation')) {
                return;
            }
            if (err && err.type === 'not implemented') {
                return;
            }
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('shows alert when cart is empty', () => {
        const mockEvent = { preventDefault: jest.fn() };
        window.localStorage.getItem.mockReturnValueOnce(JSON.stringify([]));

        try {
            placeOrder(mockEvent);
        } catch(e) {}

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockAlert).toHaveBeenCalledWith("Your cart is empty!");
        expect(window.localStorage.setItem).not.toHaveBeenCalled();
    });

    test('successfully places an order when cart has items', () => {
        const mockEvent = { preventDefault: jest.fn() };
        const mockCart = [{ name: 'Milk', price: 2.99, img: 'milk.jpg' }];

        // Add total-price element to DOM, use correct format and node type
        const totalEl = document.createElement('div');
        totalEl.id = 'total-price';
        totalEl.innerText = '$2.99';
        document.body.appendChild(totalEl);

        // Set initial local storage states
        window.localStorage.getItem
            .mockReturnValueOnce(JSON.stringify(mockCart)) // first call for cart
            .mockReturnValueOnce(JSON.stringify([])); // second call for order history

        // Expected new order object
        const expectedOrder = {
            id: Math.floor(100000 + 0.12345 * 900000), // Should match placeOrder logic
            date: '1/1/2023',
            status: "Shipped",
            items: mockCart,
            total: '$2.99'
        };

        try {
            placeOrder(mockEvent);
        } catch (e) {
            // Ignore jsdom navigation err
        }

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockAlert).not.toHaveBeenCalled();

        // Verify local storage updates
        expect(window.localStorage.setItem).toHaveBeenCalledWith(
            'seniorOrderHistory',
            JSON.stringify([expectedOrder])
        );
        expect(window.localStorage.setItem).toHaveBeenCalledWith(
            'seniorLastOrder',
            JSON.stringify(expectedOrder)
        );
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('seniorCart');
    });

    test('uses fallback total if total-price element is missing', () => {
        const mockEvent = { preventDefault: jest.fn() };
        const mockCart = [{ name: 'Milk', price: 2.99, img: 'milk.jpg' }];

        // No total-price element added to DOM

        window.localStorage.getItem
            .mockReturnValueOnce(JSON.stringify(mockCart))
            .mockReturnValueOnce(JSON.stringify([]));

        try {
            placeOrder(mockEvent);
        } catch(e){}

        // Check the second argument of the second setItem call (seniorLastOrder)
        const lastOrderCall = window.localStorage.setItem.mock.calls.find(
            call => call[0] === 'seniorLastOrder'
        );
        const savedOrder = JSON.parse(lastOrderCall[1]);

        expect(savedOrder.total).toBe('$99.99');
    });

    test('prepends new order to existing order history', () => {
        const mockEvent = { preventDefault: jest.fn() };
        const mockCart = [{ name: 'Milk', price: 2.99, img: 'milk.jpg' }];
        const existingHistory = [
            { id: 999999, date: '1/1/2022', status: 'Delivered', items: [], total: '$10.00' }
        ];

        window.localStorage.getItem
            .mockReturnValueOnce(JSON.stringify(mockCart)) // cart
            .mockReturnValueOnce(JSON.stringify(existingHistory)); // existing history

        try{
            placeOrder(mockEvent);
        }catch(e){}

        const historyCall = window.localStorage.setItem.mock.calls.find(
            call => call[0] === 'seniorOrderHistory'
        );
        const savedHistory = JSON.parse(historyCall[1]);

        expect(savedHistory.length).toBe(2);

        const expectedNewOrderId = Math.floor(100000 + 0.12345 * 900000);
        expect(savedHistory[0].id).toBe(expectedNewOrderId); // New order should be first
        expect(savedHistory[1].id).toBe(999999); // Existing order should be second
    });
});
