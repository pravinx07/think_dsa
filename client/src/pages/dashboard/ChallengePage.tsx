import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/react';
import { 
  Users, Copy, Check, 
  ArrowRight, Plus, HelpCircle, Trophy, MessageSquare, Send, LogOut
} from 'lucide-react';

type UserState = {
  clerkId: string;
  username: string;
  status: 'Idle' | 'Coding' | 'Stuck' | 'Solved' | 'Given Up';
  progress: { passed: number; total: number };
  timeElapsed: number;
};

type RoomState = {
  roomId: string;
  problem: { title: string; url: string; difficulty: string } | null;
  users: UserState[];
};

type ChatMessage = {
  sender: string;
  text: string;
  time: string;
};

export default function ChallengePage() {
  const { user } = useUser();
  const [roomIdInput, setRoomIdInput] = useState('');
  const [activeRoom, setActiveRoom] = useState<RoomState | null>(null);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'Idle' | 'Coding' | 'Stuck' | 'Solved' | 'Given Up'>('Idle');
  const [testCasesPassed, setTestCasesPassed] = useState(0);
  const [totalTestCases, setTotalTestCases] = useState(15);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const username = user?.username || user?.firstName || 'Anonymous';
  const clerkId = user?.id || 'anonymous_id';

  // Handle timer
  useEffect(() => {
    if (activeRoom && activeRoom.problem && status === 'Coding') {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const nextTime = prev + 1;
          // Send periodically to socket
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
              type: 'update',
              timeElapsed: nextTime
            }));
          }
          return nextTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeRoom?.problem, status]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect to WebSocket
  const connectToRoom = (roomId: string) => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const wsUrl = `ws://${window.location.hostname}:5000/ws/lobby`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'join',
        roomId,
        username,
        clerkId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'room_state') {
          setActiveRoom(data);
          // Sync current user's local state with room if needed
          const localUser = data.users.find((u: any) => u.clerkId === clerkId);
          if (localUser) {
            setStatus(localUser.status);
            setTestCasesPassed(localUser.progress.passed);
            setTotalTestCases(localUser.progress.total);
            setTimeElapsed(localUser.timeElapsed);
          }
        } else if (data.type === 'chat_message') {
          setMessages(prev => [...prev, data.message]);
        }
      } catch (err) {
        console.error('Failed to parse websocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('Socket closed');
      setActiveRoom(null);
      setStatus('Idle');
    };
  };

  const handleCreateRoom = () => {
    const randomCode = `room-${Math.floor(1000 + Math.random() * 9000)}`;
    connectToRoom(randomCode);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomIdInput.trim()) {
      connectToRoom(roomIdInput.trim().toLowerCase());
    }
  };

  const handleStatusChange = (newStatus: 'Idle' | 'Coding' | 'Stuck' | 'Solved' | 'Given Up') => {
    setStatus(newStatus);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'update',
        status: newStatus
      }));
    }
  };

  const handleProgressChange = (passed: number) => {
    setTestCasesPassed(passed);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'update',
        progress: { passed, total: totalTestCases }
      }));
    }
  };

  const handleSelectProblem = (title: string, difficulty: 'Easy' | 'Medium' | 'Hard') => {
    const slug = title.toLowerCase().replace(/ /g, '-');
    const problem = {
      title,
      url: `https://leetcode.com/problems/${slug}/`,
      difficulty
    };

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'select_problem',
        problem
      }));
    }
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    setActiveRoom(null);
    setMessages([]);
    setStatus('Idle');
    setTestCasesPassed(0);
    setTimeElapsed(0);
  };

  const copyRoomCode = () => {
    if (activeRoom) {
      navigator.clipboard.writeText(activeRoom.roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === 'Easy') return 'text-emerald-400 bg-emerald-400/10';
    if (diff === 'Medium') return 'text-amber-400 bg-amber-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  const getStatusColor = (s: string) => {
    if (s === 'Coding') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (s === 'Stuck') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    if (s === 'Solved') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (s === 'Given Up') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent mb-4 inline-block">
          Study Buddy Matcher
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          Challenge your friends, solve DSA problems together in real-time, and track live progress.
        </p>
      </div>

      {!activeRoom ? (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Room Card */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
              <Plus className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Create Private Room</h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Start a new multiplayer session and invite your buddies to a real-time coding race.
            </p>
            <button
              onClick={handleCreateRoom}
              className="mt-8 w-full btn-primary py-3 rounded-2xl flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform duration-300"
            >
              Create Room <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Join Room Card */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all" />
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Join Existing Room</h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Enter a room code shared by your friend to join their active session.
            </p>
            <form onSubmit={handleJoinRoom} className="mt-8 space-y-4">
              <input
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="Enter Room Code (e.g. room-1234)"
                className="w-full bg-[#050515]/60 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-white placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={!roomIdInput.trim()}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/25"
              >
                Join Session
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Session Header */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 font-bold">
                ●
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-bold text-lg text-slate-200">Active Challenge Room</h2>
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs">
                    <span className="font-mono text-indigo-400 font-bold select-all">{activeRoom.roomId}</span>
                    <button onClick={copyRoomCode} className="text-slate-400 hover:text-white transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {activeRoom.problem && (
                    <div className="text-xs text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg font-mono">
                      ⏱️ {formatTime(timeElapsed)}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Share the code with your friends to join.
                </p>
              </div>
            </div>

            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-2 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 bg-white/5 hover:bg-rose-500/5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              <LogOut className="w-4 h-4" /> Leave Room
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Area - Problem & Progress Control */}
            <div className="lg:col-span-2 space-y-6">
              {/* Problem Selection & Details */}
              <div className="glass-panel p-6 rounded-3xl space-y-6 relative overflow-hidden bg-[#0a0a1a]/80 border border-white/5 shadow-xl shadow-indigo-900/10">
                {!activeRoom.problem ? (
                  <div className="text-center py-12 px-6 space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                      <HelpCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-100">No Problem Selected</h3>
                      <p className="text-sm text-slate-400 mt-2">Select a challenge problem to start the contest.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 pt-4">
                      <button
                        onClick={() => handleSelectProblem("Two Sum", "Easy")}
                        className="px-5 py-3 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:scale-105 transition-all border border-emerald-500/20 shadow-lg shadow-emerald-900/20"
                      >
                        Two Sum (Easy)
                      </button>
                      <button
                        onClick={() => handleSelectProblem("Longest Substring Without Repeating Characters", "Medium")}
                        className="px-5 py-3 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:scale-105 transition-all border border-amber-500/20 shadow-lg shadow-amber-900/20"
                      >
                        Longest Substring (Medium)
                      </button>
                      <button
                        onClick={() => handleSelectProblem("Merge k Sorted Lists", "Hard")}
                        className="px-5 py-3 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:scale-105 transition-all border border-red-500/20 shadow-lg shadow-red-900/20"
                      >
                        Merge k Lists (Hard)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${getDifficultyColor(activeRoom.problem.difficulty)}`}>
                          {activeRoom.problem.difficulty}
                        </span>
                        <h3 className="text-xl font-bold text-slate-200 mt-2.5">{activeRoom.problem.title}</h3>
                      </div>
                      <a
                        href={activeRoom.problem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:scale-[1.02] transition-transform"
                      >
                        Solve on LeetCode <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Progress controller */}
                    <div className="border-t border-white/5 pt-6 space-y-4">
                      <h4 className="text-sm font-bold text-slate-400">Update Your Live Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {(['Coding', 'Stuck', 'Solved', 'Given Up'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                              status === s
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                : 'bg-[#0a0a20] border-white/5 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>

                      {status === 'Coding' && (
                        <div className="space-y-2.5 pt-2">
                          <div className="flex justify-between text-xs font-medium text-slate-400">
                            <span>Test Cases Passed</span>
                            <span className="font-bold text-slate-200">{testCasesPassed} / {totalTestCases}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={totalTestCases}
                            value={testCasesPassed}
                            onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Leaderboard */}
              <div className="glass-panel p-6 rounded-3xl space-y-6 bg-[#0a0a1a]/80 border border-white/5 shadow-xl shadow-indigo-900/10">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-slate-100">Live Leaderboard</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-medium">
                        <th className="pb-4 font-semibold uppercase tracking-wider text-[10px]">User</th>
                        <th className="pb-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                        <th className="pb-4 font-semibold uppercase tracking-wider text-[10px]">Test Cases</th>
                        <th className="pb-4 font-semibold uppercase tracking-wider text-[10px] text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {activeRoom.users.map((u) => (
                        <tr key={u.clerkId} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 font-bold text-slate-200 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs uppercase shadow-lg shadow-indigo-500/30">
                              {u.username.slice(0, 2)}
                            </div>
                            <div className="flex flex-col">
                              <span>{u.username}</span>
                              {u.clerkId === clerkId && <span className="text-[10px] font-semibold text-indigo-400/80 -mt-0.5">You</span>}
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-lg ${getStatusColor(u.status)}`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-slate-300 font-bold">
                                {u.progress.passed}/{u.progress.total}
                              </span>
                              <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden hidden sm:block shadow-inner">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"
                                  style={{ width: `${(u.progress.passed / u.progress.total) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-right font-mono text-xs text-slate-400">
                            {formatTime(u.timeElapsed)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Area - Room Chat */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-[500px]">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-200">Room Chat</h3>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-xs text-slate-600 italic">
                    No messages yet. Send a word of encouragement!
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender === username;
                    return (
                      <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mx-1">
                          <span className="font-bold">{isMe ? 'You' : msg.sender}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p className={`text-sm rounded-2xl px-4 py-2 break-words max-w-[90%] shadow-sm ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                            : 'bg-white/10 border border-white/5 text-slate-200 rounded-tl-sm'
                        }`}>
                          {msg.text}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat input */}
              <div className="border-t border-white/5 pt-4 mt-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (chatInput.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
                      socketRef.current.send(JSON.stringify({
                        type: 'chat',
                        text: chatInput.trim()
                      }));
                      setChatInput('');
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#050515]/60 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-all text-white placeholder-slate-600"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-xl transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
