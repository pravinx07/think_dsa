import { useData } from '../../contexts/DataContext'

function AreaCard({ name, emoji, mastery, isStrong }: { name: string; emoji: string; mastery: number; isStrong: boolean }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-slate-200 truncate">{name}</span>
          <span className={`text-xs font-bold ${isStrong ? 'text-emerald-400' : 'text-red-400'}`}>{mastery}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isStrong ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`}
            style={{ width: `${mastery}%` }}
          />
        </div>
      </div>
      <span className="text-base">{isStrong ? '' : ''}</span>
    </div>
  )
}

export default function StrengthAnalysis() {
  const { data } = useData()
  const mockStrongAreas = data.strongAreas || []
  const mockWeakAreas = data.weakAreas || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Strong Areas */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-sm"></div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Strong Areas</h3>
            <p className="text-xs text-slate-600">Mastery &gt; 60%</p>
          </div>
        </div>
        {mockStrongAreas.map((a: any) => (
          <AreaCard key={a.name} {...a} isStrong={true} />
        ))}
      </div>

      {/* Weak Areas */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center text-sm"></div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Weak Areas</h3>
            <p className="text-xs text-slate-600">Needs practice</p>
          </div>
        </div>
        {mockWeakAreas.map((a: any) => (
          <AreaCard key={a.name} {...a} isStrong={false} />
        ))}
      </div>
    </div>
  )
}
