import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  label?: string
}

export function LoadingState({ label = 'Cargando el estadio…' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center" role="status">
      <Loader2 className="size-9 animate-spin text-led" aria-hidden="true" />
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
    </div>
  )
}
