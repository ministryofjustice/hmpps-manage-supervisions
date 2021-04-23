import { Expose, Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator'

export class ExampleDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  message: string

  @Expose()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  n: number
}
