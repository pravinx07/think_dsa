import React from "react";
import ReactDOM from "react-dom/client";
import Sidebar from "../sidebar/Sidebar";
import "../index.css";

function getProblemDetails() {
  const titleElement = document.querySelector(".text-title-large");
  const title = titleElement?.textContent;

  const difficultyElement = document.querySelector(".text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard");
  const difficulty = difficultyElement?.textContent;

  const descriptionElement = document.querySelector("[data-track-load='description_content']");
  const description = descriptionElement?.textContent;

  if (title) {
    chrome.storage.local.get(["problemTitle", "problemDifficulty"], (result) => {
      if (result.problemTitle !== title || result.problemDifficulty !== difficulty) {
        chrome.storage.local.set({ 
          problemTitle: title,
          problemDifficulty: difficulty || "Unknown",
          problemDescription: description || "",
          problemStartTime: Date.now()
        });
      }
    });
  }
}

getProblemDetails();

// Debounce helper to avoid calling getProblemTitle too many times
let timeout: number;
const observer = new MutationObserver(() => {
  clearTimeout(timeout);
  timeout = window.setTimeout(() => {
    getProblemDetails();
  }, 1000);
});

observer.observe(document.body, { childList: true, subtree: true });

// inject sidebar root
const root =
  document.createElement("div");

root.id = "thinkdsa-root";

document.body.appendChild(root);

// mount react app
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Sidebar />
  </React.StrictMode>
);