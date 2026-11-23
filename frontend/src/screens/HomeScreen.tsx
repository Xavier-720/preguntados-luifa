import { Check, Shirt, Target, Timer } from 'lucide-react'
import { getErrorMessage } from '../api/client'
import { useConfig } from '../api/hooks'
import type { CategorySummary } from '../api/types'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { ErrorBanner } from '../components/ErrorBanner'
import { LoadingState } from '../components/LoadingState'
import { CapIcon, CupIcon } from '../components/icons'
import { useGame } from '../game/GameContext'

function PrizeMini({
  kind,
  label,
  stock,
}: {
  kind: 'hat' | 'cup'
  label: string
  stock: number
}) {
  const Icon = kind === 'hat' ? CapIcon : CupIcon

  return (
    <div className="panel-soft flex items-center gap-3 px-3 py-2.5">
      <span className="grid size-10 flex-none place-items-center rounded-full bg-led/15 text-led">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-lg font-black uppercase leading-none tracking-wide text-chalk">
          {label}
        </p>
        <p className={stock > 0 ? 'text-xs text-muted' : 'text-xs font-semibold text-bad'}>
          {stock > 0 ? `${stock} en stock` : 'Sin stock'}
        </p>
      </div>
    </div>
  )
}

function CategoryChip({ category }: { category: CategorySummary }) {
  return (
    <span className="rule-pill">
      <span
        className="size-2.5 rounded-full"
        style={{ backgroundColor: category.color }}
        aria-hidden="true"
      />
      {category.name}
      <span className="text-muted/70">{category.questionCount}</span>
    </span>
  )
}

export function HomeScreen() {
  const { startGame, pending, error, clearError } = useGame()
  const configQuery = useConfig()
  const starting = pending === 'starting'

  if (configQuery.isPending) {
    return <LoadingState />
  }

  if (configQuery.isError) {
    return (
      <EmptyState
        title="No pudimos cargar el juego"
        message={getErrorMessage(configQuery.error)}
        onRetry={() => void configQuery.refetch()}
      />
    )
  }

  const config = configQuery.data
  const noStock = config.stockHats === 0 && config.stockCups === 0
  const noCategories = config.categories.length === 0

  return (
    <section className="screen flex w-full flex-col items-center gap-5 sm:gap-6">
      <div className="grid w-full max-w-5xl items-center gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:gap-10">
        <div className="text-center lg:text-left">
          <p className="eyebrow">Charata · Chaco</p>
          <h1 className="mt-2 text-[clamp(2.7rem,7.4vw,5.2rem)] leading-[0.86]">
            ¿Cuánto sabés de <span className="text-led">camisetas</span>?
          </h1>
          <p className="lead mx-auto mt-4 max-w-xl lg:mx-0">
            Girá la ruleta, respondé {config.totalRounds} preguntas y acertá{' '}
            {config.requiredCorrect} antes de que se acabe el tiempo.
            {noStock
              ? ' Los premios están agotados, pero podés jugar igual.'
              : ' Si ganás, te llevás una gorra o un vaso.'}
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
            <span className="rule-pill">
              <Target className="size-4 text-led" aria-hidden="true" />
              {config.totalRounds} preguntas
            </span>
            <span className="rule-pill">
              <Check className="size-4 text-ok" aria-hidden="true" />
              {config.requiredCorrect} aciertos
            </span>
            <span className="rule-pill">
              <Timer className="size-4 text-led" aria-hidden="true" />
              {config.questionSeconds} segundos
            </span>
          </div>

          <div className="mt-7 flex justify-center lg:justify-start">
            <Button
              size="xl"
              onClick={() => void startGame()}
              loading={starting}
              disabled={noCategories}
            >
              Jugar
            </Button>
          </div>

          {noCategories ? (
            <p className="mt-3 text-sm text-bad">
              Todavía no hay preguntas cargadas. Avisá al administrador.
            </p>
          ) : null}

          {error ? (
            <ErrorBanner
              message={error}
              onDismiss={clearError}
              className="mx-auto mt-4 max-w-xl lg:mx-0"
            />
          ) : null}
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute inset-6 rounded-full bg-led/10 blur-3xl" aria-hidden="true" />
          <img
            src="/logo-luifa.png"
            alt="Las Camisetas de Luifa, Charata, Chaco"
            className="logo-glow relative mx-auto w-[min(68vw,330px)] animate-float"
            width={420}
            height={560}
          />
          <div className="relative mt-4">
            <p className="mb-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              <Shirt className="size-4" aria-hidden="true" />
              Premios del local
            </p>
            <div className="grid grid-cols-2 gap-3">
              <PrizeMini kind="hat" label="Gorra" stock={config.stockHats} />
              <PrizeMini kind="cup" label="Vaso" stock={config.stockCups} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex max-w-4xl flex-wrap items-center justify-center gap-2">
        {config.categories.map((category) => (
          <CategoryChip key={category.id} category={category} />
        ))}
      </div>

      <p className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted/60">
        La ruleta elige la categoría · El servidor valida cada respuesta
      </p>
    </section>
  )
}
