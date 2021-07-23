import { WellKnownRequirementTypeConfig, WellKnownRequirementTypePattern } from './types'
import { Requirement } from '../community-api'
import { quantity, safeCapitalize } from '../util'

export function isRar(config: WellKnownRequirementTypeConfig, requirement: Requirement): boolean {
  return config[requirement.requirementTypeMainCategory?.code]?.isRar || false
}

export function getWellKnownRequirementName(config: WellKnownRequirementTypeConfig, requirement: Requirement): string {
  const postfix = !requirement.active ? ' (terminated)' : ''

  const wellKnown = config[requirement.requirementTypeMainCategory?.code]
  if (!wellKnown) {
    // fallback to 'mainCategory: subCategory'
    return safeCapitalize(
      [requirement.requirementTypeMainCategory?.description, requirement.requirementTypeSubCategory?.description]
        .filter(x => x)
        .join(': ') + postfix,
    )
  }

  const pattern =
    (wellKnown.subTypePatterns && wellKnown.subTypePatterns[requirement.requirementTypeSubCategory?.code]) ||
    wellKnown.pattern

  const [length, unit] =
    requirement.length !== undefined && requirement.lengthUnit !== undefined
      ? quantity(requirement.length, requirement.lengthUnit).split(' ')
      : ['0', requirement.lengthUnit || 'days']

  const result = pattern
    .replace(WellKnownRequirementTypePattern.SubCategory, requirement.requirementTypeSubCategory?.description || '')
    .replace(WellKnownRequirementTypePattern.Length, length)
    .replace(WellKnownRequirementTypePattern.Unit, unit)
    .replace(
      WellKnownRequirementTypePattern.Progress,
      requirement.rarCount ? quantity(requirement.rarCount, 'days') : 'none',
    )

  return safeCapitalize(result) + postfix
}
