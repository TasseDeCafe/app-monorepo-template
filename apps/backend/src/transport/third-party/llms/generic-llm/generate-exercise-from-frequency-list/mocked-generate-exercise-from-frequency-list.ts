import { DialectCode, LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { FrequencyLists } from '../../../../../utils/frequency-list-utils'

export const mockGenerateExerciseFromFrequencyList = async (
  language: SupportedStudyLanguage,
  dialect: DialectCode,
  position: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  wordLength: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  frequencyLists: FrequencyLists
): Promise<string | null> => {
  const mockSentences: Record<SupportedStudyLanguage, string> = {
    [LangCode.ENGLISH]: 'The quick brown fox jumps over the lazy dog near the bustling city park.',
    [LangCode.SPANISH]:
      'El zorro marrón rápido salta sobre el perro perezoso cerca del parque de la ciudad bulliciosa.',
    [LangCode.FRENCH]: 'Le renard brun rapide saute par-dessus le chien paresseux près du parc animé de la ville.',
    [LangCode.GERMAN]: 'Der schnelle braune Fuchs springt über den faulen Hund in der Nähe des belebten Stadtparks.',
    [LangCode.ITALIAN]: 'La volpe marrone rapida salta sopra il cane pigro vicino al parco cittadino affollato.',
    [LangCode.POLISH]: 'Szybki brązowy lis przeskakuje nad leniwym psem w pobliżu ruchliwego parku miejskiego.',
    [LangCode.PORTUGUESE]: 'A rápida raposa marrom pula sobre o cão preguiçoso perto do movimentado parque da cidade.',
    [LangCode.RUSSIAN]: 'Быстрая коричневая лиса прыгает через ленивую собаку возле оживлённого городского парка.',
    [LangCode.UKRAINIAN]: 'Швидка коричнева лисиця стрибає через ледачого пса біля жвавого міського парку.',
    [LangCode.CZECH]: 'Rychlá hnědá liška skáče přes líného psa poblíž rušného městského parku.',
    [LangCode.DANISH]: 'Den hurtige brune ræv hopper over den dovne hund nær den travle bypark.',
    [LangCode.DUTCH]: 'De snelle bruine vos springt over de luie hond in de buurt van het drukke stadspark.',
    [LangCode.FINNISH]: 'Nopea ruskea kettu hyppää laiskan koiran yli lähellä vilkasta kaupunginpuistoa.',
    [LangCode.INDONESIAN]: 'Rubah cokelat yang cepat melompat di atas anjing malas di dekat taman kota yang ramai.',
    [LangCode.MALAY]: 'Rubah perang yang pantas melompat di atas anjing malas berhampiran taman bandar yang sibuk.',
    [LangCode.ROMANIAN]: 'Vulpea maronie rapidă sare peste câinele leneș lângă parcul aglomerat al orașului.',
    [LangCode.SLOVAK]: 'Rýchla hnedá líška skáče cez lenivého psa blízko rušného mestského parku.',
    [LangCode.SWEDISH]: 'Den snabba bruna räven hoppar över den lata hunden nära den livliga stadsparken.',
    [LangCode.TURKISH]: 'Hızlı kahverengi tilki, kalabalık şehir parkının yanındaki tembel köpeğin üzerinden atlar.',
    [LangCode.HUNGARIAN]: 'Gyors, fehér kutya a gyorsan és lassan álló faluban lévő parkján.',
    [LangCode.NORWEGIAN]: 'Raskt, raskt brun katt hoppar over den langsomt hunden i nærliggende byparken.',
  }

  return mockSentences[language] || `Mock sentence for ${language} at position ${position}.`
}
