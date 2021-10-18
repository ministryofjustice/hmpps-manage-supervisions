import { NunjucksFilter } from './types'

export class Email implements NunjucksFilter {
  filter(email: string): string {
    if (!email) {
      return email
    }
    return email.replace('@', '<wbr>@')
  }
}
