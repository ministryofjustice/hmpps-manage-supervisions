import { Expose, Type } from 'class-transformer'
import { PhoneNumber } from './PhoneNumber'

export class ContactDetails {
  @Expose()
  @Type(() => PhoneNumber)
  phoneNumbers?: PhoneNumber[]
}
