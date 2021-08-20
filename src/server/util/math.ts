export interface QuantityOptions {
  plural?: string
  zero?: string
  emitPlural?: boolean
  overridePlural?: string
}

/**
 * Creates a very naive pluralisation of the specified value & units.
 */
export function quantity(
  value: number,
  units: string,
  { plural = 's', zero = '0', emitPlural = true, overridePlural }: QuantityOptions = {},
) {
  const singular = units.toLowerCase().endsWith(plural) ? units.substr(0, units.length - plural.length) : units
  if (value === 1) {
    return `${value} ${singular}`
  }

  const pluralValue = overridePlural || (emitPlural ? singular + plural : singular)
  return value === 0 ? `${zero} ${pluralValue}` : `${value} ${pluralValue}`
}
