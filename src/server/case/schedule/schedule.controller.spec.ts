import { Test } from '@nestjs/testing'
import { ScheduleController } from './schedule.controller'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { ScheduleService } from './schedule.service'
import { CasePage, CaseScheduleViewModel } from '../case.types'
import { fakeAppointmentListViewModel } from './schedule.fake'
import { fakeSecurityContext } from '../../security/context/security-context.fake'
import { Role } from '../../security'
import { EligibilityService } from '../../community-api/eligibility'
import { BreadcrumbType, LinksService } from '../../common/links'
import { MockOffenderModule, OffenderServiceFixture } from '../offender/offender.mock'
import { MockLinksModule } from '../../common/links/links.mock'

describe('ScheduleController', () => {
  let subject: ScheduleController
  let offenderFixture: OffenderServiceFixture
  let scheduleService: SinonStubbedInstance<ScheduleService>

  beforeEach(async () => {
    scheduleService = createStubInstance(ScheduleService)

    const module = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        { provide: ScheduleService, useValue: scheduleService },
        { provide: EligibilityService, useValue: null },
        { provide: LinksService, useValue: null },
      ],
      imports: [MockOffenderModule.register()],
    }).compile()

    subject = module.get(ScheduleController)
    offenderFixture = module.get(OffenderServiceFixture)
  })

  it('gets schedule', async () => {
    offenderFixture.havingOffender().havingCasePageOf()

    const appointments = [fakeAppointmentListViewModel()]
    scheduleService.getScheduledAppointments.withArgs('some-crn').resolves(appointments)

    const context = fakeSecurityContext()
    const observed = await subject.getSchedule('some-crn', context)

    const links = MockLinksModule.of({ crn: 'some-crn' })
    expect(observed).toBe(offenderFixture.caseViewModel)
    offenderFixture.shouldHaveCalledCasePageOf<CaseScheduleViewModel>({
      page: CasePage.Schedule,
      appointments,
      appointmentBookingEnabled: true,
      links: {
        arrangeAppointment: links.url(BreadcrumbType.NewAppointment),
      },
    })
  })

  it('gets read only schedule', async () => {
    offenderFixture.havingOffender().havingCasePageOf()

    const context = fakeSecurityContext({ authorities: [Role.ReadOnly] })
    await subject.getSchedule('some-crn', context)

    const { appointmentBookingEnabled } = offenderFixture.theCasePageOfOptions
    expect(appointmentBookingEnabled).toBe(false)
  })
})
