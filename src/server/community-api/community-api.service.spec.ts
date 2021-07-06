import { Test } from '@nestjs/testing'
import { CommunityApiService } from './community-api.service'
import { fakeUser } from '../security/user/user.fake'
import { REQUEST } from '@nestjs/core'
import { fakeAppointmentType } from './community-api.fake'
import { Logger } from '@nestjs/common'
import { MockRestModule } from '../common/rest/rest.mock'
import { AuthenticationMethod } from '../common'
import MockAdapter from 'axios-mock-adapter'

describe('CommunityApiService', () => {
  let subject: CommunityApiService
  let user: User
  let client: MockAdapter

  beforeEach(async () => {
    user = fakeUser()

    const module = await Test.createTestingModule({
      imports: [
        MockRestModule.register([{ name: 'community', user, authMethod: AuthenticationMethod.ReissueForDeliusUser }]),
      ],
      providers: [CommunityApiService, { provide: REQUEST, useValue: { user } }],
    })
      .setLogger(new Logger())
      .compile()

    subject = await module.resolve(CommunityApiService)
    client = module.get(MockRestModule.CLIENT)
  })

  it('calls appointment api', async () => {
    const appointmentTypes = [fakeAppointmentType(), fakeAppointmentType()]
    client.onGet('/secure/appointment-types').reply(200, appointmentTypes)
    const observed = await subject.appointment.getAllAppointmentTypesUsingGET()
    expect(observed.data).toEqual(appointmentTypes)
  })

  it('calls risk registration api', async () => {
    client.onGet('/secure/offenders/crn/:crn/registrations').reply(200)
  })
})
