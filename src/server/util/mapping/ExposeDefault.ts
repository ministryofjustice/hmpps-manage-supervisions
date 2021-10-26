import { Expose, ExposeOptions } from 'class-transformer'

export const DEFAULT_GROUP = 'default'

export function ExposeDefault(options?: ExposeOptions): PropertyDecorator & ClassDecorator {
  return Expose({ ...options, groups: [DEFAULT_GROUP, ...(options?.groups || [])] })
}
