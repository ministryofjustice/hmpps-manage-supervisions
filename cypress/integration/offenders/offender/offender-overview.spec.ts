import { ViewOffenderFixture } from './view-offender.fixture'

context('ViewOffenderOverview', () => {
  const fixture = new ViewOffenderFixture()

  it('displays offender overview', () => {
    const past = { appointmentStart: '2020-05-25T12:00:00+01:00', appointmentEnd: '2020-05-25T13:00:00+01:00' }
    cy.seed({
      appointments: [
        {
          appointmentStart: '2100-05-25T12:00:00+01:00',
          appointmentEnd: '2100-05-25T13:00:00+01:00',
          type: { contactType: 'CHVS' },
          staff: { unallocated: false, forenames: 'Laura', surname: 'Smith' },
        },
        { ...past, outcome: { complied: true, attended: true } },
        { ...past, outcome: { complied: false, attended: true } },
        { ...past, outcome: { complied: true, attended: false } },
      ],
    })

    fixture
      .whenViewingOffender()
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('overview', page => {
        page.mainOffence.contains(
          'Cheats at gambling or enables or assists person to cheat (Gambling Act 2005) (1 count)',
        )
        page.additionalOffences.contains('Assault on Police Officer (1 count)')

        page.sentence.contains('12 month Community Order')
        page.progress('Sentence').contains('12 months elapsed (of 12 months)')
        page.progress('RAR').contains('44 days RAR, 29 completed (2 requirements)')

        page.previousOrders.contains('Previous orders (1) Last ended on 1 November 2018')

        page.nextAppointment.contains('The next appointment is Tuesday 25 May 2100 at 12pm Home visit with Laura Smith')
        page.appointmentAttendance.contains('1 Complied')
        page.appointmentAttendance.contains('1 Acceptable absence')
        page.appointmentAttendance.contains('1 Failure to comply')
      })
  })

  it('displays offender overview when no OASys risk data', () => {
    cy.seed({ risks: null })
    fixture
      .whenViewingOffender()
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('overview', page => {
        page.roshRisksSection.should('not.exist')
      })
  })
})
