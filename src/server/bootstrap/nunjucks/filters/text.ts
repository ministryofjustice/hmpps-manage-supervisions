import { kebabCase } from 'lodash'
import { NunjucksFilter } from './types'

export class FullStop implements NunjucksFilter {
  filter(value: string): any {
    if (!value) {
      return value
    }

    value = value.trim()
    return value.endsWith('.') ? value : value + '.'
  }
}

export class Brackets implements NunjucksFilter {
  filter(value: string): any {
    if (!value) {
      return ''
    }
    return `(${value})`
  }
}

export class Slug implements NunjucksFilter {
  filter(value: string): any {
    if (!value) {
      return ''
    }
    return kebabCase(value)
  }
}

enum Abbreviation {
  CRN = 'Case reference number',
  PNC = 'Police national computer',
  RAR = 'Rehabilitation activity requirement',
}

export class Abbr implements NunjucksFilter {
  filter(value: Abbreviation): string {
    if (!Abbreviation[value]) throw new Error(`Undefined abbreviation: ${value}`)

    return `<abbr title="${Abbreviation[value]}">${value}</abbr>`
  }
}
