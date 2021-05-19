import { Expose, Type } from 'class-transformer'

export class PhoneNumber {
  @Expose()
  number: string

  @Expose()
  type: string
}

export class ContactDetails {
  @Expose()
  @Type(() => PhoneNumber)
  phoneNumbers?: PhoneNumber[]
}

export class OffenderManagerTeam {
  @Expose()
  code: string
}

export class OffenderManager {
  @Expose()
  @Type(() => OffenderManagerTeam)
  team: OffenderManagerTeam
}

export class OffenderDetailsResponse {
  @Expose()
  firstName: string

  @Expose()
  surname: string

  @Expose()
  @Type(() => ContactDetails)
  contactDetails: ContactDetails

  @Expose()
  @Type(() => OffenderManager)
  offenderManagers: OffenderManager[]
}
