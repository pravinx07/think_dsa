import { useEffect, useState } from 'react'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${scrolled ? 'bg-[#050510]/85 backdrop-blur-xl border-b border-white/5' : ''}`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            ⟨/⟩
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-gradient-brand">Think</span>
            <span className="text-slate-100">DSA</span>
          </span>
        </div>

        {/* Links & Auth */}
        <div className="flex items-center gap-3">
          <a
            href="#features"
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-100 border border-white/10 rounded-xl hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-100 border border-white/10 rounded-xl hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200"
          >
            How it works
          </a>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Log In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                id="nav-get-started"
                className="glow-btn px-5 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500"
              >
                Get Started →
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <a
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 rounded-xl hover:bg-indigo-500/10 transition-all duration-200 mr-2"
            >
              Dashboard
            </a>
            <UserButton />
          </Show>
        </div>
      </div>
    </nav>
  )
}
