import { Test } from '@nestjs/testing'
import { DeliusApiService } from './delius-api.service'
import { MockRestModule } from '../common/rest/rest.mock'
import { fakeUser } from '../security/user/user.fake'
import { AuthenticationMethod } from '../common'
import { Logger } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'

describe('DeliusApiService', () => {
  let subject: DeliusApiService
  const user = fakeUser()

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MockRestModule.register([{ name: 'delius', user, authMethod: AuthenticationMethod.ReissueForDeliusUser }]),
      ],
      providers: [DeliusApiService, { provide: REQUEST, useValue: { user } }],
    })
      .setLogger(new Logger())
      .compile()

    subject = await module.resolve(DeliusApiService)
  })

  it('should be defined', () => {
    expect(subject).toBeDefined()
  })
})
