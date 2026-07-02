import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/topbar'
import { mockDashboardStats } from '@/lib/mock-data'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FB]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar unreadAlerts={mockDashboardStats.unreadAlerts} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
