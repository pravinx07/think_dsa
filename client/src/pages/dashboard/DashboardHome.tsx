import { useData } from '../../contexts/DataContext'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import StatsCards from '../../components/dashboard/StatsCards'
import StrengthAnalysis from '../../components/dashboard/StrengthAnalysis'
import RecommendedProblems from '../../components/dashboard/RecommendedProblems'
import RecentActivity from '../../components/dashboard/RecentActivity'
import EmptyState from '../../components/dashboard/EmptyState'
import DailyReview from '../../components/dashboard/DailyReview'

export default function DashboardHome() {
  const { data, loading, error } = useData()

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-slate-400">Loading dashboard...</div>
  }
  
  if (error) {
    return <div className="min-h-[70vh] flex items-center justify-center text-red-400">{error}</div>
  }

  if (!data?.user?.hasActivity) return <EmptyState />

  return (
    <div>
      <DashboardHeader />
      <StatsCards />
      <DailyReview />
      <StrengthAnalysis />
      <RecommendedProblems />
      <RecentActivity />
    </div>
  )
}
