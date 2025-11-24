/**
 * Removes spaces according to non-French typography rules
 * Note that not all punctuation symbols in French are preceded by a space
 */
export const removeFrenchPunctuationSpaces = (text: string): string => {
  return (
    text
      // Remove spaces before punctuation marks (!, ?, ;, :)
      // \s+ matches one or more whitespace characters
      // ([!?;:]) captures these punctuation marks in a group
      .replace(/\s+([!?;:])/g, '$1')

      // Remove any spaces after opening French quotation marks (guillemets)
      // «\s* matches « followed by zero or more spaces
      .replace(/«\s*/g, '«')

      // Remove any spaces before closing French quotation marks
      // \s*» matches zero or more spaces followed by »
      .replace(/\s*»/g, '»')

      // Remove spaces before percentage signs
      // \s*% matches zero or more spaces followed by %
      .replace(/\s*%/g, '%')
  )
}

/**
 * Adds spaces according to French typography rules
 * This is useful when we want to convert English-formatted text to follow French spacing rules
 */
export const addFrenchPunctuationSpaces = (text: string): string => {
  return (
    text
      // Add spaces before punctuation marks if there isn't one already
      // ([^\s]) captures any non-whitespace character
      // ([!?;:]) captures these punctuation marks in a group
      .replace(/([^\s])([!?;:])/g, '$1 $2')

      // Add a space after opening French quotation marks if there isn't one
      // «([^\s]) matches « followed by any non-whitespace character
      .replace(/«([^\s])/g, '« $1')

      // Add a space before closing French quotation marks if there isn't one
      // ([^\s])» matches any non-whitespace character followed by »
      .replace(/([^\s])»/g, '$1 »')

      // Add a space between numbers and percentage signs
      // ([0-9])% matches any digit followed by %
      .replace(/([0-9])%/g, '$1 %')
  )
}
