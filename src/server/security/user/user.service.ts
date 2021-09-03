import { Injectable } from '@nestjs/common'
import { Expose, plainToClass } from 'class-transformer'
import { StaffApi, StaffDetails } from '../../community-api/client'
import { AuthenticationMethod, RestService } from '../../common'

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

@Injectable()
export class UserService {
  constructor(private readonly rest: RestService) {}

  async getUser(user: User): Promise<UserProfile> {
    const client = this.rest.build('hmppsAuth', user)
    const { data } = await client.get('/api/user/me')
    return plainToClass(UserProfile, data)
  }

  async getStaffDetails(user: User): Promise<StaffDetails> {
    const staffApi = new StaffApi(
      null,
      '',
      this.rest.build('community', user, AuthenticationMethod.ReissueForDeliusUser),
    )
    const { data } = await staffApi.getStaffDetailsForUsernameUsingGET({ username: user.username })
    return data
  }
}
