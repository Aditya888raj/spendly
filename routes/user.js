const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

// GET /api/user/me -> current user's details
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/user/profile -> change name
router.put('/profile', async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (name.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name },
      { returnDocument: 'after' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/user/password -> change password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both passwords are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;