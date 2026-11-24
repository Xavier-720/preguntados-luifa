import {
  CATEGORIES,
  findCategory,
  findQuestion,
  playableCategories,
  toCategorySummary,
  toCategoryView,
} from './catalog'
import { ApiError } from './errors'
import { dailyBucket } from './state'
import { localDateKey } from './time'
import type {
  AdminSettings,
  AdminStats,
  AnswerResponse,
  AppState,
  ConfigResponse,
  FinishResponse,
  GameSessionState,
  PrizeCode,
  PrizeResponse,
  PrizeView,
  RoundResponse,
  RoundState,
  StartGameResponse,
} from './types'

const ANSWER_GRACE_MS = 2_000
const FINISHED_GAME_TTL_MS = 30 * 24 * 60 * 60 * 1_000
const ACTIVE_GAME_TTL_MS = 3 * 24 * 60 * 60 * 1_000

export interface GameRuntime {
  now: Date
  timeZone: string
  random: () => number
}

function randomIndex(runtime: GameRuntime, size: number): number {
  return Math.min(size - 1, Math.floor(runtime.random() * size))
}

function prizeLabel(prize: PrizeCode): string {
  return prize === 'HAT' ? 'Gorra' : 'Vaso'
}

function prizeView(prize: PrizeCode | null): PrizeView | null {
  return prize ? { code: prize, label: prizeLabel(prize) } : null
}

function daysBetween(date: Date, now: Date): number {
  return now.getTime() - date.getTime()
}

function pruneOldGames(state: AppState, now: Date): void {
  for (const [gameId, game] of Object.entries(state.games)) {
    const startedAt = new Date(game.startedAt)
    const expired = game.status === 'FINISHED'
      ? daysBetween(startedAt, now) > FINISHED_GAME_TTL_MS
      : daysBetween(startedAt, now) > ACTIVE_GAME_TTL_MS

    if (expired) {
      delete state.games[gameId]
    }
  }
}

function findGame(state: AppState, gameId: string): GameSessionState {
  const game = state.games[gameId]
  if (!game) {
    throw new ApiError(404, 'GAME_NOT_FOUND', 'No encontramos la partida indicada.')
  }
  return game
}

function toRoundResponse(round: RoundState, game: GameSessionState): RoundResponse {
  const category = findCategory(round.categoryId)
  const question = findQuestion(round.questionId)

  if (!category || !question) {
    throw new ApiError(500, 'INTERNAL_ERROR', 'La pregunta de la ronda ya no está disponible.')
  }

  const options = round.optionOrder.flatMap((optionId) => {
    const option = question.options.find((candidate) => candidate.id === optionId)
    return option ? [{ id: option.id, label: option.label }] : []
  })

  if (options.length !== question.options.length) {
    throw new ApiError(500, 'INTERNAL_ERROR', 'La ronda tiene opciones inválidas.')
  }

  return {
    roundId: round.id,
    roundNumber: round.roundNumber,
    totalRounds: game.totalRounds,
    category: toCategoryView(category),
    question: {
      id: question.id,
      prompt: question.prompt,
      options,
    },
    expiresAt: new Date(
      Date.parse(round.startedAt) + game.questionSeconds * 1_000,
    ).toISOString(),
  }
}

function toAnswerResponse(round: RoundState, game: GameSessionState): AnswerResponse {
  const question = findQuestion(round.questionId)
  const correctOption = question?.options.find((option) => option.correct)

  if (!question || !correctOption) {
    throw new ApiError(500, 'INTERNAL_ERROR', 'La pregunta de la ronda ya no está disponible.')
  }

  return {
    roundId: round.id,
    correct: round.correct,
    timedOut: round.timedOut,
    selectedOptionId: round.selectedOptionId,
    correctOptionId: correctOption.id,
    correctOptionLabel: correctOption.label,
    fact: question.fact,
    correctAnswers: game.correctAnswers,
    roundsPlayed: game.roundsPlayed,
    totalRounds: game.totalRounds,
    lastRound: game.roundsPlayed >= game.totalRounds,
  }
}

function shuffle<T>(items: T[], runtime: GameRuntime): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index--) {
    const swapIndex = randomIndex(runtime, index + 1)
    const current = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = current
  }
  return copy
}

export function getConfig(state: AppState): ConfigResponse {
  return {
    totalRounds: state.settings.totalRounds,
    requiredCorrect: state.settings.requiredCorrect,
    questionSeconds: state.settings.questionSeconds,
    stockHats: state.settings.stockHats,
    stockCups: state.settings.stockCups,
    categories: playableCategories(),
  }
}

