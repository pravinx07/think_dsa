import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Brain, X, Loader2, Sparkles, Send, Network, Code2, Activity, Timer, Play, Compass, BarChart, Wand2, FileText, ChevronLeft, ChevronRight, Cpu, Briefcase, Flag } from "lucide-react";

type Message = {
  role: "user" | "ai";
  text: string;
};

type DryRunStep = {
  line: string;
  variables: Record<string, string>;
  note: string;
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [problemTitle, setProblemTitle] = useState("Loading...");
  const [problemDifficulty, setProblemDifficulty] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"chat" | "scratchpad" | "dashboard" | "visualizer">("chat");
  const [scratchpadText, setScratchpadText] = useState("");
  const [problemStats, setProblemStats] = useState<Record<string, { hints: number }>>({});

  // Dry Run Visualizer state
  const [dryrunSteps, setDryrunSteps] = useState<DryRunStep[]>([]);
  const [dryrunCurrentStep, setDryrunCurrentStep] = useState(0);
  const [dryrunTestInput, setDryrunTestInput] = useState("");
  const [dryrunResult, setDryrunResult] = useState("");
  const [dryrunError, setDryrunError] = useState("");

  // Interview Mode state
  const INTERVIEW_DURATION = 45 * 60; // 45 minutes in seconds
  const [interviewActive, setInterviewActive] = useState(false);
  const [interviewMessages, setInterviewMessages] = useState<Message[]>([]);
  const [interviewInput, setInterviewInput] = useState("");
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewTimeLeft, setInterviewTimeLeft] = useState(INTERVIEW_DURATION);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const interviewTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const interviewEndRef = useRef<HTMLDivElement>(null);

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

  async function triggerAction(action: "hint" | "pattern" | "review" | "complexity" | "dryrun" | "stepdown" | "refactor") {
    let code = "";
    if (action === "review" || action === "complexity" || action === "dryrun" || action === "refactor") {
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
    if (action === "refactor") userMsg = "Make my code Pro (Refactor to FAANG standards).";

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

  async function generateNotes() {
    let code = "";
    const lineElements = document.querySelectorAll('.view-lines .view-line');
    if (lineElements.length === 0) {
      setMessages([...messages, { role: "ai", text: "I couldn't find your code. Make sure the editor is open and has code." }]);
      setActiveTab("chat");
      return;
    }
    code = Array.from(lineElements).map(el => el.textContent).join('\n');

    setLoading(true);
    // Switch to scratchpad tab so they can see it happening
    setActiveTab("scratchpad");

    try {
      const response = await fetch("http://localhost:5000/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemTitle,
          action: "notes",
          code,
          messages: [],
        }),
      });
      const data = await response.json();
      const notes = data.hint;
      
      const newScratchpadText = scratchpadText + (scratchpadText ? "\n\n" : "") + "### AI Generated Notes\n" + notes;
      setScratchpadText(newScratchpadText);
      chrome.storage.local.set({ [`scratchpad_${problemTitle}`]: newScratchpadText });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function triggerDryRunVisual() {
    const lineElements = document.querySelectorAll('.view-lines .view-line');
    if (lineElements.length === 0) {
      setDryrunError("Couldn't find code in the editor. Make sure the LeetCode code panel is open.");
      setActiveTab("visualizer");
      return;
    }
    const code = Array.from(lineElements).map(el => el.textContent).join('\n');

    // Reset visualizer state
    setDryrunSteps([]);
    setDryrunCurrentStep(0);
    setDryrunResult("");
    setDryrunError("");
    setDryrunTestInput("");
    setLoading(true);
    setActiveTab("visualizer");

    try {
      const response = await fetch("http://localhost:5000/dryrun-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemTitle, code }),
      });

      if (!response.ok) {
        const err = await response.json();
        setDryrunError(err.error ?? "Server error. Please try again.");
        return;
      }

      const data = await response.json();

      if (!Array.isArray(data.steps) || data.steps.length === 0) {
        setDryrunError("AI returned an empty trace. Please try again.");
        return;
      }

      setDryrunSteps(data.steps);
      setDryrunResult(data.result ?? "");
      setDryrunTestInput(data.testInput ?? "");
    } catch (error) {
      console.error(error);
      setDryrunError("Network error. Is the server running at localhost:5000?");
    } finally {
      setLoading(false);
    }
  }

  // ─── Interview Mode Functions ─────────────────────────────────────────────
  async function startInterview() {
    setInterviewMessages([]);
    setInterviewInput("");
    setInterviewEnded(false);
    setInterviewTimeLeft(INTERVIEW_DURATION);
    setInterviewActive(true);
    setInterviewLoading(true);

    // Start countdown
    if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
    interviewTimerRef.current = setInterval(() => {
      setInterviewTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interviewTimerRef.current!);
          setInterviewEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const res = await fetch("http://localhost:5000/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemTitle, messages: [] }),
      });
      const data = await res.json();
      setInterviewMessages([{ role: "ai", text: data.reply }]);
    } catch (e) {
      setInterviewMessages([{ role: "ai", text: "Could not connect to server. Is it running at localhost:5000?" }]);
    } finally {
      setInterviewLoading(false);
    }
  }

  function stopInterview() {
    if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
    setInterviewActive(false);
    setInterviewEnded(false);
    setInterviewMessages([]);
    setInterviewTimeLeft(INTERVIEW_DURATION);
  }

  async function sendInterviewMessage(text: string) {
    if (!text.trim() || interviewLoading || interviewEnded) return;
    const newMessages: Message[] = [...interviewMessages, { role: "user", text }];
    setInterviewMessages(newMessages);
    setInterviewInput("");
    setInterviewLoading(true);

    // Auto-scroll
    setTimeout(() => interviewEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const res = await fetch("http://localhost:5000/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemTitle, messages: newMessages }),
      });
      const data = await res.json();
      const reply = data.reply ?? data.error ?? "No response.";
      setInterviewMessages(prev => [...prev, { role: "ai", text: reply }]);
    } catch {
      setInterviewMessages(prev => [...prev, { role: "ai", text: "Network error. Please try again." }]);
    } finally {
      setInterviewLoading(false);
      setTimeout(() => interviewEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  async function requestFeedback() {
    await sendInterviewMessage("I'm done with my solution. Please give me structured feedback.");
  }

  const formatInterviewTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  const interviewTimerColor = interviewTimeLeft < 300
    ? "text-red-400"
    : interviewTimeLeft < 600
    ? "text-amber-400"
    : "text-emerald-400";

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

  // ── INTERVIEW MODE: early return with dedicated UI ──────────────────────────
  if (interviewActive) {
    const outerCls = "fixed right-4 top-4 bottom-4 w-[450px] text-white z-[999999] rounded-2xl flex flex-col transition-all duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden bg-zinc-950 border border-red-900/50";
    const feedbackBtnCls = "w-full py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all";
    const sendBtnCls = "bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white p-2.5 rounded-xl transition-all flex items-center justify-center";

    return (
      <div className={outerCls}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-red-900/40 bg-red-950/30">
          <h1 className="text-base font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-red-400" />
            <span className="text-red-300">Interview Mode</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className={"flex items-center gap-1.5 font-mono text-sm font-bold " + interviewTimerColor}>
              <Timer className="w-4 h-4" />
              {formatInterviewTime(interviewTimeLeft)}
            </div>
            <button
              onClick={stopInterview}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-all"
            >
              <Briefcase className="w-3.5 h-3.5" />
              End
            </button>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 p-1.5 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-red-950/20 border-b border-red-900/20">
          <p className="text-xs text-red-300 truncate font-medium">📋 {problemTitle}</p>
          {interviewEnded
            ? <span className="text-xs text-red-400 font-bold animate-pulse">⏰ Time's up!</span>
            : <span className="text-[10px] text-zinc-500">Hints & pattern names are off-limits</span>
          }
        </div>

        {/* Time's up banner */}
        {interviewEnded && (
          <div className="bg-red-900/30 border-b border-red-800/50 px-4 py-3 text-center">
            <p className="text-sm font-bold text-red-300">⏰ 45 minutes are up!</p>
            <p className="text-xs text-zinc-400 mt-0.5">Click "Get Feedback" to receive your evaluation.</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {interviewMessages.length === 0 && interviewLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800/80 rounded-2xl rounded-bl-none border border-zinc-700/50 px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                <span className="text-sm text-zinc-400">Interviewer is joining...</span>
              </div>
            </div>
          )}

          {interviewMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const bubbleCls = isUser
              ? 'max-w-[88%] rounded-2xl rounded-br-none p-3 text-sm bg-zinc-700/60 text-zinc-100 border border-zinc-600/50'
              : 'max-w-[88%] rounded-2xl rounded-bl-none p-3 text-sm bg-red-950/40 text-zinc-200 border border-red-900/40';
            return (
              <div key={idx} className={isUser ? 'flex justify-end' : 'flex justify-start'}>
                <div className={bubbleCls}>
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed break-words">
                    {isUser ? msg.text : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}
                        components={{
                          code({ inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match
                              ? <SyntaxHighlighter {...props} children={String(children).replace(/\n$/, "")} style={vscDarkPlus as any} language={match[1]} PreTag="div" />
                              : <code {...props} className={className}>{children}</code>;
                          },
                        }}
                      >{msg.text}</ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {interviewLoading && interviewMessages.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-red-950/40 border border-red-900/40 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                <span className="text-sm text-zinc-400">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={interviewEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-red-900/30 bg-zinc-900/50 space-y-2">
          {interviewEnded && (
            <button onClick={requestFeedback} disabled={interviewLoading} className={feedbackBtnCls}>
              <Flag className="w-4 h-4" />
              Get Structured Feedback
            </button>
          )}
          <form onSubmit={(e) => { e.preventDefault(); sendInterviewMessage(interviewInput); }} className="flex gap-2">
            <textarea
              value={interviewInput}
              onChange={(e) => setInterviewInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendInterviewMessage(interviewInput); }
              }}
              disabled={interviewLoading || interviewEnded}
              placeholder={interviewEnded ? "Time's up! Get feedback above." : "Speak to the interviewer... (Enter to send)"}
              rows={1}
              className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-red-700/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all text-white placeholder-zinc-600 disabled:opacity-40 resize-none"
              style={{ minHeight: '42px', maxHeight: '100px' }}
            />
            <button type="submit" disabled={!interviewInput.trim() || interviewLoading || interviewEnded} className={sendBtnCls}>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-4 bottom-4 w-[450px] bg-zinc-950/95 backdrop-blur-2xl text-white z-[999999] border border-zinc-800 rounded-2xl flex flex-col transition-all duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
        <h1 className="text-base font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-500" />
          ThinkDSA
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={startInterview}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/50 transition-all"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Interview
          </button>
          <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 p-1.5 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
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
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === 'dashboard' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/20'}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab("visualizer")}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === 'visualizer' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/20'}`}
        >
          Visualizer
        </button>
      </div>

      {activeTab === "scratchpad" ? (
        <div className="flex-1 flex flex-col p-4 bg-zinc-950">
          <div className="flex justify-between items-start mb-3 gap-2">
            <p className="text-xs text-zinc-500">Use this space to trace algorithms, write pseudocode, or jot down ideas. Auto-saves locally.</p>
            <button 
              onClick={generateNotes} 
              disabled={loading} 
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
              {loading ? "Generating..." : "Auto-Notes"}
            </button>
          </div>
          <textarea
            value={scratchpadText}
            onChange={handleScratchpadChange}
            placeholder="Write your notes or pseudocode here..."
            className="flex-1 w-full bg-transparent resize-none text-zinc-300 font-mono text-sm focus:outline-none placeholder-zinc-700"
            spellCheck={false}
          />
        </div>
      ) : activeTab === "visualizer" ? (
        <div className="flex-1 flex flex-col p-4 bg-zinc-950 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
            <Cpu className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Dry Run Visualizer</h2>
          </div>

          {/* Empty / Launch state */}
          {!loading && dryrunSteps.length === 0 && !dryrunError && (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center">
              <Cpu className="w-12 h-12 text-sky-400/40" />
              <p className="text-zinc-400 text-sm max-w-[260px]">
                Click <strong className="text-sky-400">"Visualize"</strong> in the Chat tab toolbar to
                auto-trace your code step-by-step.
              </p>
              <button
                onClick={triggerDryRunVisual}
                disabled={loading}
                className="bg-sky-600 hover:bg-sky-700 text-white text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-lg shadow-sky-500/20"
              >
                <Play className="w-4 h-4" />
                Start Visualizer
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center flex-1 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
              <p className="text-zinc-400 text-sm">Simulating your code...</p>
            </div>
          )}

          {/* Error state */}
          {dryrunError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
              <p className="font-semibold mb-1">Error</p>
              <p>{dryrunError}</p>
              <button
                onClick={triggerDryRunVisual}
                className="mt-3 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {/* Visualizer content */}
          {!loading && dryrunSteps.length > 0 && (
            <div className="flex flex-col gap-4">
              {/* Test input */}
              {dryrunTestInput && (
                <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Test Input</p>
                  <p className="text-sm font-mono text-emerald-400">{dryrunTestInput}</p>
                </div>
              )}

              {/* Step navigator */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setDryrunCurrentStep(s => Math.max(0, s - 1))}
                  disabled={dryrunCurrentStep === 0}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-xs text-zinc-400">Step </span>
                  <span className="text-sm font-bold text-white">{dryrunCurrentStep + 1}</span>
                  <span className="text-xs text-zinc-400"> / {dryrunSteps.length}</span>
                </div>
                <button
                  onClick={() => setDryrunCurrentStep(s => Math.min(dryrunSteps.length - 1, s + 1))}
                  disabled={dryrunCurrentStep === dryrunSteps.length - 1}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div
                  className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((dryrunCurrentStep + 1) / dryrunSteps.length) * 100}%` }}
                />
              </div>

              {/* Current step card */}
              {(() => {
                const step = dryrunSteps[dryrunCurrentStep];
                return (
                  <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl overflow-hidden">
                    {/* Code line */}
                    <div className="bg-zinc-800/80 px-4 py-2.5 border-b border-zinc-700/50">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Executing Line</p>
                      <code className="text-sm font-mono text-yellow-300 break-all">{step.line}</code>
                    </div>

                    {/* Variables table */}
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Variables</p>
                      {Object.keys(step.variables).length === 0 ? (
                        <p className="text-xs text-zinc-600 italic">No variables changed.</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left">
                              <th className="text-zinc-500 font-medium text-xs pb-2 pr-4">Name</th>
                              <th className="text-zinc-500 font-medium text-xs pb-2">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(step.variables).map(([k, v]) => (
                              <tr key={k} className="border-t border-zinc-800">
                                <td className="py-1.5 pr-4 font-mono text-indigo-300 text-xs">{k}</td>
                                <td className="py-1.5 font-mono text-emerald-300 text-xs break-all">{v}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Note */}
                    <div className="bg-sky-500/5 border-t border-sky-500/20 px-4 py-2.5">
                      <p className="text-xs text-sky-300">{step.note}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Final result */}
              {dryrunCurrentStep === dryrunSteps.length - 1 && dryrunResult && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Final Result</p>
                  <p className="text-sm font-mono text-emerald-400">{dryrunResult}</p>
                </div>
              )}

              {/* Restart button */}
              <button
                onClick={triggerDryRunVisual}
                disabled={loading}
                className="w-full text-xs text-zinc-400 hover:text-sky-400 border border-zinc-800 hover:border-sky-500/30 py-2 rounded-xl transition-all"
              >
                ↺ Run Again
              </button>
            </div>
          )}
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
        <div className="grid grid-cols-6 gap-2 mt-2">
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
            onClick={triggerDryRunVisual}
            className="flex flex-col items-center justify-center gap-1 bg-zinc-800/50 hover:bg-sky-500/20 text-zinc-300 hover:text-sky-400 border border-zinc-700/50 hover:border-sky-500/30 rounded-xl py-2 transition-all"
            title="Dry Run Visualizer"
          >
            <Cpu className="w-4 h-4" />
            <span className="text-[9px] font-medium uppercase tracking-wider">Visualize</span>
          </button>
          <button 
            onClick={() => triggerAction("refactor")}
            className="flex flex-col items-center justify-center gap-1 bg-zinc-800/50 hover:bg-purple-500/20 text-zinc-300 hover:text-purple-400 border border-zinc-700/50 hover:border-purple-500/30 rounded-xl py-2 transition-all"
            title="Make it Pro"
          >
            <Wand2 className="w-4 h-4" />
            <span className="text-[9px] font-medium uppercase tracking-wider">Pro</span>
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
              if (e.nativeEvent.isComposing || e.keyCode === 229) return;
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