import 'reflect-metadata'
import { AppointmentWizardStep } from './AppointmentWizardViewModel'
import { fakeAppointmentBuilderDto } from './arrange-appointment.fake'
import { IS_INT, IS_NOT_EMPTY, IS_POSITIVE, IS_STRING, validate } from 'class-validator'
import { AppointmentBuilderDto } from './AppointmentBuilderDto'
import { flattenValidationErrors } from '../../util/flattenValidationErrors'
import { RequiredOptional } from './AppointmentTypeDto'
import { DateTime } from 'luxon'
import * as faker from 'faker'
import { plainToClass } from 'class-transformer'
import { DEFAULT_GROUP } from '../../util/mapping'
import { pick } from 'lodash'
import { IS_AFTER, IS_DATE_INPUT, IS_FUTURE_DATE, IS_FUTURE_TIME, IS_TIME } from '../../validators'

class Given {
  static dto(partial: DeepPartial<AppointmentBuilderDto>) {
    const subject = fakeAppointmentBuilderDto(partial)
    return new Given(subject)
  }

  private group?: AppointmentWizardStep
  private expectedConstraints: Record<string, string[]> = {}

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
    this.expectedConstraints = {}
    return this
  }

  async run() {
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
      requiresLocation: RequiredOptional.Required,
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
  })

  describe('full validation', () => {
    it('is valid', async () => Given.dto({}).whenValidating().shouldBeValid().run())

    it('is invalid from "type" group', async () =>
      Given.dto({ type: '' }).whenValidating().shouldTriggerConstraints('type', IS_NOT_EMPTY).run())

    it('is invalid from "where" group', async () =>
      Given.dto({ requiresLocation: RequiredOptional.Required, location: '' })
        .whenValidating()
        .shouldTriggerConstraints('location', IS_NOT_EMPTY)
        .run())
  })

  describe(`type group`, () => {
    it('is featured & valid', async () =>
      Given.dto({ type: 'code' }).whenValidating(AppointmentWizardStep.Type).shouldBeValid().run())

    it('is featured & empty', async () =>
      Given.dto({ type: '' })
        .whenValidating(AppointmentWizardStep.Type)
        .shouldTriggerConstraints('type', IS_NOT_EMPTY)
        .run())

    it('is featured & missing', async () =>
      Given.dto({ type: null })
        .whenValidating(AppointmentWizardStep.Type)
        .shouldTriggerConstraints('type', IS_STRING, IS_NOT_EMPTY)
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
      Given.dto({ requiresLocation: RequiredOptional.Required, location: 'code' })
        .whenValidating(AppointmentWizardStep.Where)
        .shouldBeValid()
        .run())

    it('is optional & provided', async () =>
      Given.dto({ requiresLocation: RequiredOptional.Optional, location: 'code' })
        .whenValidating(AppointmentWizardStep.Where)
        .shouldBeValid()
        .run())

    it('is optional & not provided', async () =>
      Given.dto({ requiresLocation: RequiredOptional.Optional, location: '' })
        .whenValidating(AppointmentWizardStep.Where)
        .shouldBeValid()
        .run())

    it('is not required & not provided', async () =>
      Given.dto({ requiresLocation: RequiredOptional.NotRequired, location: '' })
        .whenValidating(AppointmentWizardStep.Where)
        .whenValidating()
        .run())

    it('is required but not provided', async () =>
      Given.dto({ requiresLocation: RequiredOptional.Required, location: '' })
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
})
