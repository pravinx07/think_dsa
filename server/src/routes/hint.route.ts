import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { dsaMentorPrompt } from "../prompts/dsaMentorPrompt.js"
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

router.post("/", async (req, res) => {
  try {
    const { problemTitle } = req.body;

    if (!problemTitle) {
      return res.status(400).json({
        message: "Problem title required",
      });
    }

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",

        contents: `
          Problem: ${problemTitle}

          Give first hint.
        `,

        config: {
          systemInstruction:
            dsaMentorPrompt,
        },
      });

    return res.json({
      hint: response.text,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;