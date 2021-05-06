import { Expose } from 'class-transformer'

export class PhoneNumber {
  @Expose()
  number: string

  @Expose()
  type: string
}
