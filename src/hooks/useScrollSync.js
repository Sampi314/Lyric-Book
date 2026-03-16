import { useEffect, useRef } from 'react'

export function useScrollSync() {
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const isSyncing = useRef(false)

  useEffect(() => {
    const left = leftRef.current
    const right = rightRef.current
    if (!left || !right) return

    const handleScroll = () => {
      if (isSyncing.current) return

      const maxScroll = left.scrollHeight - left.clientHeight
      if (maxScroll <= 0) return

      isSyncing.current = true
      const scrollPct = left.scrollTop / maxScroll
      right.scrollTop = scrollPct * (right.scrollHeight - right.clientHeight)

      requestAnimationFrame(() => {
        isSyncing.current = false
      })
    }

    left.addEventListener('scroll', handleScroll, { passive: true })
    return () => left.removeEventListener('scroll', handleScroll)
  }, [])

  return { leftRef, rightRef }
}
