const steps = [
  {
    num: '01',
    icon: '🧩',
    title: 'Open any LeetCode problem',
    desc: 'The ThinkDSA sidebar activates automatically on any LeetCode problem page — no extra setup needed.',
  },
  {
    num: '02',
    icon: '⚡',
    title: 'ThinkDSA Extension kicks in',
    desc: 'It reads the problem, detects the pattern category, and arms your personal AI mentor with full context.',
  },
  {
    num: '03',
    icon: '🚀',
    title: 'Personalized Growth',
    desc: 'Get tailored hints, track mastery per pattern, and watch your thinking evolve session after session.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 bg-gradient-to-b from-[#050510] to-[#07071a]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="badge-shimmer inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-5">
            ✦ How it works
          </span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-tight leading-tight mb-4">
            Three steps to
            <br />
            <span className="text-gradient">transform your practice</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-16">
          {steps.map((step) => (
            <div key={step.num} className="glass-card rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border-2 border-indigo-500/30 flex items-center justify-center text-3xl mx-auto mb-5">
                {step.icon}
              </div>
              <p className="text-xs font-bold text-indigo-400 tracking-[2px] uppercase mb-2">Step {step.num}</p>
              <h3 className="text-lg font-bold text-slate-100 mb-3 leading-snug">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Flow diagram */}
        <div className="glass max-w-sm mx-auto rounded-2xl p-8 text-center">
          <div className="font-mono text-sm space-y-2">
            <p className="text-indigo-400 font-semibold text-base">LeetCode Problem</p>
            <p className="text-slate-600 text-xl">↓</p>
            <p className="text-violet-400 font-semibold text-base">ThinkDSA Extension</p>
            <p className="text-slate-600 text-xl">↓</p>
            <p className="text-emerald-400 font-semibold text-base">Personalized Growth</p>
          </div>
        </div>
      </div>
    </section>
  )
}
