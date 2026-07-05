import { Router } from 'express';
import { getAuth } from '@clerk/express';
import { ReviewQueue, SRS_INTERVALS } from '../models/ReviewQueue.model.js';

const router = Router();

// Helper: compute next review date based on SRS stage and result
function computeNextReview(stage: number, result: 'easy' | 'hard' | 'failed'): { nextStage: number; nextDate: Date } {
  let nextStage = stage;

  if (result === 'easy') {
    // Advance to the next interval
    nextStage = Math.min(stage + 1, SRS_INTERVALS.length - 1);
  } else if (result === 'hard') {
    // Stay at the same stage (repeat same interval)
    nextStage = stage;
  } else {
    // Failed → reset to stage 0 (review again tomorrow)
    nextStage = 0;
  }

  const daysUntilNext = SRS_INTERVALS[nextStage];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysUntilNext);
  nextDate.setHours(0, 0, 0, 0); // Start of that day

  return { nextStage, nextDate };
}

// ─── GET /review-queue ────────────────────────────────────────────────────────
// Returns today's due problems + upcoming count
router.get('/', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const now = new Date();
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Due today (nextReviewAt <= end of today)
    const dueToday = await ReviewQueue.find({
      userId,
      nextReviewAt: { $lte: todayEnd },
    }).sort({ nextReviewAt: 1 });

    // Upcoming (due in next 7 days, not today)
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);

    const upcoming = await ReviewQueue.find({
      userId,
      nextReviewAt: { $gt: todayEnd, $lte: weekFromNow },
    }).sort({ nextReviewAt: 1 }).limit(5);

    // Total queue size
    const totalInQueue = await ReviewQueue.countDocuments({ userId });

    return res.json({
      dueToday,
      upcoming,
      totalInQueue,
      todayCount: dueToday.length,
    });
  } catch (error) {
    console.error('GET /review-queue error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /review-queue ───────────────────────────────────────────────────────
// Add a problem to the review queue (called from extension or dashboard)
router.post('/', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { title, pattern, difficulty, leetcodeUrl } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Problem title is required.' });
    }
    if (!pattern || typeof pattern !== 'string') {
      return res.status(400).json({ error: 'Pattern is required.' });
    }
    if (!difficulty || typeof difficulty !== 'string') {
      return res.status(400).json({ error: 'Difficulty is required.' });
    }

    // First review is tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Upsert — if already in queue, just update nextReviewAt to tomorrow (re-flag)
    const item = await ReviewQueue.findOneAndUpdate(
      { userId, title: title.trim() },
      {
        $set: {
          pattern: pattern.trim(),
          difficulty: difficulty.trim(),
          leetcodeUrl: leetcodeUrl?.trim() ?? '',
          nextReviewAt: tomorrow,
          stage: 0,
          lastResult: null,
        },
        $setOnInsert: { addedAt: new Date(), reviewCount: 0 },
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({ message: 'Added to review queue.', item });
  } catch (error: any) {
    console.error('POST /review-queue error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Problem already in review queue.' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

// ─── PATCH /review-queue/:id ──────────────────────────────────────────────────
// Mark a review as done → compute next date based on result
router.patch('/:id', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { result } = req.body; // 'easy' | 'hard' | 'failed'

    if (!['easy', 'hard', 'failed'].includes(result)) {
      return res.status(400).json({ error: "result must be 'easy', 'hard', or 'failed'." });
    }

    const item = await ReviewQueue.findOne({ _id: id, userId });
    if (!item) return res.status(404).json({ error: 'Item not found in your queue.' });

    const { nextStage, nextDate } = computeNextReview(item.stage, result);
    const isGraduated = result === 'easy' && item.stage === SRS_INTERVALS.length - 1;

    if (isGraduated) {
      // Remove from queue — they've mastered it!
      await ReviewQueue.deleteOne({ _id: id });
      return res.json({ message: 'Graduated! Problem removed from review queue.', graduated: true });
    }

    item.stage = nextStage;
    item.nextReviewAt = nextDate;
    item.reviewCount += 1;
    item.lastResult = result;
    await item.save();

    return res.json({
      message: 'Review recorded.',
      graduated: false,
      nextReviewAt: nextDate,
      nextStage,
      daysUntilNext: SRS_INTERVALS[nextStage],
    });
  } catch (error) {
    console.error('PATCH /review-queue error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /review-queue/:id ─────────────────────────────────────────────────
// Manually remove a problem from queue
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const deleted = await ReviewQueue.findOneAndDelete({ _id: id, userId });

    if (!deleted) return res.status(404).json({ error: 'Item not found in your queue.' });

    return res.json({ message: 'Removed from review queue.' });
  } catch (error) {
    console.error('DELETE /review-queue error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
