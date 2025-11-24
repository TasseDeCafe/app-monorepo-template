import { Stack } from 'expo-router'
import { BackButton } from '@/components/ui/back-button'
import colors from 'tailwindcss/colors'
import { useLingui } from '@lingui/react/macro'

export default function AboutLayout() {
  const { t } = useLingui()

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.indigo[50] },
        headerStyle: {
          backgroundColor: colors.indigo[50],
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: t`About`,
          headerLeft: () => <BackButton />,
          headerShown: true,
        }}
      />
    </Stack>
  )
}
