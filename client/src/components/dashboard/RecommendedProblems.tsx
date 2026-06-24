import { useData } from '../../contexts/DataContext'

const difficultyStyle: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Hard: 'text-red-400 bg-red-500/10 border-red-500/20',
}

export default function RecommendedProblems() {
  const { data } = useData()
  const mockRecommendedProblems = data.recommendedProblems || []

  return (
    <div className="glass-card rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-sm"></div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Today's Recommendations</h3>
            <p className="text-xs text-slate-600">AI-picked for your growth</p>
          </div>
        </div>
        <span className="text-xs text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 rounded-full">AI Curated</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockRecommendedProblems.map((p) => (
          <div key={p.id} className="glass rounded-xl p-4 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{p.emoji}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${difficultyStyle[p.difficulty]}`}>
                {p.difficulty}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-100 mb-1 group-hover:text-indigo-300 transition-colors">{p.title}</p>
            <p className="text-xs text-slate-600 mb-3">{p.reason}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>{p.pattern}</span>
              <span>{p.estimatedTime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
