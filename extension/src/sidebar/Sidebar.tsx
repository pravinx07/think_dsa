import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Brain, X, Loader2, Sparkles, Send, Network, Code2, Activity } from "lucide-react";

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [problemTitle, setProblemTitle] = useState("Loading...");
  const [problemDifficulty, setProblemDifficulty] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chrome.storage.local.get(["problemTitle", "problemDifficulty"], (result) => {
      if (result.problemTitle) {
        setProblemTitle(result.problemTitle as string);
        setProblemDifficulty(result.problemDifficulty as string);
      }
    });

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.problemTitle) setProblemTitle(changes.problemTitle.newValue as string);
      if (changes.problemDifficulty) setProblemDifficulty(changes.problemDifficulty.newValue as string);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.width = "calc(100% - 460px)";
      document.body.style.transition = "width 0.3s ease-in-out";
    } else {
      document.body.style.width = "100%";
    }

    return () => {
      document.body.style.width = "100%";
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemTitle,
          messages: newMessages,
        }),
      });

      const data = await response.json();
      setMessages([...newMessages, { role: "ai", text: data.hint }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function triggerAction(action: "hint" | "pattern" | "review" | "complexity") {
    let code = "";
    if (action === "review" || action === "complexity") {
      const lineElements = document.querySelectorAll('.view-lines .view-line');
      if (lineElements.length === 0) {
        setMessages([...messages, { role: "ai", text: "I couldn't find your code. Make sure the editor is open and has code." }]);
        return;
      }
      // Scrape code by joining text content of view lines
      code = Array.from(lineElements).map(el => el.textContent).join('\n');
    }

    setLoading(true);
    let userMsg = "Can you give me a hint?";
    if (action === "pattern") userMsg = "Help me find the pattern for this problem.";
    if (action === "review") userMsg = "Review my code.";
    if (action === "complexity") userMsg = "Analyze the time and space complexity of my code.";

    const newMessages: Message[] = [...messages, { role: "user", text: userMsg }];
    
    // Always show user message visually except for initial hint (where it might feel redundant)
    if (messages.length > 0 || action !== "hint") {
      setMessages(newMessages);
    }

    try {
      const response = await fetch("http://localhost:5000/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemTitle,
          action,
          code,
          messages: messages.length > 0 || action !== "hint" ? newMessages : [],
        }),
      });

      const data = await response.json();
      setMessages((prev) => {
        // If it was an initial hint and messages was empty, prev might be empty, so handle carefully
        if (prev.length === 0) return [{ role: "ai", text: data.hint }];
        return [...prev, { role: "ai", text: data.hint }];
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[999999] bg-indigo-600 hover:bg-indigo-700 text-white p-5 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-indigo-500/50 ring-4 ring-indigo-500/30"
      >
        <Brain className="w-8 h-8" />
      </button>
    );
  }

  const getDifficultyColor = () => {
    if (problemDifficulty === "Easy") return "text-emerald-400 bg-emerald-400/10";
    if (problemDifficulty === "Medium") return "text-yellow-400 bg-yellow-400/10";
    if (problemDifficulty === "Hard") return "text-red-400 bg-red-400/10";
    return "text-zinc-400 bg-zinc-800";
  };

  return (
    <div className="fixed right-4 top-4 bottom-4 w-[450px] bg-zinc-950/95 backdrop-blur-2xl text-white z-[999999] border border-zinc-800 rounded-2xl flex flex-col transition-all duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-zinc-800/50 bg-zinc-900/30">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-indigo-500" />
          ThinkDSA
        </h1>
        <button
          onClick={() => setIsOpen(false)}
          className="text-zinc-400 hover:text-white transition-colors bg-zinc-800/50 hover:bg-zinc-700 p-2 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Problem Context */}
      <div className="px-5 py-4 bg-zinc-900/50 border-b border-zinc-800/50 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Current Problem
            </p>
            <p className="text-zinc-200 font-medium text-sm truncate max-w-[280px]">
              {problemTitle}
            </p>
          </div>
          {problemDifficulty && problemDifficulty !== "Unknown" && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getDifficultyColor()}`}>
              {problemDifficulty}
            </span>
          )}
        </div>
        
        {/* Action Toolbar */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          <button 
            onClick={() => triggerAction("pattern")}
            className="flex flex-col items-center justify-center gap-1 bg-zinc-800/50 hover:bg-indigo-500/20 text-zinc-300 hover:text-indigo-400 border border-zinc-700/50 hover:border-indigo-500/30 rounded-xl py-2 transition-all"
          >
            <Network className="w-4 h-4" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Pattern</span>
          </button>
          <button 
            onClick={() => triggerAction("review")}
            className="flex flex-col items-center justify-center gap-1 bg-zinc-800/50 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 border border-zinc-700/50 hover:border-emerald-500/30 rounded-xl py-2 transition-all"
          >
            <Code2 className="w-4 h-4" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Review</span>
          </button>
          <button 
            onClick={() => triggerAction("complexity")}
            className="flex flex-col items-center justify-center gap-1 bg-zinc-800/50 hover:bg-orange-500/20 text-zinc-300 hover:text-orange-400 border border-zinc-700/50 hover:border-orange-500/30 rounded-xl py-2 transition-all"
          >
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Complexity</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <Sparkles className="w-12 h-12 text-indigo-500/50" />
            <p className="text-zinc-400 text-sm max-w-[250px]">
              Stuck on this problem? Ask for a hint, find the core pattern, or get your code reviewed!
            </p>
            <button
              onClick={() => triggerAction("hint")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-full flex items-center gap-2 font-medium transition-all shadow-lg shadow-indigo-500/25"
            >
              <Sparkles className="w-4 h-4" />
              Get Initial Hint
            </button>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-zinc-800/80 text-zinc-200 rounded-bl-none border border-zinc-700/50"
              }`}
            >
              <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900/50 prose-pre:border prose-pre:border-zinc-700/50">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800/80 text-zinc-200 rounded-2xl rounded-bl-none border border-zinc-700/50 p-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-900/80 border-t border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white p-3 rounded-xl transition-all flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}