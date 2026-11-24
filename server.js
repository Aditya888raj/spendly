require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const expenseRoutes = require('./routes/expenses');
const authRoutes = require('./routes/auth');
const budgetRoutes = require('./routes/budget');
const userRoutes = require('./routes/user');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'publicc')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });