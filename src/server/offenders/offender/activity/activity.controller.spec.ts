import { Test } from '@nestjs/testing'
import { ActivityController } from './activity.controller'
import { SinonStubbedInstance, createStubInstance } from 'sinon'
import { OffenderService } from '../offender.service'
import { ActivityService } from './activity.service'
import { MockLinksModule } from '../../../common/links/links.mock'

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
})
