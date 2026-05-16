import { Search, Plus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center border-b border-border px-4">
        <div className="flex flex-1 items-center">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            DevStash
          </span>
        </div>

        <div className="relative w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-8 h-7 text-sm bg-muted/40 border-border"
          />
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Button variant="outline" size="sm">
            <FolderPlus />
            New Collection
          </Button>
          <Button size="sm">
            <Plus />
            New Item
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 shrink-0 border-r border-border p-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Sidebar</h2>
        </aside>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}