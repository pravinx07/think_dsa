const features = [
  {
    icon: '💡',
    iconBg: 'bg-indigo-500/15 border border-indigo-500/25',
    title: 'Guided Hints',
    desc: 'Stuck? Get progressive, Socratic hints that guide your thinking — not the answer. Build real intuition, problem by problem.',
  },
  {
    icon: '🧩',
    iconBg: 'bg-violet-500/15 border border-violet-500/25',
    title: 'Pattern Mastery',
    desc: 'Automatically tag every problem by pattern. Track sliding window, DP, and graph skills separately with visual dashboards.',
  },
  {
    icon: '📈',
    iconBg: 'bg-emerald-500/12 border border-emerald-500/20',
    title: 'Progress Tracking',
    desc: 'See exactly how your mastery grows over time. Identify weak spots, review your struggles, and improve with data-backed insights.',
  },
  {
    icon: '🤖',
    iconBg: 'bg-amber-500/12 border border-amber-500/20',
    title: 'AI Mentor',
    desc: 'An AI that knows your history. It remembers your patterns, nudges you toward first-principles thinking, and celebrates growth.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-28 bg-[#050510]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="badge-shimmer inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-5">
            ✦ Core Features
          </span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-tight leading-tight mb-4">
            Everything you need to
            <br />
            <span className="text-gradient">actually get better</span>
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed">
            Not just another LeetCode tracker. ThinkDSA changes how you approach every problem.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass-card rounded-2xl p-7">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 ${f.iconBg}`}>
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-3">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
