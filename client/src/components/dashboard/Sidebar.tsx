import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BarChart3, Bot, Map, History, Users } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
  { to: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, end: false },
  { to: '/dashboard/mentor', label: 'AI Mentor', icon: <Bot className="w-4 h-4" />, end: false },
  { to: '/dashboard/roadmap', label: 'Roadmap', icon: <Map className="w-4 h-4" />, end: false },
  { to: '/dashboard/history', label: 'History', icon: <History className="w-4 h-4" />, end: false },
  { to: '/dashboard/challenge', label: 'Study Buddy', icon: <Users className="w-4 h-4" />, end: false },
]

export default function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-[#07071a] border-r border-white/5 fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_16px_rgba(99,102,241,0.4)]">
            ⟨/⟩
          </div>
          <span className="font-bold text-base tracking-tight">
            <span className="text-gradient-brand">Think</span>
            <span className="text-slate-100">DSA</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }: { isActive: boolean }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Extension badge */}
        <div className="px-3 pb-6">
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500 mb-2">Extension Status</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs text-amber-400 font-medium">Not Connected</span>
            </div>
            <a href="#" className="mt-2 block text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Install Extension →
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#07071a]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }: { isActive: boolean }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive ? 'text-indigo-400' : 'text-slate-600'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
