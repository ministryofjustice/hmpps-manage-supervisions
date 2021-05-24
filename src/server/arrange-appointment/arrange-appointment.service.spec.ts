import 'reflect-metadata'
import { match } from 'sinon'
import { ArrangeAppointmentService, DomainAppointmentType, DUMMY_DATA } from './arrange-appointment.service'
import { fakeAppointmentBuilderDto } from './dto/arrange-appointment.fake'
import * as faker from 'faker'
import { pick } from 'lodash'
import { MockCacheModule, MockCacheService } from '../common/cache/cache.mock'
import { Test } from '@nestjs/testing'
import { MockCommunityApiModule, MockCommunityApiService } from '../community-api/community-api.mock'
import { CommunityApiService } from '../community-api'
import {
  fakeAppointmentCreateResponse,
  fakeAppointmentType,
  fakeOffenderDetail,
  fakeOfficeLocation,
} from '../community-api/community-api.fake'
import { fakeOkResponse } from '../common/rest/rest.fake'

describe('ArrangeAppointmentService', () => {
  let community: MockCommunityApiService
  let cache: MockCacheService
  let subject: ArrangeAppointmentService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [MockCacheModule.register(), MockCommunityApiModule.register()],
      providers: [ArrangeAppointmentService],
    }).compile()

    subject = module.get(ArrangeAppointmentService)
    community = module.get(CommunityApiService)
    cache = module.get(MockCacheService)
  })

  it('creates appointment', async () => {
    const dto = fakeAppointmentBuilderDto()
    const response = fakeAppointmentCreateResponse()
    const crn = faker.datatype.uuid()

    const stub = community.appointment.createAppointmentUsingPOST.withArgs(match.any).resolves(fakeOkResponse(response))

    const returned = await subject.createAppointment(dto, crn)

    expect(returned).toBe(response)
    expect(stub.getCall(0).args[0]).toEqual({
      crn,
      sentenceId: DUMMY_DATA.sentenceId,
      appointmentCreateRequest: {
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
    const response = fakeOffenderDetail()
    const crn = faker.datatype.uuid()

    community.offender.getOffenderDetailByCrnUsingGET.withArgs(match({ crn })).resolves(fakeOkResponse(response))

    const returned = await subject.getOffenderDetails(crn)

    expect(returned).toBe(response)
  })

  it('getting fresh appointment types', async () => {
    const featured = fakeAppointmentType({ contactType: 'APAT' })
    const other = fakeAppointmentType()
    community.appointment.getAllAppointmentTypesUsingGET.resolves(fakeOkResponse([featured, other]))
    const observed = await subject.getAppointmentTypes()
    expect(observed).toEqual([
      {
        isFeatured: true,
        description: 'Office visit',
        ...pick(featured, 'contactType', 'orderTypes', 'requiresLocation'),
      },
      {
        isFeatured: false,
        description: other.description,
        ...pick(other, 'contactType', 'orderTypes', 'requiresLocation'),
      },
    ] as DomainAppointmentType[])
  })

  it('getting cached appointment types', async () => {
    const types = (cache.cache['community:all-appointment-types'] = [{ ...fakeAppointmentType(), isFeatured: true }])
    const observed = await subject.getAppointmentTypes()
    expect(observed).toBe(types)
  })

  it('getting team office locations', async () => {
    const locations = [fakeOfficeLocation(), fakeOfficeLocation()]
    community.team.getAllOfficeLocationsUsingGET.resolves(fakeOkResponse(locations))
    const observed = await subject.getTeamOfficeLocations('some-team-code')
    expect(observed).toBe(locations)
  })

  it('getting cached team office locations', async () => {
    const locations = (cache.cache['community:team-office-locations:some-team-code'] = [
      fakeOfficeLocation(),
      fakeOfficeLocation(),
    ])
    const observed = await subject.getTeamOfficeLocations('some-team-code')
    expect(observed).toEqual(locations)
  })
})
