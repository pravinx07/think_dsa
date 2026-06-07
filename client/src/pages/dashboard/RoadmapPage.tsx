import RoadmapComponent from '../../components/dashboard/Roadmap'

export default function RoadmapPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">My Roadmap</h1>
        <p className="text-slate-500 text-sm mt-1">AI-generated 8-week plan adapted to your strengths and gaps</p>
      </div>
      <RoadmapComponent />
    </div>
  )
}
