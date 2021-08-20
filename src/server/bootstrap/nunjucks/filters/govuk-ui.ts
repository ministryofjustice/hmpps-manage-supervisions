import { NunjucksFilter } from './types'
import { GovUkUiTagColour, getTagClassName } from '../../../util/govuk-ui'

export class TagClassName implements NunjucksFilter {
  filter(colour: GovUkUiTagColour): any {
    return getTagClassName(colour)
  }
}
