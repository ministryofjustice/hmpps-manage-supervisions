import { Test } from '@nestjs/testing'
import { RecordOutcomeService } from './record-outcome.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../community-api/community-api.mock'
import { CommunityApiService, ContactMappingService } from '../community-api'
import { fakeOkResponse } from '../common/rest/rest.fake'
import { fakeContactSummary } from '../community-api/community-api.fake'
import { RecordOutcomeAppointmentSummary } from './record-outcome.types'
import { DateTime } from 'luxon'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { fakeContactMeta } from '../community-api/contact-mapping/contact-mapping.fake'
import { ContactTypeCategory } from '../config'

describe('RecordOutcomeService', () => {
  let subject: RecordOutcomeService
  let community: MockCommunityApiService
  let contactMapping: SinonStubbedInstance<ContactMappingService>

  beforeEach(async () => {
    contactMapping = createStubInstance(ContactMappingService)
    const module = await Test.createTestingModule({
      imports: [MockCommunityApiModule.register()],
      providers: [RecordOutcomeService, { provide: ContactMappingService, useValue: contactMapping }],
    }).compile()

    subject = module.get(RecordOutcomeService)
    community = module.get(CommunityApiService)
  })

  it('gets appointment detail', async () => {
    const appointment = fakeContactSummary({
      contactStart: '2021-11-10',
      contactEnd: '2021-11-11',
    })
    community.contactAndAttendance.getOffenderContactSummaryByCrnUsingGET
      .withArgs({
        crn: 'some-crn',
        contactId: 100,
      })
      .resolves(fakeOkResponse(appointment))

    const meta = fakeContactMeta(ContactTypeCategory.Appointment)
    contactMapping.getTypeMeta.withArgs(appointment).returns(meta)

    const observed = await subject.getAppointmentDetail('some-crn', 100)

    expect(observed).toEqual({
      id: 100,
      name: 'some appointment',
      start: DateTime.fromISO('2021-11-10'),
      end: DateTime.fromISO('2021-11-11'),
    } as RecordOutcomeAppointmentSummary)
  })
})
