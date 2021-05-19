import { Expose } from 'class-transformer'

export class OfficeLocation {
  @Expose()
  code: string

  @Expose()
  description: string

  @Expose()
  buildingName: string

  @Expose()
  buildingNumber: string

  @Expose()
  streetName: string

  @Expose()
  townCity: string

  @Expose()
  county: string

  @Expose()
  postcode: string
}
