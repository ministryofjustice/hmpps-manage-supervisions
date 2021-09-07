import { fake } from '../../../util/util.fake'
import { fakeAppointmentDetail, FakeAppointmentDetailOptions } from '../../../community-api/community-api.fake'
import * as faker from 'faker'
import { AppointmentListViewModel, NextAppointmentSummary } from './schedule.types'
import { DateTime } from 'luxon'

export const fakeAppointmentListViewModel = fake<AppointmentListViewModel, FakeAppointmentDetailOptions>(options => {
  const date = DateTime.fromJSDate(faker.date.past()).set({ hour: 12 })
  return {
    ...fakeAppointmentDetail({}, options),
    name: faker.company.bs(),
    link: faker.internet.url(),
    start: date,
    end: date.plus({ hours: 1 }),
    today: false,
  }
})

export const fakeNextAppointmentSummary = fake<NextAppointmentSummary>(() => ({
  date: DateTime.fromJSDate(faker.date.future()),
  name: faker.company.bs(),
}))
