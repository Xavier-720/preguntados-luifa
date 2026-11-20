import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function initialValue(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia(QUERY).matches
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(initialValue)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia(QUERY)
    const update = () => setReduced(mediaQuery.matches)
    update()
    mediaQuery.addEventListener('change', update)

    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return reduced
}
