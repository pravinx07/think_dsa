import { useData } from '../../contexts/DataContext'

const freqStyle: Record<string, string> = {
  High: 'text-red-400 bg-red-500/10 border-red-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}

export default function WeaknessInsights() {
  const { data } = useData()
  const mockWeaknessInsights = data.weaknessInsights || []

  return (
    <div className="glass-card rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-sm"></div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">AI Weakness Insights</h3>
          <p className="text-xs text-slate-600">Personalized analysis of your mistakes</p>
        </div>
      </div>

      {/* AI summary */}
      <div className="glass rounded-xl p-4 mb-5 border-indigo-500/20">
        <p className="text-xs text-indigo-400 font-semibold mb-2"> AI Analysis</p>
        <p className="text-sm text-slate-400 leading-relaxed">
          You often <span className="text-slate-200 font-medium">jump to brute force</span> before identifying the optimal pattern.
          Focus on pattern recognition as the first step before writing any code.
        </p>
      </div>

      <div className="space-y-3">
        {mockWeaknessInsights.map((insight: any) => (
          <div key={insight.issue} className="flex items-start gap-3 p-4 glass rounded-xl">
            <div className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-semibold text-slate-200">{insight.issue}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${freqStyle[insight.frequency]}`}>
                  {insight.frequency} frequency
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
