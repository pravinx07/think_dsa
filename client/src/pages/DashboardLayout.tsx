import { Outlet } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#050510] text-slate-100">
      <Sidebar />

      {/* Main content — offset by sidebar width on desktop */}
      <main className="md:ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
