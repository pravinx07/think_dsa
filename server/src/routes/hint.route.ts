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
    const { problemTitle, messages, action, code } = req.body;

    if (!problemTitle) {
      return res.status(400).json({
        message: "Problem title required",
      });
    }

    let contents;
    if (messages && messages.length > 0) {
      contents = [
        { role: "user", parts: [{ text: `Problem: ${problemTitle}\n\nGive first hint.` }] },
        ...messages.map((msg: any) => ({
          role: msg.role === 'ai' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        }))
      ];
    } else {
      let initialPrompt = `Problem: ${problemTitle}\n\n`;
      if (action === "pattern") {
         initialPrompt += "I want to find the pattern for this problem. Guide me with questions, do not reveal the pattern immediately.";
      } else if (action === "review") {
         initialPrompt += `Review my code:\n\n${code}\n\nPoint out boundary condition issues or bugs, but DO NOT rewrite the code.`;
      } else if (action === "complexity") {
         initialPrompt += `Analyze the time and space complexity of my code:\n\n${code}\n\nAsk me how I can optimize it if it's sub-optimal.`;
      } else {
         initialPrompt += "Give first hint.";
      }
      contents = initialPrompt;
    }

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",

        contents: contents,

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