import type { ContractRouterClient } from '@orpc/contract'
import type { JsonifiedClient } from '@orpc/openapi-client'
import { createORPCClient } from '@orpc/client'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { OpenAPILink } from '@orpc/openapi-client/fetch'
import { getConfig } from '@/config/environment-config'
import { store } from '@/state/store'
import { selectAccountAccessToken } from '@/state/slices/account-slice'
import { NAME_OF_SECRET_HEADER_USED_FOR_AUTHENTICATING_FRONTEND } from '@yourbestaccent/api-client/key-generation/frontend-api-key-constants'
import { generateFrontendApiKey } from '@yourbestaccent/api-client/key-generation/frontend-api-key-generator'
import { rootOrpcContract } from '@yourbestaccent/api-client/orpc-contracts/root-contract'

const apiPrefix = '/api/v1'
const openApiPrefix = '/api/v1/open'
const hostWithPrefix = `${getConfig().apiHost}${apiPrefix}`
const hostWithOpenPrefix = `${getConfig().apiHost}${openApiPrefix}`

const link = new OpenAPILink(rootOrpcContract, {
  url: hostWithPrefix,
  headers: () => {
    const state = store.getState()
    const accessToken = selectAccountAccessToken(state)

    const headers: Record<string, string> = {
      [NAME_OF_SECRET_HEADER_USED_FOR_AUTHENTICATING_FRONTEND]: generateFrontendApiKey(Date.now(), 0),
    }

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    return headers
  },
})

const openLink = new OpenAPILink(rootOrpcContract, {
  url: hostWithOpenPrefix,
  headers: () => {
    return {
      [NAME_OF_SECRET_HEADER_USED_FOR_AUTHENTICATING_FRONTEND]: generateFrontendApiKey(Date.now(), 0),
    }
  },
})

export const orpcClient = createORPCClient(link) as JsonifiedClient<ContractRouterClient<typeof rootOrpcContract>>

export const orpcOpenClient = createORPCClient(openLink) as JsonifiedClient<
  ContractRouterClient<typeof rootOrpcContract>
>

export const orpcQuery = createTanstackQueryUtils(orpcClient)
export const orpcOpenQuery = createTanstackQueryUtils(orpcOpenClient)
