import { OffenderPage, TABS } from '../../../pages/offender.page'
import { StubGetConvictionsOptions, StubOffenderAppointmentOptions } from '../../../mockApis/community-api'

export class ViewOffenderFixture {
  crn = 'ABC123'
  page = new OffenderPage()

  reset() {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubGetStaffDetails')
  }

  havingOffender(
    options: {
      convictions?: Omit<StubGetConvictionsOptions, 'crn'>
      appointments?: StubOffenderAppointmentOptions['partials']
    } = {},
  ): this {
    const crn = this.crn
    cy.task('stubOffenderDetails', { crn })
    cy.task('stubGetConvictions', { crn, ...options.convictions })
    cy.task('stubGetRequirements', { crn })
    cy.task('stubOffenderAppointments', { crn, partials: options.appointments })
    cy.task('stubGetPersonalCircumstances', { crn })
    cy.task('stubGetPersonalContacts', { crn })
    cy.task('stubOffenderRegistrations', { crn })
    cy.task('stubOffenderRisks', { crn })
    return this
  }

  whenViewingOffender(): this {
    cy.login()
    cy.viewOffender(this.crn)
    return this
  }

  whenClickingSubNavTab(tab: TABS): this {
    this.page.subNavTab(tab).click()
    return this
  }

  shouldDisplayCommonHeader(): this {
    this.page.pageTitle.contains(`CRN: ${this.crn}`)
    this.page.pageTitle.contains('Brian Cheese (Bob)')
    this.page.registrations.should('have.length', 2)
    this.page.registrations.contains('High RoSH').parent().should('have.class', 'govuk-tag--red')
    this.page.registrations.contains('Restraining Order').parent().should('have.class', 'govuk-tag--orange')
    return this
  }

  shouldRenderOffenderTab<TAB extends TABS>(tab: TAB, assert: (page: OffenderPage[TAB]) => void): this {
    this.page.currentTab.should('eq', tab)
    assert(this.page[tab])
    return this
  }
}
