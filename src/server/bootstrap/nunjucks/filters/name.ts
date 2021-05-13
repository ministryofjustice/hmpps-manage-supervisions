import { NunjucksFilter } from './types'

export class InitialiseName implements NunjucksFilter {
  filter(fullName: string): any {
    if (!fullName) {
      return null
    }
    const [[initial], ...rest] = fullName.split(' ')
    return `${initial}. ${rest.slice(-1)}`
  }
}
