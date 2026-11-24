const express = require('express');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Every route below requires login
router.use(authMiddleware);

// Only these fields can be set from the request
function pickFields(body) {
  const { title, amount, category, date } = body;
  return { title, amount, category, date };
}

// GET /api/expenses -> this user's expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/expenses -> add one for this user
router.post('/', async (req, res) => {
  try {
    const expense = await Expense.create({ ...pickFields(req.body), user: req.userId });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/expenses/:id -> edit one (only if it belongs to this user)
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      pickFields(req.body),
      { returnDocument: 'after', runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/expenses/:id -> delete one (only if it belongs to this user)
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;