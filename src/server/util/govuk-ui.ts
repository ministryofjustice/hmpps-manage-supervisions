export enum GovUkUiTagColour {
  Grey = 'grey',
  Green = 'green',
  Turquoise = 'turquoise',
  Blue = 'blue',
  Purple = 'purple',
  Pink = 'pink',
  Red = 'red',
  Orange = 'orange',
  Yellow = 'yellow',
  DarkRed = 'dark-red',
}

export function getTagClassName(colour: GovUkUiTagColour) {
  switch (colour) {
    case GovUkUiTagColour.DarkRed:
      return `app-tag--${colour}`
    default:
      return `govuk-tag--${colour}`
  }
}
