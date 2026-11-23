import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Button } from '../components/Button'
import { ErrorBanner } from '../components/ErrorBanner'
import { ProgressDots } from '../components/ProgressDots'
import { Wheel } from '../components/Wheel'
import { useGame } from '../game/GameContext'
import { useReducedMotion } from '../lib/useReducedMotion'
import { computeTargetRotation } from '../lib/wheel'

export function WheelScreen() {
  const {
    game,
    round,
    results,
    spin,
    beginRound,
    pending,
    error,
    clearError,
  } = useGame()
  const reducedMotion = useReducedMotion()
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const rotationRef = useRef(0)
  const timeoutRef = useRef<number | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (!game) {
    return null
  }

  const categories = game.categories
  const roundNumber = round ? round.roundNumber + 1 : 1
  const totalRounds = game.totalRounds
  const busy = spinning || pending === 'spinning'

  const handleSpin = async () => {
    if (busy || !categories.length) {
      return
    }

    clearError()
    setSpinning(true)
    const response = await spin()
    if (!response) {
      setSpinning(false)
      return
    }

    const foundIndex = categories.findIndex((category) => category.id === response.category.id)
    const index = foundIndex >= 0 ? foundIndex : 0
    const offset = 0.15 + Math.random() * 0.5
    // El servidor ya eligió la categoría; acá solo calculamos dónde frenar la ruleta.
    const nextRotation = computeTargetRotation(
      rotationRef.current,
      index,
      categories.length,
      4,
      offset,
    )

    rotationRef.current = nextRotation
    setRotation(nextRotation)

    timeoutRef.current = window.setTimeout(
      () => {
        if (mountedRef.current) {
          beginRound(response)
        }
      },
      reducedMotion ? 120 : 1380,
    )
  }

  return (
    <section className="screen flex w-full flex-col items-center gap-4 sm:gap-5">
      <div className="flex w-full max-w-xl flex-col items-center gap-2">
        <ProgressDots results={results} total={totalRounds} active={roundNumber - 1} />
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
          Ronda {roundNumber} de {totalRounds}
        </p>
      </div>

      <Wheel
        categories={categories}
        rotation={rotation}
        spinning={spinning}
        roundNumber={roundNumber}
        totalRounds={totalRounds}
      />

      <div className="flex w-full max-w-md flex-col items-center gap-3">
        <Button
          size="lg"
          onClick={() => void handleSpin()}
          loading={busy}
          disabled={!categories.length}
          className="min-w-52"
        >
          {spinning ? 'Girando…' : 'Girar'}
          {!spinning ? <ChevronRight className="size-6" aria-hidden="true" /> : null}
        </Button>
        <p className="text-center text-sm text-muted">
          La ruleta elige la categoría. Después tenés {game.questionSeconds} segundos para responder.
        </p>
        {error ? (
          <ErrorBanner
            message={error}
            onRetry={() => void handleSpin()}
            onDismiss={clearError}
          />
        ) : null}
      </div>
    </section>
  )
}
