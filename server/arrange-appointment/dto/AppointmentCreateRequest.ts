import { Expose } from 'class-transformer'
import { IsDateString, IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator'

export class AppointmentCreateRequest {
  @Expose()
  @IsInt()
  @IsPositive()
  requirementId: number

  @Expose()
  @IsString()
  @IsNotEmpty()
  contactType: string

  @Expose()
  @IsDateString()
  @IsNotEmpty()
  appointmentStart: string

  @Expose()
  @IsDateString()
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
