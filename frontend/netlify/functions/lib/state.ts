import { ApiError } from './errors'
import type { AppState, DailyStats } from './types'

export interface StateEnvelope {
  state: AppState
  version: string
}

export interface StateStore {
  read(): Promise<StateEnvelope | null>
  create(state: AppState): Promise<string | null>
  replace(state: AppState, version: string): Promise<string | null>
}

const MAX_WRITE_ATTEMPTS = 20

export function createInitialState(now: Date): AppState {
  return {
    version: 1,
    settings: {
      totalRounds: 3,
      requiredCorrect: 2,
      questionSeconds: 15,
      stockHats: 10,
      stockCups: 10,
      updatedAt: now.toISOString(),
    },
    games: {},
    stats: {
      totalGames: 0,
      totalWins: 0,
      totalPrizes: 0,
      daily: {},
    },
  }
}

export function dailyBucket(state: AppState, dateKey: string): DailyStats {
  const existing = state.stats.daily[dateKey]
  if (existing) {
    return existing
  }
  const created: DailyStats = { games: 0, wins: 0, prizes: 0 }
  state.stats.daily[dateKey] = created
  return created
}

export async function loadState(store: StateStore, now: Date): Promise<StateEnvelope> {
  const current = await store.read()
  if (current) {
    return current
  }

  const initial = createInitialState(now)
  const version = await store.create(initial)
  if (version) {
    return { state: initial, version }
  }

  const raced = await store.read()
  if (!raced) {
    throw new ApiError(
      500,
      'INTERNAL_ERROR',
      'No se pudo inicializar la configuración del juego.',
    )
  }
  return raced
}

// Blobs no ofrece transacciones: cada modificación relee el estado y escribe
// solo si el ETag no cambió. Así el stock, las respuestas y el sorteo no se
// pisan entre dos requests concurrentes.
export async function withState<T>(
  store: StateStore,
  now: Date,
  mutate: (state: AppState) => T | Promise<T>,
): Promise<T> {
  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
    const current = await loadState(store, now)
    const draft = structuredClone(current.state)
    const result = await mutate(draft)
    const nextVersion = await store.replace(draft, current.version)

    if (nextVersion) {
      return result
    }
  }

  throw new ApiError(
    500,
    'INTERNAL_ERROR',
    'No pudimos guardar los cambios por concurrencia. Intentá nuevamente.',
  )
}

export class MemoryStateStore implements StateStore {
  private state: AppState | null = null
  private revision = 0

  async read(): Promise<StateEnvelope | null> {
    if (!this.state) {
      return null
    }
    return {
      state: structuredClone(this.state),
      version: String(this.revision),
    }
  }

  async create(state: AppState): Promise<string | null> {
    if (this.state) {
      return null
    }
    this.state = structuredClone(state)
    this.revision += 1
    return String(this.revision)
  }

  async replace(state: AppState, version: string): Promise<string | null> {
    if (!this.state || version !== String(this.revision)) {
      return null
    }
    this.state = structuredClone(state)
    this.revision += 1
    return String(this.revision)
  }
}
