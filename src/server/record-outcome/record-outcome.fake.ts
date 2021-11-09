import { RecordOutcomeDto } from './record-outcome.dto'
import { fake, fakeClass, fakeEnum } from '../util/util.fake'
import * as faker from 'faker'
import { fakeAvailableOutcomeTypes, fakeContactType } from '../community-api/community-api.fake'
import {
  ComplianceOption,
  RecordOutcomeAppointmentSummary,
  RecordOutcomeUnavailableReason,
} from './record-outcome.types'
import { DEFAULT_GROUP } from '../util/mapping'
import { DateTime } from 'luxon'

export const fakeRecordOutcomeAppointmentSummary = fake<RecordOutcomeAppointmentSummary>((options, partial = {}) => {
  const start = partial.start || DateTime.fromJSDate(faker.date.past()).startOf('day').set({ hour: 12 })
  return {
    id: faker.datatype.number(),
    start,
    end: start.plus({ hours: 1 }),
    name: faker.company.bs(),
  }
})

export const fakeRecordOutcomeDto = fakeClass(
  RecordOutcomeDto,
  (options, partial = {}) => {
    const availableOutcomeTypes = fakeAvailableOutcomeTypes(partial.availableOutcomeTypes)
    const outcome = faker.random.arrayElement(availableOutcomeTypes?.outcomeTypes || [null])
    const enforcement = faker.random.arrayElement(outcome?.enforcements || [null])
    const appointment = fakeRecordOutcomeAppointmentSummary(partial.appointment)
    return {
      appointment: {
        ...appointment,
        start: appointment.start.toISO(),
        end: appointment.end?.toISO(),
      },
      contactType: fakeContactType(partial.contactType),
      availableOutcomeTypes,
      unavailableReason: fakeEnum(RecordOutcomeUnavailableReason),
      compliance: fakeEnum(ComplianceOption),
      isRar: faker.datatype.boolean(),
      acceptableAbsence: faker.datatype.boolean(),
      outcome: outcome?.code,
      enforcement: enforcement?.code,
      addNotes: faker.datatype.boolean(),
      notes: faker.lorem.sentence(),
      sensitive: faker.datatype.boolean(),
    }
  },
  { groups: [DEFAULT_GROUP] },
)
