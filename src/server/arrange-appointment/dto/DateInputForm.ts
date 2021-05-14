import { Expose } from 'class-transformer'
import { IsNotEmpty, ValidateIf } from 'class-validator'

export default class DateInputForm {
  @ValidateIf(o => o.month || o.year)
  @IsNotEmpty({ message: 'Enter a day' })
  @Expose()
  day: string

  @ValidateIf(o => o.day || o.year)
  @IsNotEmpty({ message: 'Enter a month' })
  @Expose()
  month: string

  @ValidateIf(o => o.day || o.month)
  @IsNotEmpty({ message: 'Enter a year' })
  @Expose()
  year: string
}
