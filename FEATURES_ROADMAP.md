# 🚀 ThinkDSA - Future Features Roadmap

This document outlines the planned features and improvements for the **ThinkDSA** project. It serves as a step-by-step guide to evolve the platform from its current state into a comprehensive AI-powered learning environment for Data Structures and Algorithms.

---

## 🟢 Phase 1: Core Experience Enhancements
*Focus on making the immediate coding and review experience flawless.*

- [x] **"Spaghetti Code" Refactoring ("Make it Pro")**
  - Add a button in the extension for accepted solutions.
  - The AI refactors the user's working code to match FAANG-level engineering standards (better variable names, modularity, early returns).
  - Provide a short side-by-side explanation of why the changes improve the code.

- [x] **Automatic "Notion-style" Notes Generator**
  - Detect when the user gets an "Accepted" status on LeetCode.
  - Automatically generate a markdown summary of their solution, including:
    - Time and Space Complexity.
    - Core Pattern used.
    - Key takeaways.
  - Save to the Scratchpad or add an export button for Notion/GitHub.

---

## 🟡 Phase 2: Advanced Visual & Interactive Tools
*Move beyond text-based chat to highly interactive visual components.*

- [x] **Interactive "Step-by-Step" Dry Run Visualizer**
  - Enhance the current "Dry Run" action.
  - The AI parses the user's code and generates a structured JSON execution trace.
  - Build a sidebar UI component with a slider/buttons to step through the code line-by-line.
  - Display a dynamic table showing the state of local variables at each step.

- [x] **Pattern Radar Chart & Weakness Targeting**
  - Aggregate the user's `problemStats` and hint usage data on the backend.
  - On the web client Dashboard, display a dynamic Radar/Spider Chart showing mastery levels across different patterns (e.g., Sliding Window, DP, Graphs).
  - Use this data to power the AI Mentor so it proactively suggests highly targeted easy/medium problems for the user's weakest patterns.

---

## 🟠 Phase 3: Long-term Learning & Retention
*Features focused on building habits and long-term memory retention.*

- [x] **"Spaced Repetition" (Anki-style) Problem Scheduler**
  - Automatically flag problems where the user struggled (took >30 mins or used multiple hints).
  - Add these problems to a "Review Queue" in the database.
  - On the web client Dashboard, show a "Daily Review" section that prompts users to re-solve specific problems at optimized intervals (e.g., 3 days, 7 days, 21 days).

- [x] **"Interview Mode" (Mock Interviewer)**
  - Add an "Interview Mode" toggle in the extension.
  - When active, the sidebar hides LeetCode's constraints and hints, and starts a strict 45-minute timer.
  - The AI shifts persona to act as a strict interviewer—it refuses to write code but asks probing questions like, "What are the trade-offs of using a Hash Map here?"
  - *(Stretch Goal)*: Integrate the Web Speech API so users can talk out loud and the AI transcribes and responds to their thought process.

---

## 🔴 Phase 4: Social & Gamification
*Make practicing DSA engaging, competitive, and less lonely.*

- [ ] **Social Accountability / "Study Buddy" Matcher**
  - Add a multiplayer aspect to the platform.
  - "Challenge a friend" mode: users join a room, start the same LeetCode problem, and their progress (test cases passed) updates in real-time on a shared leaderboard.
  - Matchmaking system for users at similar skill levels.

---

## 📝 How to use this Roadmap
1. Check off tasks as you complete them by changing `[ ]` to `[x]`.
2. Break down each feature into smaller tickets or GitHub Issues before starting.
3. Prioritize based on what brings the most value to the user immediately.
