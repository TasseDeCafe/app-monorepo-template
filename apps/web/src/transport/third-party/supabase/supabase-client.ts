import { createClient } from '@supabase/supabase-js'
import { getConfig } from '@/config/environment-config'

const supabaseClient: ReturnType<typeof createClient> = createClient(
  getConfig().supabaseProjectUrl,
  getConfig().supabaseProjectKey
)

export const getSupabaseClient = () => {
  return supabaseClient
}
