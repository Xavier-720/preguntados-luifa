import type { Config, Context } from '@netlify/functions'
import { createApiHandler } from './lib/api'
import { BlobStateStore } from './lib/blob-store'

export default async function api(request: Request, context: Context): Promise<Response> {
  // Cada deploy preview usa su propio store de Blobs para no mezclar datos.
  return createApiHandler(new BlobStateStore(context.deploy.context))(request)
}

export const config: Config = {
  path: '/api/*',
}
