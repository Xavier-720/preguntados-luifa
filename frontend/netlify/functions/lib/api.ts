import { ApiError } from './errors'
import {
  adminSettings,
  adminStats,
  answer,
  drawPrize,
  finish,
  getConfig,
  spin,
  startGame,
  updateAdminSettings,
  type GameRuntime,
} from './game'
import { loadState, withState, type StateStore } from './state'
import type { AdminSettings, AppState } from './types'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface ApiOptions {
  adminPin?: string
  timeZone?: string
  now?: () => Date
  random?: () => number
}

type JsonObject = Record<string, unknown>

const STATUS_TITLES: Record<number, string> = {
  400: 'Solicitud inválida',
  401: 'No autorizado',
  404: 'No encontrado',
  405: 'Método no permitido',
  409: 'Conflicto',
  415: 'Formato no soportado',
  500: 'Error del servidor',
}

function json(body: unknown, status = 200, contentType = 'application/json; charset=utf-8'): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': contentType,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  })
}

function problem(error: ApiError, path: string): Response {
  const body: Record<string, unknown> = {
    type: 'about:blank',
    title: STATUS_TITLES[error.status] ?? 'Error del servidor',
    status: error.status,
    detail: error.message,
    instance: path,
    code: error.code,
    timestamp: new Date().toISOString(),
  }
  if (Object.keys(error.fieldErrors).length > 0) {
    body.errors = error.fieldErrors
  }
  return json(body, error.status, 'application/problem+json; charset=utf-8')
}

function methodNotAllowed(allowed: string[]): Response {
  return new Response(
    JSON.stringify({
      type: 'about:blank',
      title: 'Método no permitido',
      status: 405,
      detail: 'El método HTTP no está permitido para este recurso.',
      code: 'METHOD_NOT_ALLOWED',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 405,
      headers: {
        'content-type': 'application/problem+json; charset=utf-8',
        allow: allowed.join(', '),
        'cache-control': 'no-store',
      },
    },
  )
}

async function readJsonObject(request: Request): Promise<JsonObject> {
  const text = await request.text()
  if (!text.trim()) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'El cuerpo de la solicitud no tiene un formato válido.',
    )
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'El cuerpo de la solicitud no tiene un formato válido.',
    )
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'El cuerpo de la solicitud no tiene un formato válido.',
    )
  }
  return parsed as JsonObject
}

function invalidUuid(field: string): ApiError {
  return new ApiError(
    400,
    'VALIDATION_ERROR',
    'Revisá los datos ingresados.',
    { [field]: 'El identificador no es válido.' },
  )
}

function parseGameId(rawGameId: string): string {
  const gameId = decodeURIComponent(rawGameId)
  if (!UUID_PATTERN.test(gameId)) {
    throw invalidUuid('gameId')
  }
  return gameId
}

