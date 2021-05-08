import { Expose } from 'class-transformer'

export enum RequiredOptional {
  /**
   * Value must be provided
   */
  Required = 'REQUIRED',

  /**
   * Value may be provided
   */
  Optional = 'OPTIONAL',

  /**
   * Value must not be provided
   */
  NotRequired = 'NOT_REQUIRED',
}

export enum OrderType {
  /**
   * A CJA 2003 order.
   * https://www.legislation.gov.uk/ukpga/2003/44/contents
   */
  Cja2003 = 'CJA_2003',

  /**
   * An order that predates CJA 2003.
   */
  Legacy = 'LEGACY',
}

export class AppointmentTypeDto {
  @Expose()
  contactType: string

  @Expose()
  description: string

  @Expose()
  requiresLocation: RequiredOptional

  @Expose()
  orderTypes: OrderType[]
}
