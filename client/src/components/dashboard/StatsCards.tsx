import { useData } from '../../contexts/DataContext'

export default function StatsCards() {
  const { data } = useData()
  const mockUser = data.user || {}

  const cards = [
    {
      label: 'Problems Solved',
      value: mockUser.problemsSolved,
      icon: '',
      sub: '+3 this week',
      iconBg: 'bg-emerald-500/15 border-emerald-500/25',
      color: 'text-emerald-400',
    },
    {
      label: 'Hints Used',
      value: mockUser.hintsUsed,
      icon: '',
      sub: '35% dependency',
      iconBg: 'bg-amber-500/15 border-amber-500/25',
      color: 'text-amber-400',
    },
    {
      label: 'Current Streak',
      value: `${mockUser.streak}d`,
      icon: '',
      sub: 'Personal best!',
      iconBg: 'bg-orange-500/15 border-orange-500/25',
      color: 'text-orange-400',
    },
    {
      label: 'Learning Level',
      value: mockUser.level,
      icon: '',
      sub: '70% to Advanced',
      iconBg: 'bg-violet-500/15 border-violet-500/25',
      color: 'text-violet-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((c) => (
        <div key={c.label} className="glass-card rounded-2xl p-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${c.iconBg} mb-4`}>
            {c.icon}
          </div>
          <p className={`text-2xl font-black ${c.color} mb-1`}>{c.value}</p>
          <p className="text-xs font-semibold text-slate-300 mb-0.5">{c.label}</p>
          <p className="text-xs text-slate-600">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
