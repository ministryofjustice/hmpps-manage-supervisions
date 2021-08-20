import { fake } from '../../../util/util.fake'
import { fakeAppointmentDetail, FakeAppointmentDetailOptions } from '../../../community-api/community-api.fake'
import * as faker from 'faker'
import { AppointmentListViewModel, NextAppointmentSummary, RecentAppointments } from './schedule.types'
import { DateTime } from 'luxon'

export const fakeAppointmentListViewModel = fake<AppointmentListViewModel, FakeAppointmentDetailOptions>(options => {
  const date = DateTime.fromJSDate(faker.date.past()).set({ hour: 12 })
  return {
    ...fakeAppointmentDetail({}, options),
    name: faker.company.bs(),
    link: faker.internet.url(),
    start: date,
    end: date.plus({ hours: 1 }),
  }
})

export const fakeRecentAppointments = fake<RecentAppointments>(() => ({
  past: [fakeAppointmentListViewModel({}, { when: 'past' })],
  recent: [fakeAppointmentListViewModel({}, { when: 'recent' })],
  future: [fakeAppointmentListViewModel({}, { when: 'future' })],
}))

export const fakeNextAppointmentSummary = fake<NextAppointmentSummary>(() => ({
  date: DateTime.fromJSDate(faker.date.future()),
  name: faker.company.bs(),
}))
