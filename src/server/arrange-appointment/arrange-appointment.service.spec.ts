import 'reflect-metadata'
import { SinonStubbedInstance, match } from 'sinon'
import { ArrangeAppointmentService, DomainAppointmentType } from './arrange-appointment.service'
import {
  fakeAppointmentBuilderDto,
  fakeAppointmentCreateResponse,
  fakeAppointmentTypeDto,
  fakeOffenderDetailsResponse,
} from './dto/arrange-appointment.fake'
import * as faker from 'faker'
import { AppointmentCreateResponse } from './dto/AppointmentCreateResponse'
import { OffenderDetailsResponse } from './dto/OffenderDetailsResponse'
import { AppointmentTypeDto } from './dto/AppointmentTypeDto'
import { pick } from 'lodash'
import { serialize } from 'class-transformer'
import { RestClient } from '../common'
import { fakeUser } from '../security/user/user.fake'
import { MockCacheModule, MockCacheService } from '../common/cache/cache.mock'
import { Test } from '@nestjs/testing'
import { MockRestModule } from '../common/rest/rest.mock'

describe('ArrangeAppointmentService', () => {
  let client: SinonStubbedInstance<RestClient>
  let cache: MockCacheService
  let user: User
  let subject: ArrangeAppointmentService

  beforeEach(async () => {
    user = fakeUser()

    const module = await Test.createTestingModule({
      imports: [MockCacheModule.register(), MockRestModule.register('community', user)],
      providers: [ArrangeAppointmentService],
    }).compile()

    subject = module.get(ArrangeAppointmentService)
    client = module.get(MockRestModule.CLIENT)
    cache = module.get(MockCacheService)
  })

  it('creates appointment', async () => {
    const dto = fakeAppointmentBuilderDto()
    const response = fakeAppointmentCreateResponse()
    const crn = faker.datatype.uuid()

    const stub = client.post
      .withArgs(
        AppointmentCreateResponse,
        `/secure/offenders/crn/${crn}/sentence/${dto.sentenceId}/appointments`,
        match.any,
      )
      .resolves(response)

    const returned = await subject.createAppointment(dto, crn, user)

    expect(returned).toBe(response)
    expect(stub.getCall(0).args[2]).toEqual({
      data: {
        appointmentStart: dto.appointmentStart.toISO(),
        appointmentEnd: dto.appointmentEnd.toISO(),
        contactType: dto.contactType.code,
        notes: dto.notes,
        officeLocationCode: dto.officeLocationCode,
        providerCode: dto.providerCode,
        requirementId: dto.requirementId,
        staffCode: dto.staffCode,
        teamCode: dto.teamCode,
      },
    })
  })

  it('gets offender details', async () => {
    const response = fakeOffenderDetailsResponse()
    const crn = faker.datatype.uuid()

    client.get.withArgs(OffenderDetailsResponse, `/secure/offenders/crn/${crn}`).resolves(response)

    const returned = await subject.getOffenderDetails(crn, user)

    expect(returned).toBe(response)
  })

  it('getting fresh appointment types', async () => {
    const featured = fakeAppointmentTypeDto({ contactType: 'APAT' })
    const other = fakeAppointmentTypeDto()
    client.get.withArgs(AppointmentTypeDto, '/secure/appointment-types').resolves([featured, other])
    const observed = await subject.getAppointmentTypes(user)
    expect(observed).toEqual([
      { isFeatured: true, name: 'Office visit', ...pick(featured, 'contactType', 'orderTypes', 'requiresLocation') },
      { isFeatured: false, name: other.description, ...pick(other, 'contactType', 'orderTypes', 'requiresLocation') },
    ] as DomainAppointmentType[])
  })

  it('getting cached appointment types', async () => {
    const other = fakeAppointmentTypeDto()
    cache.cache['community:appointment-types'] = serialize([other])
    const observed = await subject.getAppointmentTypes(user)
    expect(observed).toEqual([
      { isFeatured: false, name: other.description, ...pick(other, 'contactType', 'orderTypes', 'requiresLocation') },
    ] as DomainAppointmentType[])
  })
})
