const router = require('express').Router();
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

// Get all children with progress
router.get('/children', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single child details
router.get('/children/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Child not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get summary stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false });
    const totalChildren = users.length;
    const totalSessions = users.reduce((sum, u) => sum + u.sessions.length, 0);
    const totalStars = users.reduce((sum, u) => sum + u.totalStars, 0);
    const avgScore = users.length > 0
      ? users.reduce((sum, u) => {
          const scores = u.sessions.map(s => s.score);
          return sum + (scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
        }, 0) / users.length
      : 0;
    res.json({ totalChildren, totalSessions, totalStars, avgScore: Math.round(avgScore) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
