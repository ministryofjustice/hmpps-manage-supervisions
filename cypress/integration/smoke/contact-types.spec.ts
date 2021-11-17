import { DateTime } from 'luxon'
import { AppointmentBookingTestCase, ArrangeAppointmentFixture } from '../../fixtures/arrange-appointment.fixture'
import * as FixtureData from '../../fixtures/smoke.json'
import { DeploymentEnvironment, Env } from '../../util'

context('contact types smoke test', () => {
  const fixture = new ArrangeAppointmentFixture()
  const testRunStartTime = DateTime.now().set({ second: 0, millisecond: 0 })
  let testcount = 0

  before(() => {
    if (Env.deployment === DeploymentEnvironment.Local) {
      cy.seed()
    }
  })

  const { crn, displayName } = FixtureData[Env.deployment].case[0]

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const otherContactTypes = require('../../fixtures/other_types.json')

  otherContactTypes.forEach(contactType => {
    it(`appointment type ${contactType}`, () => {
      const test: AppointmentBookingTestCase = {
        type: { code: null, name: contactType },
        location: { code: null, name: null },
        sensitive: false,
        addNotes: false,
        start: testRunStartTime.plus({ days: 2, minutes: testcount }),
        end: testRunStartTime.plus({ days: 2, minutes: testcount + 1 }),
        crn,
        firstName: displayName.split(' ')[0],
      }

      cy.arrangeAppointment(crn)

      fixture.attemptBookingOtherAppointment(test, false)

      testcount++
    })
  })
})
