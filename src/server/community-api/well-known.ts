import { Requirement } from './client'

export const RAR_REQUIREMENT_TYPE_MAIN_CATEGORY_CODE = 'F'
export const EMPLOYMENT_TYPE_CODE = 'B'

export const isRar = (requirement: Requirement) =>
  requirement.requirementTypeMainCategory.code == RAR_REQUIREMENT_TYPE_MAIN_CATEGORY_CODE

export enum WellKnownAddressTypes {
  Main = 'M',
  Previous = 'P',
  Secondary = 'S',
}
