import { Expose, Type } from 'class-transformer'
import { PhoneNumber } from './PhoneNumber'

export class OffenderDetailsResponse {
  @Expose()
  firstName: string

  @Expose()
  surname: string

  @Expose()
  @Type(() => PhoneNumber)
  phoneNumbers?: PhoneNumber[]
}
