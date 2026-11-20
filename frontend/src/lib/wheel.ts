/**
 * La ruleta dibuja el segmento 0 centrado arriba (donde está el puntero) cuando
 * la rotación es 0. Cada segmento ocupa `360 / count` grados en sentido horario.
 */

export function segmentAngle(count: number): number {
  return count > 0 ? 360 / count : 360
}

/**
 * Devuelve la rotación final para que el segmento `index` quede debajo del
 * puntero, sumando vueltas completas para que el giro se sienta generoso.
 *
 * `offset` desplaza el descanso dentro del segmento (0 a 1) sin salirse de él.
 */
export function computeTargetRotation(
  currentRotation: number,
  index: number,
  count: number,
  turns = 4,
  offset = 0,
): number {
  if (count <= 0) {
    return currentRotation
  }

  const segment = segmentAngle(count)
  const safeIndex = ((index % count) + count) % count
  const clampedOffset = Math.min(Math.max(offset, 0), 0.8)
  const targetMod = (360 - safeIndex * segment - clampedOffset * segment + 720) % 360
  const currentMod = ((currentRotation % 360) + 360) % 360
  const delta = (targetMod - currentMod + 360) % 360

  return currentRotation + Math.max(turns, 1) * 360 + delta
}

/** Índice del segmento que está debajo del puntero para una rotación dada. */
export function indexAtRotation(rotation: number, count: number): number {
  if (count <= 0) {
    return 0
  }

  const segment = segmentAngle(count)
  const normalized = ((-rotation % 360) + 360) % 360

  return Math.min(Math.floor(normalized / segment), count - 1)
}

/** Punto sobre la circunferencia, con 0° arriba y ángulos en sentido horario. */
export function polarPoint(angleDegrees: number, radius: number): { x: number; y: number } {
  const radians = (angleDegrees * Math.PI) / 180
  return {
    x: Math.sin(radians) * radius,
    y: -Math.cos(radians) * radius,
  }
}

/** Divide una etiqueta larga en como máximo dos líneas. */
export function labelLines(label: string): string[] {
  const words = label.trim().split(/\s+/)
  if (words.length <= 1 || label.length <= 10) {
    return [label]
  }

  let best = 1
  let bestDifference = Number.POSITIVE_INFINITY
  for (let index = 1; index < words.length; index += 1) {
    const first = words.slice(0, index).join(' ')
    const second = words.slice(index).join(' ')
    const difference = Math.abs(first.length - second.length)
    if (difference < bestDifference) {
      bestDifference = difference
      best = index
    }
  }

  return [words.slice(0, best).join(' '), words.slice(best).join(' ')]
}