export function startGame(state: AppState, runtime: GameRuntime): StartGameResponse {
  const categories = playableCategories()
  if (categories.length === 0) {
    throw new ApiError(409, 'NO_QUESTIONS', 'No hay preguntas cargadas para jugar.')
  }

  pruneOldGames(state, runtime.now)
  const gameId = crypto.randomUUID()
  state.games[gameId] = {
    id: gameId,
    status: 'IN_PROGRESS',
    totalRounds: state.settings.totalRounds,
    requiredCorrect: state.settings.requiredCorrect,
    questionSeconds: state.settings.questionSeconds,
    correctAnswers: 0,
    roundsPlayed: 0,
    prize: null,
    startedAt: runtime.now.toISOString(),
    finishedAt: null,
    prizeAwardedAt: null,
    rounds: [],
  }

  state.stats.totalGames += 1
  dailyBucket(state, localDateKey(runtime.now, runtime.timeZone)).games += 1

  return {
    gameId,
    totalRounds: state.settings.totalRounds,
    requiredCorrect: state.settings.requiredCorrect,
    questionSeconds: state.settings.questionSeconds,
    categories,
    stockHats: state.settings.stockHats,
    stockCups: state.settings.stockCups,
  }
}

export function spin(state: AppState, gameId: string, runtime: GameRuntime): RoundResponse {
  const game = findGame(state, gameId)
  if (game.status === 'FINISHED') {
    throw new ApiError(409, 'GAME_ALREADY_FINISHED', 'La partida ya está finalizada.')
  }
  if (game.roundsPlayed >= game.totalRounds) {
    throw new ApiError(
      409,
      'GAME_COMPLETE',
      'La partida ya tiene todas las respuestas; finalizala para ver el resultado.',
    )
  }

  const pendingRound = [...game.rounds]
    .sort((left, right) => left.roundNumber - right.roundNumber)
    .find((round) => !round.answered)
  if (pendingRound) {
    return toRoundResponse(pendingRound, game)
  }

  const categories = CATEGORIES.filter((category) => category.questions.length > 0)
  if (categories.length === 0) {
    throw new ApiError(409, 'NO_QUESTIONS', 'No hay preguntas cargadas para jugar.')
  }

  const category = categories[randomIndex(runtime, categories.length)]
  const usedQuestionIds = new Set(game.rounds.map((round) => round.questionId))
  const unusedQuestions = category.questions.filter((question) => !usedQuestionIds.has(question.id))
  const availableQuestions = unusedQuestions.length > 0 ? unusedQuestions : category.questions
  const question = availableQuestions[randomIndex(runtime, availableQuestions.length)]

  const round: RoundState = {
    id: crypto.randomUUID(),
    roundNumber: game.roundsPlayed + 1,
    categoryId: category.id,
    questionId: question.id,
    optionOrder: shuffle(question.options, runtime).map((option) => option.id),
    startedAt: runtime.now.toISOString(),
    answered: false,
    selectedOptionId: null,
    correct: false,
    timedOut: false,
    answeredAt: null,
  }
  game.rounds.push(round)

  return toRoundResponse(round, game)
}

export function answer(
  state: AppState,
  gameId: string,
  roundId: string,
  optionId: number | null,
  runtime: GameRuntime,
): AnswerResponse {
  const game = findGame(state, gameId)
  const round = game.rounds.find((candidate) => candidate.id === roundId)
  if (!round) {
    throw new ApiError(404, 'ROUND_NOT_FOUND', 'No encontramos la ronda indicada.')
  }

  if (round.answered) {
    return toAnswerResponse(round, game)
  }
  if (game.status === 'FINISHED') {
    throw new ApiError(409, 'GAME_ALREADY_FINISHED', 'La partida ya está finalizada.')
  }

  const expiresAt = Date.parse(round.startedAt) + game.questionSeconds * 1_000 + ANSWER_GRACE_MS
  const timedOut = optionId === null || runtime.now.getTime() > expiresAt
  const question = findQuestion(round.questionId)
  if (!question) {
    throw new ApiError(500, 'INTERNAL_ERROR', 'La pregunta de la ronda ya no está disponible.')
  }

  let selectedOptionId: number | null = null
  let correct = false
  if (!timedOut) {
    const selectedOption = question.options.find((option) => option.id === optionId)
    if (!selectedOption) {
      throw new ApiError(
        400,
        'INVALID_OPTION',
        'La opción elegida no pertenece a esta pregunta.',
      )
    }
    selectedOptionId = selectedOption.id
    correct = selectedOption.correct
  }

  round.answered = true
  round.selectedOptionId = selectedOptionId
  round.correct = correct
  round.timedOut = timedOut
  round.answeredAt = runtime.now.toISOString()

  game.roundsPlayed += 1
  if (correct) {
    game.correctAnswers += 1
  }

  return toAnswerResponse(round, game)
}

