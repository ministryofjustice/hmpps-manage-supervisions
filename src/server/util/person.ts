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
