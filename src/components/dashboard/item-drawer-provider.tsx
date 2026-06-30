'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { ItemDrawer } from './item-drawer'

interface DrawerContextValue {
  openDrawer: (itemId: string) => void
}

const DrawerContext = createContext<DrawerContextValue | null>(null)

export function useItemDrawer() {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('useItemDrawer must be used inside ItemDrawerProvider')
  return ctx
}

export function ItemDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [itemId, setItemId] = useState<string | null>(null)

  const openDrawer = useCallback((id: string) => {
    setItemId(id)
    setOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <DrawerContext.Provider value={{ openDrawer }}>
      {children}
      <ItemDrawer open={open} itemId={itemId} onClose={closeDrawer} />
    </DrawerContext.Provider>
  )
}
