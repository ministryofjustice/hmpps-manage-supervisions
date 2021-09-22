import { Test } from '@nestjs/testing'
import { ScheduleController } from './schedule.controller'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { OffenderService } from '../offender'
import { ScheduleService } from './schedule.service'
import { FakeConfigModule } from '../../config/config.fake'
import { fakeOffenderDetailSummary } from '../../community-api/community-api.fake'
import { CasePage } from '../case.types'
import { fakeAppointmentListViewModel } from './schedule.fake'
import { FeatureFlags } from '../../config'
import { fakeSecurityContext } from '../../security/context/security-context.fake'
import { Role } from '../../security'

describe('ScheduleController', () => {
  let subject: ScheduleController
  let offenderService: SinonStubbedInstance<OffenderService>
  let scheduleService: SinonStubbedInstance<ScheduleService>

  beforeEach(async () => {
    offenderService = createStubInstance(OffenderService)
    scheduleService = createStubInstance(ScheduleService)

    const module = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        { provide: OffenderService, useValue: offenderService },
        { provide: ScheduleService, useValue: scheduleService },
      ],
      imports: [FakeConfigModule.register({ server: { features: { [FeatureFlags.EnableAppointmentBooking]: true } } })],
    }).compile()

    subject = module.get(ScheduleController)
  })

  it('gets schedule', async () => {
    const offender = fakeOffenderDetailSummary()
    offenderService.getOffenderSummary.withArgs('some-crn').resolves(offender)

    const viewModel: any = { page: CasePage.Schedule }
    const stub = offenderService.casePageOf.withArgs(offender, match.any).returns(viewModel)

    const appointments = [fakeAppointmentListViewModel()]
    scheduleService.getScheduledAppointments.withArgs('some-crn').resolves(appointments)

    const context = fakeSecurityContext()
    const observed = await subject.getSchedule('some-crn', context)

    expect(observed).toBe(viewModel)
    expect(stub.getCall(0).args[1]).toEqual({
      page: CasePage.Schedule,
      appointments,
      appointmentBookingEnabled: true,
    })
  })

  it('gets read only schedule', async () => {
    const offender = fakeOffenderDetailSummary()
    offenderService.getOffenderSummary.withArgs('some-crn').resolves(offender)

    const stub = offenderService.casePageOf.withArgs(offender, match.any).returns({} as any)

    const context = fakeSecurityContext({ authorities: [Role.ReadOnly] })
    await subject.getSchedule('some-crn', context)

    const { appointmentBookingEnabled }: any = stub.getCall(0).args[1]
    expect(appointmentBookingEnabled).toBe(false)
  })
})
