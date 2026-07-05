import PatternMastery from '../../components/dashboard/PatternMastery'
import WeaknessInsights from '../../components/dashboard/WeaknessInsights'
import HintDependency from '../../components/dashboard/HintDependency'
import PatternRadarChart from '../../components/dashboard/PatternRadarChart'

export default function Analytics() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Deep dive into your DSA performance patterns</p>
      </div>

      {/* Radar Chart — visual overview of all patterns */}
      <PatternRadarChart />

      {/* Bar-chart mastery — detailed breakdown */}
      <PatternMastery />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeaknessInsights />
        <HintDependency />
      </div>
    </div>
  )
}
