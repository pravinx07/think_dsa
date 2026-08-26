# ThinkDSA

ThinkDSA is a comprehensive, AI-powered LeetCode companion platform designed to revolutionize the way you learn and practice Data Structures and Algorithms. 

Built as a modern monorepo, ThinkDSA integrates directly into your browser via a Chrome Extension, provides deep analytics through a React Web Dashboard, and is powered by a robust Node.js backend leveraging Google GenAI.

## Key Features

- **AI Code Refactoring ("Make it Pro")**: Instantly refactor your working solutions to match FAANG-level engineering standards. Get side-by-side explanations of why the changes improve your code (modularity, variable naming, early returns).
- **Automated Notion-Style Notes**: Whenever you get an "Accepted" on LeetCode, ThinkDSA automatically generates a markdown summary containing Time/Space complexity, the core pattern used, and key takeaways.
- **Interactive Dry Run Visualizer**: Step through your code line-by-line with an AI-generated execution trace and a dynamic state table of local variables.
- **Pattern Radar Chart & Analytics**: Track your mastery across different DSA patterns (e.g., DP, Sliding Window, Graphs) and let the AI Mentor proactively suggest targeted problems for your weaknesses.
- **Spaced Repetition Scheduler**: Struggle with a problem? ThinkDSA automatically adds it to an Anki-style review queue, prompting you to re-solve it at optimized intervals to build long-term retention.
- **Mock Interview Mode**: Simulate a real interview! Hides constraints and hints, starts a strict 45-minute timer, and the AI acts as a rigorous interviewer probing you on trade-offs (e.g., "Why use a Hash Map here?").

## Tech Stack

- **Client (Web Dashboard)**: React 19, TypeScript, Vite, Tailwind CSS, Recharts (for analytics), Clerk (Authentication).
- **Server (Backend)**: Node.js, Express, MongoDB (Mongoose), WebSockets, Google GenAI SDK, Clerk Auth.
- **Extension (Chrome)**: React 19, Vite + CRXjs, Tailwind CSS, injected directly into the LeetCode environment.

## Project Structure

This project is organized as a monorepo containing three main components:

- `/client` - The React-based web dashboard for tracking progress, viewing radar charts, and managing the spaced repetition queue.
- `/server` - The Node.js/Express backend that handles AI generation prompts, user data storage, WebSocket communication, and API endpoints.
- `/extension` - The Chrome extension that injects into LeetCode to provide real-time AI assistance, code refactoring, and the mock interview experience.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Instance
- Google Gemini API Key
- Clerk API Keys (for Auth)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pravinx07/think_dsa.git
   cd ThinkDSA
   ```

2. **Setup Backend (`/server`):**
   ```bash
   cd server
   npm install
   # Create a .env file with your PORT, MONGODB_URI, GEMINI_API_KEY, and Clerk keys
   npm run dev
   ```

3. **Setup Client Dashboard (`/client`):**
   ```bash
   cd ../client
   npm install
   # Create a .env file with your VITE_CLERK_PUBLISHABLE_KEY and API URL
   npm run dev
   ```

4. **Setup Chrome Extension (`/extension`):**
   ```bash
   cd ../extension
   npm install
   npm run build
   # Load the `dist` folder as an unpacked extension in Chrome at chrome://extensions/
   ```

## Roadmap
Check out the [FEATURES_ROADMAP.md](./FEATURES_ROADMAP.md) for our future plans, including social accountability features and multiplayer study buddy rooms!

## Contributing
Contributions, issues, and feature requests are welcome! 

## License
This project is licensed under the ISC License.
