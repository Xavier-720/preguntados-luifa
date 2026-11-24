// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createApiHandler } from './api'
import { findQuestion } from './catalog'
import { MemoryStateStore } from './state'
import type { AnswerResponse, RoundResponse, StartGameResponse } from './types'

const BASE_URL = 'https://preguntados.test'
const PIN = '2468'

function setup(random = () => 0.1) {
  const store = new MemoryStateStore()
  const now = new Date('2026-11-23T15:00:00.000Z')
  const handler = createApiHandler(store, {
    adminPin: PIN,
    timeZone: 'America/Argentina/Buenos_Aires',
    now: () => now,
    random,
  })

  const call = (path: string, init?: RequestInit) =>
    handler(new Request(`${BASE_URL}${path}`, init))

  const jsonCall = (path: string, method: string, body?: unknown, pin?: string) => {
    const headers: Record<string, string> = { accept: 'application/json' }
    if (body !== undefined) {
      headers['content-type'] = 'application/json'
    }
    if (pin) {
      headers['x-admin-pin'] = pin
    }
    return call(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  }

  return { call, jsonCall }
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

async function configureGame(jsonCall: ReturnType<typeof setup>['jsonCall']) {
  const response = await jsonCall(
    '/api/v1/admin/settings',
    'PUT',
    {
      totalRounds: 1,
      requiredCorrect: 1,
      questionSeconds: 15,
      stockHats: 1,
      stockCups: 1,
    },
    PIN,
  )
  expect(response.status).toBe(200)
}

async function playWinningRound(jsonCall: ReturnType<typeof setup>['jsonCall']) {
  const startResponse = await jsonCall('/api/v1/games', 'POST')
  expect(startResponse.status).toBe(201)
  const game = await readJson<StartGameResponse>(startResponse)

  const spinResponse = await jsonCall(`/api/v1/games/${game.gameId}/spins`, 'POST')
  expect(spinResponse.status).toBe(200)
  const round = await readJson<RoundResponse>(spinResponse)

  const question = findQuestion(round.question.id)
  const correctOption = question?.options.find((option) => option.correct)
  expect(correctOption).toBeDefined()

  const answerResponse = await jsonCall(`/api/v1/games/${game.gameId}/answers`, 'POST', {
    roundId: round.roundId,
    optionId: correctOption?.id,
  })
  expect(answerResponse.status).toBe(200)
  const answer = await readJson<AnswerResponse>(answerResponse)

  return { game, round, answer }
}

describe('API serverless', () => {
  it('expone la configuración y las cinco categorías', async () => {
    const { call } = setup()
    const response = await call('/api/v1/config')

    expect(response.status).toBe(200)
    const config = await readJson<{
      totalRounds: number
      stockHats: number
      stockCups: number
      categories: { name: string; questionCount: number }[]
    }>(response)

    expect(config.totalRounds).toBe(3)
    expect(config.stockHats).toBe(10)
    expect(config.stockCups).toBe(10)
    expect(config.categories.map((category) => category.name)).toEqual([
      'Selección',
      'Clubes AR',
      'Mundiales',
      'Clubes del mundo',
      'Historia',
    ])
    expect(config.categories.reduce((total, category) => total + category.questionCount, 0)).toBe(32)
  })

  it('juega una partida completa, descuenta stock y es idempotente', async () => {
    const { jsonCall } = setup()
    await configureGame(jsonCall)

    const { game, round, answer } = await playWinningRound(jsonCall)
    expect(answer.correct).toBe(true)
    expect(answer.lastRound).toBe(true)

    const repeatedAnswer = await jsonCall(`/api/v1/games/${game.gameId}/answers`, 'POST', {
      roundId: round.roundId,
      optionId: null,
    })
    expect(repeatedAnswer.status).toBe(200)
    expect(await readJson<AnswerResponse>(repeatedAnswer)).toMatchObject({
      correct: true,
      timedOut: false,
      correctAnswers: 1,
    })

    const finishResponse = await jsonCall(`/api/v1/games/${game.gameId}/finish`, 'POST')
    expect(finishResponse.status).toBe(200)
    expect(await readJson(finishResponse)).toMatchObject({
      won: true,
      prizeAvailable: true,
      prize: null,
      stockHats: 1,
      stockCups: 1,
    })

    const prizeResponse = await jsonCall(`/api/v1/games/${game.gameId}/prize`, 'POST')
    expect(prizeResponse.status).toBe(200)
    const prize = await readJson<{ prize: { code: string }; stockHats: number; stockCups: number }>(
      prizeResponse,
    )
    expect(prize).toEqual({
      prize: { code: 'HAT', label: 'Gorra' },
      stockHats: 0,
      stockCups: 1,
    })

    const repeatedPrize = await jsonCall(`/api/v1/games/${game.gameId}/prize`, 'POST')
    expect(repeatedPrize.status).toBe(200)
    expect(await readJson(repeatedPrize)).toEqual(prize)

    const statsResponse = await jsonCall('/api/v1/admin/stats', 'GET', undefined, PIN)
    expect(statsResponse.status).toBe(200)
    expect(await readJson(statsResponse)).toMatchObject({
      totalGames: 1,
      gamesToday: 1,
      totalWins: 1,
      winsToday: 1,
      totalPrizes: 1,
      prizesToday: 1,
      stockHats: 0,
      stockCups: 1,
    })
  })

  it('cuenta el timeout como respuesta incorrecta y bloquea el premio', async () => {
    const { jsonCall } = setup()
    await configureGame(jsonCall)

    const startResponse = await jsonCall('/api/v1/games', 'POST')
    const game = await readJson<StartGameResponse>(startResponse)
    const spinResponse = await jsonCall(`/api/v1/games/${game.gameId}/spins`, 'POST')
    const round = await readJson<RoundResponse>(spinResponse)

    const answerResponse = await jsonCall(`/api/v1/games/${game.gameId}/answers`, 'POST', {
      roundId: round.roundId,
      optionId: null,
    })
    expect(answerResponse.status).toBe(200)
    expect(await readJson<AnswerResponse>(answerResponse)).toMatchObject({
      correct: false,
      timedOut: true,
      correctAnswers: 0,
    })

    const finishResponse = await jsonCall(`/api/v1/games/${game.gameId}/finish`, 'POST')
    expect(await readJson(finishResponse)).toMatchObject({
      won: false,
      prizeAvailable: false,
    })

    const prizeResponse = await jsonCall(`/api/v1/games/${game.gameId}/prize`, 'POST')
    expect(prizeResponse.status).toBe(409)
    expect(await readJson(prizeResponse)).toMatchObject({ code: 'GAME_NOT_WON' })
  })

  it('protege la administración con el PIN y valida las reglas', async () => {
    const { jsonCall } = setup()

    const unauthorized = await jsonCall('/api/v1/admin/settings', 'GET')
    expect(unauthorized.status).toBe(401)
    expect(await readJson(unauthorized)).toMatchObject({ code: 'ADMIN_UNAUTHORIZED' })

    const wrongPin = await jsonCall('/api/v1/admin/settings', 'GET', undefined, '0000')
    expect(wrongPin.status).toBe(401)

    const authorized = await jsonCall('/api/v1/admin/settings', 'GET', undefined, PIN)
    expect(authorized.status).toBe(200)

    const invalidRules = await jsonCall(
      '/api/v1/admin/settings',
      'PUT',
      {
        totalRounds: 2,
        requiredCorrect: 3,
        questionSeconds: 15,
        stockHats: 10,
        stockCups: 10,
      },
      PIN,
    )
    expect(invalidRules.status).toBe(400)
    expect(await readJson(invalidRules)).toMatchObject({ code: 'VALIDATION_ERROR' })

    const missingField = await jsonCall(
      '/api/v1/admin/settings',
      'PUT',
      {
        totalRounds: 3,
        requiredCorrect: 2,
        questionSeconds: 15,
        stockHats: 10,
      },
      PIN,
    )
    expect(missingField.status).toBe(400)
    expect(await readJson(missingField)).toMatchObject({
      code: 'VALIDATION_ERROR',
      errors: { stockCups: 'Este campo es obligatorio.' },
    })
  })

  it('responde con errores JSON y rechaza métodos o IDs inválidos', async () => {
    const { jsonCall } = setup()

    const wrongMethod = await jsonCall('/api/v1/games', 'GET')
    expect(wrongMethod.status).toBe(405)
    expect(wrongMethod.headers.get('allow')).toBe('POST')

    const invalidGameId = await jsonCall('/api/v1/games/no-es-uuid/spins', 'POST')
    expect(invalidGameId.status).toBe(400)
    expect(await readJson(invalidGameId)).toMatchObject({ code: 'VALIDATION_ERROR' })

    const missing = await jsonCall('/api/v1/otra-cosa', 'GET')
    expect(missing.status).toBe(404)
    expect(await readJson(missing)).toMatchObject({ code: 'NOT_FOUND' })
  })
})
