import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { getSidebarData } from '@/lib/db/items'
import { auth } from '@/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarData, session] = await Promise.all([getSidebarData(), auth()])
  const user = session?.user
    ? { name: session.user.name ?? null, email: session.user.email ?? null, image: session.user.image ?? null }
    : null
  return <DashboardShell sidebarData={sidebarData} user={user}>{children}</DashboardShell>
}
