import { fake } from '../../../util/util.fake'
import { FakeAppointmentDetailOptions } from '../../../community-api/community-api.fake'
import * as faker from 'faker'
import { WellKnownContactTypeCategory } from '../../../config'
import { DateTime } from 'luxon'
import { ActivityLogEntry } from './activity.types'
import { AppointmentRequirementDetail } from '../../../community-api'

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
      category: faker.company.bs(),
      typeName: faker.company.bs(),
      sensitive: faker.datatype.boolean(),
    }

    switch (type) {
      case WellKnownContactTypeCategory.Appointment:
        return {
          ...base,
          type,
          end: base.start.plus({ hour: 1 }),
          rarActivity: faker.datatype.boolean(),
          requirement: {
            requirementId: faker.datatype.number(),
            isRar: true,
            isActive: true,
          } as AppointmentRequirementDetail,
        }
      case WellKnownContactTypeCategory.Communication:
        return { ...base, type }
    }
  },
)
