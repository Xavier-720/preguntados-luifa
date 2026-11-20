import { describe, expect, it } from 'vitest'
import {
  computeTargetRotation,
  indexAtRotation,
  labelLines,
  polarPoint,
  segmentAngle,
} from './wheel'

describe('segmentAngle', () => {
  it('reparte la circunferencia entre los segmentos', () => {
    expect(segmentAngle(5)).toBe(72)
    expect(segmentAngle(4)).toBe(90)
  })

  it('no divide por cero', () => {
    expect(segmentAngle(0)).toBe(360)
  })
})

describe('computeTargetRotation', () => {
  it.each([0, 1, 2, 3, 4])('deja el segmento %i debajo del puntero', (index) => {
    const rotation = computeTargetRotation(0, index, 5)
    expect(indexAtRotation(rotation, 5)).toBe(index)
  })

  it('respeta el desplazamiento dentro del segmento', () => {
    for (const index of [0, 1, 2, 3, 4]) {
      const rotation = computeTargetRotation(0, index, 5, 3, 0.7)
      expect(indexAtRotation(rotation, 5)).toBe(index)
    }
  })

  it('siempre suma al menos una vuelta completa', () => {
    const rotation = computeTargetRotation(720, 0, 5, 0)
    expect(rotation).toBeGreaterThan(720)
  })

  it('funciona con rotaciones negativas', () => {
    const rotation = computeTargetRotation(-200, 3, 5)
    expect(indexAtRotation(rotation, 5)).toBe(3)
  })

  it('no se mueve si no hay categorías', () => {
    expect(computeTargetRotation(123, 2, 0)).toBe(123)
  })
})

describe('indexAtRotation', () => {
  it('calcula el segmento en el puntero', () => {
    expect(indexAtRotation(0, 5)).toBe(0)
    expect(indexAtRotation(-72, 5)).toBe(1)
    expect(indexAtRotation(360 - 72 * 4, 5)).toBe(4)
  })

  it('normaliza rotaciones vueltas', () => {
    expect(indexAtRotation(360 * 12, 5)).toBe(0)
    expect(indexAtRotation(-360 * 3 - 72, 5)).toBe(1)
  })

  it('acota índices con rotaciones extremas', () => {
    expect(indexAtRotation(0.0001, 5)).toBe(4)
    expect(indexAtRotation(-0.0001, 5)).toBe(0)
  })
})

describe('polarPoint', () => {
  it('ubica el cero arriba', () => {
    expect(polarPoint(0, 100)).toEqual({ x: 0, y: -100 })
  })

  it('avanza en sentido horario', () => {
    const point = polarPoint(90, 100)
    expect(point.x).toBeCloseTo(100)
    expect(point.y).toBeCloseTo(0)
  })
})

describe('labelLines', () => {
  it('deja las etiquetas cortas en una línea', () => {
    expect(labelLines('Selección')).toEqual(['Selección'])
    expect(labelLines('Mundiales')).toEqual(['Mundiales'])
  })

  it('parte etiquetas largas en dos líneas equilibradas', () => {
    expect(labelLines('Clubes del mundo')).toEqual(['Clubes', 'del mundo'])
  })
})
