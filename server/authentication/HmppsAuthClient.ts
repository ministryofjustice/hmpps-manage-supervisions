import { Service } from 'typedi'
import { RestClientFactory } from '../data/RestClientFactory'
import { ClientCredentials } from '../config'
import { Expose } from 'class-transformer'

export class UserProfile {
  @Expose()
  name: string

  @Expose()
  username: string

  @Expose()
  active: boolean

  @Expose()
  authSource: string

  @Expose()
  userId: string

  @Expose()
  uuid: string
}

export class UserRole {
  @Expose()
  roleCode: string
}

@Service()
export class HmppsAuthClient {
  constructor(private readonly factory: RestClientFactory) {}

  async getUser(user: UserPrincipal): Promise<UserProfile> {
    const client = await this.factory.build('hmppsAuth', user)
    return client.get(UserProfile, '/api/user/me')
  }

  async getUserRoles(user: UserPrincipal): Promise<string[]> {
    const client = await this.factory.build('hmppsAuth', user)
    const roles = await client.get<UserRole[]>(UserRole, '/api/user/me/roles')
    return roles.map(x => x.roleCode)
  }
}

export function generateOauthClientToken(credentials: ClientCredentials): string {
  const token = Buffer.from(`${credentials.id}:${credentials.secret}`).toString('base64')
  return `Basic ${token}`
}
