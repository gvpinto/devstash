'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function DeleteAccountSection() {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/account', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to delete account.')
        setLoading(false)
        return
      }
      await signOut({ callbackUrl: '/sign-in' })
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      {confirming ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 space-y-3">
          <p className="text-sm text-foreground">
            Are you sure? This will permanently delete your account and all your data. This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting…' : 'Yes, delete my account'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirming(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="destructive" onClick={() => setConfirming(true)}>
          Delete account
        </Button>
      )}
    </div>
  )
}
