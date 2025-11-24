import type { ContractRouterClient } from '@orpc/contract'
import type { JsonifiedClient } from '@orpc/openapi-client'
import { createORPCClient } from '@orpc/client'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { OpenAPILink } from '@orpc/openapi-client/fetch'
import { getConfig } from '@/config/environment-config'
import { NAME_OF_SECRET_HEADER_USED_FOR_AUTHENTICATING_FRONTEND } from '@yourbestaccent/api-client/key-generation/frontend-api-key-constants'
import { generateFrontendApiKey } from '@yourbestaccent/api-client/key-generation/frontend-api-key-generator'
import { rootOrpcContract } from '@yourbestaccent/api-client/orpc-contracts/root-contract'

export const apiPrefix = '/api/v1'
const hostWithPrefix = `${getConfig().apiHost}${apiPrefix}`

let getAuthHeaderValue = () => ''

export const setTokenGetter = (fn: () => string) => {
  getAuthHeaderValue = fn
}

const link = new OpenAPILink(rootOrpcContract, {
  url: hostWithPrefix,
  headers: () => {
    const headers: Record<string, string> = {
      [NAME_OF_SECRET_HEADER_USED_FOR_AUTHENTICATING_FRONTEND]: generateFrontendApiKey(Date.now(), 0),
    }

    const authHeader = getAuthHeaderValue()
    if (authHeader) {
      headers.Authorization = authHeader
    }

    return headers
  },
})

export const orpcClient = createORPCClient(link) as JsonifiedClient<ContractRouterClient<typeof rootOrpcContract>>

export const orpcQuery = createTanstackQueryUtils(orpcClient)
