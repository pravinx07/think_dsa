export default function EmptyState() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-lg w-full text-center px-6">
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/25 flex items-center justify-center text-4xl mx-auto mb-8">
          
        </div>

        <h2 className="text-2xl font-black text-slate-100 mb-3">Start your journey</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-10">
          No progress yet. Install the ThinkDSA extension and solve your first problem to unlock your personalized dashboard.
        </p>

        {/* Steps */}
        <div className="space-y-3 mb-10">
          {[
            { icon: '', title: 'Connect ThinkDSA Extension', desc: 'Install the Chrome extension to start tracking', done: false },
            { icon: '', title: 'Solve your first problem', desc: 'Open any LeetCode problem and start thinking', done: false },
            { icon: '', title: 'Watch your dashboard grow', desc: 'Patterns, insights, and AI guidance unlock automatically', done: false },
          ].map((step, i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">{step.icon}</div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{step.title}</p>
                <p className="text-xs text-slate-600">{step.desc}</p>
              </div>
              <div className="ml-auto w-5 h-5 rounded-full border border-white/10 shrink-0" />
            </div>
          ))}
        </div>

        <a
          href="#"
          className="glow-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold"
        >
        Install Extension
        </a>
      </div>
    </div>
  )
}
