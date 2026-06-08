import type { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { User } from '../models/User.model.js';
import { Activity } from '../models/Activity.model.js';

// Helper to get or create user
const getOrCreateUser = async (clerkId: string) => {
  let user = await User.findOne({ clerkId });
  if (!user) {
    user = await User.create({
      clerkId,
      name: 'Learner',
      level: 'Beginner',
      streak: 0,
      problemsSolved: 0,
      hintsUsed: 0,
      hasActivity: false
    });
  }
  return user;
};

// Colors mapping for patterns
const patternColors: Record<string, string> = {
  'HashMap': 'from-cyan-500 to-blue-500',
  'Sliding Window': 'from-indigo-500 to-violet-500',
  'Arrays': 'from-blue-500 to-indigo-500',
  'Graphs': 'from-rose-500 to-red-600',
  'Dynamic Programming': 'from-red-500 to-pink-500',
  'Intervals': 'from-amber-500 to-orange-500',
  'Trees': 'from-orange-500 to-red-500',
};

const patternEmojis: Record<string, string> = {
  'HashMap': '🗺️',
  'Sliding Window': '🪟',
  'Arrays': '📦',
  'Graphs': '🌐',
  'Dynamic Programming': '🧠',
  'Intervals': '📏',
  'Trees': '🌲',
};

export const getDashboardHome = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await getOrCreateUser(userId);
    const recentActivity = await Activity.find({ userId }).sort({ _id: -1 }).limit(3);

    // Aggregate to find strong and weak areas
    const patternStats = await Activity.aggregate([
      { $match: { userId } },
      { 
        $group: { 
          _id: "$pattern", 
          total: { $sum: 1 }, 
          solved: { $sum: { $cond: ["$solved", 1, 0] } } 
        } 
      },
      {
        $project: {
          name: "$_id",
          emoji: "🧩", // Default
          mastery: { $multiply: [{ $divide: ["$solved", "$total"] }, 100] }
        }
      },
      { $sort: { mastery: -1 } }
    ]);

    const mappedPatternStats = patternStats.map(p => ({
      ...p,
      emoji: patternEmojis[p.name] || '🧩'
    }));

    const strongAreas = mappedPatternStats.filter(p => p.mastery >= 50).slice(0, 3);
    const weakAreas = mappedPatternStats.filter(p => p.mastery < 50).slice(0, 3);

    res.json({
      user,
      strongAreas,
      weakAreas,
      recommendedProblems: [], 
      recentActivity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const patternStats = await Activity.aggregate([
      { $match: { userId } },
      { 
        $group: { 
          _id: "$pattern", 
          total: { $sum: 1 }, 
          solved: { $sum: { $cond: ["$solved", 1, 0] } } 
        } 
      },
      {
        $project: {
          name: "$_id",
          solved: "$solved",
          mastery: { $multiply: [{ $divide: ["$solved", "$total"] }, 100] }
        }
      },
      { $sort: { mastery: -1 } }
    ]);

    const patterns = patternStats.map(p => ({
      ...p,
      color: patternColors[p.name] || 'from-slate-500 to-slate-600'
    }));

    const totalActivity = await Activity.countDocuments({ userId });
    const solvedWithoutHint = await Activity.countDocuments({ userId, solved: true, hintUsed: false });
    const dependencyPercent = totalActivity > 0 ? Math.round(((totalActivity - solvedWithoutHint) / totalActivity) * 100) : 0;

    res.json({
      patterns,
      weaknessInsights: [], 
      hintStats: {
        dependencyPercent,
        solvedWithoutHint,
        totalSolved: totalActivity,
        avgHintsPerProblem: 1.2, // Mocked for now
        thisWeek: { withHint: 0, withoutHint: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getRoadmap = async (req: Request, res: Response) => {
  try {
    res.json({
      roadmap: [] 
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const history = await Activity.find({ userId }).sort({ _id: -1 });
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
