export type PrizeCode = 'HAT' | 'CUP'
export type GameStatus = 'IN_PROGRESS' | 'FINISHED'

export interface CategorySummary {
  id: number
  name: string
  color: string
  questionCount: number
}

export interface CategoryView {
  id: number
  name: string
  color: string
}

export interface OptionView {
  id: number
  label: string
}

export interface QuestionView {
  id: number
  prompt: string
  options: OptionView[]
}

export interface PrizeView {
  code: PrizeCode
  label: string
}

export interface ConfigResponse {
  totalRounds: number
  requiredCorrect: number
  questionSeconds: number
  stockHats: number
  stockCups: number
  categories: CategorySummary[]
}

export interface StartGameResponse {
  gameId: string
  totalRounds: number
  requiredCorrect: number
  questionSeconds: number
  categories: CategorySummary[]
  stockHats: number
  stockCups: number
}

export interface RoundResponse {
  roundId: string
  roundNumber: number
  totalRounds: number
  category: CategoryView
  question: QuestionView
  expiresAt: string
}

export interface AnswerResponse {
  roundId: string
  correct: boolean
  timedOut: boolean
  selectedOptionId: number | null
  correctOptionId: number
  correctOptionLabel: string
  fact: string
  correctAnswers: number
  roundsPlayed: number
  totalRounds: number
  lastRound: boolean
}

export interface FinishResponse {
  gameId: string
  correctAnswers: number
  totalRounds: number
  requiredCorrect: number
  won: boolean
  prizeAvailable: boolean
  prize: PrizeView | null
  stockHats: number
  stockCups: number
}

export interface PrizeResponse {
  prize: PrizeView
  stockHats: number
  stockCups: number
}

export interface AdminSettings {
  totalRounds: number
  requiredCorrect: number
  questionSeconds: number
  stockHats: number
  stockCups: number
  updatedAt: string
}

export interface AdminStats {
  totalGames: number
  gamesToday: number
  totalWins: number
  winsToday: number
  totalPrizes: number
  prizesToday: number
  stockHats: number
  stockCups: number
  categories: CategorySummary[]
}

export interface DailyStats {
  games: number
  wins: number
  prizes: number
}

export interface GameStats {
  totalGames: number
  totalWins: number
  totalPrizes: number
  daily: Record<string, DailyStats>
}

export interface StoredSettings {
  totalRounds: number
  requiredCorrect: number
  questionSeconds: number
  stockHats: number
  stockCups: number
  updatedAt: string
}

export interface RoundState {
  id: string
  roundNumber: number
  categoryId: number
  questionId: number
  optionOrder: number[]
  startedAt: string
  answered: boolean
  selectedOptionId: number | null
  correct: boolean
  timedOut: boolean
  answeredAt: string | null
}

export interface GameSessionState {
  id: string
  status: GameStatus
  totalRounds: number
  requiredCorrect: number
  questionSeconds: number
  correctAnswers: number
  roundsPlayed: number
  prize: PrizeCode | null
  startedAt: string
  finishedAt: string | null
  prizeAwardedAt: string | null
  rounds: RoundState[]
}

export interface AppState {
  version: 1
  settings: StoredSettings
  games: Record<string, GameSessionState>
  stats: GameStats
}
