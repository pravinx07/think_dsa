import { useData } from '../../contexts/DataContext'

function getMasteryLabel(mastery: number) {
  if (mastery >= 70) return { label: 'Strong', color: 'text-emerald-400' }
  if (mastery >= 45) return { label: 'Growing', color: 'text-amber-400' }
  return { label: 'Weak', color: 'text-red-400' }
}

export default function PatternMastery() {
  const { data } = useData()
  const mockPatterns = data.patterns || []

  return (
    <div className="glass-card rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-sm"></div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Pattern Mastery</h3>
          <p className="text-xs text-slate-600">Your skill level per DSA pattern</p>
        </div>
      </div>

      <div className="space-y-5">
        {mockPatterns.map((p) => {
          const { label, color } = getMasteryLabel(p.mastery)
          return (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200">{p.name}</span>
                  <span className={`text-xs font-semibold ${color}`}>{label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600">{p.solved} solved</span>
                  <span className={`text-sm font-bold ${color}`}>{p.mastery}%</span>
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${p.color} transition-all duration-700`}
                  style={{ width: `${p.mastery}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
