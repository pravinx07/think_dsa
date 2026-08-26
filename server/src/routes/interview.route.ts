import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { interviewerPrompt } from "../prompts/interviewerPrompt.js";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

router.post("/", async (req, res) => {
  try {
    const { problemTitle, messages } = req.body;

    if (!problemTitle || typeof problemTitle !== "string") {
      return res.status(400).json({ error: "Problem title is required." });
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Build conversation history for Gemini multi-turn chat
    let contents: any[];

    if (messages.length === 0) {
      // Opening statement from the interviewer
      contents = [
        {
          role: "user",
          parts: [{ text: `Problem: "${problemTitle}". Start the interview. Greet me and ask me to read the problem and share my initial thoughts.` }],
        },
      ];
    } else {
      // Reconstruct full multi-turn history
      contents = [
        {
          role: "user",
          parts: [{ text: `Problem: "${problemTitle}". Start the interview.` }],
        },
        ...messages.map((msg: { role: "user" | "ai"; text: string }) => ({
          role: msg.role === "ai" ? "model" : "user",
          parts: [{ text: msg.text }],
        })),
      ];
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: interviewerPrompt,
      },
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Interview route error:", error);

    if (error?.status === 503) {
      return res.status(503).json({ error: "AI is currently busy. Please try again." });
    }
    return res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
