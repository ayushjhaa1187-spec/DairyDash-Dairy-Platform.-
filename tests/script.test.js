/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Frontend Toast Notification', () => {
    beforeAll(() => {
        // Mocking localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(() => null),
                setItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn()
            },
            writable: true
        });

        // Mock window.location
        Object.defineProperty(window, 'location', {
            value: {
                pathname: '/'
            },
            writable: true
        });

        // Use fake timers to control setTimeout
        jest.useFakeTimers();

        // Load the script. Note: The script.js file itself creates the #toast element on load.
        const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
        const scriptEl = document.createElement('script');
        scriptEl.textContent = scriptContent;
        document.body.appendChild(scriptEl);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test('Toast element should be created in the DOM', () => {
        const toast = document.getElementById('toast');
        expect(toast).not.toBeNull();
        expect(toast.tagName).toBe('DIV');
    });

    test('showToast should display message and add "show" class', () => {
        const message = "Test Message";

        // Access global function
        // Note: Function declarations in script tags are added to window
        expect(window.showToast).toBeDefined();
        window.showToast(message);

        const toast = document.getElementById('toast');

        // Verify text content
        expect(toast.innerText).toBe("✅ " + message);

        // Verify class
        expect(toast.className).toContain('show');
    });

    test('Toast notification should disappear after 3 seconds', () => {
        const toast = document.getElementById('toast');

        // Ensure it's currently shown (from previous test)
        expect(toast.className).toContain('show');

        // Fast-forward time by 3 seconds
        jest.advanceTimersByTime(3000);

        // Verify class is removed
        expect(toast.className).not.toContain('show');
    });
});
