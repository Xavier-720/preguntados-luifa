import { useEffect, useState } from 'react'

/**
 * Milisegundos restantes hasta `expiresAt`. Cuando `enabled` pasa a false el
 * valor queda congelado en el último tick (así el temporizador no sigue
 * corriendo mientras se muestra la respuesta).
 */
export function useCountdown(expiresAt: string | undefined, enabled: boolean): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!enabled) {
      return
    }

    const interval = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(interval)
  }, [enabled, expiresAt])

  if (!expiresAt) {
    return 0
  }

  const target = Date.parse(expiresAt)
  if (Number.isNaN(target)) {
    return 0
  }

  return Math.max(0, target - now)
}
