import * as faker from 'faker'
import { AppointmentListViewModel, RecentAppointments } from './offender-view-model'
import { fake } from '../../util/util.fake'
import { fakeAppointmentDetail, FakeAppointmentDetailOptions } from '../../community-api/community-api.fake'
import { ActivityLogEntry } from './activity-log-entry'
import { DateTime } from 'luxon'
import { WellKnownContactTypeCategory } from '../../config'

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

export const fakeActivityLogEntry = fake<ActivityLogEntry, FakeAppointmentDetailOptions>(
  ({ when = 'past' }, { type = faker.random.arrayElement(Object.values(WellKnownContactTypeCategory)) }) => {
    const base = {
      id: faker.datatype.number(),
      start: DateTime.fromJSDate(faker.date[when]()),
      notes: faker.company.bs(),
      name: faker.company.bs(),
      tags: [],
      links: {
        view: faker.internet.url(),
        addNotes: faker.internet.url(),
        recordMissingAttendance: faker.internet.url(),
      },
    }

    switch (type) {
      case WellKnownContactTypeCategory.Appointment:
        return { ...base, type, end: base.start.plus({ hour: 1 }) }
      case WellKnownContactTypeCategory.Communication:
        return { ...base, type }
    }
  },
)
