const stats = [
  { value: '50+', label: 'DSA Patterns Tracked' },
  { value: '10x', label: 'Faster Mastery' },
  { value: '300+', label: 'Problems Analyzed' },
  { value: '1', label: 'Click to Install' },
]

export default function Stats() {
  return (
    <div className="border-y border-white/5 bg-indigo-500/[0.03] py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="stat-gradient text-4xl font-black leading-none mb-2">{s.value}</p>
              <p className="text-sm text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
