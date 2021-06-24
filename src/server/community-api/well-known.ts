import { Requirement } from './client'

export const RAR_REQUIREMENT_TYPE_MAIN_CATEGORY_CODE = 'F'
export const RAR_REQUIREMENT_SUB_TYPE_CATEGORY_CODE = 'RARREQ'
export const EMPLOYMENT_TYPE_CODE = 'B'

export function isRar(requirement: Requirement) {
  return (
    requirement.requirementTypeMainCategory.code == RAR_REQUIREMENT_TYPE_MAIN_CATEGORY_CODE &&
    requirement.requirementTypeSubCategory.code == RAR_REQUIREMENT_SUB_TYPE_CATEGORY_CODE
  )
}
