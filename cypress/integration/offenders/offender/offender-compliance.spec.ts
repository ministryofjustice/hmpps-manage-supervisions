import { ViewOffenderFixture } from './view-offender.fixture'
import { DateTime } from 'luxon'
import { SummaryList } from '../../../pages/components/summary-list'
import { AppointmentOutcome, ContactSummary } from '../../../../src/server/community-api/client'

class Fixture extends ViewOffenderFixture {
  shouldRenderSentence({ breaches, breachesLabel = 'Breaches' }: { breaches: string; breachesLabel?: string }) {
    return this.shouldRenderOffenderTab('compliance', page => {
      page.sentence(card => {
        card
          .value('Main offence')
          .contains('Cheats at gambling or enables or assists person to cheat (Gambling Act 2005) (1 count)')
        card.value('Order').contains('12 month Community Order (12 months elapsed)')
        card.value('Start date').contains('17 February 2020')
        card.value(breachesLabel).contains(breaches)
      })
    })
  }

  shouldRenderRequirement(options: {
    total: string
    complied: string
    ftc: string
    absences: string
    sinceLastBreach?: boolean
  }) {
    return this.shouldRenderOffenderTab('compliance', page => {
      page.requirementName.contains('44 days RAR, 29 completed (2 requirements)')
      if (options.sinceLastBreach) {
        page.sinceLastBreachMessage.contains('Showing compliance since previous breach')
      } else {
        page.sinceLastBreachMessage.should('not.exist')
      }
      page.requirement(card => {
        // TODO look at testing these links?
        card.value('Appointments').contains(options.total)
        card.value('Complied').contains(options.complied)
        card
          .value(options.sinceLastBreach ? 'Failures to comply' : 'Failures to comply within 12 months')
          .contains(options.ftc)
        card.value('Acceptable absences').contains(options.absences)
      })
    })
  }
}

function complianceAppointments({ complied, ftc, absence }: { complied: number; ftc: number; absence: number }) {
  function withOutcome(outcome: DeepPartial<AppointmentOutcome>, n: number): DeepPartial<ContactSummary>[] {
    return [...Array(n)].map(() => ({ type: { code: 'APAT', appointment: true }, outcome }))
  }

  return [
    ...withOutcome({ complied: true, attended: true }, complied),
    ...withOutcome({ complied: false }, ftc),
    ...withOutcome({ complied: true, attended: false }, absence),
  ]
}

