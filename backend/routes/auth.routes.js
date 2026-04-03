const express = require('express');
const router = express.Router();

// Placeholder for auth routes
router.get('/', (req, res) => {
  res.json({ message: 'Auth route' });
});

module.exports = router;
