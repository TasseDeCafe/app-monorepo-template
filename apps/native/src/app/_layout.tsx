import '../global.css'
import '@/polyfills/intl'
import { Stack, useNavigationContainerRef } from 'expo-router'
import { validateConfig } from '@/config/environment-config-validator'
import { getConfig } from '@/config/environment-config'
import * as Sentry from '@sentry/react-native'
import { initializeSentry, navigationIntegration } from '@/analytics/sentry/sentry-initializer'
import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { BottomSheetController } from '@/components/sheets/bottom-sheet-controller'
import { PortalHost } from '@rn-primitives/portal'
import { queryClient } from '@/config/react-query-config'
import { LocaleInitializer } from '@/i18n/locale-initializer'
import { useAuthStore } from '@/stores/auth-store'
import { SessionInitializer } from '@/components/gates/auth/session-initializer'
import { EasUpdateGate } from '@/components/gates/eas-update-gate'
import { useBottomSheetStore } from '@/stores/bottom-sheet-store'
import { UserSetupGate } from '@/components/gates/user-setup-gate'
import { PostHogProvider } from 'posthog-react-native'
import { posthog } from '@/analytics/posthog/posthog'

validateConfig(getConfig())
initializeSentry()

const RootLayout = () => {
  const ref = useNavigationContainerRef()
  const session = useAuthStore((state) => state.session)
  const isSignedIn = !!session
  const activeSheetName = useBottomSheetStore((state) => state.activeSheetName)
  const isBottomSheetOpen = activeSheetName !== null

  // Register the navigation container with Sentry to enable automatic navigation tracking
  // This allows Sentry to monitor navigation performance metrics and capture navigation-related errors
  // See: https://docs.sentry.io/platforms/react-native/tracing/instrumentation/expo-router/
  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref)
    }
  }, [ref])

  return (
    <PostHogProvider client={posthog}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <LocaleInitializer>
            <BottomSheetModalProvider>
              <KeyboardProvider>
                <SessionInitializer>
                  <EasUpdateGate>
                    <UserSetupGate>
                      <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Protected guard={!isSignedIn}>
                          <Stack.Screen name='(auth)' />
                        </Stack.Protected>
                        <Stack.Protected guard={isSignedIn}>
                          <Stack.Screen name='(requires-auth)' />
                        </Stack.Protected>
                        <Stack.Screen
                          name='+not-found'
                          options={{
                            headerShown: true,
                            title: 'Oops!',
                          }}
                        />
                      </Stack>
                      <BottomSheetController />
                      <Toaster position={isBottomSheetOpen ? 'top-center' : 'bottom-center'} duration={600} />
                      <PortalHost />
                    </UserSetupGate>
                  </EasUpdateGate>
                </SessionInitializer>
              </KeyboardProvider>
            </BottomSheetModalProvider>
          </LocaleInitializer>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </PostHogProvider>
  )
}

export default Sentry.wrap(RootLayout)
