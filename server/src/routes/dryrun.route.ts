import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

const systemPrompt = `
You are a code execution simulator for DSA problems.
When given a piece of code and a test input, you MUST simulate the code execution step-by-step.

You MUST respond with ONLY valid JSON. No markdown fences, no extra text, no explanation outside the JSON.

The JSON must have this structure:
{
  "steps": [
    {
      "line": "the exact line of code being executed",
      "variables": { "key": "value" },
      "note": "brief human-readable explanation of what just happened"
    }
  ],
  "result": "the final return value or output of the code",
  "testInput": "the test case you used, shown cleanly (e.g., nums = [2,0,2,1,1,0])"
}

RULES:
1. Pick a simple, interesting test case yourself if none is provided (e.g., a small array like [2,0,2,1,1,0] for sort colors).
2. Only track variables that change at each step. Skip unchanged variables if the step is clear without them.
3. Show array state as a visual string, e.g., "[2,0,_,1,1,_]" using underscores if indices haven't been set yet.
4. Keep "note" very short (max 10 words).
5. Limit to a maximum of 25 steps to keep things concise.
6. Respond with ONLY the JSON object. Absolutely nothing else.
`;

router.post("/", async (req, res) => {
  try {
    const { problemTitle, code } = req.body;

    // Edge case: missing required fields
    if (!problemTitle || !code) {
      return res.status(400).json({ error: "Both problemTitle and code are required." });
    }

    // Edge case: code too long (prevent abuse / huge prompts)
    if (code.length > 5000) {
      return res.status(400).json({ error: "Code is too long. Please limit to 5000 characters." });
    }

    const prompt = `Problem: ${problemTitle}\n\nCode to simulate:\n\`\`\`\n${code}\n\`\`\`\n\nSimulate this code step-by-step and return the JSON execution trace.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text?.trim() ?? "";

    // Attempt to parse the JSON from the response
    let parsed;
    try {
      // Strip markdown code fences if the model wraps it anyway
      const clean = rawText.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      console.error("Failed to parse AI JSON response:", rawText);
      return res.status(500).json({ error: "AI returned invalid JSON. Please try again." });
    }

    // Validate that the required fields exist
    if (!Array.isArray(parsed.steps)) {
      return res.status(500).json({ error: "AI response is missing 'steps' array. Please try again." });
    }

    return res.json(parsed);

  } catch (error: any) {
    console.error("DryRun Visual Error:", error);

    // Handle Gemini 503 (high demand) gracefully
    if (error?.status === 503) {
      return res.status(503).json({ error: "AI is currently busy. Please try again in a moment." });
    }

    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
