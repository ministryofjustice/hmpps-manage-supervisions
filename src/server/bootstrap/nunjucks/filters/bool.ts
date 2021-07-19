import { NunjucksFilter } from './types'

export class YesNo implements NunjucksFilter {
  filter(value?: boolean): any {
    return value === true ? 'Yes' : 'No'
  }
}
