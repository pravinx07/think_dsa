import { mockUser } from '../../data/mockData'

export default function DashboardHeader() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      {/* Welcome */}
      <div>
        <p className="text-slate-500 text-sm mb-1">{greeting} 👋</p>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-100">
          Welcome back, <span className="text-gradient-brand">{mockUser.name}</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Keep going — you're on a <span className="text-amber-400 font-semibold">{mockUser.streak}-day streak</span> 🔥
        </p>
      </div>

      {/* Level + Streak badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="glass rounded-xl px-4 py-2.5 text-center">
          <p className="text-xs text-slate-600 mb-0.5">Level</p>
          <p className="text-sm font-bold text-violet-400">{mockUser.level}</p>
        </div>
        <div className="glass rounded-xl px-4 py-2.5 text-center">
          <p className="text-xs text-slate-600 mb-0.5">Streak</p>
          <p className="text-sm font-bold text-amber-400">{mockUser.streak} 🔥</p>
        </div>
      </div>
    </div>
  )
}
