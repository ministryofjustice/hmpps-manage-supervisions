import { Expose, Transform } from 'class-transformer'
import { Role } from '../authorization'

export class SecurityContext {
  @Expose()
  readonly username: string

  @Expose()
  readonly staffCode: string

  @Expose()
  @Transform(({ value }) => (Array.isArray(value) ? value.map(x => x.toUpperCase()) : null))
  readonly authorities: string[]

  hasRole(role: Role): boolean {
    return this.authorities?.includes(role) || false
  }
}
