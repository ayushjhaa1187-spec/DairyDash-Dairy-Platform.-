/**
 * @jest-environment jsdom
 */

const { loadOrderHistory } = require('./script.js');

describe('loadOrderHistory', () => {
    let container;
    let emptyMsg;

    beforeEach(() => {
        // Set up the DOM
        document.body.innerHTML = `
            <div id="orders-container"></div>
            <div id="no-orders-msg" style="display: none;">No orders yet</div>
        `;

        container = document.getElementById('orders-container');
        emptyMsg = document.getElementById('no-orders-msg');

        // Clear localStorage
        localStorage.clear();
    });

    it('should show empty message when history is empty', () => {
        localStorage.setItem('seniorOrderHistory', JSON.stringify([]));

        loadOrderHistory();

        expect(container.style.display).toBe('none');
        expect(emptyMsg.style.display).toBe('block');
    });

    it('should show empty message when history is null', () => {
        // Not setting anything in localStorage means it returns null
        loadOrderHistory();

        expect(container.style.display).toBe('none');
        expect(emptyMsg.style.display).toBe('block');
    });

    it('should render orders and hide empty message when history exists', () => {
        const mockHistory = [
            {
                id: '123456',
                date: '10/25/2023',
                status: 'Delivered',
                items: [{ name: 'Milk' }, { name: 'Bread' }],
                total: '$5.50'
            },
            {
                id: '789012',
                date: '10/20/2023',
                status: 'Shipped',
                items: [{ name: 'Eggs' }],
                total: '$3.00'
            }
        ];

        localStorage.setItem('seniorOrderHistory', JSON.stringify(mockHistory));

        loadOrderHistory();

        expect(emptyMsg.style.display).toBe('none');
        expect(container.style.display).toBe('block');

        // Check if orders are rendered
        expect(container.innerHTML).toContain('Order #123456');
        expect(container.innerHTML).toContain('10/25/2023');
        expect(container.innerHTML).toContain('Delivered');
        expect(container.innerHTML).toContain('Milk, Bread');

        expect(container.innerHTML).toContain('Order #789012');
        expect(container.innerHTML).toContain('10/20/2023');
        expect(container.innerHTML).toContain('Shipped');
        expect(container.innerHTML).toContain('Eggs');
    });

    it('should not throw error if DOM elements are missing', () => {
        document.body.innerHTML = '';
        localStorage.setItem('seniorOrderHistory', JSON.stringify([{ id: '1', date: 'now', status: 'shipped', items: [{ name: 'Test' }] }]));

        expect(() => loadOrderHistory()).not.toThrow();
    });

    it('should handle missing container but existing emptyMsg correctly', () => {
        document.body.innerHTML = '<div id="no-orders-msg" style="display: none;">No orders yet</div>';
        const msg = document.getElementById('no-orders-msg');

        localStorage.setItem('seniorOrderHistory', JSON.stringify([]));

        expect(() => loadOrderHistory()).not.toThrow();
        expect(msg.style.display).toBe('block');
    });

    it('should handle missing emptyMsg but existing container correctly', () => {
        document.body.innerHTML = '<div id="orders-container"></div>';
        const cont = document.getElementById('orders-container');

        localStorage.setItem('seniorOrderHistory', JSON.stringify([]));

        expect(() => loadOrderHistory()).not.toThrow();
        expect(cont.style.display).toBe('none');
    });

    it('should handle invalid items array in history safely', () => {
        const mockHistory = [
            {
                id: '123456',
                date: '10/25/2023',
                status: 'Delivered',
                items: [], // Empty items
                total: '$5.50'
            }
        ];

        localStorage.setItem('seniorOrderHistory', JSON.stringify(mockHistory));

        loadOrderHistory();

        expect(container.innerHTML).toContain('Items:</span>');
    });
});
