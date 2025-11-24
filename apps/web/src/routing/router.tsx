import { Navigate, Route, Routes } from 'react-router-dom'

import { ROUTE_PATHS } from './route-paths.ts'
import { CloneVoiceView } from '../components/onboarding/steps/clone-voice/clone-voice-view.tsx'
import { OnboardingSuccessView } from '../components/onboarding/steps/onboarding-success/onboarding-success-view.tsx'
import { SignInUp } from '../components/auth/sign-in-up/sign-in-up.tsx'
import { ProtectedRoute } from '../components/auth/protected-route.tsx'
import { ChooseMotherLanguageView } from '../components/onboarding/steps/choose-language/choose-mother-language-view.tsx'
import { ChooseStudyLanguageView } from '../components/onboarding/steps/choose-language/choose-study-language-view.tsx'
import { TermsAndConditionsView } from '../components/onboarding/steps/terms-and-conditions/terms-and-conditions-view.tsx'
import { NewCustomPronunciationEvaluationExerciseView } from '@/components/exercises/pronunciation-evaluation-exercise/new-custom-pronunciation-evaluation-exercise-view.tsx'
import { ChooseDialectView } from '../components/onboarding/steps/choose-dialect/choose-dialect-view.tsx'
import { PricingView } from '../components/pricing/pricing-view.tsx'
import { AccountRemovedSuccessView } from '../components/auth/account-removed-success-view.tsx'
import { AdminSettings } from '../components/views/admin-settings.tsx'
import { RedirectToCheckOut } from '../components/redirect-to-check-out.tsx'
import { ProgressView } from '../components/progress/progress-view.tsx'
import { FromLanding } from '../components/auth/from-landing.tsx'
import { SignInUpEmail } from '../components/auth/sign-in-up/sign-in-up-email.tsx'
import { SignInUpEmailVerificationSentView } from '../components/auth/sign-in-up/sign-in-up-email-verification-sent-view.tsx'
import { SignInUpEmailVerify } from '../components/auth/sign-in-up/sign-in-up-email-verify.tsx'
import { RequirePremiumPlanRoute } from '../components/auth/payment/require-premium-plan-route.tsx'
import { CheckoutSuccessView } from '../components/checkout/checkout-success-view'
import { DashboardView } from '../components/dashboard/dashboard-view.tsx'
import { AllowIfOnboarded } from '../components/onboarding/allow-if-onboarded.tsx'
import { AllowIfNotOnboarded } from '../components/onboarding/allow-if-not-onboarded.tsx'
import { RequireNicknameRoute } from '../components/leaderboard/require-nickname-route.tsx'
import { LeaderboardView } from '../components/leaderboard/leaderboard-view.tsx'
import { ChooseNicknameView } from '../components/leaderboard/choose-nickname-view.tsx'
import { FreeTrialExplanationView } from '../components/pricing/free-trial-explanation-view.tsx'
import { StressExerciseView } from '../components/exercises/stress-exercise/stress-exercise-view'
import { ConversationExerciseView } from '../components/exercises/conversation-exercise/conversation-exercise-view.tsx'
import { NewTranslationExerciseView } from '../components/exercises/translation-exercise/new-translation-exercise-view.tsx'
import { TranslationExerciseByIdView } from '../components/exercises/translation-exercise/translation-exercise-by-id-view.tsx'
import { NewStandardPronunciationEvaluationExerciseView } from '@/components/exercises/pronunciation-evaluation-exercise/new-standard-pronunciation-evaluation-exercise-view.tsx'
import { PronunciationEvaluationExerciseView } from '@/components/exercises/pronunciation-evaluation-exercise/pronunciation-evaluation-exercise-view.tsx'
import { HistoryTab } from '../components/progress/tabs/history/history-tab.tsx'
import { IpaConverterView } from '../components/ipa-converter/ipa-converter-view.tsx'
import { AllowIfClonedVoice } from '@/components/onboarding/allow-if-cloned-voice'
import { AllowIfNotClonedVoice } from '@/components/onboarding/allow-if-not-cloned-voice'

