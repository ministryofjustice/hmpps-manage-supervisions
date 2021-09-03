import { ArrangeAppointmentPage } from '../../pages'

context('Arrange appointment authorization', () => {
  const page = new ArrangeAppointmentPage()

  it('is unauthorized for read only users', () => {
    cy.seed({ roles: ['ROLE_MANAGE_SUPERVISIONS_RO'] })
    cy.arrangeAppointment()
    page.pageTitle.contains('Access denied')
  })
})
