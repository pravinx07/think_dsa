/// <reference types="chrome" />
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [problemTitle, setProblemTitle] =
    useState("Loading...");

  const [hint, setHint] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    chrome.storage.local.get(
      ["problemTitle"],
      (result) => {
        if (result.problemTitle) {
          setProblemTitle(
            result.problemTitle as string
          );
        }
      }
    );
  }, []);

  async function getHint() {
    try {
      setLoading(true);

      const response =
        await fetch(
          "http://localhost:5000/hint",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              problemTitle,
            }),
          }
        );

      const data =
        await response.json();

      setHint(data.hint);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-[350px] min-h-screen bg-zinc-950 text-white p-4">
      <h1 className="text-2xl font-bold">
        ThinkDSA 
      </h1>

      <p className="text-zinc-400 mt-2">
        Learn DSA by thinking,
        not memorizing.
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
        <button
          onClick={getHint}
          className="bg-blue-600 py-2 rounded-lg"
        >
          {loading
            ? "Generating..."
            : "Get Hint"}
        </button>

        <button className="bg-zinc-800 py-2 rounded-lg">
          Find Pattern
        </button>

        <button className="bg-zinc-800 py-2 rounded-lg">
          Explain Concept
        </button>
      </div>

      {hint && (
        <div className="mt-6 bg-zinc-900 p-4 rounded-xl">
          <h2 className="font-semibold">
            Hint
          </h2>

          <p className="text-zinc-300 mt-2">
            {hint}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;