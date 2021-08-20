import { StaffHuman } from '../community-api/client'
import { titleCase } from './text'

export function staffName(staff?: StaffHuman): string | null {
  if (!staff || staff.unallocated) {
    return null
  }

  return [...[staff.forenames, staff.surname].map(x => titleCase(x))].filter(x => x).join(' ')
}

export interface NameLike {
  firstName?: string
  middleNames?: string[]
  surname?: string
  preferredName?: string
}

export type GetDisplayNameOptions = Partial<Record<keyof NameLike, boolean>>

export function getDisplayName(
  nameLike: NameLike,
  { firstName = true, middleNames = true, surname = true, preferredName = false }: GetDisplayNameOptions = {},
): string {
  const names = [
    firstName && nameLike.firstName,
    ...((middleNames && nameLike.middleNames) || []),
    surname && nameLike.surname,
  ]
  if (preferredName && nameLike.preferredName) {
    names.push(`(${nameLike.preferredName})`)
  }
  return names.filter(x => x).join(' ')
}
