import 'reflect-metadata'
import { SinonStubbedInstance, match } from 'sinon'
import { ArrangeAppointmentService, DomainAppointmentType, DUMMY_DATA } from './arrange-appointment.service'
import {
  fakeAppointmentBuilderDto,
  fakeAppointmentCreateResponse,
  fakeAppointmentTypeDto,
  fakeOffenderDetailsResponse,
  fakeOfficeLocation,
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
import { OfficeLocation } from './dto/OfficeLocation'

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
        `/secure/offenders/crn/${crn}/sentence/${DUMMY_DATA.sentenceId}/appointments`,
        match.any,
      )
      .resolves(response)

    const returned = await subject.createAppointment(dto, crn, user)

    expect(returned).toBe(response)
    expect(stub.getCall(0).args[2]).toEqual({
      data: {
        contactType: dto.type,
        officeLocationCode: dto.location,
        appointmentStart: dto.appointmentStart.toISO(),
        appointmentEnd: dto.appointmentEnd.toISO(),
        sensitive: dto.sensitive,
        notes: dto.notes,
        providerCode: DUMMY_DATA.providerCode,
        requirementId: DUMMY_DATA.requirementId,
        staffCode: DUMMY_DATA.staffCode,
        teamCode: DUMMY_DATA.teamCode,
      },
    })
  })

  it('gets offender details', async () => {
    const response = fakeOffenderDetailsResponse()
    const crn = faker.datatype.uuid()

    client.get.withArgs(OffenderDetailsResponse, `/secure/offenders/crn/${crn}/all`).resolves(response)

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

  it('getting team office locations', async () => {
    const locations = [fakeOfficeLocation(), fakeOfficeLocation()]
    client.get.withArgs(OfficeLocation, '/secure/teams/some-team-code/office-locations').resolves(locations)
    const observed = await subject.getTeamOfficeLocations(user, 'some-team-code')
    expect(observed).toBe(locations)
  })

  it('getting cached team office locations', async () => {
    const locations = [fakeOfficeLocation(), fakeOfficeLocation()]
    cache.cache['community:office-locations:some-team-code'] = serialize(locations)
    const observed = await subject.getTeamOfficeLocations(user, 'some-team-code')
    expect(observed).toEqual(locations)
  })
})
