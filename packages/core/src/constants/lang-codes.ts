export enum LangCode {
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  ITALIAN = 'it',
  POLISH = 'pl',
  PORTUGUESE = 'pt',
  RUSSIAN = 'ru',
  UKRAINIAN = 'uk',
  CZECH = 'cs',
  VIETNAMESE = 'vi',

  // second batch of languages was inspired by this list https://github.com/wooorm/franc/tree/main/packages/franc-min
  // and limited by the list of languages that Deepgram nova-2 supports: https://developers.deepgram.com/docs/models-languages-overview
  CHINESE = 'zh',
  HINDI = 'hi',
  INDONESIAN = 'id',
  MALAY = 'ms',
  JAPANESE = 'ja',
  KOREAN = 'ko',
  TAMIL = 'ta',
  TURKISH = 'tr',
  ROMANIAN = 'ro',
  SWEDISH = 'sv',
  NORWEGIAN = 'no',
  DANISH = 'da',
  SLOVAK = 'sk',
  DUTCH = 'nl',
  THAI = 'th',
  HUNGARIAN = 'hu',
  GREEK = 'el',
  FINNISH = 'fi',
  BULGARIAN = 'bg',
  CATALAN = 'ca',
}

export type SupportedStudyLanguage = (typeof SUPPORTED_STUDY_LANGUAGES)[number]

export enum DialectCode {
  AMERICAN_ENGLISH = 'en-US',
  BRITISH_ENGLISH = 'en-UK',
  AFRICAN_AMERICAN_VERNACULAR_ENGLISH = 'en-US-AFR',
  AUSTRALIAN_ENGLISH = 'en-AU',
  SCOTTISH_ENGLISH = 'en-GB-SCT',
  INDIAN_ENGLISH = 'en-IN',
  CASTILIAN_SPANISH = 'es-ES',
  MEXICAN_SPANISH = 'es-MX',
  COLOMBIAN_SPANISH = 'es-CO',
  ARGENTINIAN_SPANISH = 'es-AR',
  PERUVIAN_SPANISH = 'es-PE',
  ANDALUSIAN_SPANISH = 'es-AN',
  PARISIAN_FRENCH = 'fr-FR',
  BELGIAN_FRENCH = 'fr-BE',
  CANADIAN_FRENCH = 'fr-CA',
  STANDARD_GERMAN = 'de-DE',
  STANDARD_ITALIAN = 'it-IT',
  STANDARD_POLISH = 'pl-PL',
  BRAZILIAN_PORTUGUESE = 'pt-BR',
  EUROPEAN_PORTUGUESE = 'pt-PT',
  STANDARD_RUSSIAN = 'ru-RU',
  STANDARD_UKRAINIAN = 'uk-UA',
  STANDARD_CZECH = 'cs-CZ',
  STANDARD_DANISH = 'da-DK',
  STANDARD_DUTCH = 'nl-NL',
  FLEMISH = 'nl-BE',
  STANDARD_FINNISH = 'fi-FI',
  STANDARD_INDONESIAN = 'id-ID',
  STANDARD_MALAY = 'ms-MY',
  STANDARD_ROMANIAN = 'ro-RO',
  STANDARD_SLOVAK = 'sk-SK',
  STANDARD_SWEDISH = 'sv-SE',
  STANDARD_TURKISH = 'tr-TR',
  STANDARD_HUNGARIAN = 'hu-HU',
  STANDARD_NORWEGIAN = 'no-NO',
}

