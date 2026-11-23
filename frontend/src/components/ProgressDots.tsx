import { Check, X } from 'lucide-react'
import { cn } from '../lib/cn'

interface ProgressDotsProps {
  results: boolean[]
  total: number
  active?: number
}

export function ProgressDots({ results, total, active }: ProgressDotsProps) {
  const correct = results.filter(Boolean).length

  return (
    <div
      className="flex items-center justify-center gap-2.5"
      role="img"
      aria-label={`${correct} aciertos de ${total} preguntas`}
    >
      {Array.from({ length: total }, (_, index) => {
        const answered = index < results.length
        const isCorrect = answered && results[index]
        const isActive = !answered && index === active

        return (
          <span
            key={index}
            className={cn(
              'grid size-5 place-items-center rounded-full border-2 transition-colors sm:size-6',
              isCorrect && 'border-ok bg-ok text-night',
              answered && !isCorrect && 'border-bad bg-bad text-white',
              isActive && 'animate-pulse-soft border-led bg-led/20 text-led',
              !answered && !isActive && 'border-chalk/40 bg-transparent text-transparent',
            )}
          >
            {isCorrect ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : null}
            {answered && !isCorrect ? (
              <X className="size-3.5" strokeWidth={3} aria-hidden="true" />
            ) : null}
          </span>
        )
      })}
    </div>
  )
}
