import { LayoutGrid, Star, Layers, Bookmark } from 'lucide-react'

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: number
  iconColor: string
}

function StatCard({ icon: Icon, label, value, iconColor }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3">
      <div className="rounded-md p-2 bg-muted">
        <Icon className="size-4" style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}

interface StatsCardsProps {
  totalItems: number
  totalCollections: number
  favoriteItems: number
  favoriteCollections: number
}

export function StatsCards({
  totalItems,
  totalCollections,
  favoriteItems,
  favoriteCollections,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard icon={LayoutGrid} label="Total Items" value={totalItems} iconColor="#3b82f6" />
      <StatCard icon={Layers} label="Collections" value={totalCollections} iconColor="#8b5cf6" />
      <StatCard icon={Star} label="Favorite Items" value={favoriteItems} iconColor="#f59e0b" />
      <StatCard icon={Bookmark} label="Fav Collections" value={favoriteCollections} iconColor="#10b981" />
    </div>
  )
}
