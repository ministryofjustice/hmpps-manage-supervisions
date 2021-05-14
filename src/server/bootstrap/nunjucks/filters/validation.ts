import { NunjucksFilter } from './types'
import { ValidationError } from 'class-validator'

export interface GdsErrorMessage {
  text: string
}

export class FindErrorMessages implements NunjucksFilter {
  filter(errors: ValidationError[], ...names: string[]): GdsErrorMessage {
    const filtered = errors?.filter(x => names.indexOf(x.property) >= 0) || []
    if (filtered.length === 0) {
      return null
    }
    const errorSet = new Set(filtered.map(x => Object.values(x.constraints)).reduce((x, y) => [...x, ...y]))
    return { text: [...errorSet].join(', ') }
  }
}
