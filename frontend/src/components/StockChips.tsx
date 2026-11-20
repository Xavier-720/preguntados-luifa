import { CapIcon, CupIcon } from './icons'
import { cn } from '../lib/cn'

interface StockChipsProps {
  hats: number
  cups: number
  className?: string
}

export function StockChips({ hats, cups, className }: StockChipsProps) {
  return (
    <div className={cn('flex items-center gap-1.5 sm:gap-2', className)}>
      <span
        className={cn('chip', hats === 0 && 'chip-empty')}
        aria-label={`${hats} ${hats === 1 ? 'gorra disponible' : 'gorras disponibles'}`}
        title="Gorras disponibles"
      >
        <CapIcon className="size-4 text-led" />
        {hats}
      </span>
      <span
        className={cn('chip', cups === 0 && 'chip-empty')}
        aria-label={`${cups} ${cups === 1 ? 'vaso disponible' : 'vasos disponibles'}`}
        title="Vasos disponibles"
      >
        <CupIcon className="size-4 text-led" />
        {cups}
      </span>
    </div>
  )
}
