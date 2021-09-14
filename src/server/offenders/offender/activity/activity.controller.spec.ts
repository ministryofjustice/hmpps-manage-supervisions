import { Test } from '@nestjs/testing'
import { ActivityController } from './activity.controller'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { OffenderService } from '../offender.service'
import { ActivityService } from './activity.service'
import { MockLinksModule } from '../../../common/links/links.mock'
import { BreadcrumbType } from '../../../common/links'
import { fakeOffenderDetailSummary } from '../../../community-api/community-api.fake'
import { getDisplayName } from '../../../util'
import { fakeActivityLogEntry } from './activity.fake'
import { ContactTypeCategory } from '../../../config'
import {
  AppointmentActivityLogEntry,
  AppointmentViewModel,
  CommunicationActivityLogEntry,
  CommunicationViewModel,
} from './activity.types'

describe('ActivityController', () => {
  let subject: ActivityController
  let offenderService: SinonStubbedInstance<OffenderService>
  let activityService: SinonStubbedInstance<ActivityService>

  beforeEach(async () => {
    offenderService = createStubInstance(OffenderService)
    activityService = createStubInstance(ActivityService)

    const module = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        { provide: OffenderService, useValue: offenderService },
        { provide: ActivityService, useValue: activityService },
      ],
      imports: [MockLinksModule],
    }).compile()

    subject = module.get(ActivityController)
  })

  it('gets appointment', async () => {
    const offender = havingOffenderSummary()

    const appointment = fakeActivityLogEntry(
      { type: ContactTypeCategory.Appointment },
      { when: 'future' },
    ) as AppointmentActivityLogEntry
    const displayName = getDisplayName(offender)
    activityService.getAppointment.withArgs('some-crn', 111).resolves(appointment)

    const observed = await subject.getAppointment('some-crn', 111)
    const links = MockLinksModule.of({
      crn: 'some-crn',
      offenderName: displayName,
      entityName: appointment.name,
      id: 111,
      parentOverrides: {
        [BreadcrumbType.Appointment]: BreadcrumbType.CaseSchedule,
      },
    })
    expect(observed).toEqual({
      displayName,
      breadcrumbs: links.breadcrumbs(BreadcrumbType.Appointment),
      appointment,
    } as AppointmentViewModel)
  })

  it('gets communication', async () => {
    const offender = havingOffenderSummary()
    const displayName = getDisplayName(offender)
    const contact = fakeActivityLogEntry({ type: ContactTypeCategory.Communication }) as CommunicationActivityLogEntry
    activityService.getCommunicationContact.withArgs('some-crn', 111, offender).resolves(contact)

    const observed = await subject.getCommunication('some-crn', 111)
    const links = MockLinksModule.of({
      crn: 'some-crn',
      offenderName: displayName,
      entityName: contact.name,
      id: 111,
    })
    expect(observed).toEqual({
      displayName,
      breadcrumbs: links.breadcrumbs(BreadcrumbType.OtherCommunication),
      contact,
    } as CommunicationViewModel)
  })

  function havingOffenderSummary() {
    const offender = fakeOffenderDetailSummary({
      otherIds: { crn: 'some-crn', pncNumber: 'some-pnc' },
      firstName: 'Liz',
      middleNames: ['Danger'],
      surname: 'Haggis',
      preferredName: 'Bob',
    })
    offenderService.getOffenderSummary.withArgs('some-crn').resolves(offender)
    return offender
  }
})
