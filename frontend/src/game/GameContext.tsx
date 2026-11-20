import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '../api/client'
import type {
  AnswerResponse,
  FinishResponse,
  PrizeResponse,
  RoundResponse,
  StartGameResponse,
} from '../api/types'
import { sleep } from '../lib/sleep'

export type GamePhase = 'home' | 'wheel' | 'question' | 'result' | 'prize'
export type GameAction = 'starting' | 'spinning' | 'answering' | 'finishing' | 'drawing'

export interface GameStock {
  hats: number
  cups: number
}

interface GameContextValue {
  phase: GamePhase
  game: StartGameResponse | null
  round: RoundResponse | null
  answer: AnswerResponse | null
  result: FinishResponse | null
  prize: PrizeResponse | null
  results: boolean[]
  stock: GameStock | null
  pending: GameAction | null
  error: string | null
  startGame: () => Promise<void>
  spin: () => Promise<RoundResponse | null>
  beginRound: (round: RoundResponse) => void
  answerQuestion: (optionId: number | null) => Promise<void>
  finishGame: () => Promise<void>
  goToWheel: () => void
  startPrize: () => void
  goToResult: () => void
  drawPrize: () => Promise<void>
  reset: () => void
  clearError: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

const PRIZE_MIN_SUSPENSE = 1600

export function GameProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const [phase, setPhase] = useState<GamePhase>('home')
  const [game, setGame] = useState<StartGameResponse | null>(null)
  const [round, setRound] = useState<RoundResponse | null>(null)
  const [answer, setAnswer] = useState<AnswerResponse | null>(null)
  const [result, setResult] = useState<FinishResponse | null>(null)
  const [prize, setPrize] = useState<PrizeResponse | null>(null)
  const [results, setResults] = useState<boolean[]>([])
  const [stock, setStock] = useState<GameStock | null>(null)
  const [pending, setPending] = useState<GameAction | null>(null)
  const [error, setError] = useState<string | null>(null)

  const gameRef = useRef<StartGameResponse | null>(null)
  const roundRef = useRef<RoundResponse | null>(null)
  const answerRef = useRef<AnswerResponse | null>(null)
  const prizeRef = useRef<PrizeResponse | null>(null)
  const busyRef = useRef<GameAction | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const startGame = useCallback(async () => {
    if (busyRef.current) {
      return
    }
    busyRef.current = 'starting'
    setPending('starting')
    setError(null)

    try {
      const response = await api.startGame()
      gameRef.current = response
      roundRef.current = null
      answerRef.current = null
      prizeRef.current = null
      setGame(response)
      setRound(null)
      setAnswer(null)
      setResult(null)
      setPrize(null)
      setResults([])
      setStock({ hats: response.stockHats, cups: response.stockCups })
      setPhase('wheel')
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      busyRef.current = null
      setPending(null)
    }
  }, [])

  const spin = useCallback(async (): Promise<RoundResponse | null> => {
    const currentGame = gameRef.current
    if (!currentGame || busyRef.current) {
      return null
    }
    busyRef.current = 'spinning'
    setPending('spinning')
    setError(null)

    try {
      return await api.spin(currentGame.gameId)
    } catch (caught) {
      setError(getErrorMessage(caught))
      return null
    } finally {
      busyRef.current = null
      setPending(null)
    }
  }, [])

  const beginRound = useCallback((nextRound: RoundResponse) => {
    roundRef.current = nextRound
    answerRef.current = null
    setRound(nextRound)
    setAnswer(null)
    setError(null)
    setPhase('question')
  }, [])

  const answerQuestion = useCallback(async (optionId: number | null) => {
    const currentGame = gameRef.current
    const currentRound = roundRef.current
    if (!currentGame || !currentRound || answerRef.current || busyRef.current) {
      return
    }
    busyRef.current = 'answering'
    setPending('answering')
    setError(null)

    try {
      const response = await api.answer(currentGame.gameId, currentRound.roundId, optionId)
      answerRef.current = response
      setAnswer(response)
      setResults((previous) => {
        if (previous.length >= response.roundsPlayed) {
          return previous
        }
        return [...previous, response.correct]
      })
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      busyRef.current = null
      setPending(null)
    }
  }, [])

  const finishGame = useCallback(async () => {
    const currentGame = gameRef.current
    if (!currentGame || busyRef.current) {
      return
    }
    busyRef.current = 'finishing'
    setPending('finishing')
    setError(null)

    try {
      const response = await api.finish(currentGame.gameId)
      setResult(response)
      setStock({ hats: response.stockHats, cups: response.stockCups })
      setPhase('result')
      void queryClient.invalidateQueries({ queryKey: ['config'] })
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      busyRef.current = null
      setPending(null)
    }
  }, [queryClient])

  const goToWheel = useCallback(() => {
    setError(null)
    setPhase('wheel')
  }, [])

  const startPrize = useCallback(() => {
    setError(null)
    setPrize(null)
    prizeRef.current = null
    setPhase('prize')
  }, [])

  const goToResult = useCallback(() => {
    setError(null)
    setPhase('result')
  }, [])

  const drawPrize = useCallback(async () => {
    const currentGame = gameRef.current
    if (!currentGame || busyRef.current || prizeRef.current) {
      return
    }
    busyRef.current = 'drawing'
    setPending('drawing')
    setError(null)

    try {
      const [response] = await Promise.all([
        api.drawPrize(currentGame.gameId),
        sleep(PRIZE_MIN_SUSPENSE),
      ])
      prizeRef.current = response
      setPrize(response)
      setStock({ hats: response.stockHats, cups: response.stockCups })
      void queryClient.invalidateQueries({ queryKey: ['config'] })
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      busyRef.current = null
      setPending(null)
    }
  }, [queryClient])

  const reset = useCallback(() => {
    gameRef.current = null
    roundRef.current = null
    answerRef.current = null
    prizeRef.current = null
    busyRef.current = null
    setGame(null)
    setRound(null)
    setAnswer(null)
    setResult(null)
    setPrize(null)
    setResults([])
    setStock(null)
    setPending(null)
    setError(null)
    setPhase('home')
    void queryClient.invalidateQueries({ queryKey: ['config'] })
  }, [queryClient])

  const value = useMemo<GameContextValue>(
    () => ({
      phase,
      game,
      round,
      answer,
      result,
      prize,
      results,
      stock,
      pending,
      error,
      startGame,
      spin,
      beginRound,
      answerQuestion,
      finishGame,
      goToWheel,
      startPrize,
      goToResult,
      drawPrize,
      reset,
      clearError,
    }),
    [
      phase,
      game,
      round,
      answer,
      result,
      prize,
      results,
      stock,
      pending,
      error,
      startGame,
      spin,
      beginRound,
      answerQuestion,
      finishGame,
      goToWheel,
      startPrize,
      goToResult,
      drawPrize,
      reset,
      clearError,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// El hook convive con el provider para mantener el contexto en un solo archivo.
// oxlint-disable-next-line react/only-export-components
export function useGame(): GameContextValue {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame debe usarse dentro de GameProvider')
  }
  return context
}
