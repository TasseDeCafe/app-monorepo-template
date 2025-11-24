import postgres from 'postgres'
import { getConfig } from '../../config/environment-config'

export const sql: postgres.Sql = postgres(getConfig().supabaseConnectionString)

// export const sqlWithOnePool = sql.createPool({ max: 1 })
