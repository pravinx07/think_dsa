import { Show, SignUpButton } from '@clerk/react'

export default function CTA() {
  return (
    <section id="cta" className="py-28 relative overflow-hidden bg-[#050510]">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-indigo-500/8 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="glass max-w-2xl mx-auto rounded-3xl p-12 shadow-[0_0_80px_rgba(99,102,241,0.08),0_0_0_1px_rgba(99,102,241,0.15)]">
          {/* Logo icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-7 shadow-[0_0_40px_rgba(99,102,241,0.4)]">
            ⟨/⟩
          </div>

          <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-black tracking-tight leading-tight mb-4">
            Start <span className="text-gradient">thinking</span>,
            <br />stop memorizing.
          </h2>

          <p className="text-slate-500 text-base max-w-sm mx-auto leading-relaxed mb-10">
            Install the ThinkDSA Chrome extension and transform every LeetCode session into real learning.
          </p>

          <Show when="signed-out">
            <SignUpButton mode="modal">
              <button
                id="cta-install-btn"
                className="glow-btn inline-flex items-center gap-2.5 px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-lg cursor-pointer"
              >
              Start Learning Free
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <a
              id="cta-install-btn"
              href="/dashboard"
              className="glow-btn inline-flex items-center gap-2.5 px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-lg"
            >
              Go to Dashboard
            </a>
          </Show>

          <p className="text-slate-600 text-sm mt-6">
            Free to install · Works on Chrome · No account needed yet
          </p>
        </div>
      </div>
    </section>
  )
}
