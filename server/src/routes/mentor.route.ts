import express from 'express';
import { chatWithMentor } from '../controllers/mentor.controller.js';

const router = express.Router();

router.post('/chat', chatWithMentor);

export default router;
