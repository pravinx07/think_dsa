import mongoose from 'mongoose';

// SRS intervals in days: 1 → 3 → 7 → 14 → 30 → done
export const SRS_INTERVALS = [1, 3, 7, 14, 30];

const reviewQueueSchema = new mongoose.Schema({
  userId:       { type: String, required: true, index: true },
  title:        { type: String, required: true },
  pattern:      { type: String, required: true },
  difficulty:   { type: String, required: true },
  leetcodeUrl:  { type: String, default: '' },
  // Which SRS stage (0-indexed into SRS_INTERVALS, -1 = fresh)
  stage:        { type: Number, default: 0 },
  // ISO date string of next scheduled review
  nextReviewAt: { type: Date, required: true },
  // Total times reviewed
  reviewCount:  { type: Number, default: 0 },
  // Did user solve it correctly on last review?
  lastResult:   { type: String, enum: ['easy', 'hard', 'failed', null], default: null },
  // When was it added to the queue
  addedAt:      { type: Date, default: Date.now },
});

// Compound index: fast per-user queue queries
reviewQueueSchema.index({ userId: 1, nextReviewAt: 1 });

// Prevent duplicate entries for same user + problem
reviewQueueSchema.index({ userId: 1, title: 1 }, { unique: true });

export const ReviewQueue = mongoose.model('ReviewQueue', reviewQueueSchema);
