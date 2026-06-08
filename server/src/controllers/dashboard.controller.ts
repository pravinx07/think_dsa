import type { Request, Response } from 'express';

// Mock data (This would typically come from a database)
const mockUser = {
  name: 'Ajay',
  level: 'Intermediate',
  streak: 12,
  problemsSolved: 47,
  hintsUsed: 23,
  joinedAt: '2024-01-15',
  hasActivity: true,
};

const mockPatterns = [
  { name: 'Sliding Window', mastery: 80, solved: 12, color: 'from-indigo-500 to-violet-500' },
  { name: 'Arrays', mastery: 75, solved: 18, color: 'from-blue-500 to-indigo-500' },
  { name: 'HashMap', mastery: 70, solved: 10, color: 'from-cyan-500 to-blue-500' },
  { name: 'Intervals', mastery: 45, solved: 5, color: 'from-amber-500 to-orange-500' },
  { name: 'Trees', mastery: 40, solved: 7, color: 'from-orange-500 to-red-500' },
  { name: 'Dynamic Programming', mastery: 20, solved: 4, color: 'from-red-500 to-pink-500' },
  { name: 'Graphs', mastery: 15, solved: 2, color: 'from-rose-500 to-red-600' },
];

const mockStrongAreas = [
  { name: 'Arrays', emoji: '📦', mastery: 75 },
  { name: 'HashMap', emoji: '🗺️', mastery: 70 },
  { name: 'Sliding Window', emoji: '🪟', mastery: 80 },
];

const mockWeakAreas = [
  { name: 'Dynamic Programming', emoji: '🧠', mastery: 20 },
  { name: 'Graphs', emoji: '🌐', mastery: 15 },
  { name: 'Intervals', emoji: '📏', mastery: 45 },
];

const mockRecommendedProblems = [
  { id: 1, title: 'Merge Intervals', difficulty: 'Medium', pattern: 'Intervals', estimatedTime: '25 min', reason: 'Target your weak area', emoji: '📏' },
  { id: 2, title: 'Rotate Image', difficulty: 'Medium', pattern: 'Matrix', estimatedTime: '20 min', reason: 'Build new pattern skills', emoji: '🔄' },
  { id: 3, title: 'Longest Substring Without Repeating', difficulty: 'Easy', pattern: 'Sliding Window', estimatedTime: '15 min', reason: 'Reinforce your strength', emoji: '🪟' },
];

const mockRecentActivity = [
  { id: 1, title: 'Two Sum', pattern: 'HashMap', difficulty: 'Easy', hintUsed: false, solved: true, timeSpent: '12 min', date: '2h ago', mistake: null },
  { id: 2, title: 'Maximum Subarray', pattern: 'Sliding Window', difficulty: 'Medium', hintUsed: true, solved: true, timeSpent: '28 min', date: 'Yesterday', mistake: 'Off-by-one in window boundary' },
  { id: 3, title: 'Clone Graph', pattern: 'Graphs', difficulty: 'Medium', hintUsed: true, solved: false, timeSpent: '45 min', date: '2 days ago', mistake: 'Forgot visited set for cycle detection' },
  { id: 4, title: 'Best Time to Buy Stock', pattern: 'Arrays', difficulty: 'Easy', hintUsed: false, solved: true, timeSpent: '10 min', date: '3 days ago', mistake: null },
  { id: 5, title: 'Coin Change', pattern: 'Dynamic Programming', difficulty: 'Medium', hintUsed: true, solved: true, timeSpent: '40 min', date: '4 days ago', mistake: 'Subproblem definition unclear' },
];

const mockWeaknessInsights = [
  { issue: 'Boundary conditions', description: 'You frequently make off-by-one errors in loops and window boundaries.', frequency: 'High' },
  { issue: 'Graph traversal setup', description: 'Setting up BFS/DFS visited tracking is inconsistent.', frequency: 'Medium' },
  { issue: 'Jumping to brute force', description: 'You often code brute force before identifying the optimal pattern.', frequency: 'High' },
];

const mockHintStats = {
  dependencyPercent: 35,
  solvedWithoutHint: 30,
  totalSolved: 47,
  avgHintsPerProblem: 1.2,
  thisWeek: { withHint: 3, withoutHint: 5 },
};

const mockRoadmap = [
  { week: 1, topic: 'Arrays & Two Pointers', status: 'completed', problems: 12 },
  { week: 2, topic: 'HashMap & Sets', status: 'completed', problems: 8 },
  { week: 3, topic: 'Sliding Window', status: 'in-progress', problems: 6 },
  { week: 4, topic: 'Binary Search', status: 'upcoming', problems: 7 },
  { week: 5, topic: 'Intervals & Merge', status: 'upcoming', problems: 5 },
  { week: 6, topic: 'Trees & Recursion', status: 'upcoming', problems: 10 },
  { week: 7, topic: 'Graphs & BFS/DFS', status: 'upcoming', problems: 9 },
  { week: 8, topic: 'Dynamic Programming', status: 'upcoming', problems: 12 },
];

export const getDashboardHome = (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.auth?.userId;
  // In a real app, fetch data specific to the userId
  
  res.json({
    user: mockUser,
    strongAreas: mockStrongAreas,
    weakAreas: mockWeakAreas,
    recommendedProblems: mockRecommendedProblems,
    recentActivity: mockRecentActivity.slice(0, 3) // Return only a few for the home dashboard
  });
};

export const getAnalytics = (req: Request, res: Response) => {
  res.json({
    patterns: mockPatterns,
    weaknessInsights: mockWeaknessInsights,
    hintStats: mockHintStats
  });
};

export const getRoadmap = (req: Request, res: Response) => {
  res.json({
    roadmap: mockRoadmap
  });
};

export const getHistory = (req: Request, res: Response) => {
  res.json({
    history: mockRecentActivity
  });
};
