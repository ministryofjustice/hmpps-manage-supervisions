import { ArrangeAppointmentFixture } from '../../fixtures/arrange-appointment.fixture'
import * as FixtureData from '../../fixtures/smoke.json'
import { DeploymentEnvironment, Env } from '../../util'

/**
 * Creates a fixture file containing all "other" contact types
 * This is then iterated over by the test in the other suite.
 */
context.skip('contact types fixture population', () => {
  const fixture = new ArrangeAppointmentFixture()
  before(() => {
    if (Env.deployment === DeploymentEnvironment.Local) {
      cy.seed()
    }
  })

  it('Populate other types fixture', () => {
    const { crn } = FixtureData[Env.deployment].case[0]
    fixture.getOtherContactTypes(crn).then(contactTypes => {
      cy.writeFile('cypress/fixtures/other_types.json', JSON.stringify(contactTypes))
    })
  })
})
