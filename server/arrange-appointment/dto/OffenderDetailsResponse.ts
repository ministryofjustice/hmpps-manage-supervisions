import { Expose, Type } from 'class-transformer'
import { ContactDetails } from './ContactDetails'

export class OffenderDetailsResponse {
  @Expose()
  firstName: string

  @Expose()
  surname: string

  @Expose()
  @Type(() => ContactDetails)
  contactDetails: ContactDetails
}
