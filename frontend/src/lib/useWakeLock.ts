import { useEffect, useRef } from 'react'
import { requestWakeLock } from './wakeLock'

export function useWakeLock(enabled = true): void {
  const sentinelRef = useRef<Awaited<ReturnType<typeof requestWakeLock>>>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    let disposed = false

    const acquire = () => {
      if (disposed || document.visibilityState !== 'visible') {
        return
      }
      void requestWakeLock().then((sentinel) => {
        if (!sentinel) {
          return
        }
        if (disposed) {
          void sentinel.release()
          return
        }
        sentinelRef.current = sentinel
      })
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        acquire()
      }
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      const sentinel = sentinelRef.current
      sentinelRef.current = null
      if (sentinel && !sentinel.released) {
        void sentinel.release()
      }
    }
  }, [enabled])
}
