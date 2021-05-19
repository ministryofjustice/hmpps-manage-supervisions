import { NunjucksFilter } from './types'
import { ValidationError } from 'class-validator'
import { flattenValidationErrors } from '../../../util/flattenValidationErrors'

export interface GdsErrorMessage {
  text: string
}

export class FindErrorMessages implements NunjucksFilter {
  filter(errors: ValidationError[], ...paths: string[]): GdsErrorMessage {
    const flattened = flattenValidationErrors(errors || [])

    const filtered = flattened?.filter(x => paths.some(p => x.path.startsWith(p))) || []
    if (filtered.length === 0) {
      return null
    }
    const errorSet = new Set(filtered.map(x => Object.values(x.constraints)).reduce((x, y) => [...x, ...y]))
    return { text: [...errorSet].join(', ') }
  }
}
