'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const ERROR_MESSAGES: Record<string, string> = {
  expired: 'Your verification link has expired. Request a new one below.',
  invalid: 'This verification link is invalid. Request a new one below.',
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email') ?? ''
  const errorParam = searchParams.get('error') ?? ''

  const [email, setEmail] = useState(emailParam)
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [resendError, setResendError] = useState('')

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setResendError('')
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResendError(data.error ?? 'Something went wrong.')
        setStatus('error')
        return
      }
      setStatus('sent')
    } catch {
      setResendError('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Check your email</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We sent a verification link to{' '}
          {emailParam ? (
            <span className="font-medium text-foreground">{emailParam}</span>
          ) : (
            'your email address'
          )}
          . Click the link to activate your account.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        {errorParam && ERROR_MESSAGES[errorParam] && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {ERROR_MESSAGES[errorParam]}
          </p>
        )}

        {status === 'sent' ? (
          <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            Verification email sent — check your inbox.
          </p>
        ) : (
          <form onSubmit={handleResend} className="space-y-3">
            <p className="text-sm text-muted-foreground">Didn&apos;t receive the email?</p>
            {resendError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {resendError}
              </p>
            )}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <Button type="submit" variant="outline" className="w-full" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending…' : 'Resend verification email'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
