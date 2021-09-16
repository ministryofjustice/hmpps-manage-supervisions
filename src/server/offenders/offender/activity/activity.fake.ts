import { fake, fakeEnum } from '../../../util/util.fake'
import * as faker from 'faker'
import { ContactTypeCategory } from '../../../config'
import { DateTime } from 'luxon'
import { ActivityLogEntry, ActivityLogEntryGroup } from './activity.types'
import { AppointmentRequirementDetail } from '../../../community-api/client'

export interface FakeActivityLogEntryOptions {
  when?: 'past' | 'recent' | 'soon' | 'future'
}

export const fakeActivityLogEntry = fake<ActivityLogEntry, FakeActivityLogEntryOptions>(
  ({ when = 'past' }, { type = fakeEnum(ContactTypeCategory) }) => {
    const base = {
      id: faker.datatype.number(),
      start: DateTime.fromJSDate(faker.date[when]()),
      isFuture: when === 'soon' || when === 'future',
      notes: faker.company.bs(),
      name: faker.company.bs(),
      tags: [],
      links: {
        view: faker.internet.url(),
        addNotes: faker.internet.url(),
        recordMissingAttendance: faker.internet.url(),
        updateOutcome: faker.internet.url(),
      },
      category: faker.company.bs(),
      typeName: faker.company.bs(),
      sensitive: faker.datatype.boolean(),
    }

    switch (type) {
      case ContactTypeCategory.Appointment:
        return {
          ...base,
          type,
          nationalStandard: faker.datatype.boolean(),
          end: base.start.plus({ hours: 1 }),
          rarActivity: faker.datatype.boolean(),
          requirement: {
            requirementId: faker.datatype.number(),
            isRar: true,
            isActive: true,
          } as AppointmentRequirementDetail,
        }
      case ContactTypeCategory.Other:
      case ContactTypeCategory.Communication:
        return {
          ...base,
          type,
          lastUpdatedDateTime: DateTime.fromJSDate(faker.date[when]()),
          lastUpdatedBy: faker.datatype.string(),
        }
    }
  },
)

export const fakeActivityLogEntryGroup = fake<ActivityLogEntryGroup>((options, partial = {}) => ({
  date: DateTime.fromJSDate(faker.date.past()),
  isToday: faker.datatype.boolean(),
  entries: partial.entries?.map(x => fakeActivityLogEntry(x)) || [fakeActivityLogEntry(), fakeActivityLogEntry()],
}))
