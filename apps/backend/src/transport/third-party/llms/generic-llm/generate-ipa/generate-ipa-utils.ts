import { DialectCode, LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { getCleanWordsFromSentence } from '@yourbestaccent/core/utils/text-utils'
import { logCustomErrorMessageAndError, logMessage } from '../../../sentry/error-monitoring'
import { dialectCodeToDialectName, langCodeToLanguageName } from '../../../../../utils/lang-code-utils'

const languageToIpaDetailedExample: { [key in SupportedStudyLanguage]: [string, string] } = {
  [LangCode.ENGLISH]: [
    'The sun set behind the mountains, casting a golden glow over the lake. Birds chirped softly as the day transitioned into a peaceful and serene evening.',
    'ðə ˈsən ˈsɛt bɪˈhaɪnd ðə ˈmaʊntn̩z ˈkæstɪŋ ə ˈɡoʊldən ˈɡloʊ ˈoʊvə˞ ðə ˈleɪk ˈbɜ˞dz ˈtʃɜ˞pt ˈsɔftli əz ðə ˈdeɪ tɹænˈzɪʃənd ˈɪntə ə ˈpisfəl ənd sə˞ˈɹin ˈivnɪŋ',
  ],
  [LangCode.SPANISH]: [
    'Benjamín pidió una bebida de kiwi y fresa. Noé, sin vergüenza, la más exquisita champaña del menú',
    'beŋxaˈmin piˈðjo ˈuna βeˈβiða de ˈkiwi i ˈfɾesa noˈe, sin βeɾˈɣwensa, la mas ekskiˈsita tʃamˈpaɲa del meˈnu',
  ],
  [LangCode.FRENCH]: ['portez ce vieux whisky au juge blond qui fume', 'pɔʁ.te sə vjø wis.ki o ʒyʒ blɔ̃ ki fym'],
  [LangCode.GERMAN]: [
    'Victor jagt zwölf Boxkämpfer quer über den großen Sylter Deich',
    'vɪktɔʁ jaːkt t͡svœf ˈbɔksˌkɛmp͡fɐ kveːɐ̯ ˈʔyːbɐ deːn ˈɡʁoːsn̩ ˈzʏltɐ daɪ̯ç',
  ],
  [LangCode.ITALIAN]: ["Pranzo d'acqua fa volti sghembi", 'ˈpran.d͡zo ˈdak.kwa fa ˈvol.ti ˈsɡem.bi'],
  [LangCode.POLISH]: ['Pchnąć w tę łódź jeża lub ośm skrzyń fig', 'pxnɔɲt͡ɕ f tɛ̃w̃ wud͡ʑ jɛʐa lub ɔɕm skʂɨɲ fʲik'],
  [LangCode.PORTUGUESE]: [
    'Ré só que vê galã sexy pôr kiwi talhado à força em baú põe juíza má em pânico',
    'ˈʁɛ ˈsɔ ki ˈve ɡaˈlɐ̃ ˈsɛk.si ˈpoʁ kiˈwi taˈʎadu ˈa ˈfoʁsɐ ˈẽj̃ baˈu ˈpõj̃ ʒuˈizɐ ˈma ˈẽj̃ ˈpɐ̃niku',
  ],
  [LangCode.RUSSIAN]: [
    'Съешь ещё этих мягких французских булок, да выпей же чаю',
    'ˈsjeʂ jɪˈɕːɵ ˈɛtʲɪx ˈmʲæxkʲɪx frɐnˈt͡suskʲɪx ˈbulək ˈda ˈvɨpʲɪj ʐɨ ˈt͡ɕæjʉ',
  ],
  [LangCode.UKRAINIAN]: [
    "Десь чув, що той фраєр привіз їхньому царю грильяж та класну шубу з пір'я ґави",
    'dɛsʲ t͡ʃuu̯ ʃt͡ʃɔ tɔi̯ ˈfrajer preˈʋʲiz ˈjixnʲix t͡sɐˈrʲu ɦrɪlʲˈjɑʒ tɑ ˈklɑsnʊ ˈʃubʊ z ˈpirʲjɑ ˈɦaʋɪ',
  ],
  [LangCode.CZECH]: ['Příliš žluťoučký kůň úpěl ďábelské ódy', 'ˈpr̝̊iːlɪʃ ʒlut̪jou̯tʃkiː ˈkuːɲ ˈuːpjɛl ˈɟaːbɛlskiː oːdɪ'],
  [LangCode.DANISH]: [
    'En stor blå fisk sprang hurtigt over en rød båd.',
    'ˈen ˈstoɐ̯ ˈblɔ ˈfesk spʁɑŋ ˈhuɐ̯d̥id̥ ˈoːʋɐ ˈen ˈʁøːˀð ˈpʰɔːð',
  ],
  [LangCode.DUTCH]: [
    "Pa's wijze lynx bezag vroom het fikse aquaduct.",
    'pɑs ˈʋɛi̯zə ˈlɪŋks bəˈzɑx vrom ɦɛt ˈfɪksə ˈaːkʋɑdʏkt',
  ],
  [LangCode.MALAY]: [
    'Muzafar kerap sembahyang dan baca al-Quran waktu belajar di Universiti Oxford.',
    'muzafar kərap səmbahjaŋ dan batʃa al-kuran waktu bəladʒar di univərsiti ɔksfərd',
  ],
  [LangCode.FINNISH]: [
    'On sangen hauskaa, että polkupyörä on maanteiden jokapäiväinen ilmiö.',
    'on sɑŋːen hɑuskɑː etːæ polkupyøræ on mɑːnteiden jokɑpæivæinen ilmiø',
  ],
  [LangCode.INDONESIAN]: [
    'Muharjo seorang xenofobia universal yang takut pada warga jazirah, contohnya Qatar.',
    'muharʤo seoraŋ ksenofobia universal jaŋ takut pada warɡa ʤazirah, tʃontohɲa katar',
  ],
  [LangCode.ROMANIAN]: [
    'Încă vând gem, whisky bej și tequila roz, preț fix.',
    'ɨnkə vɨnd ʒem wiski beʒ ʃi tekila roz pret͡s fiks',
  ],
  [LangCode.SLOVAK]: [
    'Kŕdeľ šťastných ďatľov učí pri ústí Váhu mĺkveho koňa obhrýzať kôru a žrať čerstvé mäso.',
    'kr̩ːdɛʎ ʂcasnɪːx ɟatʎɔf utʃiː pri uːsciː vaːɦu ml̩ːkvɛɦɔ kɔɲa ɔbɦriːzac køːru a ʒrac tʃɛrstveː mæsɔ',
  ],
  [LangCode.SWEDISH]: ['Schweiz för lyxfjäder på qvist bakom ugn.', 'ɧvɛjts fœr lyksfjɛːdər poː kvist baːkɔm ʉːgn'],
  [LangCode.TURKISH]: ['Pijamalı hasta yağız şoföre çabucak güvendi', 'pidʒamalɯ hasta jaːz ʃofœre tʃabudʒak gyvendi'],
  [LangCode.NORWEGIAN]: [
    'Vår sære Zulu fra badeøya spilte jo whist og quickstep i min taxi.',
    'voːɾ ˈsæːɾə ˈsuːlu fɾɑ ˈbɑːdəˌøʏɑ ˈspiɫtə juː ʋist ɔ ˈkʋikstep i miːn ˈtaksi',
  ],
  [LangCode.HUNGARIAN]: [
    'Egy hűtlen vejét fülöncsípő, dühös mexikói úr Wesselényinél mázol Quitóban.',
    'ɛɟ hy:tlɛn vɛje:t fylønʧi:pø: dy:høʃ mɛksikoi u:r vɛʃːɛle:ɲine:l ma:zol kvito:bɒn',
  ],
}

const SEPARATOR: string = '--'

const buildIpaExample = (sentence: string, ipa: string): string => {
  const words = getCleanWordsFromSentence(sentence)
  const ipaWords = getCleanWordsFromSentence(ipa)

  if (words.length !== ipaWords.length) {
    logMessage(`The number of words must be the same in ${sentence} and ${ipa}`)
  }

  let result = ''

  for (let i = 0; i < words.length; i++) {
    result += `${i + 1} ${SEPARATOR} ${words[i]} ${SEPARATOR} ${ipaWords[i]}\n`
  }

  return result.trim()
}

const buildFormattedResponseTemplate = (words: string[]): string => {
  return words
    .map((word, index) => {
      return `${index + 1} ${SEPARATOR} ${word} ${SEPARATOR} <INSERT IPA OF "${word}" HERE>`
    })
    .join('\n')
}

export const _buildPrompt = (words: string[], language: LangCode, dialect: DialectCode): string => {
  const formattedResponseTemplate = buildFormattedResponseTemplate(words)
  const [exampleText, exampleIpa] = languageToIpaDetailedExample[language]
  const ipaExample = buildIpaExample(exampleText, exampleIpa)

  return `
Here is a text in ${langCodeToLanguageName(language)} that contains ${words.length} words. Transcribe each word in IPA by filling in the missing information in the list below. 

---

${formattedResponseTemplate}

---

For example, if the text is "${exampleText}", the response should follow this format:

---

${ipaExample}

---

Make sure that there are exactly ${words.length} words in the text and that the format is always the one shown above.

The IPA transcription should be in ${dialectCodeToDialectName(dialect)}. If the text is not in the language I specified, detect the language and transcribe it in the language you detected.

DO NOT ADD ANY OTHER COMMENTS OR TEXT.
`
}

export const _removeSlashesFromIpaWord = (ipaWord: string) => {
  if (ipaWord.length < 2) {
    return ipaWord
  }

  if (ipaWord.charAt(0) === '/' && ipaWord.charAt(ipaWord.length - 1) === '/') {
    return ipaWord.substring(1, ipaWord.length - 1)
  }
  return ipaWord
}

export const extractIPA = (ipaText: string) => {
  const separatorRegex = new RegExp(`^\\d+ ${SEPARATOR} `)

  const lines: string[] = ipaText.split('\n')

  const ipaLines: string[] = lines.filter((line) => line.match(separatorRegex))

  const ipaWords: string[] = ipaLines.map((line) => {
    try {
      return line.split(SEPARATOR)[2].trim()
    } catch (error) {
      logCustomErrorMessageAndError(`Error extracting IPA from line: ${line}`, error)
      return ''
    }
  })
  return ipaWords.map((w) => _removeSlashesFromIpaWord(w))
}
