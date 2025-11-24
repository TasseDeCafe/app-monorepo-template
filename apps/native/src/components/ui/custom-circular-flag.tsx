import { DialectCode, LangCode } from '@template-app/core/constants/lang-codes'
import { Image, View, ViewStyle } from 'react-native'
import * as Flags from 'react-native-svg-circle-country-flags'
import { Languages as LanguagesFlags } from 'react-native-svg-circle-country-flags'

interface FlagProps {
  languageOrDialectCode: LangCode | DialectCode
  size?: number
  style?: ViewStyle
}

interface SvgFlagProps {
  width?: number
  height?: number
}

const CUSTOM_FLAG_MAP: Record<string, any> = {
  [DialectCode.ANDALUSIAN_SPANISH]: require('@/assets/images/flags/flag-of-andalusia.png'),
  [DialectCode.AFRICAN_AMERICAN_VERNACULAR_ENGLISH]: require('@/assets/images/flags/flag-of-louisiana.png'),
}

// Extract country code from dialect code (e.g., 'en-US' → 'US', 'pt-BR' → 'BR')
const getCountryCode = (dialect: DialectCode): string => {
  const index = dialect.indexOf('-')
  return dialect.slice(index + 1)
}

const getFlagKey = (dialect: DialectCode): string => {
  const countryCode = getCountryCode(dialect)
  // Split by hyphen and capitalize first letter of each part
  const parts = countryCode.split('-')
  return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('')
}

export const CustomCircularFlag = ({ languageOrDialectCode, size = 24, style }: FlagProps) => {
  const customFlagImage = CUSTOM_FLAG_MAP[languageOrDialectCode]

  if (customFlagImage) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
          },
          style,
        ]}
      >
        <Image
          source={customFlagImage}
          style={{
            width: size,
            height: size,
            resizeMode: 'cover',
          }}
        />
      </View>
    )
  }

  // Handle dialect codes (e.g., 'en-US', 'pt-BR')
  if (Object.values(DialectCode).includes(languageOrDialectCode as DialectCode)) {
    const dialect = languageOrDialectCode as DialectCode

    // Special case for Scottish English
    if (dialect === DialectCode.SCOTTISH_ENGLISH) {
      const ScottishFlag = LanguagesFlags['Gd'] as React.ComponentType<SvgFlagProps>
      return ScottishFlag ? <ScottishFlag width={size} height={size} /> : null
    }

    const flagKey = getFlagKey(dialect)
    const FlagComponent = Flags[flagKey as keyof typeof Flags] as React.ComponentType<SvgFlagProps>

    return FlagComponent ? <FlagComponent width={size} height={size} /> : null
  }

  const flagKey = (languageOrDialectCode as string).charAt(0).toUpperCase() + (languageOrDialectCode as string).slice(1)
  const FlagComponent = LanguagesFlags[flagKey as keyof typeof LanguagesFlags] as React.ComponentType<SvgFlagProps>

  return FlagComponent ? <FlagComponent width={size} height={size} /> : null
}
