const express = require('express');
const Budget = require('../models/Budget');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

// GET /api/budget -> this user's monthly budget (0 if not set)
router.get('/', async (req, res) => {
  try {
    const budget = await Budget.findOne({ user: req.userId });
    res.json({ amount: budget ? budget.amount : 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/budget -> set or update the budget
router.put('/', async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: 'Budget must be 0 or more' });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.userId },
      { amount },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ amount: budget.amount });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;