/**
 * Mantiene la pantalla encendida durante la partida. Es opcional: si el
 * navegador no lo soporta (o no hay HTTPS) falla en silencio.
 */
export function requestWakeLock(): Promise<WakeLockSentinel | null> {
  if (!('wakeLock' in navigator)) {
    return Promise.resolve(null)
  }

  return navigator.wakeLock.request('screen').catch(() => null)
}
