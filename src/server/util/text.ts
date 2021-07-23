import { capitalize } from 'lodash'

export function titleCase(sentence: string, { ignoreAcronyms = false }: { ignoreAcronyms?: boolean } = {}): string {
  if (!sentence) {
    return ''
  }

  if (ignoreAcronyms) {
    return sentence
      .split(' ')
      .map(x => (x.toUpperCase() === x ? x : capitalize(x)))
      .join(' ')
  }

  return sentence.trim().replace(/\w+/g, capitalize)
}

export function sentenceCase(sentence: string): string {
  return sentence?.trim()?.replace(/\w+/, capitalize) ?? ''
}

/**
 * Lower case the string ignoring (presumed) acronyms.
 */
export function safeLowerCase(s: string) {
  if (!s) {
    return s
  }
  return s
    .split(' ')
    .map(x => (x.toUpperCase() === x ? x : x.toLowerCase()))
    .join(' ')
}

/**
 * Upper case the first letter of the string and lower case the rest, ignoring (presumed) acronyms.
 */
export function safeCapitalize(s: string) {
  if (!s) {
    return s
  }
  return s.charAt(0).toUpperCase() + safeLowerCase(s.slice(1))
}
