'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/topbar'
import { useAuth } from '@/lib/auth-context'
import { canAccessPath, getAlertsForUser, getRoleHome } from '@/lib/access-control'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
      return
    }

    if (!loading && user && !canAccessPath(user.role, pathname)) {
      router.replace(getRoleHome(user.role))
    }
  }, [user, loading, pathname, router])

  if (loading || !user || !canAccessPath(user.role, pathname)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FB]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FB]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar unreadAlerts={getAlertsForUser(user).filter(alert => !alert.is_read && !alert.is_resolved).length} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
