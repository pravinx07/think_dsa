import { useData } from '../../contexts/DataContext'

const statusConfig: Record<string, { label: string; dot: string; bar: string; text: string }> = {
  completed: { label: 'Done', dot: 'bg-emerald-400', bar: 'bg-emerald-500/20 border-emerald-500/20', text: 'text-emerald-400' },
  'in-progress': { label: 'In Progress', dot: 'bg-indigo-400 animate-pulse', bar: 'bg-indigo-500/15 border-indigo-500/25', text: 'text-indigo-400' },
  upcoming: { label: 'Upcoming', dot: 'bg-slate-700', bar: 'bg-white/[0.02] border-white/5', text: 'text-slate-600' },
}

export default function Roadmap() {
  const { data } = useData()
  const mockRoadmap = data.roadmap || []
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-sm"></div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">AI-Generated Roadmap</h3>
            <p className="text-xs text-slate-600">Adaptive 8-week DSA mastery plan</p>
          </div>
          <span className="ml-auto text-xs text-violet-400 border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 rounded-full">Adaptive</span>
        </div>
        <p className="text-sm text-slate-500 mt-4 leading-relaxed">
          Your roadmap is personalized based on your current strengths in <span className="text-emerald-400">Arrays</span> and <span className="text-emerald-400">Sliding Window</span>, and your weakness in <span className="text-red-400">DP</span> and <span className="text-red-400">Graphs</span>.
        </p>
      </div>

      {/* Weeks */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/40 via-indigo-500/20 to-transparent hidden md:block" />

        <div className="space-y-4">
          {mockRoadmap.map((item: any) => {
            const cfg = statusConfig[item.status]
            return (
              <div key={item.week} className={`flex gap-5 items-start p-5 rounded-2xl border ${cfg.bar} transition-all duration-200`}>
                {/* Dot */}
                <div className="relative hidden md:flex flex-col items-center shrink-0 mt-1">
                  <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Week {item.week}</span>
                    <span className={`text-xs font-semibold ${cfg.text}`}>· {cfg.label}</span>
                  </div>
                  <p className={`text-sm font-bold mb-1 ${item.status === 'upcoming' ? 'text-slate-500' : 'text-slate-100'}`}>{item.topic}</p>
                  <p className="text-xs text-slate-600">{item.problems} problems</p>
                </div>

                {item.status === 'completed' && <span className="text-lg mt-0.5"></span>}
                {item.status === 'in-progress' && <span className="text-lg mt-0.5"></span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
