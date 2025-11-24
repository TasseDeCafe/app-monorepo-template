import { createClient } from '@supabase/supabase-js'
import { getConfig } from '../../config/environment-config'

let supabase: ReturnType<typeof createClient>

export const getSupabase = () => {
  if (!supabase) {
    supabase = createClient(getConfig().supabaseUrl, getConfig().supabaseServiceRoleKey)
  }
  return supabase
}
