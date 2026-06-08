import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  level: { type: String, default: 'Beginner' },
  streak: { type: Number, default: 0 },
  problemsSolved: { type: Number, default: 0 },
  hintsUsed: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  hasActivity: { type: Boolean, default: false }
});

export const User = mongoose.model('User', userSchema);
