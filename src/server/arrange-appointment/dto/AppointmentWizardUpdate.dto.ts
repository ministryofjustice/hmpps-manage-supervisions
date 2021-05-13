import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'

export class AppointmentWizardUpdateTypeDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  type: string
}