function parseSettingsBody(body: JsonObject): Omit<AdminSettings, 'updatedAt'> {
  const errors: Record<string, string> = {}
  const fields = ['totalRounds', 'requiredCorrect', 'questionSeconds', 'stockHats', 'stockCups'] as const

  for (const field of fields) {
    const value = body[field]
    if (value === undefined || value === null) {
      errors[field] = 'Este campo es obligatorio.'
    } else if (typeof value !== 'number' || !Number.isInteger(value)) {
      errors[field] = 'Debe ser un número entero.'
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Revisá los datos ingresados.', errors)
  }

  return {
    totalRounds: body.totalRounds as number,
    requiredCorrect: body.requiredCorrect as number,
    questionSeconds: body.questionSeconds as number,
    stockHats: body.stockHats as number,
    stockCups: body.stockCups as number,
  }
}

function parseAnswerBody(body: JsonObject): { roundId: string; optionId: number | null } {
  const errors: Record<string, string> = {}
  const roundId = body.roundId
  if (typeof roundId !== 'string' || !UUID_PATTERN.test(roundId)) {
    errors.roundId = 'El identificador de la ronda no es válido.'
  }

  const rawOptionId = body.optionId
  let optionId: number | null = null
  if (rawOptionId !== undefined && rawOptionId !== null) {
    if (typeof rawOptionId !== 'number' || !Number.isInteger(rawOptionId)) {
      errors.optionId = 'La opción debe ser un número entero.'
    } else {
      optionId = rawOptionId
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Revisá los datos ingresados.', errors)
  }

  return { roundId: roundId as string, optionId }
}

function pinMatches(provided: string | null, expected: string): boolean {
  if (provided === null) {
    return false
  }

  // Comparamos todo el largo máximo para no cortar antes según el PIN recibido.
  const length = Math.max(provided.length, expected.length)
  let difference = provided.length ^ expected.length
  for (let index = 0; index < length; index++) {
    difference |= (provided.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0)
  }
  return difference === 0
}

function runtimeFor(options: Required<Pick<ApiOptions, 'timeZone' | 'now' | 'random'>>): GameRuntime {
  return {
    now: options.now(),
    timeZone: options.timeZone,
    random: options.random,
  }
}

async function readSettings(
  store: StateStore,
  runtime: GameRuntime,
): Promise<AdminSettings> {
  const snapshot = await loadState(store, runtime.now)
  return adminSettings(snapshot.state)
}

async function updateSettings(
  store: StateStore,
  runtime: GameRuntime,
  body: JsonObject,
): Promise<AdminSettings> {
  const values = parseSettingsBody(body)
  return withState(store, runtime.now, (state: AppState) =>
    updateAdminSettings(state, values, runtime.now),
  )
}

async function readStats(store: StateStore, runtime: GameRuntime) {
  const snapshot = await loadState(store, runtime.now)
  return adminStats(snapshot.state, runtime.timeZone, runtime.now)
}

async function route(
  request: Request,
  store: StateStore,
  adminPin: string,
  runtimeOptions: Required<Pick<ApiOptions, 'timeZone' | 'now' | 'random'>>,
): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.length > 1
    ? url.pathname.replace(/\/+$/, '')
    : url.pathname
  const method = request.method.toUpperCase()

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204 })
  }

  if (path === '/api/v1/admin' || path.startsWith('/api/v1/admin/')) {
    if (!pinMatches(request.headers.get('x-admin-pin'), adminPin)) {
      throw new ApiError(401, 'ADMIN_UNAUTHORIZED', 'PIN de administrador incorrecto.')
    }
  }

  const runtime = runtimeFor(runtimeOptions)

  if (path === '/api/v1/config') {
    if (method !== 'GET') {
      return methodNotAllowed(['GET'])
    }
    const snapshot = await loadState(store, runtime.now)
    return json(getConfig(snapshot.state))
  }

  if (path === '/api/v1/games') {
    if (method !== 'POST') {
      return methodNotAllowed(['POST'])
    }
    const result = await withState(store, runtime.now, (state) => startGame(state, runtime))
    return json(result, 201)
  }

  const gameMatch = /^\/api\/v1\/games\/([^/]+)\/(spins|answers|finish|prize)$/.exec(path)
  if (gameMatch) {
    const gameId = parseGameId(gameMatch[1])
    const action = gameMatch[2]

    if (method !== 'POST') {
      return methodNotAllowed(['POST'])
    }

    if (action === 'spins') {
      return json(await withState(store, runtime.now, (state) => spin(state, gameId, runtime)))
    }
    if (action === 'answers') {
      const body = await readJsonObject(request)
      const parsed = parseAnswerBody(body)
      return json(
        await withState(store, runtime.now, (state) =>
          answer(state, gameId, parsed.roundId, parsed.optionId, runtime),
        ),
      )
    }
    if (action === 'finish') {
      return json(await withState(store, runtime.now, (state) => finish(state, gameId, runtime)))
    }

    return json(await withState(store, runtime.now, (state) => drawPrize(state, gameId, runtime)))
  }

  if (path === '/api/v1/admin/settings') {
    if (method === 'GET') {
      return json(await readSettings(store, runtime))
    }
    if (method === 'PUT') {
      const body = await readJsonObject(request)
      return json(await updateSettings(store, runtime, body))
    }
    return methodNotAllowed(['GET', 'PUT'])
  }

  if (path === '/api/v1/admin/stats') {
    if (method !== 'GET') {
      return methodNotAllowed(['GET'])
    }
    return json(await readStats(store, runtime))
  }

  throw new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado.')
}

export function createApiHandler(store: StateStore, options: ApiOptions = {}) {
  const adminPin = options.adminPin ?? (process.env.ADMIN_PIN?.trim() || '2468')
  const runtimeOptions: Required<Pick<ApiOptions, 'timeZone' | 'now' | 'random'>> = {
    timeZone: options.timeZone ?? (process.env.APP_TIMEZONE?.trim() || 'America/Argentina/Buenos_Aires'),
    now: options.now ?? (() => new Date()),
    random: options.random ?? Math.random,
  }

  return async (request: Request): Promise<Response> => {
    const path = new URL(request.url).pathname
    try {
      return await route(request, store, adminPin, runtimeOptions)
    } catch (error) {
      if (error instanceof ApiError) {
        return problem(error, path)
      }
      console.error('Error inesperado en la API de Preguntados Luifa', error)
      return problem(
        new ApiError(
          500,
          'INTERNAL_ERROR',
          'Ocurrió un error inesperado. Intentá nuevamente.',
        ),
        path,
      )
    }
  }
}
