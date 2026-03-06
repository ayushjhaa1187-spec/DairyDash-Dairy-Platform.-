const { removeItem } = require('./script');

describe('removeItem', () => {
    let store = {};

    beforeAll(() => {
        // Mock document once for the whole suite
        global.document = {
            querySelectorAll: () => [],
            getElementById: () => ({ innerHTML: '', style: {}, innerText: '' }),
            createElement: () => ({ innerText: '' }),
            head: { appendChild: () => {} },
            body: { appendChild: () => {} }
        };
    });

    beforeEach(() => {
        store = {};
        // Mock localStorage
        global.localStorage = {
            getItem: (key) => store[key] || null,
            setItem: (key, value) => { store[key] = value.toString(); },
            clear: () => { store = {}; },
            removeItem: (key) => { delete store[key]; }
        };
    });

    test('should remove the correct item from the cart in localStorage', () => {
        const initialCart = [
            { name: 'Product 1', price: '10.00', img: 'img1.jpg' },
            { name: 'Product 2', price: '20.00', img: 'img2.jpg' },
            { name: 'Product 3', price: '30.00', img: 'img3.jpg' }
        ];
        localStorage.setItem('seniorCart', JSON.stringify(initialCart));

        removeItem(1);

        const updatedCart = JSON.parse(localStorage.getItem('seniorCart'));
        expect(updatedCart).toHaveLength(2);
        expect(updatedCart[0].name).toBe('Product 1');
        expect(updatedCart[1].name).toBe('Product 3');
    });

    test('should handle removing the only item in the cart', () => {
        const initialCart = [{ name: 'Only Product', price: '15.00', img: 'only.jpg' }];
        localStorage.setItem('seniorCart', JSON.stringify(initialCart));

        removeItem(0);

        const updatedCart = JSON.parse(localStorage.getItem('seniorCart'));
        expect(updatedCart).toHaveLength(0);
    });

    test('should handle empty cart gracefully', () => {
        // No items in localStorage
        removeItem(0);

        const updatedCart = JSON.parse(localStorage.getItem('seniorCart'));
        expect(updatedCart).toEqual([]);
    });
});
