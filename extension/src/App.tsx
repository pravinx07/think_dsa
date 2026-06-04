/// <reference types="chrome" />
import { useEffect, useState } from "react";
import "./App.css";
function App() {
  const [problemTitle, setProblemTitle] =
    useState("Loading...");

  useEffect(() => {
    chrome.storage.local.get(
      ["problemTitle"],
      (result:any) => {
        if (result.problemTitle) {
          setProblemTitle(result.problemTitle);
        }
      }
    );
  }, []);

  return (
    <div className="w-[350px] min-h-screen bg-zinc-950 text-white p-4">
      <h1 className="text-2xl font-bold">
        ThinkDSA 🚀
      </h1>

      <p className="text-zinc-400 mt-2">
        Learn DSA by thinking, not memorizing.
      </p>

      <div className="mt-6 bg-zinc-900 p-4 rounded-xl">
        <h2 className="font-semibold">
          Problem Detected
        </h2>

        <p className="text-zinc-300 mt-2">
          {problemTitle}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button className="bg-blue-600 py-2 rounded-lg">
          Get Hint
        </button>

        <button className="bg-zinc-800 py-2 rounded-lg">
          Find Pattern
        </button>

        <button className="bg-zinc-800 py-2 rounded-lg">
          Explain Concept
        </button>
      </div>
    </div>
  );
}

export default App;