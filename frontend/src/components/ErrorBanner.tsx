import { AlertTriangle, X } from 'lucide-react'
import { cn } from '../lib/cn'

interface ErrorBannerProps {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function ErrorBanner({ message, onRetry, onDismiss, className }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-left text-sm text-red-50',
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 size-5 flex-none text-bad" aria-hidden="true" />
      <p className="flex-1 leading-snug">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="flex-none font-bold uppercase tracking-wide text-led hover:text-white"
        >
          Reintentar
        </button>
      ) : null}
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar aviso"
          className="flex-none rounded text-red-100/80 hover:text-white"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
