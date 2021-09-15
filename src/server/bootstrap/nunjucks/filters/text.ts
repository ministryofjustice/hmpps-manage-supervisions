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
