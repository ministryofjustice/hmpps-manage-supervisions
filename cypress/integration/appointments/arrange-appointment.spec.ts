import { ArrangeAppointmentPage } from '../../pages'
import { DateTime } from 'luxon'
import { getDateRange } from '../../util/getDateRange'
import { CRN } from '../../plugins/offender'
import { AppointmentCreateRequest } from '../../../src/server/community-api/client'
interface AppointmentBookingTestCase {
  start: DateTime
  end: DateTime
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

context('Arrange appointment happy path & validation', () => {
  const page = new ArrangeAppointmentPage()

  before(() => {
    cy.seed()
  })

  it('can book an office visit appointment', () => {
    const test = testCase({
      type: { code: 'COAP', name: 'Office visit' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      addNotes: true,
      notes: 'These are some notes',
      sensitive: true,
    })

    cy.arrangeAppointment()

    shouldBeAccessible()

    whenSelectingTypeRadio(test.type.name)
    whenSubmittingCurrentStep()

    shouldBeAccessible()

    whenSelectingIsRar(false)
    whenSubmittingCurrentStep()

    shouldBeAccessible()

    whenSelectingLocationRadio(test.location.name)
    whenSubmittingCurrentStep()

    shouldBeAccessible()

    whenEnteringAppointmentDateAndTimes(test)

    shouldBeAccessible()

    whenAskingToEnterNotes(test)
    whenEnteringNotes(test)

    whenSelectingSensitive(test)

    shouldBeAccessible()

    shouldDisplayCorrectAppointmentSummary(test)

    whenSubmittingCurrentStep()
    shouldDisplayAppointmentBookingConfirmation(test)

    shouldHaveBookedAppointment(test)

    shouldBeAccessible()
  })

  it('can book an "other" appointment by searching', () => {
    const test = testCase({
      type: { code: 'C243', name: 'Alcohol Group Work Session (NS)' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      sensitive: false,
      addNotes: true,
      notes: 'These are some notes',
    })

    cy.arrangeAppointment()

    whenSelectingTypeRadio('Other')
    whenSelectingOtherAppointmentType('Alcohol', test)
    whenSubmittingCurrentStep()

    whenSelectingIsRar(false)
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
    cy.arrangeAppointment()

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

    shouldBeAccessible()
  })

  it('validates location', () => {
    const test = testCase({
      type: { code: 'APAT', name: 'Office visit' },
      sensitive: true,
    })

    cy.arrangeAppointment()

    whenSelectingTypeRadio(test.type.name)
    whenSubmittingCurrentStep()

    whenSelectingIsRar(false)
    whenSubmittingCurrentStep()

    // nothing selected
    whenSubmittingCurrentStep()
    shouldRenderLocationValidationMessages('Select a location')

    shouldBeAccessible()
  })

  it('redirects to unavailable when unavailable location selected', () => {
    cy.arrangeAppointment()

    whenSelectingTypeRadio('Office visit')
    whenSubmittingCurrentStep()

    whenSelectingIsRar(false)
    whenSubmittingCurrentStep()

    whenSelectingLocationRadio('The location I’m looking for is not in this list')
    whenSubmittingCurrentStep()
    shouldRedirectToLocationUnavailablePage()

    shouldBeAccessible()
  })

  it('validates rar options and redirects to unavailable when rar selected', () => {
    cy.arrangeAppointment()

    whenSelectingTypeRadio('Office visit')
    whenSubmittingCurrentStep()

    whenSubmittingCurrentStep()
    page.rar.errorMessages.isRar.contains('Select yes if this appointment will count towards RAR')

    whenSelectingIsRar(true)
    whenSubmittingCurrentStep()

    shouldRedirectToRarUnavailablePage()

    shouldBeAccessible()
  })

  it('validates time and dates', () => {
    const test = testCase({
      type: { code: 'CHVS', name: 'Home visit' },
      sensitive: true,
    })

    cy.arrangeAppointment()

    whenSelectingTypeRadio(test.type.name)
    whenSubmittingCurrentStep()

    whenSelectingIsRar(false)
    whenSubmittingCurrentStep()

    offendersCircumstancesAreShown()

    whenEnteringDateStrings('80', '20', '6')
    whenSubmittingCurrentStep()
    aDateErrorIsShown('Enter a valid date')
    aStartTimeErrorIsShown('Enter a valid start time')
    aEndTimeErrorIsShown('Enter a valid end time')

    whenEnteringDateStrings('15', '01', '2021')
    whenSubmittingCurrentStep()
    aDateErrorIsShown('Enter a date in the future')
    aStartTimeErrorIsShown('Enter a valid start time')
    aEndTimeErrorIsShown('Enter a valid end time')

    const now = DateTime.now()

    whenEnteringDate(now)
    whenEnteringStartTime(now)
    whenSubmittingCurrentStep()
    aStartTimeErrorIsShown('Enter a time in the future')

    whenEnteringEndTime(now.minus({ minutes: 1 }))
    whenSubmittingCurrentStep()
    aStartTimeErrorIsShown('Enter a time in the future')
    aEndTimeErrorIsShown('Enter an end time after the start time')

    shouldBeAccessible()
  })

  it('validates selecting to add notes', () => {
    const test = testCase({
      type: { code: 'APAT', name: 'Office visit' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      notes: 'Some note text',
      sensitive: true,
    })

    cy.arrangeAppointment()

    whenSelectingTypeRadio(test.type.name)
    whenSubmittingCurrentStep()

    whenSelectingIsRar(false)
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

    shouldBeAccessible()
  })

  it('validates sensitive & sensitive help text', () => {
    const test = testCase({
      type: { code: 'APAT', name: 'Office visit' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      addNotes: true,
      notes: 'Some note text',
      sensitive: true,
    })

    cy.arrangeAppointment()

    whenSelectingTypeRadio(test.type.name)
    whenSubmittingCurrentStep()

    whenSelectingIsRar(false)
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

    shouldBeAccessible()
  })

  function whenSubmittingCurrentStep() {
    page.continueButton.click()
  }

  function whenSelectingTypeRadio(name: string) {
    page.pageTitle.contains('What type of appointment are you arranging?')
    page.type.radio(name).click()
  }

  function whenSelectingIsRar(value: boolean) {
    page.pageTitle.contains('Will this be a RAR toolkit session?')
    if (value) {
      page.rar.yes.click()
    } else {
      page.rar.no.click()
    }
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
    notes,
    sensitive,
    location: { name: locationDescription },
  }: AppointmentBookingTestCase) {
    const crn = CRN
    page.pageTitle.contains('Check your answers')
    page.check.appointmentType.contains(type.name)
    page.check.appointmentTypeChangeLink.should('have.attr', 'href').and('include', `${crn}/arrange-appointment/type`)

    page.check.appointmentLocation.contains(locationDescription)
    page.check.appointmentLocationChangeLink
      .should('have.attr', 'href')
      .and('include', `${crn}/arrange-appointment/where`)

    page.check.appointmentDate.contains(longDate(start))
    page.check.appointmentDateChangeLink.should('have.attr', 'href').and('include', `${crn}/arrange-appointment/when`)

    page.check.appointmentTime.contains(`${time(start)} to ${time(end)}`)
    page.check.appointmentTimeChangeLink.should('have.attr', 'href').and('include', `${crn}/arrange-appointment/when`)

    page.check.notes.contains(notes)
    page.check.notesChangeLink.should('have.attr', 'href').and('include', `${crn}/arrange-appointment/notes`)

    page.check.sensitive.contains(sensitive ? 'Yes' : 'No')
    page.check.sensitiveChangeLink.should('have.attr', 'href').and('include', `${crn}/arrange-appointment/sensitive`)
  }

  function longDate(date: DateTime) {
    const format = date.year === DateTime.now().year ? 'cccc d MMMM' : 'cccc d MMMM yyyy'
    return date.toFormat(format)
  }

  function time(date: DateTime) {
    const hourMinuteFormat = date.minute === 0 ? 'ha' : 'h:mma'
    return date.toFormat(hourMinuteFormat).toLowerCase()
  }

  function shouldDisplayAppointmentBookingConfirmation({ start, type }: AppointmentBookingTestCase) {
    page.pageTitle.contains('Appointment arranged')
    page.confirm.descriptionMessage.contains(type.name)
    page.confirm.timeMessage.contains(`${longDate(start)} from ${time(start)}`)
    page.confirm.phoneMessage.contains('Liz')
    page.confirm.phoneMessage.contains('07734 111992')
    page.confirm.finishButton.should('have.attr', 'href').and('include', `case/${CRN}/overview`)
  }

  function shouldHaveBookedAppointment({ start, end, type, location, notes, sensitive }: AppointmentBookingTestCase) {
    cy.task<AppointmentCreateRequest[]>('getCreatedAppointments')
      .then(apts => apts.find(a => a.contactType === type.code))
      .should('deep.eq', {
        providerCode: 'N07',
        staffCode: 'CRSSTAFF1',
        teamCode: 'N07UAT',
        appointmentStart: start.toISO(),
        appointmentEnd: end.toISO(),
        contactType: type.code,
        officeLocationCode: location?.code,
        notes,
        sensitive,
      })
  }

  function shouldRenderTypeValidationMessages(expected: { type?: string; other?: string }) {
    page.documentTitle.contains('Error')
    page.errorSummary.contains('There is a problem')
    for (const name of Object.keys(page.type.errorMessages)) {
      if (expected[name]) {
        page.type.errorMessages[name].contains(expected[name])
      } else {
        page.type.errorMessages[name].should('not.exist')
      }
    }
  }

  function shouldRenderLocationValidationMessages(expected: string) {
    page.documentTitle.contains('Error')
    page.errorSummary.contains('There is a problem')
    page.where.errorMessages.location.contains(expected)
  }

  function shouldRedirectToLocationUnavailablePage() {
    page.pageTitle.contains('Arrange an appointment in another location')
    page.documentTitle.contains('Arrange an appointment in another location')
  }

  function shouldRedirectToRarUnavailablePage() {
    page.pageTitle.contains('You need to arrange this appointment on National Delius')
    page.documentTitle.contains('You need to arrange this appointment on National Delius')
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

  function shouldBeAccessible() {
    cy.testA11y()
  }
})
