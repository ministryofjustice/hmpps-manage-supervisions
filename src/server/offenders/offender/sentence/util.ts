import { Offence, Sentence } from '../../../community-api/client'
import { quantity, titleCase } from '../../../util'

export function getOffenceName(offence?: Offence): string {
  if (!offence) {
    return null
  }
  return `${offence.detail.subCategoryDescription} (${quantity(offence.offenceCount || 1, 'count')})`
}

export function getSentenceName(sentence: Sentence) {
  // TODO HACK: building this is messy as the data is messy, we probably need a well known data source to clean it up.
  return `${quantity(sentence.originalLength, sentence.originalLengthUnits, {
    plural: false,
  })} ${titleCase(sentence.sentenceType.description.replace('ORA', '').trim(), { ignoreAcronyms: true })}`
}
