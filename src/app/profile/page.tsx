import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { auth } from '@/auth'
import { getProfileData } from '@/lib/db/profile'
import { UserAvatar } from '@/components/ui/user-avatar'
import { ICON_MAP } from '@/lib/icon-map'
import { ChangePasswordForm } from './change-password-form'
import { DeleteAccountSection } from './delete-account-section'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const { user, totalItems, collectionCount, typeBreakdown, isEmailUser } =
    await getProfileData(session.user.id)

  if (!user) redirect('/sign-in')

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>

        {/* User info */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account</h2>
          <div className="flex items-center gap-4">
            <UserAvatar name={user.name} image={user.image} className="size-14 text-base" />
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">{user.name ?? '—'}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </section>

        {/* Usage stats */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Usage</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/40 px-4 py-3">
              <p className="text-2xl font-bold text-foreground">{totalItems}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total items</p>
            </div>
            <div className="rounded-lg bg-muted/40 px-4 py-3">
              <p className="text-2xl font-bold text-foreground">{collectionCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Collections</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">By type</p>
            <div className="space-y-1.5">
              {typeBreakdown.map((t) => {
                const Icon = ICON_MAP[t.icon]
                return (
                  <div key={t.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className="size-3.5" style={{ color: t.color }} />}
                      <span className="text-sm text-foreground">{t.name}s</span>
                    </div>
                    <span className="text-sm font-medium text-foreground tabular-nums">{t.count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Change password — email users only */}
        {isEmailUser && (
          <section className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Change password</h2>
            <ChangePasswordForm />
          </section>
        )}

        {/* Delete account */}
        <section className="rounded-xl border border-destructive/30 bg-card p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-destructive uppercase tracking-wider">Danger zone</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <DeleteAccountSection />
        </section>
      </div>
    </div>
  )
}
