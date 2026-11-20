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
  code: 'HAT' | 'CUP'
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

export type UpdateSettingsRequest = Omit<AdminSettings, 'updatedAt'>

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

export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  code?: string
  timestamp?: string
  errors?: Record<string, string>
}
