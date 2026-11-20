import { useEffect, useRef, useState } from 'react'
import { PartyPopper, RotateCcw } from 'lucide-react'
import { Button } from '../components/Button'
import { Confetti } from '../components/Confetti'
import { ErrorBanner } from '../components/ErrorBanner'
import { CapIcon, CupIcon } from '../components/icons'
import { useGame } from '../game/GameContext'
import { useReducedMotion } from '../lib/useReducedMotion'

export function PrizeScreen() {
  const {
    prize,
    drawPrize,
    goToResult,
    reset,
    pending,
    error,
    clearError,
    stock,
  } = useGame()
  const reducedMotion = useReducedMotion()
  const requestedRef = useRef(false)
  const [highlight, setHighlight] = useState(0)

  useEffect(() => {
    if (requestedRef.current || prize) {
      return
    }
    requestedRef.current = true
    void drawPrize()
  }, [drawPrize, prize])

  useEffect(() => {
    if (prize || error || reducedMotion) {
      return
    }
    const interval = window.setInterval(() => {
      setHighlight((current) => (current === 0 ? 1 : 0))
    }, 160)
    return () => window.clearInterval(interval)
  }, [prize, error, reducedMotion])

  const drawing = pending === 'drawing'
  const winnerIndex = prize?.prize.code === 'CUP' ? 1 : 0

  const cards = [
    { code: 'HAT' as const, label: 'Gorra', Icon: CapIcon },
    { code: 'CUP' as const, label: 'Vaso', Icon: CupIcon },
  ]

  return (
    <section className="screen flex w-full max-w-2xl flex-col items-center gap-5 text-center">
      <Confetti active={Boolean(prize)} />

      <p className="eyebrow">{prize ? 'Sorteo listo' : 'Sorteo de premio'}</p>
      <h1 className="text-[clamp(2.6rem,7vw,4.6rem)]">
        {prize ? `¡Te llevás ${prize.prize.label.toLowerCase()}!` : 'Sorteando…'}
      </h1>
      <p className="lead max-w-lg">
        {prize
          ? 'Mostrá esta pantalla en el local para retirar tu premio.'
          : 'Un segundo, la suerte está girando.'}
      </p>

      <div className="flex items-end justify-center gap-4 sm:gap-6">
        {cards.map(({ code, label, Icon }, index) => {
          const isWinner = Boolean(prize) && winnerIndex === index
          const isActive = !prize && !error && highlight === index

          return (
            <div
              key={code}
              className="prize-card"
              data-active={isActive || undefined}
              data-winner={isWinner || undefined}
              aria-label={isWinner ? `Premio: ${label}` : label}
            >
              <Icon className="size-10 sm:size-12" aria-hidden="true" />
              <span className="prize-card-label">{label}</span>
              {isWinner ? (
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em]">
                  ¡Ganaste!
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      {prize ? (
        <div aria-live="polite" className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-led/40 bg-led/10 px-5 py-2 text-led">
            <PartyPopper className="size-5" aria-hidden="true" />
            <span className="font-display text-xl font-black uppercase tracking-wide">
              {prize.prize.label}
            </span>
          </div>
          {stock ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Quedan {stock.hats} gorras y {stock.cups} vasos
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="flex w-full max-w-md flex-col gap-3">
          <ErrorBanner message={error} onDismiss={clearError} />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              variant="secondary"
              onClick={() => void drawPrize()}
              loading={drawing}
            >
              Reintentar sorteo
            </Button>
            <Button variant="ghost" onClick={goToResult}>
              Volver al resultado
            </Button>
          </div>
        </div>
      ) : null}

      {prize ? (
        <Button size="lg" onClick={reset}>
          <RotateCcw className="size-5" aria-hidden="true" />
          Jugar de nuevo
        </Button>
      ) : null}

      {!prize && !error ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted/70">
          El stock se descuenta automáticamente
        </p>
      ) : null}
    </section>
  )
}
