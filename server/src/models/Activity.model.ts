import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // refers to clerkId
  title: { type: String, required: true },
  pattern: { type: String, required: true },
  difficulty: { type: String, required: true },
  hintUsed: { type: Boolean, default: false },
  solved: { type: Boolean, default: false },
  timeSpent: { type: String, required: true },
  date: { type: String, required: true },
  mistake: { type: String, default: null }
});

export const Activity = mongoose.model('Activity', activitySchema);
