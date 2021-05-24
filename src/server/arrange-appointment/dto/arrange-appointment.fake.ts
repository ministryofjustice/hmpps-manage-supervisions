import * as faker from 'faker'
import { merge } from 'lodash'
import { AppointmentBuilderDto } from './AppointmentBuilderDto'
import { plainToClass } from 'class-transformer'
import { DateTime } from 'luxon'
import { TIME_FORMAT } from '../../validators'
import { DEFAULT_GROUP } from '../../util/mapping'
import { AppointmentTypeRequiresLocation } from '../../community-api/client'

export function fakeAppointmentBuilderDto(
  partial: DeepPartial<AppointmentBuilderDto> = {},
  groups: string[] = [DEFAULT_GROUP],
): AppointmentBuilderDto {
  const date = DateTime.fromJSDate(faker.date.future(), { locale: 'en-gb' }).set({ hour: 12 })
  return plainToClass(
    AppointmentBuilderDto,
    merge(
      {
        type: faker.datatype.uuid(),
        requiresLocation: AppointmentTypeRequiresLocation.Required,
        typeDescription: faker.company.bs(),
        location: faker.datatype.uuid(),
        date: { day: date.day, month: date.month, year: date.year },
        startTime: date.toFormat(TIME_FORMAT, { locale: 'en-gb' }),
        endTime: date.plus({ hour: 1 }).toFormat(TIME_FORMAT, { locale: 'en-gb' }),
        addNotes: true,
        notes: faker.lorem.sentences(3),
        sensitive: faker.datatype.boolean(),
      } as FlatDeepPartial<AppointmentBuilderDto>,
      partial,
    ),
    { groups },
  )
}
