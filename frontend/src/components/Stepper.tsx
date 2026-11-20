import { Minus, Plus } from 'lucide-react'
import { useId } from 'react'

interface StepperProps {
  label: string
  hint?: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
  disabled?: boolean
}

export function Stepper({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
  disabled = false,
}: StepperProps) {
  const labelId = useId()
  const clamp = (next: number) => Math.min(max, Math.max(min, next))

  return (
    <div className="flex flex-col gap-2 border-b border-white/8 py-4 last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p id={labelId} className="font-semibold text-chalk">
            {label}
          </p>
          {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
        </div>
        <div className="flex flex-none items-center gap-2" role="group" aria-labelledby={labelId}>
          <button
            type="button"
            className="stepper-btn"
            onClick={() => onChange(clamp(value - step))}
            disabled={disabled || value <= min}
            aria-label={`Restar ${label}`}
          >
            <Minus className="size-5" strokeWidth={3} aria-hidden="true" />
          </button>
          <output className="stepper-value" aria-live="polite">
            {value}
            {suffix ? <span className="ml-1 text-sm text-muted">{suffix}</span> : null}
          </output>
          <button
            type="button"
            className="stepper-btn"
            onClick={() => onChange(clamp(value + step))}
            disabled={disabled || value >= max}
            aria-label={`Sumar ${label}`}
          >
            <Plus className="size-5" strokeWidth={3} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
