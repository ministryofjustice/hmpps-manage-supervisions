import 'reflect-metadata'
import { match } from 'sinon'
import { ArrangeAppointmentService } from './arrange-appointment.service'
import { fakeAppointmentBuilderDto, fakeFeaturedAppointmentType } from './dto/arrange-appointment.fake'
import * as faker from 'faker'
import { MockCacheModule, MockCacheService } from '../common/cache/cache.mock'
import { Test } from '@nestjs/testing'
import { MockCommunityApiModule, MockCommunityApiService } from '../community-api/community-api.mock'
import { CommunityApiService, EMPLOYMENT_TYPE_CODE } from '../community-api'
import {
  fakeAppointmentCreateResponse,
  fakeAppointmentType,
  fakeOffenderDetail,
  fakeOfficeLocation,
  fakePersonalCircumstance,
} from '../community-api/community-api.fake'
import { fakeOkResponse } from '../common/rest/rest.fake'
import { WellKnownAppointmentType, ContactTypeCategory, WellKnownContactTypeConfig } from '../config'
import { AvailableAppointmentTypes } from './dto/AppointmentWizardViewModel'
import { FakeConfigModule } from '../config/config.fake'
import { ConfigService } from '@nestjs/config'

describe('ArrangeAppointmentService', () => {
  let community: MockCommunityApiService
  let cache: MockCacheService
  let subject: ArrangeAppointmentService
  let config: WellKnownContactTypeConfig

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [MockCacheModule.register(), MockCommunityApiModule.register(), FakeConfigModule.register()],
      providers: [ArrangeAppointmentService],
    }).compile()

    subject = module.get(ArrangeAppointmentService)
    community = module.get(CommunityApiService)
    cache = module.get(MockCacheService)
    config = module.get(ConfigService).get('contacts')
  })

  it('creates appointment', async () => {
    const dto = fakeAppointmentBuilderDto({ type: WellKnownAppointmentType.OfficeVisit })
    const response = fakeAppointmentCreateResponse()
    const crn = faker.datatype.uuid()
    const type = fakeFeaturedAppointmentType({ type: WellKnownAppointmentType.OfficeVisit })
    cache.cache['community:available-appointment-types'] = {
      featured: [type],
      other: [],
    } as AvailableAppointmentTypes
    const stub = community.appointment.createAppointmentUsingPOST.withArgs(match.any).resolves(fakeOkResponse(response))

    const returned = await subject.createAppointment(dto, crn)

    expect(returned).toBe(response)
    expect(stub.getCall(0).args[0]).toEqual({
      crn,
      sentenceId: dto.convictionId,
      appointmentCreateRequest: {
        contactType: type.appointmentTypes[0].contactType,
        officeLocationCode: dto.location,
        appointmentStart: dto.appointmentStart.toISO(),
        appointmentEnd: dto.appointmentEnd.toISO(),
        sensitive: dto.sensitive,
        notes: dto.notes,
        providerCode: dto.providerCode,
        requirementId: dto.requirementId,
        staffCode: dto.staffCode,
        teamCode: dto.teamCode,
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

  it('getting offender details throws exception if no active probation managed sentence', async () => {
    const response = fakeOffenderDetail({ activeProbationManagedSentence: false })
    const crn = faker.datatype.uuid()

    community.offender.getOffenderDetailByCrnUsingGET.withArgs(match({ crn })).resolves(fakeOkResponse(response))

    await expect(async () => {
      await subject.getOffenderDetails(crn)
    }).rejects.toThrowError('This offender does not have an active probation managed sentence')
  })

  it('getting fresh appointment types', async () => {
    const featured = fakeAppointmentType({ contactType: 'APAT' })
    const other = fakeAppointmentType()
    community.appointment.getAllAppointmentTypesUsingGET.resolves(fakeOkResponse([featured, other]))
    const observed = await subject.getAppointmentTypes()
    expect(observed).toEqual({
      featured: [
        {
          type: WellKnownAppointmentType.OfficeVisit,
          description: 'Office visit',
          meta: config[ContactTypeCategory.Appointment][WellKnownAppointmentType.OfficeVisit],
          appointmentTypes: [featured],
        },
      ],
      other: [other],
    } as AvailableAppointmentTypes)
  })

  it('getting cached appointment types', async () => {
    const types = (cache.cache['community:available-appointment-types'] = [
      { ...fakeAppointmentType(), isFeatured: true },
    ])
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

  it('gets offender employment', async () => {
    const personalCircumstances = [
      fakePersonalCircumstance({
        personalCircumstanceType: { code: EMPLOYMENT_TYPE_CODE },
        personalCircumstanceSubType: { description: 'Some offender employment' },
      }),
    ]
    const stub = community.personalCircumstances.getOffenderPersonalCircumstancesByCrnUsingGET.resolves(
      fakeOkResponse({ personalCircumstances }),
    )
    const observed = await subject.getCurrentEmploymentCircumstances('some-crn')
    expect(observed).toBe('Some offender employment')
    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn' })
  })
})
