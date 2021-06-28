import { fake } from '../../../util/util.fake'
import { fakeAppointmentDetail, FakeAppointmentDetailOptions } from '../../../community-api/community-api.fake'
import * as faker from 'faker'
import { AppointmentListViewModel, RecentAppointments } from './schedule.types'

export const fakeAppointmentListViewModel = fake<AppointmentListViewModel, FakeAppointmentDetailOptions>(options => ({
  ...fakeAppointmentDetail({}, options),
  name: faker.company.bs(),
  link: faker.internet.url(),
}))

export const fakeRecentAppointments = fake<RecentAppointments>(() => ({
  past: [fakeAppointmentListViewModel({}, { when: 'past' })],
  recent: [fakeAppointmentListViewModel({}, { when: 'recent' })],
  future: [fakeAppointmentListViewModel({}, { when: 'future' })],
}))
