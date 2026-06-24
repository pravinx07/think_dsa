import { useData } from '../../contexts/DataContext'

const difficultyStyle: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Hard: 'text-red-400 bg-red-500/10 border-red-500/20',
}

export default function RecentActivity() {
  const { data } = useData()
  const mockRecentActivity = data.history || data.recentActivity || []

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-slate-500/15 border border-slate-500/25 flex items-center justify-center text-sm">⏱</div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Recent Activity</h3>
          <p className="text-xs text-slate-600">Your last {mockRecentActivity.length} sessions</p>
        </div>
      </div>

      <div className="space-y-3">
        {mockRecentActivity.map((item) => (
          <div key={item.id} className="flex items-start gap-4 p-4 glass rounded-xl hover:border-white/10 transition-all duration-200">
            {/* Status dot */}
            <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${item.solved ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-red-400 shadow-[0_0_6px_#f87171]'}`} />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-slate-200">{item.title}</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${difficultyStyle[item.difficulty]}`}>{item.difficulty}</span>
                {item.hintUsed && (
                  <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full"> Hint used</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span> {item.pattern}</span>
                <span> {item.timeSpent}</span>
                <span> {item.date}</span>
              </div>
              {item.mistake && (
                <p className="mt-1.5 text-xs text-red-400/80 bg-red-500/5 border border-red-500/10 rounded-lg px-2.5 py-1.5">
                   {item.mistake}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
