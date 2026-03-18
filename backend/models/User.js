const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sessionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  stage: { type: Number, required: true },
  operation: { type: String, enum: ['add', 'subtract', 'divide'], required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  score: { type: Number, required: true },
  timeSpent: { type: Number, default: 0 }, // seconds
});

const progressSchema = new mongoose.Schema({
  operation: { type: String, enum: ['add', 'subtract', 'divide'], required: true },
  stage: { type: Number, required: true },
  unlocked: { type: Boolean, default: false },
  highScore: { type: Number, default: 0 },
  completions: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: Number, default: () => Math.floor(Math.random() * 8) },
  isAdmin: { type: Boolean, default: false },
  totalStars: { type: Number, default: 0 },
  sessions: [sessionSchema],
  progress: [progressSchema],
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (pw) {
  return bcrypt.compare(pw, this.password);
};

// Initialize default progress stages on first save
userSchema.pre('save', function (next) {
  if (this.isNew && this.progress.length === 0) {
    const ops = ['add', 'subtract', 'divide'];
    ops.forEach(op => {
      for (let stage = 1; stage <= 5; stage++) {
        this.progress.push({ operation: op, stage, unlocked: stage === 1, highScore: 0, completions: 0 });
      }
    });
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
