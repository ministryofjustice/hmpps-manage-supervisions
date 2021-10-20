import * as FixtureData from '../../fixtures/smoke.json'
import { ViewCaseFixture } from '../../fixtures/view-case.fixture'
import { DeploymentEnvironment, Env } from '../../util'

context('case smoke test', () => {
  before(() => {
    if (Env.deployment === DeploymentEnvironment.Local) {
      cy.seed()
    }
  })

  for (const { crn, displayName } of FixtureData[Env.deployment].case) {
    it(`loads case '${crn}'`, () => {
      new ViewCaseFixture({ crn, displayName })
        .whenViewingOffender()
        .dismissEligibilityWarningIfPresent()
        .shouldRenderOffenderTab('overview')
        .shouldDisplayCommonHeader()

        .whenClickingSubNavTab('schedule')
        .shouldRenderOffenderTab('schedule')

        .whenClickingSubNavTab('personal')
        .shouldRenderOffenderTab('personal')

        .whenClickingSubNavTab('risk')
        .shouldRenderOffenderTab('risk')

        .whenClickingSubNavTab('sentence')
        .shouldRenderOffenderTab('sentence')

        .whenClickingSubNavTab('activity')
        .shouldRenderOffenderTab('activity')

        .whenClickingSubNavTab('compliance')
        .shouldRenderOffenderTab('compliance')
    })
  }
})
