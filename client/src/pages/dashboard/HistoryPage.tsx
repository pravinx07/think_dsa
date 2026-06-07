import RecentActivity from '../../components/dashboard/RecentActivity'

export default function HistoryPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">Problem History</h1>
        <p className="text-slate-500 text-sm mt-1">Your full problem timeline with mistakes and reflections</p>
      </div>
      <RecentActivity />
    </div>
  )
}
