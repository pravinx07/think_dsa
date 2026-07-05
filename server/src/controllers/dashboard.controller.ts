import type { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { User } from '../models/User.model.js';
import { Activity } from '../models/Activity.model.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

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
  'HashMap': '',
  'Sliding Window': '',
  'Arrays': '',
  'Graphs': '',
  'Dynamic Programming': '',
  'Intervals': '',
  'Trees': '',
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
          emoji: "", // Default
          mastery: { $multiply: [{ $divide: ["$solved", "$total"] }, 100] }
        }
      },
      { $sort: { mastery: -1 } }
    ]);

    const mappedPatternStats = patternStats.map(p => ({
      ...p,
      emoji: patternEmojis[p.name] || ''
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
    }))

    // Derive weak areas (mastery < 50) for AI Mentor targeting
    const weakAreas = patterns.filter(p => p.mastery < 50).sort((a, b) => a.mastery - b.mastery).slice(0, 3)

    const totalActivity = await Activity.countDocuments({ userId })
    const solvedWithoutHint = await Activity.countDocuments({ userId, solved: true, hintUsed: false })
    const dependencyPercent = totalActivity > 0 ? Math.round(((totalActivity - solvedWithoutHint) / totalActivity) * 100) : 0

    res.json({
      patterns,
      weakAreas,
      weaknessInsights: [], 
      hintStats: {
        dependencyPercent,
        solvedWithoutHint,
        totalSolved: totalActivity,
        avgHintsPerProblem: 1.2, // Mocked for now
        thisWeek: { withHint: 0, withoutHint: 0 }
      }
    })
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
}

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

export const getTargetedProblems = async (req: Request, res: Response) => {
  try {
    const { pattern } = req.query;

    // Validate input
    if (!pattern || typeof pattern !== 'string' || pattern.trim().length === 0) {
      return res.status(400).json({ error: 'A valid pattern name is required.' });
    }

    const safePattern = pattern.trim().slice(0, 100); // Sanitize: max 100 chars

    const prompt = `You are a DSA curriculum expert. A student is weak at the "${safePattern}" pattern.

Return ONLY a valid JSON array of exactly 3 LeetCode problems to help them improve. No markdown, no explanation outside JSON.

Format:
[
  { "title": "Two Sum", "url": "https://leetcode.com/problems/two-sum/", "difficulty": "Easy", "why": "Teaches basic HashMap lookup" },
  ...
]

Rules:
- Pick real problems that actually exist on LeetCode.
- Difficulty should be Easy or Medium only (to build confidence).
- "why" should be one short sentence explaining why this problem is a good foundation for "${safePattern}".
- Do not include Hard problems.
- Return exactly 3 problems.
- Return ONLY the JSON array.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const rawText = response.text?.trim() ?? '';

    let problems;
    try {
      const clean = rawText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
      problems = JSON.parse(clean);
    } catch {
      console.error('AI JSON parse error for targeted problems:', rawText);
      return res.status(500).json({ error: 'AI returned invalid data. Please try again.' });
    }

    if (!Array.isArray(problems)) {
      return res.status(500).json({ error: 'AI returned unexpected format. Please try again.' });
    }

    // Validate each problem has required fields
    const valid = problems.filter(
      (p: any) => typeof p.title === 'string' && typeof p.url === 'string' && typeof p.difficulty === 'string'
    ).slice(0, 3); // max 3

    return res.json({ pattern: safePattern, problems: valid });
  } catch (error: any) {
    console.error('getTargetedProblems error:', error);
    if (error?.status === 503) {
      return res.status(503).json({ error: 'AI is busy. Please try again in a moment.' });
    }
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};
