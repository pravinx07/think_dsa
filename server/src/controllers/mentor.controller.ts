import type { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { GoogleGenAI } from '@google/genai';

export const chatWithMentor = async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    
    // Check if the API key is set
    if (!process.env.GOOGLE_API_KEY) {
      // Mock response if no API key
      return res.json({ 
        reply: "Hey Ajay! 👋 I've analyzed your progress. You're strong at Sliding Window (80%) and Arrays. Your main growth area right now is **Dynamic Programming** — you've only solved 4 DP problems. Want to work on that?" 
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    
    const systemPrompt = `You are an AI DSA Mentor for a platform called ThinkDSA. 
You are talking to a student. Keep your answers concise, personalized, and focused on patterns and problem-solving strategies, NOT just giving code solutions.
Student Context: ${JSON.stringify(context || { level: 'Intermediate', weakAreas: 'Dynamic Programming, Graphs' })}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemPrompt}\n\nStudent asks: ${message}`,
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Mentor chat error:", error);
    res.status(500).json({ reply: "I'm having trouble thinking right now. Please try again later!" });
  }
};
