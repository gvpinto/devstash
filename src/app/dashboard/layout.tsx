import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { getSidebarData } from '@/lib/db/items'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sidebarData = await getSidebarData()
  return <DashboardShell sidebarData={sidebarData}>{children}</DashboardShell>
}
