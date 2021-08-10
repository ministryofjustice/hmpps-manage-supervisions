import { trimEnd } from 'lodash'

/**
 * Creates a very naive pluralisation of the specified value & units.
 */
export function quantity(
  value: number,
  units: string,
  { plural = true, alternativeZero }: { plural?: boolean; alternativeZero?: string } = {},
) {
  const singular = trimEnd(units, 's').toLowerCase()

  switch (value) {
    case 0:
      return `${alternativeZero || '0'} ${plural ? singular + 's' : singular}`
    case 1:
      return `${value} ${singular}`
    default:
      return `${value} ${plural ? singular + 's' : singular}`
  }
}
