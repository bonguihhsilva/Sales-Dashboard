'use client'

import { useEffect, useState, useCallback } from 'react'

const KEY = 'gds:sidebar-collapsed'

export function useSidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY)
      if (stored !== null) setCollapsed(JSON.parse(stored) === true)
    } catch { /* localStorage unavailable */ }
    setHydrated(true)
  }, [])

  const toggle = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev
      try { window.localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* */ }
      return next
    })
  }, [])

  return { collapsed, toggle, hydrated }
}
