import { Test } from '@nestjs/testing'
import { ActivityController } from './activity.controller'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { OffenderService } from '../offender.service'
import { ActivityService } from './activity.service'
import { MockLinksModule } from '../../../common/links/links.mock'
import { BreadcrumbType } from '../../../common/links'
import { fakeOffenderDetailSummary } from '../../../community-api/community-api.fake'
import { getDisplayName } from '../../../util'
import { fakeCommunicationActivityLogEntry } from './activity.fake'

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

  it('should be defined', () => {
    expect(subject).toBeDefined()
  })

  it('gets communication', async () => {
    const offender = havingOffenderSummary()

    const contact = fakeCommunicationActivityLogEntry()
    const displayName = getDisplayName(offender)
    activityService.getCommunicationContact.withArgs('some-crn', 111, displayName).resolves(contact)

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
    })
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
