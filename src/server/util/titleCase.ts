import { capitalize } from 'lodash'

export function titleCase(sentence: string): string {
  return sentence?.replace(/\w+/g, capitalize) ?? ''
}
