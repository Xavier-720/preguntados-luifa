import { useId } from 'react'
import { labelLines, polarPoint, segmentAngle } from '../lib/wheel'

interface WheelCategory {
  id: number
  name: string
  color: string
}

interface WheelProps {
  categories: WheelCategory[]
  rotation: number
  spinning: boolean
  roundNumber: number
  totalRounds: number
}

const RADIUS = 96

export function Wheel({ categories, rotation, spinning, roundNumber, totalRounds }: WheelProps) {
  const gradientId = `wheel-shade-${useId().replace(/:/g, '')}`
  const segment = segmentAngle(categories.length)

  const segments = categories.map((category, index) => {
    const start = index * segment - segment / 2
    const end = start + segment
    const from = polarPoint(start, RADIUS)
    const to = polarPoint(end, RADIUS)
    const largeArc = segment > 180 ? 1 : 0

    return {
      category,
      path: `M 0 0 L ${from.x} ${from.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${to.x} ${to.y} Z`,
      label: polarPoint(index * segment, 61),
      lines: labelLines(category.name.toUpperCase()),
    }
  })

  const labelSize = (lines: string[]) => {
    const longest = Math.max(...lines.map((line) => line.length))
    if (longest > 12) {
      return 7.2
    }
    if (longest > 9) {
      return 8.4
    }
    return 10
  }

  return (
    <div
      className="wheel-shell"
      role="img"
      aria-label={`Ruleta de categorías: ${categories.map((category) => category.name).join(', ')}`}
    >
      <div
        className="wheel-rotor"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? 'transform 1350ms cubic-bezier(0.12, 0.72, 0.12, 1)' : 'none',
        }}
      >
        <svg viewBox="-110 -110 220 220" className="size-full" aria-hidden="true">
          <defs>
            <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
              <stop offset="52%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.24" />
            </radialGradient>
          </defs>

          <circle r={RADIUS} fill="#07130e" />

          {segments.map(({ category, path }) => (
            <path
              key={category.id}
              d={path}
              fill={category.color}
              stroke="#07130e"
              strokeWidth={2.4}
              strokeLinejoin="round"
            />
          ))}

          <circle r={RADIUS} fill={`url(#${gradientId})`} />

          {segments.map(({ category, label, lines }) => {
            const fontSize = labelSize(lines)

            return (
              <g key={category.id}>
                {lines.map((line, lineIndex) => (
                  <text
                    key={`${line}-${lineIndex}`}
                    x={label.x}
                    y={lines.length === 1 ? label.y : label.y - 4 + lineIndex * (fontSize + 1)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#07130e"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 900,
                      fontSize,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {line}
                  </text>
                ))}
              </g>
            )
          })}

          <circle r={RADIUS} fill="none" stroke="#07130e" strokeWidth={3} />
          <circle r={RADIUS - 1.5} fill="none" stroke="#eef5ec" strokeOpacity={0.18} strokeWidth={0.8} />
        </svg>
      </div>

      <div className="wheel-pointer" aria-hidden="true" />
      <div className="wheel-hub" aria-hidden="true">
        {roundNumber}/{totalRounds}
      </div>
    </div>
  )
}
