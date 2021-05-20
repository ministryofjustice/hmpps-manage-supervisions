import { ValidationError } from 'class-validator'

export type ViewModel<T, Name extends string = 'dto'> = {
  errors?: ValidationError[] | null
  paths?: {
    back?: string
    type?: string
    where?: string
    when?: string
    sensitive?: string
    notes?: string
  }
} & { [P in Name]: T }
