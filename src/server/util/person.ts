import { capitalize } from 'lodash'
import { StaffHuman } from '../community-api'

export function titleCase(sentence: string): string {
  return sentence?.trim()?.replace(/\w+/g, capitalize) ?? ''
}

export function staffName(staff?: StaffHuman): string | null {
  if (!staff || staff.unallocated) {
    return null
  }

  return [...[staff.forenames, staff.surname].map(titleCase)].filter(x => x).join(' ')
}

export interface NameLike {
  firstName?: string
  middleNames?: string[]
  surname?: string
  preferredName?: string
}

export interface PreferredNameLike extends NameLike {
  preferredName?: string
}

export interface GetDisplayNameOptions {
  preferredName?: boolean
}

export function getDisplayName(nameLike: NameLike | PreferredNameLike, options = { preferredName: false }): string {
  const names = [nameLike.firstName, ...(nameLike.middleNames || []), nameLike.surname]
  if (options.preferredName && nameLike.preferredName) {
    names.push(`(${nameLike.preferredName})`)
  }
  return names.filter(x => x).join(' ')
}
