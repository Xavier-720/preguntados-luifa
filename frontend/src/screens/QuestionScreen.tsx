import { useEffect, useRef } from 'react'
import { Check, Timer, X } from 'lucide-react'
import { Button } from '../components/Button'
import { ErrorBanner } from '../components/ErrorBanner'
import { ProgressDots } from '../components/ProgressDots'
import { useGame } from '../game/GameContext'
import { useCountdown } from '../lib/useCountdown'
import { useReducedMotion } from '../lib/useReducedMotion'

type OptionState = 'idle' | 'correct' | 'wrong' | 'muted'

export function QuestionScreen() {
  const {
    game,
    round,
    answer,
    results,
    pending,
    error,
    answerQuestion,
    finishGame,
    goToWheel,
    clearError,
  } = useGame()
  const reducedMotion = useReducedMotion()
  const remainingMs = useCountdown(round?.expiresAt, Boolean(round) && !answer)
  const autoSubmittedRef = useRef(false)
  const lastSelectionRef = useRef<number | null>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (answer) {
      feedbackRef.current?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
      })
    }
  }, [answer, reducedMotion])

  useEffect(() => {
    if (!round || answer || pending === 'answering' || autoSubmittedRef.current) {
      return
    }
    if (remainingMs <= 0) {
      autoSubmittedRef.current = true
      void answerQuestion(null)
    }
  }, [round, answer, pending, remainingMs, answerQuestion])

  if (!game || !round) {
    return null
  }

  const totalMs = Math.max(game.questionSeconds * 1000, 1)
  const percent = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100))
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const low = percent <= 30
  const answering = pending === 'answering'
  const finishing = pending === 'finishing'

  const optionState = (optionId: number): OptionState => {
    if (!answer) {
      return 'idle'
    }
    if (optionId === answer.correctOptionId) {
      return 'correct'
    }
    if (optionId === answer.selectedOptionId) {
      return 'wrong'
    }
    return 'muted'
  }

  const selectOption = (optionId: number) => {
    if (answer || answering) {
      return
    }
    lastSelectionRef.current = optionId
    void answerQuestion(optionId)
  }

  const continueGame = () => {
    if (!answer) {
      return
    }
    if (answer.lastRound) {
      void finishGame()
    } else {
      goToWheel()
    }
  }

  const feedbackTitle = answer
    ? answer.timedOut
      ? 'Se acabó el tiempo'
      : answer.correct
        ? '¡Correcto!'
        : 'Casi…'
    : ''

  return (
    <section className="screen flex w-full max-w-3xl flex-col items-center gap-3 sm:gap-4">
      <div className="flex w-full items-center justify-between gap-3">
        <ProgressDots
          results={results}
          total={round.totalRounds}
          active={answer ? undefined : round.roundNumber - 1}
        />
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
          Pregunta {round.roundNumber} de {round.totalRounds}
        </p>
      </div>

      <div className="panel w-full p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="category-badge" style={{ backgroundColor: round.category.color }}>
            {round.category.name}
          </span>
          <div
            className="flex items-center gap-2 text-led"
            role="timer"
            aria-label={`${seconds} segundos restantes`}
          >
            <Timer className="size-5" aria-hidden="true" />
            <span className="timer-number" aria-hidden="true">
              {seconds}s
            </span>
          </div>
        </div>

        <h2 className="mt-4 font-sans text-[clamp(1.4rem,3.3vw,2.15rem)] font-semibold normal-case leading-tight tracking-normal text-chalk">
          {round.question.prompt}
        </h2>

        <div className="timer-track mt-4" aria-hidden="true">
          <div className="timer-fill" data-low={low} style={{ width: `${percent}%` }} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {round.question.options.map((option, index) => {
            const state = optionState(option.id)
            return (
              <button
                key={option.id}
                type="button"
                className="option"
                data-state={state === 'idle' ? undefined : state}
                onClick={() => selectOption(option.id)}
                disabled={Boolean(answer) || answering}
                aria-label={`Opción ${String.fromCharCode(65 + index)}: ${option.label}`}
              >
                <span className="option-letter" aria-hidden="true">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option.label}</span>
                {state === 'correct' ? (
                  <Check className="size-6 flex-none" strokeWidth={3} aria-hidden="true" />
                ) : null}
                {state === 'wrong' ? (
                  <X className="size-6 flex-none" strokeWidth={3} aria-hidden="true" />
                ) : null}
              </button>
            )
          })}
        </div>

        {error ? (
          <ErrorBanner
            message={error}
            onRetry={() => void answerQuestion(lastSelectionRef.current)}
            onDismiss={clearError}
            className="mt-4"
          />
        ) : null}

        {answer ? (
          <div
            ref={feedbackRef}
            aria-live="polite"
            className={
              answer.correct
                ? 'mt-4 rounded-xl border border-ok/40 bg-ok/10 p-4'
                : 'mt-4 rounded-xl border border-bad/40 bg-bad/10 p-4'
            }
          >
            <div className="flex items-center gap-2">
              <span
                className={
                  answer.correct
                    ? 'grid size-8 flex-none place-items-center rounded-full bg-ok text-night'
                    : 'grid size-8 flex-none place-items-center rounded-full bg-bad text-white'
                }
              >
                {answer.correct ? (
                  <Check className="size-5" strokeWidth={3} aria-hidden="true" />
                ) : (
                  <X className="size-5" strokeWidth={3} aria-hidden="true" />
                )}
              </span>
              <p className="font-display text-2xl font-black uppercase leading-none tracking-wide text-chalk">
                {feedbackTitle}
              </p>
            </div>

            {!answer.correct ? (
              <p className="mt-2 text-sm font-semibold text-chalk/90">
                La respuesta correcta era: {answer.correctOptionLabel}
              </p>
            ) : null}

            <p className="mt-2 text-sm leading-relaxed text-muted">{answer.fact}</p>

            <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                {answer.correctAnswers} de {answer.totalRounds} aciertos
              </p>
              <Button size="md" onClick={continueGame} loading={finishing}>
                {answer.lastRound ? 'Ver resultado' : 'Seguir'}
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted/70">
            Elegí una opción · sin respuesta se cuenta como incorrecta
          </p>
        )}
      </div>
    </section>
  )
}
