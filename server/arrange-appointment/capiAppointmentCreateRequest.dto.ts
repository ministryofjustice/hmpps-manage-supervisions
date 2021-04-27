import { Expose } from 'class-transformer'
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator'

export class CapiAppointmentCreateRequest {
  @Expose()
  @IsInt()
  @IsPositive()
  requirementId: number

  @Expose()
  @IsString()
  @IsNotEmpty()
  contactType: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  appointmentStart: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  appointmentEnd: string

  @Expose()
  @IsString()
  officeLocationCode?: string

  @Expose()
  @IsString()
  notes: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  providerCode: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  teamCode: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  staffCode: string
}
