import { cn } from '@/lib/utils'

interface UserAvatarProps {
  name: string | null
  image: string | null
  className?: string
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function UserAvatar({ name, image, className }: UserAvatarProps) {
  if (image) {
    return (
      <img
        src={image}
        alt={name ?? 'User'}
        className={cn('rounded-full object-cover', className)}
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-bold',
        className,
      )}
    >
      <span className="text-[11px] leading-none">{getInitials(name)}</span>
    </div>
  )
}
