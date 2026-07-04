import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Brain, X, Loader2, Sparkles, Send, Network, Code2, Activity, Timer, Play, Compass, BarChart } from "lucide-react";

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

  const [activeTab, setActiveTab] = useState<"chat" | "scratchpad" | "dashboard">("chat");
  const [scratchpadText, setScratchpadText] = useState("");
  const [problemStats, setProblemStats] = useState<Record<string, { hints: number }>>({});

  useEffect(() => {
    if (problemTitle && problemTitle !== "Loading...") {
       chrome.storage.local.get([`scratchpad_${problemTitle}`, "problemStats"], (res) => {
         setScratchpadText((res[`scratchpad_${problemTitle}`] as string) || "");
         setProblemStats((res.problemStats as Record<string, { hints: number }>) || {});
       });
    }
  }, [problemTitle]);

  const handleScratchpadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setScratchpadText(val);
    chrome.storage.local.set({ [`scratchpad_${problemTitle}`]: val });
  };

  const STRUGGLE_TIME = 300; // 5 minutes
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    chrome.storage.local.get(["problemTitle", "problemDifficulty", "problemStartTime"], (result) => {
      if (result.problemTitle) {
        setProblemTitle(result.problemTitle as string);
        setProblemDifficulty(result.problemDifficulty as string);
      }
      if (result.problemStartTime) {
        setStartTime(result.problemStartTime as number);
      }
    });

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.problemTitle) setProblemTitle(changes.problemTitle.newValue as string);
      if (changes.problemDifficulty) setProblemDifficulty(changes.problemDifficulty.newValue as string);
      if (changes.problemStartTime) setStartTime(changes.problemStartTime.newValue as number);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  useEffect(() => {
    const timerId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeLeft(Math.max(0, STRUGGLE_TIME - elapsed));
    }, 1000);
    return () => clearInterval(timerId);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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

    // Track hint/interaction count
    const updatedStats = { ...problemStats };
    if (!updatedStats[problemTitle]) updatedStats[problemTitle] = { hints: 0 };
    updatedStats[problemTitle].hints += 1;
    setProblemStats(updatedStats);
    chrome.storage.local.set({ problemStats: updatedStats });

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

  async function triggerAction(action: "hint" | "pattern" | "review" | "complexity" | "dryrun" | "stepdown") {
    let code = "";
    if (action === "review" || action === "complexity" || action === "dryrun") {
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
    if (action === "dryrun") userMsg = "Help me dry run my code step-by-step with a test case.";
    if (action === "stepdown") userMsg = "I am completely lost. Can you recommend 1-2 easier foundational problems I should solve first?";

    // Track hint count for generic hints and patterns
    if (action === "hint" || action === "pattern" || action === "stepdown") {
      const updatedStats = { ...problemStats };
      if (!updatedStats[problemTitle]) updatedStats[problemTitle] = { hints: 0 };
      updatedStats[problemTitle].hints += 1;
      setProblemStats(updatedStats);
      chrome.storage.local.set({ problemStats: updatedStats });
    }

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

      {/* Tabs */}
      <div className="flex border-b border-zinc-800/50 bg-zinc-900/50">
        <button 
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'chat' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/20'}`}
        >
          Chat Assistant
        </button>
        <button 
          onClick={() => setActiveTab("scratchpad")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'scratchpad' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/20'}`}
        >
          Scratchpad
        </button>
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/20'}`}
        >
          Dashboard
        </button>
      </div>

      {activeTab === "scratchpad" ? (
        <div className="flex-1 flex flex-col p-4 bg-zinc-950">
          <p className="text-xs text-zinc-500 mb-2">Use this space to trace algorithms, write pseudocode, or jot down ideas. Auto-saves locally.</p>
          <textarea
            value={scratchpadText}
            onChange={handleScratchpadChange}
            placeholder="Write your notes or pseudocode here..."
            className="flex-1 w-full bg-transparent resize-none text-zinc-300 font-mono text-sm focus:outline-none placeholder-zinc-700"
            spellCheck={false}
          />
        </div>
      ) : activeTab === "dashboard" ? (
        <div className="flex-1 flex flex-col p-5 bg-zinc-950 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
            <BarChart className="w-6 h-6 text-indigo-500" />
            <h2 className="text-lg font-bold text-white">Learning Analytics</h2>
          </div>
          <p className="text-sm text-zinc-400 mb-4">Track how much you rely on hints to identify weak patterns.</p>
          
          <div className="space-y-3">
            {Object.entries(problemStats).length === 0 ? (
              <p className="text-sm text-zinc-500 italic">Solve some problems and use hints to see your stats here.</p>
            ) : (
              Object.entries(problemStats).map(([title, stats]) => (
                <div key={title} className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-sm text-zinc-300 font-medium truncate max-w-[220px]">{title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Hints:</span>
                    <span className={`text-sm font-bold ${stats.hints > 3 ? 'text-red-400' : stats.hints > 1 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      {stats.hints}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <>
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
        <div className="grid grid-cols-5 gap-2 mt-2">
          <button 
            onClick={() => triggerAction("pattern")}
            disabled={timeLeft > 0}
            className="flex flex-col items-center justify-center gap-1 bg-zinc-800/50 hover:bg-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 hover:text-indigo-400 border border-zinc-700/50 hover:border-indigo-500/30 rounded-xl py-2 transition-all"
            title="Find Pattern"
          >
            <Network className="w-4 h-4" />
            <span className="text-[9px] font-medium uppercase tracking-wider">Pattern</span>
          </button>
          <button 
            onClick={() => triggerAction("stepdown")}
            className="flex flex-col items-center justify-center gap-1 bg-zinc-800/50 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 border border-zinc-700/50 hover:border-rose-500/30 rounded-xl py-2 transition-all"
            title="I'm Lost"
          >
            <Compass className="w-4 h-4" />
            <span className="text-[9px] font-medium uppercase tracking-wider">Lost</span>
          </button>
          <button 
            onClick={() => triggerAction("review")}
            className="flex flex-col items-center justify-center gap-1 bg-zinc-800/50 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 border border-zinc-700/50 hover:border-emerald-500/30 rounded-xl py-2 transition-all"
            title="Review Code"
          >
            <Code2 className="w-4 h-4" />
            <span className="text-[9px] font-medium uppercase tracking-wider">Review</span>
          </button>
          <button 
            onClick={() => triggerAction("complexity")}
            className="flex flex-col items-center justify-center gap-1 bg-zinc-800/50 hover:bg-orange-500/20 text-zinc-300 hover:text-orange-400 border border-zinc-700/50 hover:border-orange-500/30 rounded-xl py-2 transition-all"
            title="Analyze Complexity"
          >
            <Activity className="w-4 h-4" />
            <span className="text-[9px] font-medium uppercase tracking-wider">Big-O</span>
          </button>
          <button 
            onClick={() => triggerAction("dryrun")}
            className="flex flex-col items-center justify-center gap-1 bg-zinc-800/50 hover:bg-sky-500/20 text-zinc-300 hover:text-sky-400 border border-zinc-700/50 hover:border-sky-500/30 rounded-xl py-2 transition-all"
            title="Dry Run"
          >
            <Play className="w-4 h-4" />
            <span className="text-[9px] font-medium uppercase tracking-wider">Dry Run</span>
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
            
            {timeLeft > 0 ? (
              <div className="flex flex-col items-center gap-2 mt-4 bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl">
                <Timer className="w-6 h-6 text-orange-400 animate-pulse" />
                <p className="text-sm font-semibold text-zinc-300">Struggle Timer</p>
                <p className="text-2xl font-mono text-orange-400 tracking-wider">
                  {formatTime(timeLeft)}
                </p>
                <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">
                  Take at least 5 minutes to think on your own before asking for a hint!
                </p>
              </div>
            ) : (
              <button
                onClick={() => triggerAction("hint")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-full flex items-center gap-2 font-medium transition-all shadow-lg shadow-indigo-500/25"
              >
                <Sparkles className="w-4 h-4" />
                Get Initial Hint
              </button>
            )}
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
              <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900/50 prose-pre:border prose-pre:border-zinc-700/50 whitespace-pre-wrap break-words">
                {msg.role === "user" ? (
                  msg.text
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            {...props}
                            children={String(children).replace(/\n$/, "")}
                            style={vscDarkPlus as any}
                            language={match[1]}
                            PreTag="div"
                          />
                        ) : (
                          <code {...props} className={className}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                )}
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
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !loading && !(timeLeft > 0 && messages.length === 0)) {
                  sendMessage(input);
                }
              }
            }}
            disabled={timeLeft > 0 && messages.length === 0}
            placeholder={timeLeft > 0 && messages.length === 0 ? "Timer active. Keep thinking!" : "Ask a question..."}
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none max-h-32"
            rows={1}
            style={{ minHeight: '46px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || (timeLeft > 0 && messages.length === 0)}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white p-3 rounded-xl transition-all flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
        </>
      )}
    </div>
  );
}