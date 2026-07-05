import express from 'express';
import { getAnalytics, getDashboardHome, getHistory, getRoadmap, getTargetedProblems } from '../controllers/dashboard.controller.js';
import { seedDatabase } from '../controllers/seed.controller.js';

const router = express.Router();

router.get('/home', getDashboardHome);
router.get('/analytics', getAnalytics);
router.get('/roadmap', getRoadmap);
router.get('/history', getHistory);
router.get('/targeted-problems', getTargetedProblems);
router.post('/seed', seedDatabase);

export default router;
