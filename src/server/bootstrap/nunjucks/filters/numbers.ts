import { NunjucksFilter } from './types'

export class Quantity implements NunjucksFilter {
  filter(value: number, singular: string, plural = `${singular}s`): any {
    return value === 1 ? `${value} ${singular}` : `${value} ${plural}`
  }
}
