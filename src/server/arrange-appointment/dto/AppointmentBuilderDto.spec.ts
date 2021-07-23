import 'reflect-metadata'
import { AppointmentWizardStep } from './AppointmentWizardViewModel'
import { fakeAppointmentBuilderDto } from './arrange-appointment.fake'
import { IS_BOOLEAN, IS_IN, IS_INT, IS_NOT_EMPTY, IS_POSITIVE, IS_STRING, validate } from 'class-validator'
import { AppointmentBuilderDto } from './AppointmentBuilderDto'
import { flattenValidationErrors } from '../../util/flattenValidationErrors'
import { DateTime } from 'luxon'
import * as faker from 'faker'
import { plainToClass } from 'class-transformer'
import { DEFAULT_GROUP } from '../../util/mapping'
import { pick } from 'lodash'
import { IS_AFTER, IS_DATE_INPUT, IS_FUTURE_DATE, IS_FUTURE_TIME, IS_TIME } from '../../validators'
import { AppointmentTypeRequiresLocation } from '../../community-api/client'
import { WellKnownAppointmentType } from '../../config'

type Assertion = (subject: AppointmentBuilderDto) => void

class Given {
  static dto(partial: DeepPartial<AppointmentBuilderDto>) {
    const subject = fakeAppointmentBuilderDto(partial)
    return new Given(subject)
  }

  static exactly(partial: DeepPartial<AppointmentBuilderDto>) {
    const subject = new AppointmentBuilderDto()
    Object.assign(subject, partial)
    return new Given(subject)
  }

  private group?: AppointmentWizardStep
  private readonly expectedConstraints: Record<string, string[]> = {}
  private readonly assertions: Assertion[] = []

  constructor(private readonly subject: AppointmentBuilderDto) {}

  whenValidating(group?: AppointmentWizardStep) {
    this.group = group
    return this
  }

  shouldTriggerConstraints(field: string, ...constraints: string[]) {
    this.expectedConstraints[field] = constraints
    return this
  }

  shouldBeValid() {
    return this
  }

  shouldMap(assertion: Assertion) {
    this.assertions.push(assertion)
    return this
  }

  async run() {
    for (const assertion of this.assertions) {
      assertion(this.subject)
    }

    const errors = await validate(this.subject, { groups: this.group ? [this.group] : [] })
    if (Object.keys(this.expectedConstraints).length === 0) {
      expect(errors).toHaveLength(0)
    } else {
      const constraints = flattenValidationErrors(errors).reduce(
        (agg, x) => ({ ...agg, [x.path]: Object.keys(x.constraints) }),
        {},
      )
      expect(constraints).toEqual(this.expectedConstraints)
    }
  }
}