export const LANGUAGES_TO_DIALECT_MAP: { [key in SupportedStudyLanguage]: DialectCode[] } = {
  [LangCode.ENGLISH]: [
    DialectCode.AMERICAN_ENGLISH,
    DialectCode.BRITISH_ENGLISH,
    DialectCode.AUSTRALIAN_ENGLISH,
    DialectCode.SCOTTISH_ENGLISH,
    DialectCode.INDIAN_ENGLISH,
    DialectCode.AFRICAN_AMERICAN_VERNACULAR_ENGLISH,
  ],
  [LangCode.SPANISH]: [
    DialectCode.MEXICAN_SPANISH,
    DialectCode.CASTILIAN_SPANISH,
    DialectCode.COLOMBIAN_SPANISH,
    DialectCode.ARGENTINIAN_SPANISH,
    DialectCode.PERUVIAN_SPANISH,
    DialectCode.ANDALUSIAN_SPANISH,
  ],
  [LangCode.FRENCH]: [DialectCode.PARISIAN_FRENCH, DialectCode.BELGIAN_FRENCH, DialectCode.CANADIAN_FRENCH],
  [LangCode.GERMAN]: [DialectCode.STANDARD_GERMAN],
  [LangCode.ITALIAN]: [DialectCode.STANDARD_ITALIAN],
  [LangCode.POLISH]: [DialectCode.STANDARD_POLISH],
  [LangCode.PORTUGUESE]: [DialectCode.BRAZILIAN_PORTUGUESE, DialectCode.EUROPEAN_PORTUGUESE],
  [LangCode.RUSSIAN]: [DialectCode.STANDARD_RUSSIAN],
  [LangCode.UKRAINIAN]: [DialectCode.STANDARD_UKRAINIAN],
  [LangCode.CZECH]: [DialectCode.STANDARD_CZECH],
  [LangCode.DANISH]: [DialectCode.STANDARD_DANISH],
  [LangCode.DUTCH]: [DialectCode.STANDARD_DUTCH, DialectCode.FLEMISH],
  [LangCode.FINNISH]: [DialectCode.STANDARD_FINNISH],
  [LangCode.INDONESIAN]: [DialectCode.STANDARD_INDONESIAN],
  [LangCode.MALAY]: [DialectCode.STANDARD_MALAY],
  [LangCode.ROMANIAN]: [DialectCode.STANDARD_ROMANIAN],
  [LangCode.SLOVAK]: [DialectCode.STANDARD_SLOVAK],
  [LangCode.SWEDISH]: [DialectCode.STANDARD_SWEDISH],
  [LangCode.TURKISH]: [DialectCode.STANDARD_TURKISH],
  [LangCode.HUNGARIAN]: [DialectCode.STANDARD_HUNGARIAN],
  [LangCode.NORWEGIAN]: [DialectCode.STANDARD_NORWEGIAN],
}

export const LANGUAGES_WITH_MULTIPLE_DIALECTS: SupportedStudyLanguage[] = Object.keys(LANGUAGES_TO_DIALECT_MAP).filter(
  (lang) => LANGUAGES_TO_DIALECT_MAP[lang as SupportedStudyLanguage].length > 1
) as SupportedStudyLanguage[]

// the default dialects are the first dialect of each language
export const DEFAULT_DIALECTS = Object.fromEntries(
  Object.entries(LANGUAGES_TO_DIALECT_MAP).map(([lang, dialects]) => [lang, dialects[0]])
) as { [key in SupportedStudyLanguage]: DialectCode }

export type SupportedMotherLanguage = LangCode

export const SUPPORTED_MOTHER_LANGUAGES = Object.values(LangCode) as readonly LangCode[]

export const SUPPORTED_STUDY_LANGUAGES = [
  LangCode.ENGLISH,
  LangCode.SPANISH,
  LangCode.FRENCH,
  LangCode.GERMAN,
  LangCode.ITALIAN,
  LangCode.POLISH,
  LangCode.PORTUGUESE,
  LangCode.RUSSIAN,
  LangCode.UKRAINIAN,
  LangCode.CZECH,
  LangCode.DANISH,
  LangCode.DUTCH,
  LangCode.FINNISH,
  LangCode.INDONESIAN,
  LangCode.MALAY,
  LangCode.ROMANIAN,
  LangCode.SLOVAK,
  LangCode.SWEDISH,
  LangCode.TURKISH,
  LangCode.HUNGARIAN,
  LangCode.NORWEGIAN,
] as const

export const SUPPORTED_STUDY_LANGUAGES_SET = new Set(SUPPORTED_STUDY_LANGUAGES)

export const LANGUAGES_WITH_TRANSLITERATION = [LangCode.RUSSIAN, LangCode.UKRAINIAN] as const

export type LanguageWithTransliteration = (typeof LANGUAGES_WITH_TRANSLITERATION)[number]
