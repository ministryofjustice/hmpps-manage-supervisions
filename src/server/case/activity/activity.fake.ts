import { fake, fakeEnum } from '../../util/util.fake'
import * as faker from 'faker'
import { ContactTypeCategory } from '../../config'
import { DateTime } from 'luxon'
import { CaseActivityLogEntry, CaseActivityLogGroup } from './activity.types'
import { GovUkUiTagColour } from '../../util/govuk-ui'

export interface FakeCaseActivityLogEntryOptions {
  when?: 'past' | 'recent' | 'soon' | 'future'
}

export const fakeCaseActivityLogEntry = fake<CaseActivityLogEntry, FakeCaseActivityLogEntryOptions>(
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
          rarActivity: { name: faker.company.bs() },
          outcome: {
            complied: true,
            attended: true,
            description: faker.company.bs(),
            tag: { name: faker.company.bs(), colour: GovUkUiTagColour.Red },
            compliedAndAttendedText: faker.company.bs(),
          },
        }

      case ContactTypeCategory.Other:
        return {
          ...base,
          type,
          lastUpdatedDateTime: DateTime.fromJSDate(faker.date[when]()),
          lastUpdatedBy: faker.datatype.string(),
        }

      case ContactTypeCategory.Communication:
        return {
          ...base,
          type,
          lastUpdatedDateTime: DateTime.fromJSDate(faker.date[when]()),
          lastUpdatedBy: faker.datatype.string(),
          from: faker.name.findName(),
          to: faker.name.findName(),
        }

      case ContactTypeCategory.System:
        return { ...base, type }
    }
  },
)

export const fakeCaseActivityLogGroup = fake<CaseActivityLogGroup>((options, partial = {}) => ({
  date: DateTime.fromJSDate(faker.date.past()),
  isToday: faker.datatype.boolean(),
  entries: partial.entries?.map(x => fakeCaseActivityLogEntry(x)) || [
    fakeCaseActivityLogEntry(),
    fakeCaseActivityLogEntry(),
  ],
}))
