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
    'Type of appointment': 'Office Visit',
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
    cy.arrangeAppointmentStep(crn, 'check')
    cy.task('getLoginAttempts').should('have.length', 1)
  })

  it('Check page rendered', () => {
    cy.login()

    // TODO run through form builder here, using the page object as an abstraction.

    cy.arrangeAppointmentStep(crn, 'check')
    page.pageTitle.contains('Check your answers')

    // TODO these assertions are not nice, open to suggestions please!!!
    page.appointmentSummaryTableLabels.then(labels => {
      const expectedKeys = Object.keys(expectedSummary)
      for (let i = 0; i < expectedKeys.length; i++) {
        expect(labels[i]).to.contain.text(expectedKeys[i])
      }
    })

    page.appointmentSummaryTableData.then(values => {
      const expectedValues = Object.values(expectedSummary)
      for (let i = 0; i < expectedValues.length; i++) {
        expect(values[i]).to.contain.text(expectedValues[i])
      }
    })
  })

  it('Dummy appointment booked', () => {
    cy.task('stubCreateAppointment', { crn, sentenceId })
    cy.login()

    // TODO run through form builder here, using the page object as an abstraction.

    cy.arrangeAppointmentStep(crn, 'check')
    page.continueButton.click()

    cy.task('getCreatedAppointments', { crn, sentenceId }).should('deep.eq', [
      {
        requirementId: 2500199144,
        contactType: 'COTH',
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
