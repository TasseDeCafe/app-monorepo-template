// todo: add more source voices to cover all languages and dialects. Consider adding female voices.
import { DialectCode } from '@yourbestaccent/core/constants/lang-codes'

import { CustomVoice } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'

// https://elevenlabs.io/app/voice-lab?voiceId=Vi3EwJBuzc4IaX1PB1bm
export const AMERICAN_ENGLISH_MALE_VOICE_ID = 'Vi3EwJBuzc4IaX1PB1bm'
// https://elevenlabs.io/app/voice-lab?voiceId=UgBBYS2sOqTuMpoF3BR0
export const MARK_NATURAL_CONVERSATIONS_VOICE_ID: string = 'UgBBYS2sOqTuMpoF3BR0'
// https://elevenlabs.io/app/voice-lab?voiceId=kPzsL2i3teMYv0FxEYQ6
export const BRITTNEY_SOCIAL_MEDIA_VOICE_ID: string = 'kPzsL2i3teMYv0FxEYQ6'
// https://elevenlabs.io/app/voice-lab?voiceId=56AoDkrOh6qfVPDXZ7Pt
export const CASSIDY_VOICE_ID: string = '56AoDkrOh6qfVPDXZ7Pt'

export const voiceOptionsToElevenlabsVoices: Record<CustomVoice, string> = {
  [CustomVoice.NAMI]: BRITTNEY_SOCIAL_MEDIA_VOICE_ID,
  [CustomVoice.WELA]: CASSIDY_VOICE_ID,
  [CustomVoice.SIME]: MARK_NATURAL_CONVERSATIONS_VOICE_ID,
  [CustomVoice.LATU]: AMERICAN_ENGLISH_MALE_VOICE_ID,
}

export const COLOMBIAN_SPANISH = '6z7DGa6EoROi3cODJ0IF'
export const dialectsToElevenlabsVoiceIds: { [key in DialectCode]?: string } = {
  [DialectCode.AMERICAN_ENGLISH]: AMERICAN_ENGLISH_MALE_VOICE_ID, // american_english_male
  [DialectCode.BRITISH_ENGLISH]: 'vlrzrZYtucI4FZ2CNeHD', // british_english_male
  [DialectCode.AUSTRALIAN_ENGLISH]: 'pXgsayqpmuFfzTsJw2ni', // australian_english_male
  [DialectCode.SCOTTISH_ENGLISH]: 'y6p0SvBlfEe2MH4XN7BP', // scottish_english_male
  [DialectCode.INDIAN_ENGLISH]: 'mCQMfsqGDT6IDkEKR20a', // indian_english_male
  [DialectCode.AFRICAN_AMERICAN_VERNACULAR_ENGLISH]: '03vEurziQfq3V8WZhQvn', // Middle-aged, African-American female with a Southern accent and over-the-top emotion.  https://elevenlabs.io/app/voice-lab?voiceId=03vEurziQfq3V8WZhQvn
  [DialectCode.MEXICAN_SPANISH]: 'qXvyMc4erc4RzqXLpiiR', // mexican_spanish_male
  [DialectCode.CASTILIAN_SPANISH]: 'BPoDAH7n4gFrnGY27Jkj', // castilian_spanish_male
  [DialectCode.COLOMBIAN_SPANISH]: COLOMBIAN_SPANISH, // colombian_spanish_male
  [DialectCode.ARGENTINIAN_SPANISH]: '9oPKasc15pfAbMr7N6Gs', // argentinian_spanish_female
  [DialectCode.PERUVIAN_SPANISH]: 'dF1Qg3iMRirscWEMtEKb', // peruvian_spanish_male
  [DialectCode.ANDALUSIAN_SPANISH]: 'syjZiIvIUSwKREBfMpKZ', // Warm middle-aged male voice with an accent from southern Spain. https://elevenlabs.io/app/voice-library?voiceId=syjZiIvIUSwKREBfMpKZ
  [DialectCode.BRAZILIAN_PORTUGUESE]: 'hwnuNyWkl9DjdTFykrN6', // brazilian_portuguese_male
  [DialectCode.EUROPEAN_PORTUGUESE]: 'JAqIzWZIissTpXs85CsN', // european_portuguese_male
  [DialectCode.PARISIAN_FRENCH]: '0bKGtCCpdKSI5NjGhU3z', // parisian_french_male
  [DialectCode.BELGIAN_FRENCH]: 'HDc7042zGcc1SdpT2m1U', // belgian_french_male
  [DialectCode.CANADIAN_FRENCH]: 'IPgYtHTNLjC7Bq7IPHrm', // canadian_french_male
  [DialectCode.STANDARD_GERMAN]: 'FTNCalFNG5bRnkkaP5Ug', // standard_german_male
  [DialectCode.STANDARD_ITALIAN]: 'UlwxMDtxqMDYmG6pk2q6', // standard_italian_male
  // https://elevenlabs.io/app/voice-library?voiceId=ARIOBKJtltx2F7r1TMzI
  [DialectCode.STANDARD_DUTCH]: 'ARIOBKJtltx2F7r1TMzI', // Marcèles, Dutch male voice for conversational use.
  // https://elevenlabs.io/app/voice-library?voiceId=p89spRysUJwdYyVhSeEL
  [DialectCode.FLEMISH]: '4SZMuFG3NOs5lWy1q5Wf', // Luc - Flemish voice, Flemish male voice. Suitable for informative content, https://elevenlabs.io/app/voice-library?voiceId=4SZMuFG3NOs5lWy1q5Wf
  [DialectCode.STANDARD_RUSSIAN]: '3EuKHIEZbSzrHGNmdYsx', // Nikolay, Middle-aged Russian male with a confident tone. Great for Social media.
  [DialectCode.STANDARD_POLISH]: 'JWUOwsYG4XgR9Od3eeon', // Tomasz Kowalski - Tomasz Grey is a polished, narrative-ready voice with just the right balance of energy and calm...
}
