const { removeItem } = require('./script.js');

describe('removeItem', () => {
    let container;
    let emptyMsg;
    let cartSummary;
    let totalPrice;

    beforeEach(() => {
        // Clear localStorage
        localStorage.clear();

        // Setup DOM
        document.body.innerHTML = `
            <div id="cart-items-container"></div>
            <div id="empty-cart-msg" style="display: none;"></div>
            <div id="cart-summary" style="display: none;">
                <span id="total-price">$0.00</span>
            </div>
            <div class="cart-count-display"></div>
            <div class="cart-count-display"></div>
        `;

        container = document.getElementById('cart-items-container');
        emptyMsg = document.getElementById('empty-cart-msg');
        cartSummary = document.getElementById('cart-summary');
        totalPrice = document.getElementById('total-price');
    });

    test('removes item from multi-item cart', () => {
        const initialCart = [
            { name: 'Milk', price: '2.50', img: 'milk.jpg' },
            { name: 'Bread', price: '1.50', img: 'bread.jpg' },
            { name: 'Eggs', price: '3.00', img: 'eggs.jpg' }
        ];
        localStorage.setItem('seniorCart', JSON.stringify(initialCart));

        removeItem(1); // Remove Bread

        const updatedCart = JSON.parse(localStorage.getItem('seniorCart'));
        expect(updatedCart).toHaveLength(2);
        expect(updatedCart[0].name).toBe('Milk');
        expect(updatedCart[1].name).toBe('Eggs');
    });

    test('removes only item from cart', () => {
        const initialCart = [
            { name: 'Milk', price: '2.50', img: 'milk.jpg' }
        ];
        localStorage.setItem('seniorCart', JSON.stringify(initialCart));

        removeItem(0);

        const updatedCart = JSON.parse(localStorage.getItem('seniorCart'));
        expect(updatedCart).toHaveLength(0);
    });

    test('updates DOM correctly after removing last item', () => {
        const initialCart = [
            { name: 'Milk', price: '2.50', img: 'milk.jpg' }
        ];
        localStorage.setItem('seniorCart', JSON.stringify(initialCart));

        removeItem(0);

        expect(container.style.display).toBe('none');
        expect(emptyMsg.style.display).toBe('block');
        expect(cartSummary.style.display).toBe('none');

        const countDisplays = document.querySelectorAll('.cart-count-display');
        countDisplays.forEach(el => {
            expect(el.innerText).toBe('Cart (0)');
        });
    });

    test('updates total price after removing one of multiple items', () => {
        const initialCart = [
             { name: 'Milk', price: '2.50', img: 'milk.jpg' },
             { name: 'Cheese', price: '5.00', img: 'cheese.jpg' }
        ];
        localStorage.setItem('seniorCart', JSON.stringify(initialCart));

        removeItem(0); // Remove Milk, remaining Cheese 5.00

        // removeItem calls renderCartPage which updates innerText
        expect(totalPrice.innerText).toBe('$5.00');
        expect(container.style.display).toBe('block');
    });
});
