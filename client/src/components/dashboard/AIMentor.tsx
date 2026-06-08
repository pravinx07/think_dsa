import { useState, useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import { useData } from '../../contexts/DataContext'

type Message = { role: 'user' | 'assistant'; content: string }

export default function AIMentor() {
  const { data } = useData()
  const mockUser = data.user || { level: 'Unknown', streak: 0 }
  const mockWeakAreas = data.weakAreas || []
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! 👋 I've analyzed your progress. Let me know what you want to practice or if you need help with a problem.",
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { fetchApi } = useApi()

  const mockMentorSuggestions = [
    'Why am I bad at DP?',
    'How do I approach Graph problems?',
    'What should I focus on this week?',
  ]

  const send = async (text?: string) => {
    const msg = text ?? input.trim()
    if (!msg) return
    
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setInput('')
    setLoading(true)
    
    try {
      const data = await fetchApi('/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          message: msg,
          context: { level: mockUser.level, weakAreas: mockWeakAreas.map(a => a.name).join(', ') }
        })
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I couldn't connect to the server." }]);
    } finally {
      setLoading(false)
    }
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
