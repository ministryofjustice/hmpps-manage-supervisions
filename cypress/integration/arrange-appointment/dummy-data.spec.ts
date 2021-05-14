import { ArrangeAppointmentPage } from '../../pages'
import { DateTime } from 'luxon'

interface AppointmentBookingTestCase {
  start: DateTime
  end: DateTime
  crn: string
  sentenceId: number
  type: {
    code: string
    name: string
  }
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
    })

    havingOffender(test)
    havingLoggedInAndBeginBookingAppointmentFlow(test)

    whenSelectingTypeRadio(test.type.name)
    whenSubmittingCurrentStep()
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
    })

    havingOffender(test)
    havingLoggedInAndBeginBookingAppointmentFlow(test)

    whenSelectingTypeRadio('Other')
    whenSelectingOtherAppointmentType('Alcohol', test)
    whenSubmittingCurrentStep()
    shouldDisplayCorrectAppointmentSummary(test)

    whenSubmittingCurrentStep()
    shouldDisplayAppointmentBookingConfirmation(test)

    shouldHaveBookedAppointment(test)
  })

  it('renders validation errors', () => {
    const test = testCase({
      crn: 'ABC123',
      sentenceId: 2500443138,
      type: { code: 'APAT', name: 'Office visit' },
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

  function havingOffender({ crn, sentenceId }: AppointmentBookingTestCase) {
    cy.task('stubGetAppointmentTypes')
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

  function shouldDisplayCorrectAppointmentSummary({ start, end, type }: AppointmentBookingTestCase) {
    const expectedSummary = {
      'Type of appointment': type.name,
      Date: start.toFormat('cccc d MMMM'),
      Time: `${start.toFormat('h:mm a')} to ${end.toFormat('h:mm a')}`,
      'RAR activity': 'No',
      'Appointment notes': 'some notes',
    }
    page.pageTitle.contains('Check your answers')
    page.check.appointmentSummaryTable.should('deep.eq', expectedSummary)
  }

  function shouldDisplayAppointmentBookingConfirmation({ start, type }: AppointmentBookingTestCase) {
    page.pageTitle.contains('Appointment arranged')
    page.confirm.descriptionMessage.contains(type.name)
    page.confirm.timeMessage.contains(`${start.toFormat('cccc d MMMM')} from ${start.toFormat('h:mm a')}`)
    page.confirm.phoneMessage.contains('Beth')
    page.confirm.phoneMessage.contains('07734 111992')
  }

  function shouldHaveBookedAppointment({ crn, sentenceId, start, end, type }: AppointmentBookingTestCase) {
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
})
