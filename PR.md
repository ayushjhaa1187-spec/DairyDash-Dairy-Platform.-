🧪 Testing improvement for placeOrder in script.js

🎯 **What:** The testing gap addressed
The `placeOrder` function in `script.js` was previously untested. It handles critical functionality: verifying cart contents, creating a new order object with a generated ID, interacting with the DOM to get total price, updating multiple `localStorage` keys (`seniorCart`, `seniorOrderHistory`, `seniorLastOrder`), and redirecting the user to a success page. It lacked test coverage to ensure it correctly handled these tasks and edge cases like missing DOM elements or empty carts.

📊 **Coverage:** What scenarios are now tested
- `shows alert when cart is empty`: Verifies `window.alert` is shown and no orders are processed or storage updated when `seniorCart` is empty.
- `successfully places an order when cart has items`: Mocks `localStorage`, DOM, `Date`, and `Math.random` to ensure the correct order object is generated, appended to the history list, set as the last order, the cart is cleared, and redirect code executed.
- `uses fallback total if total-price element is missing`: Ensures the function gracefully falls back to a default value (`$99.99`) if the `#total-price` DOM element is not found on the page.
- `prepends new order to existing order history`: Ensures that when `seniorOrderHistory` already has existing orders, the new order correctly prepends (unshifts) to the top of the list rather than overwriting it or appending to the bottom.

✨ **Result:** The improvement in test coverage
The `placeOrder` logic is now fully unit tested in JSDOM environment, ensuring robust cart-to-order transition logic and regression safety for `localStorage` interactions on the frontend.
