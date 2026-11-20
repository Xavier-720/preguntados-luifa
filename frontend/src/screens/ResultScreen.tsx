import { Frown, Sparkles, Trophy } from 'lucide-react'
import { Button } from '../components/Button'
import { ErrorBanner } from '../components/ErrorBanner'
import { ProgressDots } from '../components/ProgressDots'
import { CapIcon, CupIcon } from '../components/icons'
import { useGame } from '../game/GameContext'

export function ResultScreen() {
  const {
    result,
    results,
    startPrize,
    reset,
    error,
    clearError,
  } = useGame()

  if (!result) {
    return null
  }

  const won = result.won
  const prizeAvailable = won && result.prizeAvailable
  const noStock = won && !result.prizeAvailable && !result.prize

  return (
    <section className="screen flex w-full max-w-2xl flex-col items-center gap-5 text-center">
      <div
        className={
          won
            ? 'grid size-24 place-items-center rounded-full border-4 border-led/50 bg-led/15 text-led shadow-[0_0_60px_rgba(255,210,63,0.25)] animate-pop sm:size-28'
            : 'grid size-24 place-items-center rounded-full border-4 border-white/15 bg-white/5 text-muted animate-pop sm:size-28'
        }
      >
        {won ? (
          <Trophy className="size-12 sm:size-14" aria-hidden="true" />
        ) : (
          <Frown className="size-12 sm:size-14" aria-hidden="true" />
        )}
      </div>

      <div>
        <p className="eyebrow">{won ? '¡Gran partida!' : 'La próxima sale'}</p>
        <h1 className="mt-1 text-[clamp(2.8rem,8vw,5rem)]">
          {won ? '¡Ganaste!' : 'Casi, casi…'}
        </h1>
        <p className="lead mx-auto mt-2 max-w-lg">
          Acertaste {result.correctAnswers} de {result.totalRounds}. Necesitabas{' '}
          {result.requiredCorrect} para llevarte un premio.
        </p>
      </div>

      <ProgressDots results={results} total={result.totalRounds} />

      {prizeAvailable ? (
        <div className="panel-soft flex w-full max-w-md items-center justify-center gap-4 px-4 py-3 text-left">
          <span className="grid size-10 place-items-center rounded-full bg-led/15 text-led">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-lg font-black uppercase leading-none tracking-wide text-chalk">
              Hay premio para vos
            </p>
            <p className="text-xs text-muted">
              {result.stockHats} gorras y {result.stockCups} vasos disponibles
            </p>
          </div>
        </div>
      ) : null}

      {noStock ? (
        <p className="panel-soft w-full max-w-md px-4 py-3 text-sm text-muted">
          No quedan premios en stock. Avisá al local para que repongan y volvé a intentarlo.
        </p>
      ) : null}

      {result.prize ? (
        <div className="panel-soft flex w-full max-w-md items-center justify-center gap-3 px-4 py-3">
          <span className="grid size-10 place-items-center rounded-full bg-led/15 text-led">
            {result.prize.code === 'HAT' ? (
              <CapIcon className="size-5" />
            ) : (
              <CupIcon className="size-5" />
            )}
          </span>
          <p className="font-display text-xl font-black uppercase tracking-wide text-chalk">
            Ya sorteaste: {result.prize.label}
          </p>
        </div>
      ) : null}

      {error ? <ErrorBanner message={error} onDismiss={clearError} className="max-w-md" /> : null}

      <div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        {prizeAvailable ? (
          <Button size="lg" onClick={startPrize} className="sm:flex-1">
            Sortear premio
          </Button>
        ) : null}
        <Button
          size="lg"
          variant={prizeAvailable ? 'secondary' : 'primary'}
          onClick={reset}
          className="sm:flex-1"
        >
          Jugar de nuevo
        </Button>
      </div>

      {won && !prizeAvailable && !noStock ? (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted/70">
          El stock se actualiza en vivo desde el local
        </p>
      ) : null}
    </section>
  )
}
