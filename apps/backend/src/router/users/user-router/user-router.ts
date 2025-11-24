import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../../orpc/orpc-context'
import { DbUser, UsersRepositoryInterface } from '../../../transport/database/users/users-repository'
import { processReferral } from './user-router-utils'
import { logMessage } from '../../../transport/third-party/sentry/error-monitoring'
import { CustomerioApi } from '../../../transport/third-party/customerio/customerio-api'
import { WordsRepositoryInterface } from '../../../transport/database/words/words-repository'
import { ElevenlabsApi } from '../../../transport/third-party/elevenlabs/elevenlabs-api'
import { getConfig } from '../../../config/environment-config'
import { LANGUAGES_TO_DIALECT_MAP } from '@yourbestaccent/core/constants/lang-codes'
import { AUDIO_TOO_SHORT_MESSAGE, userContract } from '@yourbestaccent/api-client/orpc-contracts/user-contract'
import { CUSTOM_CUSTOMERIO_ATTRIBUTE } from '../../../transport/third-party/customerio/types'
import { createDefaultSettings } from '../../../transport/database/users/users-repositoru.utils'
import { UserStatsServiceInterface } from '../../../service/user-stats/user-stats-service'
import { STREAK_BADGE_THRESHOLDS } from '@yourbestaccent/core/constants/badges-constants'
import { fileToUploadedFile } from '../../../types/uploaded-file'
import { getAudioDurationInSeconds } from '../../../utils/audio/get-audio-duration'
import { MIN_LENGTH_OF_AUDIO_FOR_CLONING_IN_SECONDS } from '@yourbestaccent/core/constants/voice-cloning-constants'

