import type {
  AdminSettings,
  AdminStats,
  AnswerResponse,
  ConfigResponse,
  FinishResponse,
  PrizeResponse,
  ProblemDetail,
  RoundResponse,
  StartGameResponse,
  UpdateSettingsRequest,
} from './types'

const API_BASE = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: Record<string, string>

  constructor(status: number, code: string, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT'
  body?: unknown
  adminPin?: string
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (options.adminPin) {
    headers['X-Admin-Pin'] = options.adminPin
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'No pudimos conectar con el servidor. Revisá que el backend esté funcionando.',
    )
  }

  if (!response.ok) {
    let problem: ProblemDetail | null = null
    try {
      problem = (await response.json()) as ProblemDetail
    } catch {
      // La respuesta de error no era JSON.
    }
    throw new ApiError(
      response.status,
      problem?.code ?? 'HTTP_ERROR',
      problem?.detail ?? `La solicitud falló con el código ${response.status}.`,
      problem?.errors ?? {},
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const api = {
  getConfig: () => request<ConfigResponse>('/config'),

  startGame: () =>
    request<StartGameResponse>('/games', {
      method: 'POST',
    }),

  spin: (gameId: string) =>
    request<RoundResponse>(`/games/${encodeURIComponent(gameId)}/spins`, {
      method: 'POST',
    }),

  answer: (gameId: string, roundId: string, optionId: number | null) =>
    request<AnswerResponse>(`/games/${encodeURIComponent(gameId)}/answers`, {
      method: 'POST',
      body: { roundId, optionId },
    }),

  finish: (gameId: string) =>
    request<FinishResponse>(`/games/${encodeURIComponent(gameId)}/finish`, {
      method: 'POST',
    }),

  drawPrize: (gameId: string) =>
    request<PrizeResponse>(`/games/${encodeURIComponent(gameId)}/prize`, {
      method: 'POST',
    }),

  getAdminSettings: (pin: string) =>
    request<AdminSettings>('/admin/settings', {
      adminPin: pin,
    }),

  updateAdminSettings: (pin: string, settings: UpdateSettingsRequest) =>
    request<AdminSettings>('/admin/settings', {
      method: 'PUT',
      adminPin: pin,
      body: settings,
    }),

  getAdminStats: (pin: string) =>
    request<AdminStats>('/admin/stats', {
      adminPin: pin,
    }),
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Ocurrió un error inesperado. Intentá nuevamente.'
}
