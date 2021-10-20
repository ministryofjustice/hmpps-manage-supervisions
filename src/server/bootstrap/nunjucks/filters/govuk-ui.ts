import { NunjucksFilter } from './types'
import { GovUkUiTagColour, getTagClassName } from '../../../util/govuk-ui'

export class TagClassName extends NunjucksFilter {
  filter(colour: GovUkUiTagColour): any {
    return getTagClassName(colour)
  }
}
