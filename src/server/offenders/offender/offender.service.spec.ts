import { Test } from '@nestjs/testing'
import { orderBy } from 'lodash'
import { MAX_RECENT_APPOINTMENTS, OffenderService } from './offender.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../../community-api/community-api.mock'
import { AppointmentDetail, CommunityApiService } from '../../community-api'
import { fakeAppointmentDetail, fakeOffenderDetail } from '../../community-api/community-api.fake'
import { fakeOkResponse } from '../../common/rest/rest.fake'
import { RecentAppointments } from './offender-view-model'

describe('OffenderService', () => {
  let service: OffenderService
  let community: MockCommunityApiService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OffenderService],
      imports: [MockCommunityApiModule.register()],
    }).compile()

    service = module.get(OffenderService)
    community = module.get(CommunityApiService)
  })

  it('gets offender detail', async () => {
    const offender = fakeOffenderDetail()
    const stub = community.offender.getOffenderDetailByCrnUsingGET.resolves(fakeOkResponse(offender))
    const observed = await service.getOffenderDetail('some-crn')
    expect(observed).toBe(offender)
    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn' })
  })

  it('gets offender appointments', async () => {
    const partial: DeepPartial<AppointmentDetail> = {
      appointmentId: 12345,
      type: { description: 'some-appointment-type' },
      staff: { forenames: 'some-first-name', surname: 'some-last-name' },
    }
    const appointments = orderBy(
      [
        fakeAppointmentDetail(partial, { when: 'future' }),
        ...[...Array(MAX_RECENT_APPOINTMENTS)].map(() => fakeAppointmentDetail(partial, { when: 'recent' })),
        fakeAppointmentDetail(partial, { when: 'past' }),
      ],
      'appointmentStart',
      'desc',
    )
    const expected = appointments.map(x => ({
      ...x,
      name: 'some-appointment-type with some-first-name some-last-name',
      href: '/offender/some-crn/appointment/12345',
    }))
    const stub = community.appointment.getOffenderAppointmentsByCrnUsingGET.resolves(fakeOkResponse(appointments))
    const observed = await service.getRecentAppointments('some-crn')
    expect(observed).toEqual({
      future: expected.slice(0, 1),
      recent: expected.slice(1, MAX_RECENT_APPOINTMENTS + 1),
      past: expected.slice(MAX_RECENT_APPOINTMENTS + 1),
    } as RecentAppointments)
    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn' })
  })
})
