import { sql } from '../postgres-client'
import { logCustomErrorMessageAndError } from '../../third-party/sentry/error-monitoring'
import {
  XpRepositoryInterface,
  DbGetDailyWeightedLengthsResult,
  DbDailyWeightedLength,
  DbGetLeaderboardDataResult,
  DbLeaderboardUserData,
} from './xp-repository-types'
import { LEADERBOARD_LIMITS } from './xp-leaderboard-constants'

export const XpRepository = (): XpRepositoryInterface => {
  const getDailyWeightedLengths = async (userId: string): Promise<DbGetDailyWeightedLengthsResult> => {
    try {
      const result = await sql`
        SELECT 
          DATE(pa.created_at) as date,
          COALESCE(SUM(LENGTH(pe.text) * pa.user_score), 0) as total_weighted_length
        FROM public.pronunciation_evaluation_attempts pa
        INNER JOIN public.pronunciation_evaluation_exercises pe ON pa.pronunciation_exercise_id = pe.id
        WHERE pe.user_id = ${userId}::uuid
        GROUP BY DATE(pa.created_at)
        ORDER BY DATE(pa.created_at) ASC
      `

      const dailyData: DbDailyWeightedLength[] = result.map((row) => ({
        date: row.date,
        total_weighted_length: Number(row.total_weighted_length),
      }))

      return {
        isSuccess: true,
        dailyData,
      }
    } catch (e) {
      logCustomErrorMessageAndError(`getDailyWeightedLengths error, userId = ${userId}`, e)
      return {
        isSuccess: false,
        dailyData: null,
      }
    }
  }

  const getLeaderboardData = async (): Promise<DbGetLeaderboardDataResult> => {
    try {
      const result = await sql`
        WITH user_xp_all_time AS (
          SELECT 
            pe.user_id,
            pe.language,
            SUM(LENGTH(pe.text) * pa.user_score) as total_weighted_length
          FROM public.pronunciation_evaluation_exercises pe
          INNER JOIN public.pronunciation_evaluation_attempts pa ON pe.id = pa.pronunciation_exercise_id
          GROUP BY pe.user_id, pe.language
          HAVING SUM(LENGTH(pe.text) * pa.user_score) > 0
        ),
        user_xp_weekly AS (
          SELECT 
            pe.user_id,
            pe.language,
            SUM(LENGTH(pe.text) * pa.user_score) as total_weighted_length
          FROM public.pronunciation_evaluation_exercises pe
          INNER JOIN public.pronunciation_evaluation_attempts pa ON pe.id = pa.pronunciation_exercise_id
          WHERE pa.created_at >= date_trunc('week', CURRENT_TIMESTAMP)
          GROUP BY pe.user_id, pe.language
          HAVING SUM(LENGTH(pe.text) * pa.user_score) > 0
        ),
        -- Overall all-time leaderboard (aggregated across languages per user)
        overall_all_time AS (
          SELECT 
            u.id as user_id,
            u.nickname,
            'all_time' as time_period,
            NULL::VARCHAR(3) as language,
            SUM(uxat.total_weighted_length) as total_weighted_length,
            ROW_NUMBER() OVER (ORDER BY SUM(uxat.total_weighted_length) DESC) as rank
          FROM public.users u
          INNER JOIN user_xp_all_time uxat ON u.id = uxat.user_id
          GROUP BY u.id, u.nickname
          ORDER BY total_weighted_length DESC
          LIMIT ${LEADERBOARD_LIMITS.OVERALL_ALL_TIME_LIMIT}
        ),
        -- Overall weekly leaderboard (aggregated across languages per user)
        overall_weekly AS (
          SELECT 
            u.id as user_id,
            u.nickname,
            'weekly' as time_period,
            NULL::VARCHAR(3) as language,
            SUM(uxw.total_weighted_length) as total_weighted_length,
            ROW_NUMBER() OVER (ORDER BY SUM(uxw.total_weighted_length) DESC) as rank
          FROM public.users u
          INNER JOIN user_xp_weekly uxw ON u.id = uxw.user_id
          GROUP BY u.id, u.nickname
          ORDER BY total_weighted_length DESC
          LIMIT ${LEADERBOARD_LIMITS.OVERALL_WEEKLY_LIMIT}
        ),
        -- By-language all-time leaderboards
        by_language_all_time AS (
          SELECT 
            u.id as user_id,
            u.nickname,
            'all_time' as time_period,
            uxat.language,
            uxat.total_weighted_length,
            ROW_NUMBER() OVER (PARTITION BY uxat.language ORDER BY uxat.total_weighted_length DESC) as rank
          FROM public.users u
          INNER JOIN user_xp_all_time uxat ON u.id = uxat.user_id
        ),
        -- By-language weekly leaderboards  
        by_language_weekly AS (
          SELECT 
            u.id as user_id,
            u.nickname,
            'weekly' as time_period,
            uxw.language,
            uxw.total_weighted_length,
            ROW_NUMBER() OVER (PARTITION BY uxw.language ORDER BY uxw.total_weighted_length DESC) as rank
          FROM public.users u
          INNER JOIN user_xp_weekly uxw ON u.id = uxw.user_id
        ),
        -- Combine all results with proper limits
        final_results AS (
          -- Overall leaderboards
          SELECT user_id, nickname, time_period, language, total_weighted_length 
          FROM overall_all_time
          
          UNION ALL
          
          SELECT user_id, nickname, time_period, language, total_weighted_length 
          FROM overall_weekly
          
          UNION ALL
          
          -- By-language all-time (limited per language)
          SELECT user_id, nickname, time_period, language, total_weighted_length 
          FROM by_language_all_time 
          WHERE rank <= ${LEADERBOARD_LIMITS.BY_LANGUAGE_ALL_TIME_LIMIT}
          
          UNION ALL
          
          -- By-language weekly (limited per language)  
          SELECT user_id, nickname, time_period, language, total_weighted_length 
          FROM by_language_weekly 
          WHERE rank <= ${LEADERBOARD_LIMITS.BY_LANGUAGE_WEEKLY_LIMIT}
        )
        SELECT 
          user_id,
          nickname,
          time_period,
          language,
          total_weighted_length
        FROM final_results
        ORDER BY 
          time_period,
          CASE WHEN language IS NULL THEN 0 ELSE 1 END, -- Overall leaderboards first
          language NULLS FIRST,
          total_weighted_length DESC
      `

      const userData: DbLeaderboardUserData[] = result.map((row) => ({
        user_id: row.user_id,
        nickname: row.nickname,
        language: row.language,
        time_period: row.time_period,
        total_weighted_length: Number(row.total_weighted_length),
      }))

      return {
        isSuccess: true,
        userData,
      }
    } catch (e) {
      logCustomErrorMessageAndError('getLeaderboardData error', e)
      return {
        isSuccess: false,
        userData: null,
      }
    }
  }

  return {
    getDailyWeightedLengths,
    getLeaderboardData,
  }
}
