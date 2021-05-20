import { NunjucksFilter } from './types'

export class YesNo implements NunjucksFilter {
  filter(value?: boolean): any {
    switch (value) {
      case true:
        return 'Yes'
      case false:
        return 'No'
      default:
        return 'Not specified'
    }
  }
}
