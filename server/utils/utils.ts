import { capitalize } from 'lodash'

export function convertToTitleCase(sentence: string): string {
  return sentence?.replace(/\w+/g, capitalize) ?? ''
}
