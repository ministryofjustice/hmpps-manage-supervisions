import { trimEnd } from 'lodash'

export function quantity(value: number, units: string) {
  const singular = trimEnd(units, 's').toLowerCase()
  return `${value} ${value === 1 ? singular : singular + 's'}`
}
