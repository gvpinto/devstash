'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'
import { UserAvatar } from '@/components/ui/user-avatar'

interface UserDropdownProps {
  name: string | null
  email: string | null
  image: string | null
}

export function UserDropdown({ name, email, image }: UserDropdownProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-sidebar-accent transition-colors cursor-pointer text-left"
      >
        <UserAvatar name={name} image={image} className="size-6 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight text-sidebar-foreground truncate">
            {name ?? 'User'}
          </p>
          <p className="text-[11px] text-sidebar-foreground/40 truncate">{email}</p>
        </div>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-md border border-sidebar-border bg-sidebar shadow-lg overflow-hidden z-50">
          <button
            onClick={() => {
              setOpen(false)
              router.push('/profile')
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <User className="size-3.5 shrink-0" />
            Profile
          </button>
          <div className="border-t border-sidebar-border" />
          <button
            onClick={() => signOut({ callbackUrl: '/sign-in' })}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="size-3.5 shrink-0" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
