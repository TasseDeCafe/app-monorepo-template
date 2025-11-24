const IS_DEV = process.env.APP_VARIANT === 'development'
const IS_PREVIEW = process.env.APP_VARIANT === 'preview'

export const getUniqueIosIdentifier = () => {
  if (IS_DEV) {
    return 'com.template-app.ios.dev'
  }
  if (IS_PREVIEW) {
    return 'com.template-app.ios.preview'
  }
  return 'com.template-app.ios'
}

export const getUniqueAndroidIdentifier = () => {
  if (IS_DEV) {
    return 'com.template-app.android.dev'
  }
  if (IS_PREVIEW) {
    return 'com.template-app.android.preview'
  }
  return 'com.template-app.android'
}

const getAppName = () => {
  if (IS_DEV) {
    return 'DEV - TemplateApp'
  }
  if (IS_PREVIEW) {
    return 'PREVIEW - TemplateApp'
  }
  return 'TemplateApp'
}

const getAppHost = () => {
  if (IS_DEV) {
    return '*.template-app.dev'
  }
  return 'app.template-app.com'
}

const getAssociatedDomains = () => {
  const productionDomains = ['applinks:app.template-app.com']
  if (IS_DEV) {
    return [
      ...productionDomains,
      'applinks:frontend-kamil.template-app.dev',
      'applinks:frontend-sebastien.template-app.dev',
    ]
  }
  return productionDomains
}

const config = {
  expo: {
    name: getAppName(),
    owner: 'template-app',
    slug: 'native',
    version: '0.0.1',
    orientation: 'portrait',
    icon: './src/assets/images/icon.png',
    scheme: 'template-app',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      usesAppleSignIn: true,
      supportsTablet: false,
      bundleIdentifier: getUniqueIosIdentifier(),
      associatedDomains: getAssociatedDomains(),
      universalLinks: {
        paths: [
          '/sign-in-up/email/verify',
          '(auth)/sign-in-up/email/verify',
          '/sign-in-up/email/*',
          '(auth)/sign-in-up/email/*',
        ],
      },
      infoPlist: {
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              // See https://docs.expo.dev/guides/google-authentication/
              'com.googleusercontent.apps.1027541565281-6929mrqjia9tbq6mqeoce4v8eofpe7k2',
            ],
          },
        ],
        ITSAppUsesNonExemptEncryption: false,
      },
      // this is required by Apple for Sentry: https://docs.sentry.io/platforms/react-native/data-management/apple-privacy-manifest/
      privacyManifests: {
        NSPrivacyCollectedDataTypes: [
          {
            NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeCrashData',
            NSPrivacyCollectedDataTypeLinked: false,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
          },
          {
            NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePerformanceData',
            NSPrivacyCollectedDataTypeLinked: false,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
          },
          {
            NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeOtherDiagnosticData',
            NSPrivacyCollectedDataTypeLinked: false,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
          },
        ],
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
            NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime',
            NSPrivacyAccessedAPITypeReasons: ['35F9.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
            NSPrivacyAccessedAPITypeReasons: ['C617.1'],
          },
        ],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './src/assets/images/adaptive-icon.png',
      },
      package: getUniqueAndroidIdentifier(),
      // based on https://youtu.be/kNbEEYlFIPs?si=RbYz1SDifW8iTqJj&t=608
      intentFilters: [
        // https://docs.expo.dev/linking/android-app-links/
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: getAppHost(),
              pathPrefix: '/sign-in-up/email/verify',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
      androidNavigationBar: {
        enforceContrast: true,
      },
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './src/assets/images/favicon.png',
    },
    plugins: [
      [
        'expo-audio',
        {
          microphonePermission:
            'TemplateApp records your voice to: 1) Create a personalized AI voice clone with a native accent (30-second recording), and 2) Analyze your pronunciation during practice exercises and provide feedback to improve your accent. For example, the app will help you pronounce "Massachusetts" with a perfect American accent.',
        },
      ],
      //required by expo-audio
      ['expo-asset'],
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './src/assets/images/splash-icon.png',
          resizeMode: 'cover',
        },
      ],
      [
        '@react-native-google-signin/google-signin',
        {
          // See https://react-native-google-signin.github.io/docs/setting-up/expo
          iosUrlScheme: 'com.googleusercontent.apps.1027541565281-6929mrqjia9tbq6mqeoce4v8eofpe7k2',
        },
      ],
      ['expo-apple-authentication'],
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'template-app-native',
          organization: 'template-organization',
        },
      ],
      ['expo-font'],
      ['expo-localization'],
    ],
    experiments: {
      typedRoutes: true,
      autolinkingModuleResolution: true,
      reactCompiler: true,
    },
    updates: {
      url: 'https://u.expo.dev/b2469e69-6cd5-4732-b731-3e9374812b41',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: 'b2469e69-6cd5-4732-b731-3e9374812b41',
      },
    },
  },
}

export default config
