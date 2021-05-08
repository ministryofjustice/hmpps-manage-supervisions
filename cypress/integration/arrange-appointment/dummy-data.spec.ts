import { ArrangeAppointmentPage } from '../../pages'
import { DateTime } from 'luxon'

const crn = 'ABC123'
const sentenceId = 2500443138

context('CreateAppointment', () => {
  const page = new ArrangeAppointmentPage()

  // TODO this will be built up in the form builder, no dynamic date, so we can probably use a json fixture?
  const expectedStart = DateTime.now().plus({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 })
  const expectedEnd = expectedStart.plus({ hour: 1 })

  const expectedSummary = {
    'Type of appointment': 'Office visit',
    Date: expectedStart.toFormat('cccc d MMMM'),
    Time: `${expectedStart.toFormat('h:mm a')} to ${expectedEnd.toFormat('h:mm a')}`,
    'RAR activity': 'No',
    'Appointment notes': 'some notes',
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  it('Unauthenticated user directed to login', () => {
    cy.arrangeAppointment(crn)
    cy.task('getLoginAttempts').should('have.length', 1)
  })

  it('Dummy appointment booked', () => {
    cy.task('stubGetAppointmentTypes')
    cy.task('stubCreateAppointment', { crn, sentenceId })
    cy.task('stubOffenderDetails', crn)
    cy.login()

    cy.arrangeAppointment(crn)

    // appointment type step
    page.pageTitle.contains('What type of appointment are you arranging?')
    page.type.officeVisitRadio.click()
    page.continueButton.click()

    // check step
    page.pageTitle.contains('Check your answers')
    page.check.appointmentSummaryTable.should('deep.eq', expectedSummary)
    page.continueButton.click()

    // confirm step
    page.pageTitle.contains('Appointment arranged')
    page.confirm.descriptionMessage.contains('Office visit')
    page.confirm.timeMessage.contains(
      `${expectedStart.toFormat('cccc d MMMM')} from ${expectedStart.toFormat('h:mm a')}`,
    )
    page.confirm.phoneMessage.contains('Beth')
    page.confirm.phoneMessage.contains('07734 111992')

    cy.task('getCreatedAppointments', { crn, sentenceId }).should('deep.eq', [
      {
        requirementId: 2500199144,
        contactType: 'APAT',
        appointmentStart: expectedStart.toISO(),
        appointmentEnd: expectedEnd.toISO(),
        notes: 'some notes',
        providerCode: 'CRS',
        teamCode: 'CRSUAT',
        staffCode: 'CRSUATU',
      },
    ])
  })
})
