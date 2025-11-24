import { execSync } from 'child_process'
import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../orpc/orpc-context'
import { sql } from '../../transport/database/postgres-client'
import { healthCheckContract } from '@yourbestaccent/api-client/orpc-contracts/health-check-contract'

export const HealthCheckRouter = (): Router => {
  const implementer = implement(healthCheckContract).$context<OrpcContext>()

  const router = implementer.router({
    getHealthCheck: implementer.getHealthCheck.handler(async () => {
      // todo: we should check the commit of the deployed version, not just the commit of pulled code
      const gitCommit = execSync('git rev-parse --short HEAD').toString().trim()

      return {
        data: {
          isHealthy: true,
          gitCommit,
        },
      }
    }),

    getDatabaseHealthCheck: implementer.getDatabaseHealthCheck.handler(async ({ errors }) => {
      // todo: we should check the commit of the deployed version, not just the commit of pulled code
      const gitCommit = execSync('git rev-parse --short HEAD').toString().trim()

      try {
        await sql`SELECT 1`
        return {
          data: {
            isDatabaseConnectionHealthy: true,
            gitCommit,
          },
        }
      } catch {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Database connection failed' }],
          },
        })
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: healthCheckContract })
}
