export interface NameLike {
  firstName?: string
  middleNames?: string[]
  surname?: string
}

export function getOffenderDisplayName(offender: NameLike): string {
  return [offender.firstName, ...(offender.middleNames || []), offender.surname].filter(x => x).join(' ')
}
