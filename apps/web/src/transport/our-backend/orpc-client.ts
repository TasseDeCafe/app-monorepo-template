import type { ContractRouterClient } from '@orpc/contract'
import type { JsonifiedClient } from '@orpc/openapi-client'
import { createORPCClient } from '@orpc/client'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { OpenAPILink } from '@orpc/openapi-client/fetch'
import { getConfig } from '@/config/environment-config'
import { useAuthStore, getAccessToken } from '@/stores/auth-store'
import { NAME_OF_SECRET_HEADER_USED_FOR_AUTHENTICATING_FRONTEND } from '@template-app/api-client/key-generation/frontend-api-key-constants'
import { generateFrontendApiKey } from '@template-app/api-client/key-generation/frontend-api-key-generator'
import { rootOrpcContract } from '@template-app/api-client/orpc-contracts/root-contract'

const apiPrefix = '/api/v1'
const hostWithPrefix = `${getConfig().apiHost}${apiPrefix}`

const link = new OpenAPILink(rootOrpcContract, {
  url: hostWithPrefix,
  headers: () => {
    const state = useAuthStore.getState()
    const accessToken = getAccessToken(state)

    const headers: Record<string, string> = {
      [NAME_OF_SECRET_HEADER_USED_FOR_AUTHENTICATING_FRONTEND]: generateFrontendApiKey(Date.now(), 0),
    }

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    return headers
  },
})

export const orpcClient = createORPCClient(link) as JsonifiedClient<ContractRouterClient<typeof rootOrpcContract>>

export const orpcQuery = createTanstackQueryUtils(orpcClient)
