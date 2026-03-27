const { addToCart, updateCartCount, showToast, renderCartPage, removeItem, placeOrder, loadOrderHistory } = require('./script.js');

describe('Shopping Cart & Orders Logic', () => {
    beforeEach(() => {
        // Clear local storage and mock DOM elements
        localStorage.clear();
        document.body.innerHTML = `
            <div class="cart-count-display">Cart (0)</div>
            <div id="toast"></div>
            <div id="cart-items-container"></div>
            <div id="empty-cart-msg">Your cart is empty</div>
            <div id="cart-summary"></div>
            <div id="total-price"></div>
            <div id="orders-container"></div>
            <div id="no-orders-msg">No orders yet</div>
        `;

        // Mock alert
        window.alert = jest.fn();
    });

    describe('Cart Operations', () => {
        test('addToCart adds item to localStorage and updates UI', () => {
            addToCart('Test Product', '19.99', 'test.jpg');

            // Check localStorage
            const cart = JSON.parse(localStorage.getItem('seniorCart'));
            expect(cart).toHaveLength(1);
            expect(cart[0]).toEqual({ name: 'Test Product', price: '19.99', img: 'test.jpg' });

            // Check UI update
            const countDisplay = document.querySelector('.cart-count-display');
            expect(countDisplay.innerText).toBe('Cart (1)');

            // Check toast
            const toast = document.getElementById('toast');
            expect(toast.innerText).toBe('✅ Test Product added to cart!');
            expect(toast.className).toBe('show');
        });

        test('updateCartCount reflects accurate item count', () => {
            localStorage.setItem('seniorCart', JSON.stringify([
                { name: 'Item 1', price: '10' },
                { name: 'Item 2', price: '20' }
            ]));

            updateCartCount();

            const countDisplay = document.querySelector('.cart-count-display');
            expect(countDisplay.innerText).toBe('Cart (2)');
        });

        test('renderCartPage displays empty state when cart is empty', () => {
            renderCartPage();

            expect(document.getElementById('empty-cart-msg').style.display).toBe('block');
            expect(document.getElementById('cart-items-container').style.display).toBe('none');
            expect(document.getElementById('cart-summary').style.display).toBe('none');
        });

        test('renderCartPage displays items when cart has contents', () => {
            localStorage.setItem('seniorCart', JSON.stringify([
                { name: 'Item 1', price: '10', img: '1.jpg' },
                { name: 'Item 2', price: '20.50', img: '2.jpg' }
            ]));

            renderCartPage();

            expect(document.getElementById('empty-cart-msg').style.display).toBe('none');
            expect(document.getElementById('cart-items-container').style.display).toBe('block');
            expect(document.getElementById('cart-summary').style.display).toBe('block');

            const containerHTML = document.getElementById('cart-items-container').innerHTML;
            expect(containerHTML).toContain('Item 1');
            expect(containerHTML).toContain('Item 2');
            expect(document.getElementById('total-price').innerText).toBe('$30.50');
        });

        test('removeItem removes specific item from cart', () => {
            localStorage.setItem('seniorCart', JSON.stringify([
                { name: 'Item 1', price: '10' },
                { name: 'Item 2', price: '20' }
            ]));

            removeItem(0);

            const cart = JSON.parse(localStorage.getItem('seniorCart'));
            expect(cart).toHaveLength(1);
            expect(cart[0].name).toBe('Item 2');
        });
    });

    describe('Order Operations', () => {
        test('placeOrder prevents ordering with empty cart', () => {
            const event = { preventDefault: jest.fn() };
            placeOrder(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('Your cart is empty!');
        });

        test('placeOrder creates new order and clears cart', () => {
            const event = { preventDefault: jest.fn() };
            localStorage.setItem('seniorCart', JSON.stringify([
                { name: 'Item 1', price: '10' }
            ]));
            document.getElementById('total-price').innerText = '$10.00';

            // Catch the JSDOM navigation error but allow the function to complete
            // its synchronous tasks before the error is thrown
            try {
                placeOrder(event);
            } catch (e) {
                // Ignore the navigation error expected in jsdom
                if (!e.message.includes('Not implemented: navigation')) {
                    throw e;
                }
            }

            // Cart should be empty
            expect(localStorage.getItem('seniorCart')).toBeNull();

            // Order history should have 1 item
            const history = JSON.parse(localStorage.getItem('seniorOrderHistory'));
            expect(history).toHaveLength(1);
            expect(history[0].items[0].name).toBe('Item 1');
            expect(history[0].total).toBe('$10.00');
            expect(history[0].status).toBe('Shipped');

            // Last order should be saved
            const lastOrder = JSON.parse(localStorage.getItem('seniorLastOrder'));
            expect(lastOrder.id).toBe(history[0].id);
        });

        test('loadOrderHistory displays empty state when no orders', () => {
            loadOrderHistory();

            expect(document.getElementById('orders-container').style.display).toBe('none');
            expect(document.getElementById('no-orders-msg').style.display).toBe('block');
        });

        test('loadOrderHistory displays order history cards', () => {
            localStorage.setItem('seniorOrderHistory', JSON.stringify([
                {
                    id: '123456',
                    date: '1/1/2024',
                    status: 'Shipped',
                    items: [{ name: 'Test Product 1' }, { name: 'Test Product 2' }]
                }
            ]));

            loadOrderHistory();

            expect(document.getElementById('orders-container').style.display).toBe('block');
            expect(document.getElementById('no-orders-msg').style.display).toBe('none');

            const containerHTML = document.getElementById('orders-container').innerHTML;
            expect(containerHTML).toContain('Order #123456');
            expect(containerHTML).toContain('Test Product 1, Test Product 2');
        });
    });
});
