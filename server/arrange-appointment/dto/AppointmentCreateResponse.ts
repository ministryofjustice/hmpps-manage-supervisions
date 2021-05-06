import { Expose, Type } from 'class-transformer'

export class AppointmentCreateResponse {
  @Expose()
  @Type(() => Number)
  id?: number

  @Expose()
  @Type(() => Number)
  appointmentId: number

  @Expose()
  appointmentStart: string

  @Expose()
  appointmentEnd: string

  @Expose()
  typeDescription: string
}
