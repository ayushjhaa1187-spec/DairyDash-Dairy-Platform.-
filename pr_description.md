🎯 **What:** The `backend/routes/Order.routes.js` route `/create` passed the destructured body fields directly to `new Order(...)` without input validation. I implemented an `express-validator` middleware array for `items`, `totalPrice`, `deliveryAddress`, and `deliveryPhone` checking types, structure, and required fields.

⚠️ **Risk:** If left unfixed, this vulnerability could allow attackers to pass malformed data, unexpected arrays/objects causing NoSQL injection, or mass assignment vulnerabilities, resulting in potential server crashes or database corruption.

🛡️ **Solution:** The implemented fix introduces a robust validation layer using `express-validator`. It checks for expected types, valid Mongo IDs, array length, constraints (min values), and ensures all variables are valid before continuing to insert into the MongoDB database. Errors are caught and returned as `400 Bad Request`.