export const UserRouter = (
  customerioApi: CustomerioApi,
  elevenLabsApi: ElevenlabsApi,
  usersRepository: UsersRepositoryInterface,
  userStatsService: UserStatsServiceInterface,
  wordsRepository: WordsRepositoryInterface
): Router => {
  const implementer = implement(userContract).$context<OrpcContext>()

  const router = implementer.router({
    getUser: implementer.getUser.handler(async ({ context, errors }) => {
      const userId = context.res.locals.userId

      const dbUser = await usersRepository.findUserByUserId(userId)
      if (!dbUser) {
        throw errors.NOT_FOUND({
          data: {
            errors: [{ message: 'User not found' }],
          },
        })
      }

      const [countersResult, dailyWordsLearnedResult, userSettingsResult, userStatsResult] = await Promise.all([
        wordsRepository.selectWordCounters(userId),
        wordsRepository.getDailyWordsLearned(userId),
        usersRepository.getUserSettings(userId),
        userStatsService.getUserStatsForUser(userId),
      ])

      if (!countersResult.isSuccess) {
        logMessage(`could not select word counters, userId - ${userId}`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'an error occurred while retrieving the user' }],
          },
        })
      }
      if (!dailyWordsLearnedResult.isSuccess) {
        logMessage(`could not select daily words learned, userId - ${userId}`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'an error occurred while retrieving the user' }],
          },
        })
      }
      if (!userSettingsResult) {
        logMessage(`could not select user settings, userId - ${userId}`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'an error occurred while retrieving the user' }],
          },
        })
      }
      if (!userStatsResult.isSuccess) {
        logMessage(`could not select user stats, userId - ${userId}`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'an error occurred while retrieving the user' }],
          },
        })
      }

      return {
        data: {
          hasVoice: !!dbUser.elevenlabs_voice_id,
          counters: countersResult.counters,
          learnedWordsByDay: dailyWordsLearnedResult.learnedWordsByDay,
          stats: userStatsResult.userStats,
          settings: userSettingsResult,
          referral: dbUser.referral,
          studyLanguage: dbUser.study_language,
          studyDialect: dbUser.study_dialect,
          dailyStudyMinutes: dbUser.daily_study_minutes,
          motherLanguage: dbUser.mother_language,
          topics: dbUser.topics,
          nickname: dbUser.nickname,
          utmSource: dbUser.utm_source,
          utmMedium: dbUser.utm_medium,
          utmCampaign: dbUser.utm_campaign,
          utmTerm: dbUser.utm_term,
          utmContent: dbUser.utm_content,
        },
      }
    }),

    putUser: implementer.putUser.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId
      const userEmail = context.res.locals.email
      const { referral, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = input

      const dbUser: DbUser | null = await usersRepository.findUserByUserId(userId)

      if (!dbUser) {
        const processedReferral = processReferral(referral)
        const hasInsertedSuccessfully = await usersRepository.insertUser(userId, processedReferral, {
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          utmTerm: utmTerm || null,
          utmContent: utmContent || null,
        })
        if (!hasInsertedSuccessfully) {
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [{ message: 'An error occurred while inserting the user.' }],
            },
          })
        }

        await customerioApi.identifyCustomer(userId, {
          [CUSTOM_CUSTOMERIO_ATTRIBUTE.EMAIL]: userEmail,
          [CUSTOM_CUSTOMERIO_ATTRIBUTE.HAS_VOICE]: false,
          [CUSTOM_CUSTOMERIO_ATTRIBUTE.REFERRAL]: referral ?? null,
          [CUSTOM_CUSTOMERIO_ATTRIBUTE.MOTHER_LANGUAGE]: null,
          [CUSTOM_CUSTOMERIO_ATTRIBUTE.STUDY_LANGUAGE]: null,
          [CUSTOM_CUSTOMERIO_ATTRIBUTE.STUDY_DIALECT]: null,
          [CUSTOM_CUSTOMERIO_ATTRIBUTE.NICKNAME]: null,
          [CUSTOM_CUSTOMERIO_ATTRIBUTE.CURRENT_PLAN]: null,
          [CUSTOM_CUSTOMERIO_ATTRIBUTE.CURRENT_PLAN_INTERVAL]: null,
        })

        return {
          data: {
            hasVoice: false,
            counters: [],
            learnedWordsByDay: [],
            stats: {
              currentStreak: 0,
              longestStreak: 0,
              totalDaysLearned: 0,
              numberOfDaysOfNextStreakBadge: STREAK_BADGE_THRESHOLDS[0],
              numberOfAchievedStreakBadges: 0,
              xpEarnedToday: 0,
              totalXp: 0,
            },
            settings: createDefaultSettings(),
            referral: referral ?? null,
            studyLanguage: null,
            studyDialect: null,
            dailyStudyMinutes: null,
            motherLanguage: null,
            topics: [],
            nickname: null,
            utmSource: utmSource ?? null,
            utmMedium: utmMedium ?? null,
            utmCampaign: utmCampaign ?? null,
            utmTerm: utmTerm ?? null,
            utmContent: utmContent ?? null,
          },
        }
      }

      const [countersResult, dailyWordsLearnedResult, userSettingsResult, userStatsResult] = await Promise.all([
        wordsRepository.selectWordCounters(userId),
        wordsRepository.getDailyWordsLearned(userId),
        usersRepository.getUserSettings(userId),
        userStatsService.getUserStatsForUser(userId),
      ])

      if (!countersResult.isSuccess) {
        logMessage(`could not select word counters, userId - ${userId}`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'an error occurred while retrieving the user' }],
          },
        })
      }
      if (!dailyWordsLearnedResult.isSuccess) {
        logMessage(`could not select daily words learned, userId - ${userId}`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'an error occurred while retrieving the user' }],
          },
        })
      }
      if (!userSettingsResult) {
        logMessage(`could not select user settings, userId - ${userId}`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'an error occurred while retrieving the user' }],
          },
        })
      }
      if (!userStatsResult.isSuccess) {
        logMessage(`could not select user stats, userId - ${userId}`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'an error occurred while retrieving the user' }],
          },
        })
      }

      return {
        data: {
          hasVoice: !!dbUser.elevenlabs_voice_id,
          counters: countersResult.counters,
          learnedWordsByDay: dailyWordsLearnedResult.learnedWordsByDay,
          stats: userStatsResult.userStats,
          settings: userSettingsResult,
          referral: dbUser.referral,
          studyLanguage: dbUser.study_language,
          studyDialect: dbUser.study_dialect,
          dailyStudyMinutes: dbUser.daily_study_minutes,
          motherLanguage: dbUser.mother_language,
          topics: dbUser.topics,
          nickname: dbUser.nickname,
          utmSource: dbUser.utm_source,
          utmMedium: dbUser.utm_medium,
          utmCampaign: dbUser.utm_campaign,
          utmTerm: dbUser.utm_term,
          utmContent: dbUser.utm_content,
        },
      }
    }),

    patchUser: implementer.patchUser.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId
      const userEmail = context.res.locals.email
      const { audio, langCode } = input

      const dbUser = await usersRepository.findUserByUserId(userId)
      if (!dbUser) {
        throw errors.NOT_FOUND({
          data: {
            errors: [{ message: 'User not found' }],
          },
        })
      }

      // Check if voice is already cloned
      if (dbUser?.elevenlabs_voice_id) {
        logMessage(`PATCH /users/me already cloned the voice: langCode - ${langCode}`)
        throw errors.NOT_FOUND({
          data: {
            errors: [{ message: 'User already cloned the voice' }],
          },
        })
      }
      const uploadedFile = await fileToUploadedFile(audio)

      if (!getConfig().shouldSkipVoiceCloningChecks) {
        const durationInSeconds = await getAudioDurationInSeconds(uploadedFile)

        if (durationInSeconds === null) {
          logMessage(`PATCH /users/me audio duration unavailable: langCode - ${langCode}`)
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [{ message: 'There was an error when updating the user' }],
            },
          })
        }

        if (durationInSeconds < MIN_LENGTH_OF_AUDIO_FOR_CLONING_IN_SECONDS) {
          // we don't log this validation error, the user has to handle it by recording
          // a longer audio.
          throw errors.AUDIO_VALIDATION_ERROR({
            data: {
              errors: [{ message: AUDIO_TOO_SHORT_MESSAGE }],
            },
          })
        }
      }

      const cloneVoiceResult = await elevenLabsApi.cloneVoice(uploadedFile, userId)

      if (cloneVoiceResult.status === 'voice_too_short') {
        throw errors.AUDIO_VALIDATION_ERROR({
          data: {
            errors: [{ message: AUDIO_TOO_SHORT_MESSAGE }],
          },
        })
      }

      if (cloneVoiceResult.status === 'failure') {
        logMessage(`PATCH /users/me cloneVoice unexpected error: langCode - ${langCode}`)
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Cloning voice with 11labs api failed' }],
          },
        })
      }

      const hasUpdatedUserSuccessfully = await usersRepository.updateUser(userId, cloneVoiceResult.voice.voice_id)

      if (!hasUpdatedUserSuccessfully) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'There was an error when updating the user' }],
          },
        })
      }

      await customerioApi.updateCustomer(userId, {
        [CUSTOM_CUSTOMERIO_ATTRIBUTE.EMAIL]: userEmail,
        [CUSTOM_CUSTOMERIO_ATTRIBUTE.HAS_VOICE]: true,
      })

      return {
        data: {
          hasVoice: true,
        },
      }
    }),

    patchMotherLanguage: implementer.patchMotherLanguage.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId
      const userEmail = context.res.locals.email
      const { motherLanguage } = input

      const result = await usersRepository.updateUserMotherLanguage(userId, motherLanguage)

      if (result === null) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Failed to update user mother language' }],
          },
        })
      }

      await customerioApi.updateCustomer(userId, {
        [CUSTOM_CUSTOMERIO_ATTRIBUTE.EMAIL]: userEmail,
        [CUSTOM_CUSTOMERIO_ATTRIBUTE.MOTHER_LANGUAGE]: result,
      })

      return {
        data: {
          motherLanguage: result,
        },
      }
    }),

    patchStudyLanguage: implementer.patchStudyLanguage.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId
      const userEmail = context.res.locals.email
      const { studyLanguage } = input

      const result = await usersRepository.updateUserStudyLanguage(userId, studyLanguage)

      if (result === null) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Failed to update user study language' }],
          },
        })
      }

      await customerioApi.updateCustomer(userId, {
        [CUSTOM_CUSTOMERIO_ATTRIBUTE.EMAIL]: userEmail,
        [CUSTOM_CUSTOMERIO_ATTRIBUTE.STUDY_LANGUAGE]: result,
      })

      return {
        data: {
          studyLanguage: result,
        },
      }
    }),

    patchStudyDialect: implementer.patchStudyDialect.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId
      const userEmail = context.res.locals.email
      const { studyDialect } = input

      const result = await usersRepository.updateUserStudyDialect(userId, studyDialect)

      if (!result) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Failed to update user study dialect' }],
          },
        })
      }

      await customerioApi.updateCustomer(userId, {
        [CUSTOM_CUSTOMERIO_ATTRIBUTE.EMAIL]: userEmail,
        [CUSTOM_CUSTOMERIO_ATTRIBUTE.STUDY_LANGUAGE]: result as string,
      })

      return {
        data: {
          studyDialect: result,
        },
      }
    }),

    patchStudyLanguageAndDialect: implementer.patchStudyLanguageAndDialect.handler(
      async ({ input, context, errors }) => {
        const userId = context.res.locals.userId
        const userEmail = context.res.locals.email
        const { studyLanguage, studyDialect } = input

        if (!LANGUAGES_TO_DIALECT_MAP[studyLanguage].includes(studyDialect)) {
          logMessage(
            `PATCH /users/me/study_language_and_study_dialect Invalid dialect for study language: request - ${JSON.stringify(
              {
                studyLanguage,
                studyDialect,
              }
            )}, userId - ${userId}`
          )
          throw errors.BAD_REQUEST({
            data: {
              errors: [{ message: 'Invalid dialect for study language' }],
            },
          })
        }

        const result = await usersRepository.updateUserStudyLanguageAndDialect(userId, studyLanguage, studyDialect)

        if (!result) {
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              errors: [{ message: 'Failed to update user study language and dialect' }],
            },
          })
        }

        await customerioApi.updateCustomer(userId, {
          [CUSTOM_CUSTOMERIO_ATTRIBUTE.EMAIL]: userEmail,
          [CUSTOM_CUSTOMERIO_ATTRIBUTE.STUDY_LANGUAGE]: result.study_language,
          [CUSTOM_CUSTOMERIO_ATTRIBUTE.STUDY_DIALECT]: result.study_dialect,
        })

        return {
          data: {
            studyLanguage: result.study_language,
            studyDialect: result.study_dialect,
          },
        }
      }
    ),

    getTopics: implementer.getTopics.handler(async ({ context, errors }) => {
      const userId = context.res.locals.userId

      const dbUser = await usersRepository.findUserByUserId(userId)
      if (!dbUser) {
        throw errors.NOT_FOUND({
          data: {
            errors: [{ message: 'User not found' }],
          },
        })
      }

      return {
        data: {
          topics: dbUser.topics,
        },
      }
    }),

    patchTopics: implementer.patchTopics.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId
      const { topics } = input

      const result = await usersRepository.updateUserTopics(userId, topics)

      if (!result) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Failed to update user topics' }],
          },
        })
      }

      return {
        data: {
          topics: result,
        },
      }
    }),

    patchDailyStudyMinutes: implementer.patchDailyStudyMinutes.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId
      const { dailyStudyMinutes } = input

      const result = await usersRepository.updateUserDailyStudyMinutes(userId, dailyStudyMinutes)

      if (result === null) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Failed to update user daily study minutes' }],
          },
        })
      }

      return {
        data: {
          dailyStudyMinutes: result,
        },
      }
    }),

    getNickname: implementer.getNickname.handler(async ({ context, errors }) => {
      const userId = context.res.locals.userId

      const dbUser = await usersRepository.findUserByUserId(userId)
      if (!dbUser) {
        throw errors.NOT_FOUND({
          data: {
            errors: [{ message: 'User not found' }],
          },
        })
      }

      return {
        data: {
          nickname: dbUser.nickname,
        },
      }
    }),

    patchNickname: implementer.patchNickname.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId
      const userEmail = context.res.locals.email
      const { nickname } = input

      const existingUser = await usersRepository.findUserByNickname(nickname)

      if (existingUser) {
        throw errors.BAD_REQUEST({
          data: {
            errors: [{ message: 'This nickname is already taken' }],
          },
        })
      }

      const result = await usersRepository.updateUserNickname(userId, nickname)

      if (!result) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Failed to update nickname' }],
          },
        })
      }

      await customerioApi.updateCustomer(userId, {
        [CUSTOM_CUSTOMERIO_ATTRIBUTE.EMAIL]: userEmail,
        [CUSTOM_CUSTOMERIO_ATTRIBUTE.NICKNAME]: nickname,
      })

      return {
        data: {
          nickname: nickname,
        },
      }
    }),

    getNicknameAvailability: implementer.getNicknameAvailability.handler(async ({ input }) => {
      const { nickname } = input

      const existingUser = await usersRepository.findUserByNickname(nickname)

      if (existingUser) {
        return {
          data: {
            isAvailable: false,
            message: 'This nickname is already taken',
          },
        }
      }

      return {
        data: {
          isAvailable: true,
          message: 'This nickname is available',
        },
      }
    }),

    getUserStats: implementer.getUserStats.handler(async ({ context, errors }) => {
      const userId = context.res.locals.userId

      const userStatsResult = await userStatsService.getUserStatsForUser(userId)

      if (!userStatsResult.isSuccess) {
        throw errors.NOT_FOUND({
          data: {
            errors: [{ message: 'User stats not found' }],
          },
        })
      }

      return {
        data: userStatsResult.userStats,
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: userContract })
}
