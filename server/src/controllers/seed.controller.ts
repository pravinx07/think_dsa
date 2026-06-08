import type { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { User } from '../models/User.model.js';
import { Activity } from '../models/Activity.model.js';

export const seedDatabase = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Update user to have activity
    await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        hasActivity: true,
        streak: 5,
        problemsSolved: 12,
        hintsUsed: 4,
        level: 'Intermediate'
      }
    );

    // Add some activity
    await Activity.deleteMany({ userId }); // Clear old ones
    
    await Activity.insertMany([
      { userId, title: 'Two Sum', pattern: 'HashMap', difficulty: 'Easy', hintUsed: false, solved: true, timeSpent: '12 min', date: '2h ago', mistake: null },
      { userId, title: 'Maximum Subarray', pattern: 'Sliding Window', difficulty: 'Medium', hintUsed: true, solved: true, timeSpent: '28 min', date: 'Yesterday', mistake: 'Off-by-one in window boundary' },
      { userId, title: 'Clone Graph', pattern: 'Graphs', difficulty: 'Medium', hintUsed: true, solved: false, timeSpent: '45 min', date: '2 days ago', mistake: 'Forgot visited set for cycle detection' },
    ]);

    res.json({ message: "Database seeded successfully! Refresh your dashboard." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
