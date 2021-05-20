import { ArrangeAppointmentPage } from '../../pages'
import { DateTime } from 'luxon'
import { Time, DateWithDayAndWithoutYear } from '../../../src/server/bootstrap/nunjucks/filters'
interface AppointmentBookingTestCase {
  start: DateTime
  end: DateTime
  crn: string
  sentenceId: number
  type: {
    code: string
    name: string
  }
  location?: {
    code: string
    name: string
  }
  sensitive: boolean
}

function testCase(partial: Omit<AppointmentBookingTestCase, 'start' | 'end'>) {
  const start = DateTime.now().plus({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 })
  const end = start.plus({ hour: 1 })
  return {
    ...partial,
    start,
    end,
  }
}

context('CreateAppointment', () => {
  const page = new ArrangeAppointmentPage()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  it('Unauthenticated user directed to login', () => {
    cy.arrangeAppointment('somecrn')
    cy.task('getLoginAttempts').should('have.length', 1)
  })

  it('can book an office visit appointment', () => {
    const test = testCase({
      crn: 'ABC123',
      sentenceId: 2500443138,
      type: { code: 'APAT', name: 'Office visit' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      sensitive: true,
    })

    havingOffender(test)
    havingLoggedInAndBeginBookingAppointmentFlow(test)

    whenSelectingTypeRadio(test.type.name)
    whenSubmittingCurrentStep()

    whenSelectingLocationRadio(test.location.name)
    whenSubmittingCurrentStep()

    whenEnteringAppointmentDateAndTimes(test)

    whenSelectingSensitive(test)

    shouldDisplayCorrectAppointmentSummary(test)

    whenSubmittingCurrentStep()
    shouldDisplayAppointmentBookingConfirmation(test)

    shouldHaveBookedAppointment(test)
  })

  it('can book an "other" appointment by searching', () => {
    const test = testCase({
      crn: 'ABC123',
      sentenceId: 2500443138,
      type: { code: 'C243', name: 'Alcohol Group Work Session (NS)' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      sensitive: false,
    })

    havingOffender(test)
    havingLoggedInAndBeginBookingAppointmentFlow(test)

    whenSelectingTypeRadio('Other')
    whenSelectingOtherAppointmentType('Alcohol', test)
    whenSubmittingCurrentStep()

    whenSelectingLocationRadio(test.location.name)
    whenSubmittingCurrentStep()

    whenEnteringAppointmentDateAndTimes(test)

    whenSelectingSensitive(test)

    shouldDisplayCorrectAppointmentSummary(test)

    whenSubmittingCurrentStep()
    shouldDisplayAppointmentBookingConfirmation(test)

    shouldHaveBookedAppointment(test)
  })

  it('validates appointment type', () => {
    const test = testCase({
      crn: 'ABC123',
      sentenceId: 2500443138,
      type: { code: 'APAT', name: 'Office visit' },
      sensitive: true,
    })

    havingOffender(test)
    havingLoggedInAndBeginBookingAppointmentFlow(test)

    // nothing selected
    whenSubmittingCurrentStep()
    shouldRenderTypeValidationMessages({
      type: 'Select an appointment type',
    })

    // select 'other' but do not select an 'other' type
    whenSelectingTypeRadio('Other')
    whenSubmittingCurrentStep()
    shouldRenderTypeValidationMessages({
      other: 'Select an appointment type',
    })
  })

  it('validates location', () => {
    const test = testCase({
      crn: 'ABC123',
      sentenceId: 2500443138,
      type: { code: 'APAT', name: 'Office visit' },
      sensitive: true,
    })

    havingOffender(test)
    havingLoggedInAndBeginBookingAppointmentFlow(test)

    whenSelectingTypeRadio(test.type.name)
    whenSubmittingCurrentStep()

    // nothing selected
    whenSubmittingCurrentStep()
    shouldRenderLocationValidationMessages('Select a location')
  })

  it('validates time and dates', () => {
    const test = testCase({
      crn: 'ABC123',
      sentenceId: 2500443138,
      type: { code: 'CHVS', name: 'Home visit' },
      sensitive: true,
    })

    havingOffender(test)
    havingLoggedInAndBeginBookingAppointmentFlow(test)

    whenSelectingTypeRadio(test.type.name)
    whenSubmittingCurrentStep()

    whenEnteringDateStrings('80', '20', '6')
    whenSubmittingCurrentStep()
    aDateErrorIsShown('Enter a valid date')
    aStartTimeErrorIsShown('Enter a valid time')
    aEndTimeErrorIsShown('Enter a valid time')

    whenEnteringDateStrings('15', '01', '2021')
    whenSubmittingCurrentStep()
    aDateErrorIsShown('Enter a date in the future')
    aStartTimeErrorIsShown('Enter a valid time')
    aEndTimeErrorIsShown('Enter a valid time')

    const now = DateTime.now()

    whenEnteringDate(now)
    whenEnteringStartTime(now)
    whenSubmittingCurrentStep()
    aStartTimeErrorIsShown('Enter a time in the future')

    whenEnteringEndTime(now.minus({ minutes: 1 }))
    whenSubmittingCurrentStep()
    aStartTimeErrorIsShown('Enter a time in the future')
    aEndTimeErrorIsShown('Enter an end time after the start time')
  })

  it('validates sensitive & sensitive help text', () => {
    const test = testCase({
      crn: 'ABC123',
      sentenceId: 2500443138,
      type: { code: 'APAT', name: 'Office visit' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      sensitive: true,
    })

    havingOffender(test)
    havingLoggedInAndBeginBookingAppointmentFlow(test)

    whenSelectingTypeRadio(test.type.name)
    whenSubmittingCurrentStep()

    whenSelectingLocationRadio(test.location.name)
    whenSubmittingCurrentStep()

    whenEnteringAppointmentDateAndTimes(test)

    page.sensitive.help.should('not.have.attr', 'open')
    page.sensitive.help.contains('Help with sensitive content').click()
    page.sensitive.help.should('have.attr', 'open')
    page.sensitive.helpText.contains('Marking information as sensitive means that')

    // nothing selected
    whenSubmittingCurrentStep()
    page.sensitive.errorMessages.sensitive.contains('Select yes if the appointment contains sensitive information')
  })

  function havingOffender({ crn, sentenceId }: AppointmentBookingTestCase) {
    cy.task('stubGetAppointmentTypes')
    cy.task('stubGetLocations')
    cy.task('stubCreateAppointment', { crn, sentenceId })
    cy.task('stubOffenderDetails', crn)
  }

  function havingLoggedInAndBeginBookingAppointmentFlow({ crn }: AppointmentBookingTestCase) {
    cy.login()
    cy.arrangeAppointment(crn)
  }

  function whenSubmittingCurrentStep() {
    page.continueButton.click()
  }

  function whenSelectingTypeRadio(name: string) {
    page.pageTitle.contains('What type of appointment are you arranging?')
    page.type.radio(name).click()
  }

  function whenSelectingOtherAppointmentType(search: string, { type }: AppointmentBookingTestCase) {
    page.type.otherAutoComplete.type(search)
    page.type.autoCompleteResult(type.name).click()
  }

  function whenSelectingLocationRadio(name: string) {
    page.pageTitle.contains('Where will the appointment be?')
    page.where.radio(name).click()
  }

  function whenEnteringAppointmentDateAndTimes({ start, end }: AppointmentBookingTestCase) {
    whenEnteringDate(start)
    whenEnteringStartTime(start)
    whenEnteringEndTime(end)
    page.continueButton.click()
  }

  function whenSelectingSensitive({ sensitive }: AppointmentBookingTestCase) {
    page.pageTitle.contains('Does this appointment include sensitive information?')
    page.sensitive.radio(sensitive).click()
    page.continueButton.click()
  }

  function shouldDisplayCorrectAppointmentSummary({ start, end, type, crn, sensitive }: AppointmentBookingTestCase) {
    page.pageTitle.contains('Check your answers')
    page.check.appointmentType.contains(type.name)
    page.check.appointmentTypeChangeLink.should('have.attr', 'href').and('include', `${crn}/type`)

    page.check.appointmentDate.contains(new DateWithDayAndWithoutYear().filter(start))
    page.check.appointmentDateChangeLink.should('have.attr', 'href').and('include', `${crn}/when`)

    page.check.appointmentTime.contains(`${new Time().filter(start)} to ${new Time().filter(end)}`)
    page.check.appointmentTimeChangeLink.should('have.attr', 'href').and('include', `${crn}/when`)

    page.check.sensitive.contains(sensitive ? 'Yes' : 'No')
    page.check.sensitiveChangeLink.should('have.attr', 'href').and('include', `${crn}/sensitive`)
  }

  function shouldDisplayAppointmentBookingConfirmation({ start, type }: AppointmentBookingTestCase) {
    page.pageTitle.contains('Appointment arranged')
    page.confirm.descriptionMessage.contains(type.name)
    page.confirm.timeMessage.contains(
      `${new DateWithDayAndWithoutYear().filter(start)} from ${new Time().filter(start)}`,
    )
    page.confirm.phoneMessage.contains('Beth')
    page.confirm.phoneMessage.contains('07734 111992')
  }

  function shouldHaveBookedAppointment({
    crn,
    sentenceId,
    start,
    end,
    type,
    location,
    sensitive,
  }: AppointmentBookingTestCase) {
    cy.task('getCreatedAppointments', { crn, sentenceId }).should('deep.eq', [
      {
        requirementId: 2500199144,
        contactType: type.code,
        appointmentStart: start.toISO(),
        appointmentEnd: end.toISO(),
        notes: 'some notes',
        providerCode: 'CRS',
        teamCode: 'CRSUAT',
        staffCode: 'CRSUATU',
        officeLocationCode: location?.code,
        sensitive,
      },
    ])
  }

  function shouldRenderTypeValidationMessages(expected: { type?: string; other?: string }) {
    for (const name of Object.keys(page.type.errorMessages)) {
      if (expected[name]) {
        page.type.errorMessages[name].contains(expected[name])
      } else {
        page.type.errorMessages[name].should('not.exist')
      }
    }
  }

  function shouldRenderLocationValidationMessages(expected: string) {
    page.where.errorMessages.location.contains(expected)
  }

  function whenEnteringDate(date: DateTime) {
    whenEnteringDateStrings(date.day.toString(), date.month.toString(), date.year.toString())
  }

  function whenEnteringDateStrings(day: string, month: string, year: string) {
    page.when.dayField.clear().type(day)
    page.when.monthField.clear().type(month)
    page.when.yearField.clear().type(year)
  }

  function whenEnteringStartTime(time: DateTime) {
    page.when.startTimeField.clear().type(time.toFormat('h:mma').toString()).type('{esc}')
  }

  function whenEnteringEndTime(time: DateTime) {
    page.when.endTimeField.clear().type(time.toFormat('h:mma').toString()).type('{esc}')
  }

  function aStartTimeErrorIsShown(message: string) {
    page.when.startTimeErrorMessage.contains(message)
  }

  function aEndTimeErrorIsShown(message: string) {
    page.when.endTimeErrorMessage.contains(message)
  }

  function aDateErrorIsShown(message: string) {
    page.when.dateErrorMessage.contains(message)
  }
})
