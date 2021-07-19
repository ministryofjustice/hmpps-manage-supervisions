import { ArrangeAppointmentPage } from '../../pages'
import { DateTime } from 'luxon'
import { getDateRange } from '../../util/getDateRange'
interface AppointmentBookingTestCase {
  start: DateTime
  end: DateTime
  crn: string
  convictionId: number
  type: {
    code: string
    name: string
  }
  location?: {
    code: string
    name: string
  }
  addNotes?: boolean
  notes?: string
  sensitive: boolean
}

function testCase(partial: Omit<AppointmentBookingTestCase, 'start' | 'end'>) {
  const { start, end } = getDateRange('future')
  return {
    ...partial,
    start: DateTime.fromISO(start),
    end: DateTime.fromISO(end),
  }
}

context('CreateAppointment', () => {
  const page = new ArrangeAppointmentPage()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  it('can book an office visit appointment', () => {
    const test = testCase({
      crn: 'ABC123',
      convictionId: 2500445193,
      type: { code: 'APAT', name: 'Office visit' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      addNotes: true,
      notes: 'These are some notes',
      sensitive: true,
    })

    havingOffender(test)
    havingLoggedInAndBeginBookingAppointmentFlow(test)

    whenSelectingTypeRadio(test.type.name)
    whenSubmittingCurrentStep()

    whenSelectingLocationRadio(test.location.name)
    whenSubmittingCurrentStep()

    whenEnteringAppointmentDateAndTimes(test)

    whenAskingToEnterNotes(test)
    whenEnteringNotes(test)

    whenSelectingSensitive(test)

    shouldDisplayCorrectAppointmentSummary(test)

    whenSubmittingCurrentStep()
    shouldDisplayAppointmentBookingConfirmation(test)

    shouldHaveBookedAppointment(test)
  })

  it('can book an "other" appointment by searching', () => {
    const test = testCase({
      crn: 'ABC123',
      convictionId: 2500445193,
      type: { code: 'C243', name: 'Alcohol Group Work Session (NS)' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      sensitive: false,
      addNotes: true,
      notes: 'These are some notes',
    })

    havingOffender(test)
    havingLoggedInAndBeginBookingAppointmentFlow(test)

    whenSelectingTypeRadio('Other')
    whenSelectingOtherAppointmentType('Alcohol', test)
    whenSubmittingCurrentStep()

    whenSelectingLocationRadio(test.location.name)
    whenSubmittingCurrentStep()

    whenEnteringAppointmentDateAndTimes(test)

    whenAskingToEnterNotes(test)
    whenEnteringNotes(test)

    whenSelectingSensitive(test)

    shouldDisplayCorrectAppointmentSummary(test)

    whenSubmittingCurrentStep()
    shouldDisplayAppointmentBookingConfirmation(test)

    shouldHaveBookedAppointment(test)
  })

  it('validates appointment type', () => {
    const test = testCase({
      crn: 'ABC123',
      convictionId: 2500445193,
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
      convictionId: 2500445193,
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
      convictionId: 2500445193,
      type: { code: 'CHVS', name: 'Home visit' },
      sensitive: true,
    })

    havingOffender(test)
    havingLoggedInAndBeginBookingAppointmentFlow(test)

    whenSelectingTypeRadio(test.type.name)
    whenSubmittingCurrentStep()

    offendersCircumstancesAreShown()

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

  it('validates selecting to add notes', () => {
    const test = testCase({
      crn: 'ABC123',
      convictionId: 2500445193,
      type: { code: 'APAT', name: 'Office visit' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      notes: 'Some note text',
      sensitive: true,
    })

    havingOffender(test)
    havingLoggedInAndBeginBookingAppointmentFlow(test)

    whenSelectingTypeRadio(test.type.name)
    whenSubmittingCurrentStep()

    whenSelectingLocationRadio(test.location.name)
    whenSubmittingCurrentStep()

    whenEnteringAppointmentDateAndTimes(test)

    page.pageTitle.contains('Would you like to add notes about this appointment?')

    // nothing selected
    whenSubmittingCurrentStep()
    page.addNotes.errorMessages.addNotes.contains('Select yes if you would like to add notes')

    // no skips to sensitive page
    whenAskingToEnterNotes({ ...test, addNotes: false })
    page.pageTitle.contains('Does this appointment include sensitive information?')
    page.backLink.click()

    // yes goes to notes entry page
    whenAskingToEnterNotes({ ...test, addNotes: true })
    whenEnteringNotes(test)
  })

  it('validates sensitive & sensitive help text', () => {
    const test = testCase({
      crn: 'ABC123',
      convictionId: 2500445193,
      type: { code: 'APAT', name: 'Office visit' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      addNotes: true,
      notes: 'Some note text',
      sensitive: true,
    })

    havingOffender(test)
    havingLoggedInAndBeginBookingAppointmentFlow(test)

    whenSelectingTypeRadio(test.type.name)
    whenSubmittingCurrentStep()

    whenSelectingLocationRadio(test.location.name)
    whenSubmittingCurrentStep()

    whenEnteringAppointmentDateAndTimes(test)

    whenAskingToEnterNotes(test)
    whenEnteringNotes(test)

    page.sensitive.help.should('not.have.attr', 'open')
    page.sensitive.help.contains('Help with sensitive content').click()
    page.sensitive.help.should('have.attr', 'open')
    page.sensitive.helpText.contains('Marking information as sensitive means that')

    // nothing selected
    whenSubmittingCurrentStep()
    page.sensitive.errorMessages.sensitive.contains('Select yes if the appointment contains sensitive information')
  })

  function havingOffender({ crn, convictionId }: AppointmentBookingTestCase) {
    cy.task('stubGetStaffDetails')
    cy.task('stubGetAppointmentTypes')
    cy.task('stubGetLocations')
    cy.task('stubCreateAppointment', { crn, convictionId })
    cy.task('stubOffenderDetails', { crn })
    cy.task('stubGetConvictions', { crn, convictionId })
    cy.task('stubGetRequirements', { crn, convictionId })
    cy.task('stubGetPersonalCircumstances', { crn })
  }

  function havingLoggedInAndBeginBookingAppointmentFlow({ crn }: AppointmentBookingTestCase) {
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

  function whenAskingToEnterNotes({ addNotes }: AppointmentBookingTestCase) {
    page.pageTitle.contains('Would you like to add notes about this appointment?')
    addNotes ? page.addNotes.yesField.click() : page.addNotes.noField.click()
    page.continueButton.click()
  }

  function whenEnteringNotes({ notes }: AppointmentBookingTestCase) {
    page.pageTitle.contains('Add appointment notes')
    page.notes.notesField.type(notes)
    page.continueButton.click()
  }

  function whenSelectingSensitive({ sensitive }: AppointmentBookingTestCase) {
    page.pageTitle.contains('Does this appointment include sensitive information?')
    page.sensitive.radio(sensitive).click()
    page.continueButton.click()
  }

  function shouldDisplayCorrectAppointmentSummary({
    start,
    end,
    type,
    crn,
    notes,
    sensitive,
  }: AppointmentBookingTestCase) {
    page.pageTitle.contains('Check your answers')
    page.check.appointmentType.contains(type.name)
    page.check.appointmentTypeChangeLink.should('have.attr', 'href').and('include', `${crn}/type`)

    page.check.appointmentDate.contains(longDate(start))
    page.check.appointmentDateChangeLink.should('have.attr', 'href').and('include', `${crn}/when`)

    page.check.appointmentTime.contains(`${time(start)} to ${time(end)}`)
    page.check.appointmentTimeChangeLink.should('have.attr', 'href').and('include', `${crn}/when`)

    page.check.notes.contains(notes)
    page.check.notesChangeLink.should('have.attr', 'href').and('include', `${crn}/notes`)

    page.check.sensitive.contains(sensitive ? 'Yes' : 'No')
    page.check.sensitiveChangeLink.should('have.attr', 'href').and('include', `${crn}/sensitive`)
  }

  function longDate(date: DateTime) {
    const format = date.year === DateTime.now().year ? 'cccc d MMMM' : 'cccc d MMMM yyyy'
    return date.toFormat(format)
  }

  function time(date: DateTime) {
    const hourMinuteFormat = date.minute === 0 ? 'ha' : 'h:mma'
    return date.toFormat(hourMinuteFormat).toLowerCase()
  }

  function shouldDisplayAppointmentBookingConfirmation({ start, type, crn }: AppointmentBookingTestCase) {
    page.pageTitle.contains('Appointment arranged')
    page.confirm.descriptionMessage.contains(type.name)
    page.confirm.timeMessage.contains(`${longDate(start)} from ${time(start)}`)
    page.confirm.phoneMessage.contains('Brian')
    page.confirm.phoneMessage.contains('07734 111992')
    page.confirm.finishButton.should('have.attr', 'href').and('include', `offender/${crn}/overview`)
  }

  function shouldHaveBookedAppointment({
    crn,
    convictionId,
    start,
    end,
    type,
    location,
    notes,
    sensitive,
  }: AppointmentBookingTestCase) {
    cy.task('getCreatedAppointments', { crn, convictionId }).should('deep.eq', [
      {
        providerCode: 'N07',
        requirementId: 2500199144,
        staffCode: 'CRSSTAFF1',
        teamCode: 'N07UAT',
        appointmentStart: start.toISO(),
        appointmentEnd: end.toISO(),
        contactType: type.code,
        officeLocationCode: location?.code,
        notes,
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

  function offendersCircumstancesAreShown() {
    page.when.circumstancesDetailLink.click()
    page.when.preferredLaguageText.contains('Bengali')
    page.when.disabilitiesText.contains('Learning Difficulties')
    page.when.employmentText.contains('Temporary/casual work (30 or more hours per week)')
  }
})
