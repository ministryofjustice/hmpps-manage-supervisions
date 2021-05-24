import { ValidationError } from 'class-validator'

/**
 * TODO this has become too much like an appointment builder view model, simplify & move it into that module?
 */
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
