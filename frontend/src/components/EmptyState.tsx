import { CircleAlert } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  title: string
  message: string
  onRetry?: () => void
}

export function EmptyState({ title, message, onRetry }: EmptyStateProps) {
  return (
    <div className="panel flex w-full max-w-lg flex-col items-center gap-4 px-6 py-10 text-center">
      <CircleAlert className="size-10 text-led" aria-hidden="true" />
      <h2 className="text-3xl">{title}</h2>
      <p className="lead">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}
