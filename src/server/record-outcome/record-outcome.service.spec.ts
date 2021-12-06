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
import { fakeAvailableContactOutcomeTypes, fakeRecordOutcomeDto } from './record-outcome.fake'
import { MockDeliusApiModule, MockDeliusApiService } from '../delius-api/delius-api.mock'
import { fakeContactDto } from '../delius-api/delius-api.fake'
import { ContactV1ApiPatchContactRequest } from '../delius-api/client'
import { DeliusApiService } from '../delius-api'

describe('RecordOutcomeService', () => {
  let subject: RecordOutcomeService
  let community: MockCommunityApiService
  let delius: MockDeliusApiService
  let contactMapping: SinonStubbedInstance<ContactMappingService>

  beforeEach(async () => {
    contactMapping = createStubInstance(ContactMappingService)
    const module = await Test.createTestingModule({
      imports: [MockCommunityApiModule.register(), MockDeliusApiModule.register()],
      providers: [RecordOutcomeService, { provide: ContactMappingService, useValue: contactMapping }],
    }).compile()

    subject = module.get(RecordOutcomeService)
    community = module.get(CommunityApiService)
    delius = module.get(DeliusApiService)
  })

  it('gets appointment detail', async () => {
    const appointment = fakeContactSummary({
      contactStart: '2021-11-10',
      contactEnd: '2021-11-11',
      type: {
        code: 'OFFICE',
      },
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
      contactTypeCode: 'OFFICE',
    } as RecordOutcomeAppointmentSummary)
  })

  it('gets available contact outcomes', async () => {
    const outcomes = fakeAvailableContactOutcomeTypes()

    community.contactAndAttendance.getContactTypeOutcomesUsingGET
      .withArgs({ contactTypeCode: 'some-contact-type' })
      .resolves(fakeOkResponse(outcomes))

    const observed = await subject.getAvailableContactOutcomes('some-contact-type')

    expect(observed).toEqual(outcomes)
  })

  it('records outcomes', async () => {
    const output = fakeContactDto()

    const expectedPatchRequest: ContactV1ApiPatchContactRequest = {
      id: 123,
      body: [
        { op: 'replace', path: '/outcome', value: 'DNA1' },
        { op: 'replace', path: '/sensitive', value: false },
        { op: 'replace', path: '/notes', value: 'These are the new notes' },
        { op: 'replace', path: '/enforcement', value: 'DVDJ' },
      ],
    }

    delius.contactV1.patchContact.withArgs(expectedPatchRequest).resolves(fakeOkResponse(output))

    const input = fakeRecordOutcomeDto({
      appointment: { id: 123 },
      sensitive: false,
      addNotes: true,
      notes: 'These are the new notes',
      outcome: 'DNA1',
      enforcement: 'DVDJ',
    })

    const observed = await subject.recordOutcome(input)
    expect(observed).toEqual({ ...output, status: 'ok' })
  })
})
