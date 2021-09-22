import { ArrangeAppointmentPage } from '../../pages'
import { Role } from '../../plugins/hmpps-auth'

context('Arrange appointment authorization', () => {
  const page = new ArrangeAppointmentPage()

  it('is unauthorized for read only users', () => {
    cy.seed({ role: Role.Read })
    cy.arrangeAppointment()
    page.pageTitle.contains('Access denied')
  })

  it('is unauthorized for unknown users', () => {
    cy.seed({ role: Role.None })
    cy.arrangeAppointment()
    page.pageTitle.contains('Access denied')
  })
})
