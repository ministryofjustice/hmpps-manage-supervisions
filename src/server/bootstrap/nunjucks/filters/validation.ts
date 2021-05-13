import { NunjucksFilter } from './types'
import { ValidationError } from 'class-validator'

export interface GdsErrorMessage {
  text: string
}

export class SetErrorMessage implements NunjucksFilter {
  filter<T>(template: T, name: string, errors?: ValidationError[]): T & { errorMessage?: GdsErrorMessage } {
    const filtered = errors?.filter(x => x.property === name) || []
    if (filtered.length === 0) {
      return template
    }
    const errorSet = new Set(filtered.map(x => Object.values(x.constraints)).reduce((x, y) => [...x, ...y]))
    return { ...template, errorMessage: { text: [...errorSet].join(', ') } }
  }
}
