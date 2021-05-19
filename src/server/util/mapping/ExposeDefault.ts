import { ExposeOptions } from 'class-transformer/types/interfaces'
import { Expose } from 'class-transformer'

export const DEFAULT_GROUP = 'default'

export function ExposeDefault(options?: ExposeOptions): PropertyDecorator & ClassDecorator {
  return Expose({ ...options, groups: [DEFAULT_GROUP, ...(options?.groups || [])] })
}
