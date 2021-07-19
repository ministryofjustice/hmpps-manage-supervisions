import { ViewOffenderFixture } from './view-offender.fixture'
import { getDateRange } from '../../../util/getDateRange'

context('ViewOffenderOverview', () => {
  const fixture = new ViewOffenderFixture()

  beforeEach(() => fixture.reset())

  it('displays offender overview', () => {
    const past = getDateRange('past', { hour: 10, minute: 0 }, { hour: 1 })
    fixture
      .havingOffender({
        convictions: { previous: true },
        appointments: [
          { start: '2100-05-25T12:00:00+01:00', end: '2100-05-25T13:00:00+01:00' },
          { ...past, outcome: { complied: true, attended: true } },
          { ...past, outcome: { complied: false, attended: true } },
          { ...past, outcome: { complied: true, attended: false } },
        ],
      })
      .whenViewingOffender()
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('overview', page => {
        page.mainOffence.contains(
          'Cheats at gambling or enables or assists person to cheat (Gambling Act 2005) - 07539',
        )
        page.additionalOffences.contains('Assault on Police Officer - 10400')

        page.sentence.contains('ORA Community Order')
        page.progress('Sentence').contains('12 months elapsed (of 12 months)')
        page.progress('RAR').contains('5 days completed (of 20 days)')

        page.previousOrders.contains('Previous orders (1) Last ended on 1 December 2020')

        page.nextAppointment.contains(
          `The next appointment is Tuesday 25 May 2100 at 12pm Office visit with Some Staff`,
        )
        page.appointmentAttendance.contains('1 Complied')
        page.appointmentAttendance.contains('1 Acceptable absence')
        page.appointmentAttendance.contains('1 Failure to comply')
      })
  })

  it('displays offender overview when no OASys risk data', () => {
    fixture
      .havingOffender({ arnRiskDataAvailable: false })
      .whenViewingOffender()
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('overview', page => {
        page.roshRisksSection.should('not.exist')
      })
  })
})
