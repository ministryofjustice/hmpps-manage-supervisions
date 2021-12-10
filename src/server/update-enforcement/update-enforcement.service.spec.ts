import { Test } from '@nestjs/testing'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { UpdateEnforcementService } from './update-enforcement.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../community-api/community-api.mock'
import { MockDeliusApiModule, MockDeliusApiService } from '../delius-api/delius-api.mock'
import { CommunityApiService, ContactMappingService } from '../community-api'
import {
  fakeAvailableOutcomeTypes,
  fakeContactSummary,
  fakeEnforcementAction,
} from '../community-api/community-api.fake'
import { fakeOkResponse } from '../common/rest/rest.fake'
import { fakeContactMeta } from '../community-api/contact-mapping/contact-mapping.fake'
import { ContactTypeCategory } from '../config'
import { DeliusApiService } from '../delius-api'
import { UpdateEnforcementAppointmentSummary } from './update-enforcement.types'
import { fakeUpdateEnforcementAppointmentSummary } from './update-enforcement.fake'

describe('UpdateEnforcementService', () => {
  let subject: UpdateEnforcementService
  let community: MockCommunityApiService
  let delius: MockDeliusApiService
  let contactMapping: SinonStubbedInstance<ContactMappingService>

  beforeEach(async () => {
    contactMapping = createStubInstance(ContactMappingService)
    const module = await Test.createTestingModule({
      imports: [MockCommunityApiModule.register(), MockDeliusApiModule.register()],
      providers: [UpdateEnforcementService, { provide: ContactMappingService, useValue: contactMapping }],
    }).compile()

    subject = module.get(UpdateEnforcementService)
    community = module.get(CommunityApiService)
    delius = module.get(DeliusApiService)
  })

  it('gets appointment detail', async () => {
    const appointment = fakeContactSummary({
      contactStart: '2021-11-10',
      contactEnd: '2021-11-11',
      type: { code: 'some-contact-type' },
      outcome: { code: 'some-outcome' },
      enforcement: { enforcementAction: { code: 'some-enforcement' } },
    })
    community.contactAndAttendance.getOffenderContactSummaryByCrnUsingGET
      .withArgs({ crn: 'some-crn', contactId: 100 })
      .resolves(fakeOkResponse(appointment))

    const meta = fakeContactMeta(ContactTypeCategory.Appointment)
    contactMapping.getTypeMeta.withArgs(appointment).returns(meta)

    const observed = await subject.getAppointmentDetail('some-crn', 100)

    expect(observed).toEqual({
      id: 100,
      name: 'some appointment',
      contactTypeCode: 'some-contact-type',
      enforcementCode: 'some-enforcement',
      outcomeCode: 'some-outcome',
    } as UpdateEnforcementAppointmentSummary)
  })

  it('getting available enforcements', async () => {
    const appointment = fakeUpdateEnforcementAppointmentSummary({
      contactTypeCode: 'some-contact-type',
      outcomeCode: 'some-outcome',
    })
    const enforcements = [fakeEnforcementAction()]
    const outcomeTypes = fakeAvailableOutcomeTypes({
      outcomeTypes: [{ code: 'some-outcome', enforceable: true, enforcements }],
    })
    community.contactAndAttendance.getContactTypeOutcomesUsingGET
      .withArgs(match({ contactTypeCode: 'some-contact-type' }))
      .resolves(fakeOkResponse(outcomeTypes))

    const observed = await subject.getAvailableEnforcements(appointment)
    expect(observed).toEqual(enforcements)
  })

  it('updates enforcement', async () => {
    const stub = delius.contactV1.patchContact.resolves(fakeOkResponse({} as any))
    await subject.updateEnforcement(100, 'some-enforcement')
    expect(stub.getCall(0).firstArg).toEqual({
      id: 100,
      body: [{ op: 'replace', path: '/enforcement', value: 'some-enforcement' }],
    })
  })
})
