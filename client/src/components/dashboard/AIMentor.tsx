import { useState } from 'react'
import { mockMentorMessages, mockMentorSuggestions, mockUser, mockWeakAreas } from '../../data/mockData'

type Message = { role: 'user' | 'assistant'; content: string }

const aiReplies: Record<string, string> = {
  default: `Great question! Based on your profile, I see you've solved ${47} problems. Your strongest area is Sliding Window (80%). I recommend focusing on Dynamic Programming next — start with "Climbing Stairs" to build DP intuition from scratch.`,
  dp: `You struggle with DP because you're trying to memorize solutions instead of understanding the subproblem structure. Here's my advice:\n\n1. **Ask**: "What's the smallest version of this problem?"\n2. **Define** the DP state clearly before coding\n3. **Start** with recursion + memoization, then optimize to tabulation\n\nYour "Coin Change" attempt showed you understand the concept — you just need more reps. Try "House Robber" next.`,
  graph: `Graph problems feel hard because the setup is more about bookkeeping than algorithms. Your mistake log shows you forgot the visited set twice.\n\n**My fix for you**: Write this template before every graph problem:\n\`\`\`\nvisited = set()\nqueue = deque([start])\nvisited.add(start)\n\`\`\`\nThen adapt. You'll never forget again.`,
  week: `Based on your progress, here's your focus for this week:\n\n• **Day 1-2**: Merge Intervals (weak area — Intervals)\n• **Day 3-4**: Rotate Image (new pattern — Matrix)\n• **Day 5-6**: Coin Change II (continue DP practice)\n• **Day 7**: Review your mistake notes\n\nYou're on a 12-day streak — don't break it! 🔥`,
}

function getAIReply(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('dp') || lower.includes('dynamic')) return aiReplies.dp
  if (lower.includes('graph')) return aiReplies.graph
  if (lower.includes('week') || lower.includes('focus') || lower.includes('study')) return aiReplies.week
  return aiReplies.default
}

export default function AIMentor() {
  const [messages, setMessages] = useState<Message[]>(mockMentorMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = (text?: string) => {
    const msg = text ?? input.trim()
    if (!msg) return
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', content: getAIReply(msg) }])
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="glass-card rounded-2xl flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xl">🤖</div>
        <div>
          <p className="text-sm font-bold text-slate-100">AI Mentor</p>
          <p className="text-xs text-slate-600">Knows your history · Personalized guidance</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">Online</span>
        </div>
      </div>

      {/* Context bar */}
      <div className="px-5 py-3 border-b border-white/5 bg-white/[0.01]">
        <p className="text-xs text-slate-600">
          Mentor knows: <span className="text-slate-400">Level: {mockUser.level}</span>
          {' · '}<span className="text-slate-400">Weak: {mockWeakAreas.map(a => a.name).join(', ')}</span>
          {' · '}<span className="text-slate-400">Streak: {mockUser.streak}d</span>
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-indigo-500/20 border border-indigo-500/30 text-slate-200 rounded-br-sm'
                : 'glass text-slate-300 rounded-bl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="px-5 pt-3 flex flex-wrap gap-2">
        {mockMentorSuggestions.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="text-xs px-3 py-1.5 glass rounded-full text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-all duration-200"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask your mentor anything..."
          className="flex-1 glass rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/40 bg-transparent transition-all duration-200"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity glow-btn"
        >
          Send
        </button>
      </div>
    </div>
  )
}
