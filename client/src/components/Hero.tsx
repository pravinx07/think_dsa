import { Show, SignUpButton } from '@clerk/react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#050510] grid-bg pt-24 pb-20">
      {/* Ambient orbs */}
      <div className="animate-float-slow absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="animate-float-mid absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full bg-violet-500/10 blur-[90px] pointer-events-none" />
      <div className="animate-float-slow absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-emerald-400/6 blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center w-full">
        {/* Badge */}
        <div className="opacity-0 animate-fade-up delay-100 mb-8 flex justify-center">
          <span className="badge-shimmer inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-indigo-500/30 text-indigo-300 text-sm font-medium">
             Browser Extension for LeetCode
          </span>
        </div>

        {/* Headline */}
        <h1 className="opacity-0 animate-fade-up delay-200 text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[1.06] tracking-[-2px] mb-7">
          Learn DSA by{' '}
          <span className="text-gradient">thinking</span>,
          <br />not memorizing.
        </h1>

        {/* Sub-headline */}
        <p className="opacity-0 animate-fade-up delay-300 text-[clamp(1rem,2.5vw,1.2rem)] text-slate-400 max-w-xl mx-auto leading-relaxed mb-12">
          Track patterns. Master problem-solving.
          <br />
          <span className="text-slate-600">Stop grinding. Start understanding.</span>
        </p>

        {/* CTA buttons */}
        <div className="opacity-0 animate-fade-up delay-400 flex flex-wrap gap-4 justify-center mb-20">
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <button
                id="hero-get-started"
                className="glow-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-base"
              >
                Get Started Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <a
              id="hero-get-started"
              href="/dashboard"
              className="glow-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-base"
            >
              Go to Dashboard
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </Show>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 text-slate-300 font-medium text-base hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200"
          >
            See how it works
          </a>
        </div>

        {/* Preview card */}
        <div className="opacity-0 animate-fade-up delay-600">
          <div className="glass max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5),0_0_0_1px_rgba(99,102,241,0.15)]">
            {/* Window bar */}
            <div className="flex items-center gap-2 px-5 py-3 bg-white/[0.02] border-b border-white/5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-auto text-xs text-slate-600 font-mono">ThinkDSA Extension</span>
            </div>

            {/* Card content */}
            <div className="p-7 flex flex-col sm:flex-row gap-6">
              {/* Left: patterns */}
              <div className="flex-1">
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-widest mb-3">Problem Pattern</p>
                <div className="glass rounded-xl px-4 py-3 mb-2.5 flex items-center gap-3">
                  <span className="text-lg"></span>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Sliding Window</p>
                    <p className="text-xs text-slate-500">Mastery: 87%</p>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                </div>
                <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-lg"></span>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Tree Traversal</p>
                    <p className="text-xs text-slate-500">Mastery: 64%</p>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                </div>
              </div>

              {/* Right: AI hint */}
              <div className="flex-1">
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-widest mb-3">AI Hint</p>
                <div className="glass rounded-xl p-4 border-indigo-500/20">
                  <p className="text-xs text-indigo-400 font-semibold mb-2"> ThinkDSA suggests:</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Consider the two-pointer approach. What happens when you move the right pointer? Think about the window invariant first.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
