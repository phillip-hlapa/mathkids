const router = require('express').Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Save session result
router.post('/session', auth, async (req, res) => {
  try {
    const { stage, operation, totalQuestions, correctAnswers, score, timeSpent } = req.body;
    const user = await User.findById(req.user.id);

    // Add session
    user.sessions.push({ stage, operation, totalQuestions, correctAnswers, score, timeSpent });

    // Update progress
    const prog = user.progress.find(p => p.operation === operation && p.stage === stage);
    if (prog) {
      prog.completions += 1;
      if (score > prog.highScore) prog.highScore = score;
    }

    // Unlock next stage if score >= 70%
    if (score >= 70) {
      const nextStage = user.progress.find(p => p.operation === operation && p.stage === stage + 1);
      if (nextStage) nextStage.unlocked = true;
    }

    // Award stars (1 star per 10 points)
    const stars = Math.floor(score / 10);
    user.totalStars += stars;

    await user.save();
    res.json({ success: true, stars, totalStars: user.totalStars, progress: user.progress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user progress
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('progress totalStars sessions');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
