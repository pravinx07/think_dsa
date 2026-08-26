import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DashboardLayout from './pages/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import Analytics from './pages/dashboard/Analytics'
import MentorPage from './pages/dashboard/MentorPage'
import RoadmapPage from './pages/dashboard/RoadmapPage'
import HistoryPage from './pages/dashboard/HistoryPage'

import ChallengePage from './pages/dashboard/ChallengePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard — nested routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="mentor" element={<MentorPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="challenge" element={<ChallengePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