export function finish(state: AppState, gameId: string, runtime: GameRuntime): FinishResponse {
  const game = findGame(state, gameId)

  if (game.status === 'IN_PROGRESS') {
    if (game.roundsPlayed < game.totalRounds) {
      throw new ApiError(409, 'GAME_NOT_FINISHED', 'Todavía quedan preguntas por responder.')
    }

    game.status = 'FINISHED'
    game.finishedAt = runtime.now.toISOString()

    if (game.correctAnswers >= game.requiredCorrect) {
      state.stats.totalWins += 1
      const startDate = localDateKey(new Date(game.startedAt), runtime.timeZone)
      dailyBucket(state, startDate).wins += 1
    }
  }

  const won = game.correctAnswers >= game.requiredCorrect
  const settings = state.settings
  const prizeAvailable = won && game.prize === null && settings.stockHats + settings.stockCups > 0

  return {
    gameId: game.id,
    correctAnswers: game.correctAnswers,
    totalRounds: game.totalRounds,
    requiredCorrect: game.requiredCorrect,
    won,
    prizeAvailable,
    prize: prizeView(game.prize),
    stockHats: settings.stockHats,
    stockCups: settings.stockCups,
  }
}

export function drawPrize(
  state: AppState,
  gameId: string,
  runtime: GameRuntime,
): PrizeResponse {
  const game = findGame(state, gameId)
  const settings = state.settings

  if (game.prize !== null) {
    return {
      prize: { code: game.prize, label: prizeLabel(game.prize) },
      stockHats: settings.stockHats,
      stockCups: settings.stockCups,
    }
  }
  if (game.status !== 'FINISHED') {
    throw new ApiError(
      409,
      'GAME_NOT_FINISHED',
      'Primero terminá la partida para sortear el premio.',
    )
  }
  if (game.correctAnswers < game.requiredCorrect) {
    throw new ApiError(
      409,
      'GAME_NOT_WON',
      'La partida no tiene los aciertos necesarios para el premio.',
    )
  }
  if (settings.stockHats + settings.stockCups <= 0) {
    throw new ApiError(409, 'OUT_OF_STOCK', 'No quedan premios en stock.')
  }

  const prize: PrizeCode = randomIndex(runtime, settings.stockHats + settings.stockCups) < settings.stockHats
    ? 'HAT'
    : 'CUP'

  if (prize === 'HAT') {
    settings.stockHats -= 1
  } else {
    settings.stockCups -= 1
  }
  settings.updatedAt = runtime.now.toISOString()
  game.prize = prize
  game.prizeAwardedAt = runtime.now.toISOString()

  state.stats.totalPrizes += 1
  dailyBucket(state, localDateKey(runtime.now, runtime.timeZone)).prizes += 1

  return {
    prize: { code: prize, label: prizeLabel(prize) },
    stockHats: settings.stockHats,
    stockCups: settings.stockCups,
  }
}

export function adminSettings(state: AppState): AdminSettings {
  return { ...state.settings }
}

export function updateAdminSettings(
  state: AppState,
  values: Omit<AdminSettings, 'updatedAt'>,
  now: Date,
): AdminSettings {
  const { totalRounds, requiredCorrect, questionSeconds, stockHats, stockCups } = values

  if (totalRounds < 1 || totalRounds > 5) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Las rondas por partida deben estar entre 1 y 5.')
  }
  if (requiredCorrect < 1 || requiredCorrect > totalRounds) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Los aciertos necesarios deben estar entre 1 y la cantidad de rondas.',
    )
  }
  if (questionSeconds < 5 || questionSeconds > 60) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Los segundos por pregunta deben estar entre 5 y 60.')
  }
  if (stockHats < 0 || stockHats > 999 || stockCups < 0 || stockCups > 999) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'El stock debe estar entre 0 y 999 unidades.')
  }

  state.settings = {
    totalRounds,
    requiredCorrect,
    questionSeconds,
    stockHats,
    stockCups,
    updatedAt: now.toISOString(),
  }
  return { ...state.settings }
}

export function adminStats(state: AppState, timeZone: string, now: Date): AdminStats {
  const today = state.stats.daily[localDateKey(now, timeZone)] ?? {
    games: 0,
    wins: 0,
    prizes: 0,
  }

  return {
    totalGames: state.stats.totalGames,
    gamesToday: today.games,
    totalWins: state.stats.totalWins,
    winsToday: today.wins,
    totalPrizes: state.stats.totalPrizes,
    prizesToday: today.prizes,
    stockHats: state.settings.stockHats,
    stockCups: state.settings.stockCups,
    categories: CATEGORIES.map(toCategorySummary),
  }
}
