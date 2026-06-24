import { useData } from '../../contexts/DataContext'

export default function HintDependency() {
  const { data } = useData()
  const mockHintStats = data.hintStats || { dependencyPercent: 0, thisWeek: { withHint: 0, withoutHint: 0 } }
  const { dependencyPercent, solvedWithoutHint, totalSolved, avgHintsPerProblem, thisWeek } = mockHintStats
  const independencePercent = 100 - dependencyPercent

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-sm"></div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Hint Dependency</h3>
          <p className="text-xs text-slate-600">How independent is your problem-solving?</p>
        </div>
      </div>

      {/* Donut-style ring */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke="url(#green-grad)" strokeWidth="3"
              strokeDasharray={`${independencePercent} 100`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="green-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black text-emerald-400">{independencePercent}%</span>
            <span className="text-[9px] text-slate-600 leading-tight text-center">independent</span>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Solved without hint</span>
            <span className="text-sm font-bold text-emerald-400">{solvedWithoutHint}/{totalSolved}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Hint dependency</span>
            <span className="text-sm font-bold text-amber-400">{dependencyPercent}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Avg hints/problem</span>
            <span className="text-sm font-bold text-slate-300">{avgHintsPerProblem}</span>
          </div>
        </div>
      </div>

      {/* This week */}
      <div className="glass rounded-xl p-4">
        <p className="text-xs text-slate-600 font-semibold mb-3 uppercase tracking-widest">This Week</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-xl font-black text-emerald-400">{thisWeek.withoutHint}</p>
            <p className="text-xs text-slate-600">Without Hint </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-amber-400">{thisWeek.withHint}</p>
            <p className="text-xs text-slate-600">With Hint </p>
          </div>
        </div>
      </div>
    </div>
  )
}
