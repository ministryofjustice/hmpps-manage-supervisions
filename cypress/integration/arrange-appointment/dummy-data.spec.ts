import { ArrangeAppointmentPage } from '../../pages'
import { DateTime } from 'luxon'

context('CreateAppointment', () => {
  const page = new ArrangeAppointmentPage()

  // TODO this will be built up in the form builder, no dynamic date, so we can probably use a json fixture?
  const expectedStart = DateTime.now().plus({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 })
  const expectedEnd = expectedStart.plus({ hour: 1 })

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
    const crn = 'ABC123'
    const sentenceId = 2500443138

    havingOffender(crn, sentenceId)
    havingLoggedInAndBeginBookingAppointmentFlow(crn)

    whenSelectingFeaturedAppointmentType('APAT')
    shouldDisplayCorrectAppointmentSummary('Office visit')

    whenBookingAppointment()
    shouldDisplayAppointmentBookingConfirmation('Office visit')

    shouldHaveBookedAppointment(crn, sentenceId, 'APAT')
  })

  it('can book an "other" appointment by searching', () => {
    const crn = 'ABC123'
    const sentenceId = 2500443138

    havingOffender(crn, sentenceId)
    havingLoggedInAndBeginBookingAppointmentFlow(crn)

    whenSelectingOtherAppointmentType('Alcohol', 'Alcohol Group Work Session (NS)')
    shouldDisplayCorrectAppointmentSummary('Alcohol Group Work Session (NS)')

    whenBookingAppointment()
    shouldDisplayAppointmentBookingConfirmation('Alcohol Group Work Session (NS)')

    shouldHaveBookedAppointment(crn, sentenceId, 'C243')
  })

  function havingOffender(crn: string, sentenceId: number) {
    cy.task('stubGetAppointmentTypes')
    cy.task('stubCreateAppointment', { crn, sentenceId })
    cy.task('stubOffenderDetails', crn)
  }

  function havingLoggedInAndBeginBookingAppointmentFlow(crn: string) {
    cy.login()
    cy.arrangeAppointment(crn)
  }

  function whenSelectingOtherAppointmentType(search: string, name: string) {
    page.pageTitle.contains('What type of appointment are you arranging?')
    page.type.radio('other').click()
    page.type.otherAutoComplete.type(search)
    page.type.autoCompleteResult(name).click()
    page.continueButton.click()
  }

  function whenSelectingFeaturedAppointmentType(type: string) {
    page.pageTitle.contains('What type of appointment are you arranging?')
    page.type.radio(type).click()
    page.continueButton.click()
  }

  function shouldDisplayCorrectAppointmentSummary(type: string) {
    const expectedSummary = {
      'Type of appointment': type,
      Date: expectedStart.toFormat('cccc d MMMM'),
      Time: `${expectedStart.toFormat('h:mm a')} to ${expectedEnd.toFormat('h:mm a')}`,
      'RAR activity': 'No',
      'Appointment notes': 'some notes',
    }
    page.pageTitle.contains('Check your answers')
    page.check.appointmentSummaryTable.should('deep.eq', expectedSummary)
  }

  function whenBookingAppointment() {
    page.continueButton.click()
  }

  function shouldDisplayAppointmentBookingConfirmation(type: string) {
    page.pageTitle.contains('Appointment arranged')
    page.confirm.descriptionMessage.contains(type)
    page.confirm.timeMessage.contains(
      `${expectedStart.toFormat('cccc d MMMM')} from ${expectedStart.toFormat('h:mm a')}`,
    )
    page.confirm.phoneMessage.contains('Beth')
    page.confirm.phoneMessage.contains('07734 111992')
  }

  function shouldHaveBookedAppointment(crn: string, sentenceId: number, contactType: string) {
    cy.task('getCreatedAppointments', { crn, sentenceId }).should('deep.eq', [
      {
        requirementId: 2500199144,
        contactType,
        appointmentStart: expectedStart.toISO(),
        appointmentEnd: expectedEnd.toISO(),
        notes: 'some notes',
        providerCode: 'CRS',
        teamCode: 'CRSUAT',
        staffCode: 'CRSUATU',
      },
    ])
  }
})
