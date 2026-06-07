import { mockUser } from '../../data/mockData'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import StatsCards from '../../components/dashboard/StatsCards'
import StrengthAnalysis from '../../components/dashboard/StrengthAnalysis'
import RecommendedProblems from '../../components/dashboard/RecommendedProblems'
import RecentActivity from '../../components/dashboard/RecentActivity'
import EmptyState from '../../components/dashboard/EmptyState'

export default function DashboardHome() {
  if (!mockUser.hasActivity) return <EmptyState />

  return (
    <div>
      <DashboardHeader />
      <StatsCards />
      <StrengthAnalysis />
      <RecommendedProblems />
      <RecentActivity />
    </div>
  )
}
