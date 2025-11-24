import { describe, expect, test } from 'vitest'
import { removeFrenchPunctuationSpaces, addFrenchPunctuationSpaces } from './french-text-utils'

describe('removeFrenchPunctuationSpaces', () => {
  test('removes spaces before common punctuation', () => {
    expect(removeFrenchPunctuationSpaces('Bonjour, tout le monde !')).toBe('Bonjour, tout le monde!')
    expect(removeFrenchPunctuationSpaces('Pourquoi ? Parce que.')).toBe('Pourquoi? Parce que.')
    expect(removeFrenchPunctuationSpaces("D'abord ; ensuite : enfin")).toBe("D'abord; ensuite: enfin")
  })

  test('handles French quotation marks correctly', () => {
    expect(removeFrenchPunctuationSpaces('« Bonjour»')).toBe('«Bonjour»')
    expect(removeFrenchPunctuationSpaces('«Salut »')).toBe('«Salut»')
    expect(removeFrenchPunctuationSpaces('«   Bonsoir   »')).toBe('«Bonsoir»')
  })

  test('handles ellipsis correctly', () => {
    expect(removeFrenchPunctuationSpaces('Et puis...')).toBe('Et puis...')
  })

  test('handles percentage signs correctly', () => {
    expect(removeFrenchPunctuationSpaces('100 %')).toBe('100%')
    expect(removeFrenchPunctuationSpaces('50  %')).toBe('50%')
  })

  test('handles complex combinations', () => {
    expect(removeFrenchPunctuationSpaces('Bonjour ! Comment allez-vous ? Très bien, merci.')).toBe(
      'Bonjour! Comment allez-vous? Très bien, merci.'
    )
  })

  test('preserves valid spaces between words', () => {
    expect(removeFrenchPunctuationSpaces('Entre les mots.')).toBe('Entre les mots.')
  })

  test('handles empty strings', () => {
    expect(removeFrenchPunctuationSpaces('')).toBe('')
  })

  test('handles strings with only spaces', () => {
    expect(removeFrenchPunctuationSpaces('   ')).toBe('   ')
  })

  test('handles multiple consecutive punctuation marks', () => {
    expect(removeFrenchPunctuationSpaces('Vraiment ?!')).toBe('Vraiment?!')
    expect(removeFrenchPunctuationSpaces('Vraiment ? !')).toBe('Vraiment?!')
  })

  test('handles real French text examples', () => {
    expect(removeFrenchPunctuationSpaces('« Voulez-vous du café ? » demanda-t-elle.')).toBe(
      '«Voulez-vous du café?» demanda-t-elle.'
    )

    expect(removeFrenchPunctuationSpaces('Les résultats sont : 95 % positifs, 5 % négatifs.')).toBe(
      'Les résultats sont: 95% positifs, 5% négatifs.'
    )

    expect(removeFrenchPunctuationSpaces("L'élève dit : « Je ne comprends pas... ».")).toBe(
      "L'élève dit: «Je ne comprends pas...»."
    )

    expect(removeFrenchPunctuationSpaces("Monsieur Dupont, pouvez-vous venir, s'il vous plaît ?")).toBe(
      "Monsieur Dupont, pouvez-vous venir, s'il vous plaît?"
    )
  })
})

describe('addFrenchPunctuationSpaces', () => {
  test('adds spaces before common punctuation', () => {
    expect(addFrenchPunctuationSpaces('Bonjour, tout le monde!')).toBe('Bonjour, tout le monde !')
    expect(addFrenchPunctuationSpaces('Pourquoi? Parce que.')).toBe('Pourquoi ? Parce que.')
    expect(addFrenchPunctuationSpaces("D'abord; ensuite: enfin")).toBe("D'abord ; ensuite : enfin")
  })

  test('handles French quotation marks correctly', () => {
    expect(addFrenchPunctuationSpaces('«Bonjour»')).toBe('« Bonjour »')
    expect(addFrenchPunctuationSpaces('«Salut»')).toBe('« Salut »')
  })

  test('handles ellipsis correctly', () => {
    expect(addFrenchPunctuationSpaces('Et puis...')).toBe('Et puis...')
  })

  test('handles percentage signs correctly', () => {
    expect(addFrenchPunctuationSpaces('100%')).toBe('100 %')
    expect(addFrenchPunctuationSpaces('50%')).toBe('50 %')
  })

  test('handles complex combinations', () => {
    expect(addFrenchPunctuationSpaces('Bonjour! Comment allez-vous? Très bien, merci.')).toBe(
      'Bonjour ! Comment allez-vous ? Très bien, merci.'
    )
  })

  test('preserves valid spaces between words', () => {
    expect(addFrenchPunctuationSpaces('Entre les mots.')).toBe('Entre les mots.')
  })

  test('handles empty strings', () => {
    expect(addFrenchPunctuationSpaces('')).toBe('')
  })

  test('handles strings with only spaces', () => {
    expect(addFrenchPunctuationSpaces('   ')).toBe('   ')
  })

  test('handles multiple consecutive punctuation marks', () => {
    expect(addFrenchPunctuationSpaces('Vraiment?!')).toBe('Vraiment ?!')
  })

  test('handles real French text examples', () => {
    expect(addFrenchPunctuationSpaces('«Voulez-vous du café?» demanda-t-elle.')).toBe(
      '« Voulez-vous du café ? » demanda-t-elle.'
    )

    expect(addFrenchPunctuationSpaces('Les résultats sont: 95% positifs, 5% négatifs.')).toBe(
      'Les résultats sont : 95 % positifs, 5 % négatifs.'
    )

    expect(addFrenchPunctuationSpaces("L'élève dit: «Je ne comprends pas...»")).toBe(
      "L'élève dit : « Je ne comprends pas... »"
    )
  })
})
