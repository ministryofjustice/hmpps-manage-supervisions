import { Test } from '@nestjs/testing'
import * as faker from 'faker'
import { MockCacheModule, MockCacheService } from '../../common/cache/cache.mock'
import { fakeOkResponse } from '../../common/rest/rest.fake'
import { ContactTypesService } from '.'
import { CommunityApiService } from '..'
import { fakeAppointmentType, fakeContactType } from '../community-api.fake'
import { MockCommunityApiModule, MockCommunityApiService } from '../community-api.mock'

describe('ContactTypesService', () => {
  let subject: ContactTypesService
  let community: MockCommunityApiService
  let cache: MockCacheService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [MockCacheModule.register(), MockCommunityApiModule.register()],
      providers: [ContactTypesService],
    }).compile()

    subject = module.get(ContactTypesService)
    community = module.get(CommunityApiService)
    cache = module.get(MockCacheService)
  })

  it('getting fresh appointment types', async () => {
    const appointmentTypes = [fakeAppointmentType()]
    community.appointment.getAllAppointmentTypesUsingGET.resolves(fakeOkResponse(appointmentTypes))

    const observed = await subject.getAppointmentContactTypes()
    const expected = appointmentTypes.map(t => t.contactType)
    expect(observed).toEqual(expected as string[])
  })

  it('getting cached appointment types', async () => {
    const appointmentTypeContactType = faker.datatype.uuid()
    const contactTypes = (cache.cache['community:appointment-contact-types'] = [appointmentTypeContactType])
    const observed = await subject.getAppointmentContactTypes()
    expect(observed).toBe(contactTypes)
  })

  it('getting fresh communication types', async () => {
    const communicationContactTypes = [fakeContactType()]

    community.contactAndAttendance.getContactTypesUsingGET.resolves(fakeOkResponse(communicationContactTypes))
    const observed = await subject.getCommunicationContactTypes()
    const expected = communicationContactTypes.map(t => t.code)
    expect(observed).toEqual(expected as string[])
  })

  it('getting cached communication types', async () => {
    const communicationContactTypeCode = faker.datatype.uuid()
    const communicationContactTypes = (cache.cache['community:LT-contact-types'] = [communicationContactTypeCode])
    const observed = await subject.getCommunicationContactTypes()
    expect(observed).toBe(communicationContactTypes)
  })
})
