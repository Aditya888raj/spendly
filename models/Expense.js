const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: {
      type: String,
      required: true,
      enum: ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Other'],
    },
    date: { type: String, required: true }, // "2026-11-22", same format as your frontend
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ← add this line
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);