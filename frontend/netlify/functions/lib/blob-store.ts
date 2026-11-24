import { getStore, type Store } from '@netlify/blobs'
import type { AppState } from './types'
import type { StateEnvelope, StateStore } from './state'

const STATE_KEY = 'state'
const DEFAULT_STORE = 'preguntados'

function storeName(deployContext?: string): string {
  const base = (process.env.BLOBS_STORE_NAME ?? DEFAULT_STORE).trim() || DEFAULT_STORE
  const context = (deployContext ?? process.env.CONTEXT ?? 'development').replace(/[^a-zA-Z0-9_-]/g, '-')
  return context === 'production' ? base : `${base}-${context}`
}

export class BlobStateStore implements StateStore {
  private readonly store: Store

  constructor(deployContext?: string) {
    this.store = getStore({ name: storeName(deployContext), consistency: 'strong' })
  }

  async read(): Promise<StateEnvelope | null> {
    const entry = await this.store.getWithMetadata(STATE_KEY, {
      type: 'json',
      consistency: 'strong',
    })
    if (!entry || !entry.etag) {
      return null
    }
    return { state: entry.data as AppState, version: entry.etag }
  }

  async create(state: AppState): Promise<string | null> {
    const result = await this.store.setJSON(STATE_KEY, state, { onlyIfNew: true })
    return result.modified ? (result.etag ?? null) : null
  }

  async replace(state: AppState, version: string): Promise<string | null> {
    const result = await this.store.setJSON(STATE_KEY, state, { onlyIfMatch: version })
    return result.modified ? (result.etag ?? null) : null
  }
}