describe('AppointmentBuilderDto validation & mapping', () => {
  const future = DateTime.fromJSDate(faker.date.future(), { locale: 'en-gb' })
  const past = DateTime.fromJSDate(faker.date.past(), { locale: 'en-gb' })

  describe('mapping', () => {
    const plain: DeepPartial<AppointmentBuilderDto> = {
      type: 'other',
      otherType: 'some-type',
      requiresLocation: AppointmentTypeRequiresLocation.Required,
      location: 'some-office-location',
      date: { day: future.day, month: future.month, year: future.year },
      startTime: '12:00pm',
      endTime: '1:00pm',
      typeDescription: 'some type description',
    }

    it('mapping with default group', () => {
      const observed = plainToClass(AppointmentBuilderDto, plain, { groups: [DEFAULT_GROUP] })
      expect(observed).toEqual(plain)
    })

    it('mapping with "type" group', () => {
      const observed = plainToClass(AppointmentBuilderDto, plain, { groups: [AppointmentWizardStep.Type] })
      expect(observed).toEqual(pick(plain, ['type', 'otherType']))
    })

    it('mapping with "where" group', () => {
      const observed = plainToClass(AppointmentBuilderDto, plain, { groups: [AppointmentWizardStep.Where] })
      expect(observed).toEqual(pick(plain, ['location']))
    })

    it('mapping with "when" group', () => {
      const observed = plainToClass(AppointmentBuilderDto, plain, { groups: [AppointmentWizardStep.When] })
      expect(observed).toEqual(pick(plain, ['date', 'startTime', 'endTime']))
    })

    it('mapping with "sensitive" group', () => {
      const observed = plainToClass(AppointmentBuilderDto, plain, { groups: [AppointmentWizardStep.Sensitive] })
      expect(observed).toEqual(pick(plain, ['sensitive']))
    })
  })

  describe('full validation', () => {
    it('is valid', async () => Given.dto({}).whenValidating().shouldBeValid().run())

    it('is invalid from "type" group', async () =>
      Given.dto({ type: '' as WellKnownAppointmentType })
        .whenValidating()
        .shouldTriggerConstraints('type', IS_NOT_EMPTY, IS_IN)
        .run())

    it('is invalid from "where" group', async () =>
      Given.dto({ requiresLocation: AppointmentTypeRequiresLocation.Required, location: '' })
        .whenValidating()
        .shouldTriggerConstraints('location', IS_NOT_EMPTY)
        .run())
  })

  describe(`type group`, () => {
    it('is featured & valid', async () =>
      Given.dto({ type: WellKnownAppointmentType.OfficeVisit })
        .whenValidating(AppointmentWizardStep.Type)
        .shouldBeValid()
        .run())

    it('is featured but not well known type', async () =>
      Given.dto({ type: 'not-a-well-known-type' as WellKnownAppointmentType })
        .whenValidating(AppointmentWizardStep.Type)
        .shouldTriggerConstraints('type', IS_IN)
        .run())

    it('is featured & empty', async () =>
      Given.dto({ type: '' as WellKnownAppointmentType })
        .whenValidating(AppointmentWizardStep.Type)
        .shouldTriggerConstraints('type', IS_NOT_EMPTY, IS_IN)
        .run())

    it('is featured & missing', async () =>
      Given.dto({ type: null })
        .whenValidating(AppointmentWizardStep.Type)
        .shouldTriggerConstraints('type', IS_STRING, IS_NOT_EMPTY, IS_IN)
        .run())

    it('is other & valid', async () =>
      Given.dto({ type: 'other', otherType: 'code' }).whenValidating(AppointmentWizardStep.Type).shouldBeValid().run())

    it('is other & empty', async () =>
      Given.dto({ type: 'other', otherType: '' })
        .whenValidating(AppointmentWizardStep.Type)
        .shouldTriggerConstraints('otherType', IS_NOT_EMPTY)
        .run())

    it('is other & missing', async () =>
      Given.dto({ type: 'other', otherType: null })
        .whenValidating(AppointmentWizardStep.Type)
        .shouldTriggerConstraints('otherType', IS_STRING, IS_NOT_EMPTY)
        .run())
  })

  describe('where group', () => {
    it('is required & provided', async () =>
      Given.dto({ requiresLocation: AppointmentTypeRequiresLocation.Required, location: 'code' })
        .whenValidating(AppointmentWizardStep.Where)
        .shouldBeValid()
        .run())

    it('is optional & provided', async () =>
      Given.dto({ requiresLocation: AppointmentTypeRequiresLocation.Optional, location: 'code' })
        .whenValidating(AppointmentWizardStep.Where)
        .shouldBeValid()
        .run())

    it('is optional & not provided', async () =>
      Given.dto({ requiresLocation: AppointmentTypeRequiresLocation.Optional, location: '' })
        .whenValidating(AppointmentWizardStep.Where)
        .shouldBeValid()
        .run())

    it('is not required & not provided', async () =>
      Given.dto({ requiresLocation: AppointmentTypeRequiresLocation.NotRequired, location: '' })
        .whenValidating(AppointmentWizardStep.Where)
        .whenValidating()
        .run())

    it('is required but not provided', async () =>
      Given.dto({ requiresLocation: AppointmentTypeRequiresLocation.Required, location: '' })
        .whenValidating(AppointmentWizardStep.Where)
        .shouldTriggerConstraints('location', IS_NOT_EMPTY)
        .run())
  })

  describe('when group', () => {
    it('is valid', async () =>
      Given.dto({
        date: { day: future.day, month: future.month, year: future.year },
        startTime: '12:00pm',
        endTime: '1:00pm',
      })
        .whenValidating(AppointmentWizardStep.When)
        .shouldBeValid()
        .run())

    it('is all missing', async () =>
      Given.dto({
        date: { day: '', month: '', year: '' } as any,
        startTime: '',
        endTime: '',
      })
        .whenValidating(AppointmentWizardStep.When)
        .shouldTriggerConstraints('date', IS_DATE_INPUT)
        .shouldTriggerConstraints('date.day', IS_POSITIVE)
        .shouldTriggerConstraints('date.month', IS_POSITIVE)
        .shouldTriggerConstraints('date.year', IS_POSITIVE)
        .shouldTriggerConstraints('startTime', IS_TIME)
        .shouldTriggerConstraints('endTime', IS_TIME)
        .run())

    it('is all invalid data types', async () =>
      Given.dto({
        date: { day: 'not a number', month: 'not a number', year: 'not a number' } as any,
        startTime: 'not a time',
        endTime: 'not a time',
      })
        .whenValidating(AppointmentWizardStep.When)
        .shouldTriggerConstraints('date', IS_DATE_INPUT)
        .shouldTriggerConstraints('date.day', IS_INT, IS_POSITIVE)
        .shouldTriggerConstraints('date.month', IS_INT, IS_POSITIVE)
        .shouldTriggerConstraints('date.year', IS_INT, IS_POSITIVE)
        .shouldTriggerConstraints('startTime', IS_TIME)
        .shouldTriggerConstraints('endTime', IS_TIME)
        .run())

    it('is invalid date', async () =>
      Given.dto({
        date: { day: 32, month: future.month, year: future.year },
        startTime: '12:00pm',
        endTime: '1:00pm',
      })
        .whenValidating(AppointmentWizardStep.When)
        .shouldTriggerConstraints('date', IS_DATE_INPUT)
        .run())

    it('is in past', async () =>
      Given.dto({
        date: { day: past.day, month: past.month, year: past.year },
        startTime: '12:00pm',
        endTime: '1:00pm',
      })
        .whenValidating(AppointmentWizardStep.When)
        .shouldTriggerConstraints('date', IS_FUTURE_DATE)
        .shouldTriggerConstraints('startTime', IS_FUTURE_TIME)
        .run())

    it('is not valid time range', async () =>
      Given.dto({
        date: { day: future.day, month: future.month, year: future.year },
        startTime: '1:00pm',
        endTime: '12:00pm',
      })
        .whenValidating(AppointmentWizardStep.When)
        .shouldTriggerConstraints('endTime', IS_AFTER)
        .run())
  })

  describe('sensitive group', () => {
    it('is valid', async () =>
      Given.dto({ sensitive: true }).whenValidating(AppointmentWizardStep.Sensitive).shouldBeValid().run())

    it('is valid string', async () =>
      Given.dto({ sensitive: 'false' as any })
        .whenValidating(AppointmentWizardStep.Sensitive)
        .shouldMap(x => expect(x.sensitive).toBe(false))
        .shouldBeValid()
        .run())

    it('is invalid string', async () =>
      Given.dto({ sensitive: 'not-a-boolean' as any })
        .whenValidating(AppointmentWizardStep.Sensitive)
        .shouldTriggerConstraints('sensitive', IS_BOOLEAN)
        .run())

    it('is missing', async () =>
      Given.exactly({})
        .whenValidating(AppointmentWizardStep.Sensitive)
        .shouldTriggerConstraints('sensitive', IS_BOOLEAN)
        .run())
  })
})
