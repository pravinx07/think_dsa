export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 bg-[#050510]">
      <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs">
            ⟨/⟩
          </div>
          <span className="font-bold text-slate-500">ThinkDSA</span>
        </div>
        <p className="text-sm text-slate-700">
          © 2026 ThinkDSA · Built for thinkers, not memorizers.
        </p>
      </div>
    </footer>
  )
}
