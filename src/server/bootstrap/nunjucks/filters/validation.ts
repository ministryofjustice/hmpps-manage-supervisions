import { NunjucksFilter } from './types'
import { ValidationError } from 'class-validator'
import { flattenValidationErrors, FlatValidationError } from '../../../util/flattenValidationErrors'

export interface GdsErrorMessage {
  text: string
  href?: string
}

const parseHrefFromPath = (path: string) => {
  return path === 'date' ? '#date.day' : `#${path}`
}

export class ErrorSummary extends NunjucksFilter {
  filter(errors: ValidationError[]): GdsErrorMessage[] {
    return flattenValidationErrors(errors || []).map(
      (error: FlatValidationError): GdsErrorMessage => ({
        text: [...new Set(Object.values(error.constraints))].join(', '),
        href: parseHrefFromPath(error.path),
      }),
    )
  }
}

export class FindErrorMessages extends NunjucksFilter {
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
