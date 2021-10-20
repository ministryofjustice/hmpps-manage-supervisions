import { NunjucksFilter } from './types'

export class YesNo extends NunjucksFilter {
  filter(value?: boolean): any {
    return value === true ? 'Yes' : 'No'
  }
}