context('ViewOffenderCompliance', () => {
  const fixture = new Fixture()
  const twoYearsAgo = DateTime.now().minus({ year: 2 })

  it('displays empty compliance page', () => {
    cy.seed({
      convictions: {
        active: null,
        // old conviction terminated >2 years ago is ignored
        previous: [{ conviction: { sentence: { terminationDate: twoYearsAgo.minus({ month: 1 }).toISODate() } } }],
      },
    })

    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('compliance')
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('compliance', page => {
        page.startBreachButton.should('not.exist')
        page.noCurrentConvictionWarning.contains('Current compliance details are unavailable')
        page.noPreviousConvictionsWarning.contains('No previous orders')
      })
  })

  describe('clean compliance page', () => {
    const previousTerminationDate = twoYearsAgo.plus({ month: 1 })
    before(() => {
      cy.seed({
        convictions: {
          active: {
            conviction: { inBreach: false },
            nsis: [],
          },
          previous: [
            {
              conviction: {
                offences: [
                  {
                    mainOffence: true,
                    detail: { subCategoryDescription: 'Common Assault and Battery' },
                    offenceCount: 2,
                  },
                ],
                sentence: {
                  startDate: '2018-12-09',
                  terminationDate: previousTerminationDate.toISODate(),
                  terminationReason: 'Revoked',
                  originalLengthUnits: 'Month',
                  originalLength: 24,
                  sentenceType: { description: 'CJA Community Order' },
                },
              },
              nsis: [
                {
                  active: false,
                  nsiType: { code: 'BRE' },
                  actualStartDate: '2018-12-10',
                },
              ],
            },
          ],
        },
        contacts: [
          {
            contactStart: '2018-12-11T00:00:00+00:00',
            type: { code: 'ABNP', appointment: true },
            outcome: { complied: true, attended: true },
          },
        ],
      })
    })

    it('displays clean compliance page', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('compliance')
        .shouldDisplayCommonHeader()
        .shouldRenderOffenderTab('compliance', page => {
          page.currentStatus.contains('No failures to comply within 12 months')
        })
        .shouldRenderRequirement({
          total: '1 appointment',
          complied: '1 complied',
          ftc: 'None',
          absences: 'None',
        })
    })

    it('displays previous conviction', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('compliance')
        .shouldDisplayCommonHeader()
        .shouldRenderOffenderTab('compliance', page => {
          page.previousOrdersTitle.contains(
            `Previous orders (${DateTime.now().minus({ year: 2 }).toFormat('MMMM yyyy')} to present)`,
          )
          SummaryList.selectFromCard(
            `24 month CJA Community Order (Ended ${previousTerminationDate.toFormat('d MMMM yyyy')})`,
            card => {
              card.value('Main offence').contains('Common Assault and Battery (2 counts)')
              card.value('Status').contains('Revoked')
              card.value('Started').contains('9 December 2018')
              card.value('Ended').contains(previousTerminationDate.toFormat('d MMMM yyyy'))
              card.value('Breaches').contains('Breach not proven') // this comes from the ABNP contact & overrides the status
            },
          )
        })
    })
  })

  it('displays failure to comply compliance page', () => {
    cy.seed({
      convictions: {
        active: {
          conviction: { inBreach: false, sentence: { failureToComplyLimit: 3 } },
          nsis: [],
        },
      },
      contacts: complianceAppointments({ complied: 1, ftc: 2, absence: 3 }),
    })
    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('compliance')
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('compliance', page =>
        page.currentStatus.contains('2 failures to comply within 12 months'),
      )
      .shouldRenderSentence({ breaches: 'None' })
      .shouldRenderRequirement({
        total: '6 appointments',
        complied: '1 complied',
        ftc: '2 unacceptable absences',
        absences: '3 acceptable absences',
      })
  })

  it('displays in breach compliance page', () => {
    cy.seed({
      convictions: {
        active: {
          conviction: { inBreach: true },
          nsis: [
            {
              active: true,
              nsiType: { code: 'BRE' },
              actualStartDate: '2020-12-02',
              nsiStatus: {
                description: 'Warrant Issued',
              },
            },
          ],
        },
      },
      contacts: complianceAppointments({ complied: 1, ftc: 2, absence: 3 }),
    })
    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('compliance')
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('compliance', page => {
        page.currentStatus.contains('Breach in progress')
        page.breachDetails(card => {
          card.value('Breach started').contains('2 December 2020')
          card.value('Status').contains('Warrant Issued')
        })
      })
      .shouldRenderSentence({ breaches: 'None', breachesLabel: 'Previous breaches' })
      .shouldRenderRequirement({
        total: '6 appointments',
        complied: '1 complied',
        ftc: '2 unacceptable absences',
        absences: '3 acceptable absences',
      })
  })

  it('displays previous breach compliance page', () => {
    cy.seed({
      convictions: {
        active: {
          conviction: { inBreach: false },
          nsis: [
            {
              active: false,
              nsiType: { code: 'BRE' },
              nsiOutcome: { description: 'Breach proven' },
              actualStartDate: '2020-12-02',
              actualEndDate: '2020-12-03',
            },
          ],
        },
      },
      contacts: complianceAppointments({ complied: 1, ftc: 2, absence: 3 }),
    })
    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('compliance')
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('compliance', page => {
        page.currentStatus.contains('2 failures to comply since last breach')
      })
      .shouldRenderSentence({ breaches: 'Breach proven Resolved 3 December 2020' })
      .shouldRenderRequirement({
        total: '6 appointments',
        complied: '1 complied',
        ftc: '2 unacceptable absences',
        absences: '3 acceptable absences',
        sinceLastBreach: true,
      })
  })
})