export const Router = () => {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.SIGN_IN} element={<SignInUp isSignIn={true} />} />
      <Route path={ROUTE_PATHS.SIGN_UP} element={<SignInUp isSignIn={false} />} />
      <Route path={ROUTE_PATHS.SIGN_IN_EMAIL} element={<SignInUpEmail isSignIn={true} />} />
      <Route path={ROUTE_PATHS.SIGN_UP_EMAIL} element={<SignInUpEmail isSignIn={false} />} />
      <Route
        path={ROUTE_PATHS.SIGN_IN_EMAIL_VERIFICATION_SENT}
        element={<SignInUpEmailVerificationSentView isSignIn={true} />}
      />
      <Route
        path={ROUTE_PATHS.SIGN_UP_EMAIL_VERIFICATION_SENT}
        element={<SignInUpEmailVerificationSentView isSignIn={false} />}
      />
      <Route path={ROUTE_PATHS.ACCOUNT_REMOVED} element={<AccountRemovedSuccessView />} />
      <Route path={ROUTE_PATHS.ADMIN_SETTINGS} element={<AdminSettings />} />
      <Route path={ROUTE_PATHS.FROM_LANDING} element={<FromLanding />} />
      <Route path={ROUTE_PATHS.SIGN_IN_UP_EMAIL_VERIFY} element={<SignInUpEmailVerify />} />
      <Route path={ROUTE_PATHS.CHECKOUT_SUCCESS} element={<CheckoutSuccessView />} />
      <Route path={ROUTE_PATHS.IPA_CONVERTER} element={<IpaConverterView />} />

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTE_PATHS.PRICING} element={<PricingView />} />
        <Route path={ROUTE_PATHS.PRICING_FREE_TRIAL} element={<FreeTrialExplanationView />} />
        <Route path={ROUTE_PATHS.REDIRECT_TO_CHECK_OUT} element={<RedirectToCheckOut />} />
        <Route element={<RequirePremiumPlanRoute />}>
          <Route element={<AllowIfNotOnboarded />}>
            <Route path={ROUTE_PATHS.ONBOARDING_MOTHER_LANGUAGE} element={<ChooseMotherLanguageView />} />
            <Route path={ROUTE_PATHS.ONBOARDING_STUDY_LANGUAGE} element={<ChooseStudyLanguageView />} />
            <Route path={ROUTE_PATHS.ONBOARDING_DIALECT} element={<ChooseDialectView />} />
            {/*todo onboarding: we don't want to show those onboarding steps for the translation exercise for now */}
            {/*<Route path={ROUTE_PATHS.ONBOARDING_DAILY_STUDY_TIME} element={<ChooseDailyStudyTimeView />} />*/}
            {/*<Route path={ROUTE_PATHS.ONBOARDING_TOPICS} element={<ChooseTopicsView />} />*/}
          </Route>
          <Route element={<AllowIfOnboarded />}>
            <Route element={<AllowIfClonedVoice />}>
              <Route path={ROUTE_PATHS.CONVERSATION_EXERCISE} element={<ConversationExerciseView />} />
              <Route
                path={ROUTE_PATHS.PRONUNCIATION_EVALUATION_CUSTOM_EXERCISE_START}
                element={<NewCustomPronunciationEvaluationExerciseView />}
              />
              <Route
                path={ROUTE_PATHS.PRONUNCIATION_EVALUATION_STANDARD_EXERCISE_START}
                element={<NewStandardPronunciationEvaluationExerciseView />}
              />
              <Route
                path={ROUTE_PATHS.PRONUNCIATION_EVALUATION_EXERCISE_BY_ID}
                element={<PronunciationEvaluationExerciseView />}
              />
            </Route>
            <Route element={<AllowIfNotClonedVoice />}>
              <Route path={ROUTE_PATHS.ONBOARDING_TERMS_AND_CONDITIONS} element={<TermsAndConditionsView />} />
              <Route path={ROUTE_PATHS.ONBOARDING_CLONE_VOICE} element={<CloneVoiceView />} />
              <Route path={ROUTE_PATHS.ONBOARDING_SUCCESS} element={<OnboardingSuccessView />} />
            </Route>
            <Route path={ROUTE_PATHS.DASHBOARD} element={<DashboardView />} />
            <Route path={ROUTE_PATHS.STRESS_EXERCISE} element={<StressExerciseView />} />
            <Route path={ROUTE_PATHS.TRANSLATION_EXERCISE_START} element={<NewTranslationExerciseView />} />
            <Route path={ROUTE_PATHS.TRANSLATION_EXERCISE_BY_ID} element={<TranslationExerciseByIdView />} />

            <Route path={ROUTE_PATHS.PROGRESS} element={<Navigate replace to={ROUTE_PATHS.PROGRESS_STREAK} />} />
            <Route path={ROUTE_PATHS.PROGRESS_STREAK} element={<ProgressView />} />
            <Route path={ROUTE_PATHS.PROGRESS_BADGES_ALL} element={<ProgressView />} />
            <Route path={ROUTE_PATHS.PROGRESS_BADGES_STREAK} element={<ProgressView />} />
            <Route path={ROUTE_PATHS.PROGRESS_BADGES_WORDS} element={<ProgressView />} />
            <Route path={ROUTE_PATHS.PROGRESS_BADGES_LANGUAGES} element={<ProgressView />} />
            <Route
              path={ROUTE_PATHS.PROGRESS_BADGES}
              element={<Navigate replace to={ROUTE_PATHS.PROGRESS_BADGES_ALL} />}
            />
            <Route path={ROUTE_PATHS.PROGRESS_STATS_LEARNED_WORDS} element={<ProgressView />} />
            <Route path={ROUTE_PATHS.PROGRESS_STATS_SAVED_WORDS} element={<ProgressView />} />
            <Route path={ROUTE_PATHS.PROGRESS_STATS} element={<ProgressView />} />
            <Route path={ROUTE_PATHS.PROGRESS_HISTORY} element={<HistoryTab />} />

            <Route path={ROUTE_PATHS.CHOOSE_NICKNAME} element={<ChooseNicknameView />} />
            <Route element={<RequireNicknameRoute />}>
              <Route path={ROUTE_PATHS.LEADERBOARD} element={<LeaderboardView />} />
            </Route>
          </Route>
          <Route path={'*'} element={<Navigate replace to={ROUTE_PATHS.DASHBOARD} />} />
        </Route>
        <Route path={'*'} element={<Navigate replace to={ROUTE_PATHS.DASHBOARD} />} />
      </Route>
    </Routes>
  )
}
