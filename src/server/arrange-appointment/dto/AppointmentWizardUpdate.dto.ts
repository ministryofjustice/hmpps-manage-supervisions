import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator'
import { ValidationOptions } from 'class-validator/types/decorator/ValidationOptions'

function WithMessage(
  message: string,
  ...decorators: ((validationOptions?: ValidationOptions) => PropertyDecorator)[]
): PropertyDecorator {
  const fns = decorators.map(fn => fn({ message }))
  return (target, propertyKey) => {
    for (const fn of fns) {
      fn(target, propertyKey)
    }
  }
}

function IsAppointmentType() {
  return WithMessage(AppointmentWizardUpdateTypeDto.MESSAGES.type.required, IsString, IsNotEmpty)
}

export class AppointmentWizardUpdateTypeDto {
  @Expose()
  @IsAppointmentType()
  type: string | 'other'

  @Expose()
  @ValidateIf(object => object?.type === 'other')
  @IsAppointmentType()
  other: string

  static MESSAGES = {
    type: {
      required: 'Select an appointment type',
    },
  }
}
