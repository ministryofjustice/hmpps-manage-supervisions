import { Injectable } from '@nestjs/common'
import { Expose } from 'class-transformer'
import { RestService } from '../../common'

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

@Injectable()
export class UserService {
  constructor(private readonly rest: RestService) {}

  async getUser(user: User): Promise<UserProfile> {
    const client = await this.rest.build('hmppsAuth', user)
    return client.get(UserProfile, '/api/user/me')
  }

  async getUserRoles(user: User): Promise<string[]> {
    const client = await this.rest.build('hmppsAuth', user)
    const roles = await client.get<UserRole[]>(UserRole, '/api/user/me/roles')
    return roles.map(x => x.roleCode)
  }
}
