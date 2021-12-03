import { ViewCaseFixture } from '../../fixtures/view-case.fixture'
import { DateTime } from 'luxon'
import { ActivityLogEntry, ActivityLogGroup, AppointmentOutcome } from '../../../src/server/community-api/client'
import { DeepPartial } from '../../../src/server/app.types'

class Fixture extends ViewCaseFixture {
  shouldRenderSentence({ breaches, breachesLabel = 'Breaches' }: { breaches: string; breachesLabel?: string }) {
    return this.shouldRenderOffenderTab('compliance', page => {
      page.sentence(card =>
        card.summaryList(list => {
          list
            .value('Main offence')
            .contains('Cheats at gambling or enables or assists person to cheat (Gambling Act 2005) (1 count)')
          list.value('Order').contains('12 month Community Order (12 months elapsed)')
          list.value('Start date').contains('17 February 2020')
          list.value(breachesLabel).contains(breaches)
        }),
      )
    })
  }

  shouldRenderRequirement(options: {
    total: string
    complied: string
    ftc: string
    absences: string
    sinceLastBreach?: boolean
    withoutAnOutcome: string
  }) {
    return this.shouldRenderOffenderTab('compliance', page => {
      page.requirementName.contains('44 days RAR, 1 completed (2 requirements)')
      if (options.sinceLastBreach) {
        page.sinceLastBreachMessage.contains('Showing compliance since previous breach')
      } else {
        page.sinceLastBreachMessage.should('not.exist')
      }
      page.requirement(card => {
        // TODO look at testing these links?
        card.value('Appointments').contains(options.total)
        card.value('Without an outcome').contains(options.withoutAnOutcome)
        card.value('Complied').contains(options.complied)
        card
          .value(options.sinceLastBreach ? 'Failures to comply' : 'Failures to comply within 12 months')
          .contains(options.ftc)
        card.value('Acceptable absences').contains(options.absences)
      })
    })
  }
}

function complianceAppointments({
  complied,
  ftc,
  absence,
  noOutcome,
}: {
  complied: number
  ftc: number
  absence: number
  noOutcome: number
}): DeepPartial<ActivityLogGroup>[] {
  function withOutcome(outcome: DeepPartial<AppointmentOutcome>, n: number): DeepPartial<ActivityLogEntry>[] {
    return [...Array(n)].map(() => ({ type: { code: 'APAT', appointment: true }, outcome }))
  }

  return [
    {
      entries: [
        ...withOutcome({ complied: true, attended: true }, complied),
        ...withOutcome({ complied: false }, ftc),
        ...withOutcome({ complied: true, attended: false }, absence),
        ...withOutcome(null, noOutcome),
      ],
    },
  ]
}

context('Case compliance tab', () => {
  const fixture = new Fixture()
  const twoYearsAgo = DateTime.now().minus({ years: 2 })

  it('displays empty compliance page', () => {
    cy.seed({
      convictions: {
        active: null,
        // old conviction terminated >2 years ago is ignored
        previous: [{ conviction: { sentence: { terminationDate: twoYearsAgo.minus({ months: 1 }).toISODate() } } }],
      },
    })

    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('compliance')
      .shouldBeAccessible()
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('compliance', page => {
        page.startBreachLink.should('not.exist')
        page.noCurrentConvictionWarning.contains('Current compliance details are unavailable')
        page.noPreviousConvictionsWarning.contains('No previous orders')
      })
  })

  describe('clean compliance page', () => {
    const previousTerminationDate = twoYearsAgo.plus({ months: 1 })
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
            date: '2018-12-11',
            entries: [
              {
                startTime: null,
                endTime: null,
                type: { code: 'ABNP', appointment: true },
                outcome: { complied: true, attended: true },
              },
            ],
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
          total: '1 national standard appointment',
          withoutAnOutcome: 'None',
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
            `Previous orders (${DateTime.now().minus({ years: 2 }).toFormat('MMMM yyyy')} to present)`,
          )
          page.previousOrder('24 month CJA Community Order', previousTerminationDate, card =>
            card.summaryList(list => {
              list.value('Main offence').contains('Common Assault and Battery (2 counts)')
              list.value('Status').contains('Revoked')
              list.value('Started').contains('9 December 2018')
              list.value('Ended').contains(previousTerminationDate.toFormat('d MMMM yyyy'))
              list.value('Breaches').contains('Breach not proven') // this comes from the ABNP contact & overrides the status
            }),
          )
        })
    })

    it('links to sentence page from sentence card', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('compliance')
        .shouldRenderOffenderTab('compliance', page =>
          page.sentence(card => card.actionLinks.contains('View sentence details').click()),
        )
        .shouldRenderOffenderTab('sentence')
    })

    it('links to delius interstitial from previous order', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('compliance')
        .shouldRenderOffenderTab('compliance', page => {
          page.previousOrder('24 month CJA Community Order', previousTerminationDate, card =>
            card.actionLinks.contains('View order').click(),
          )
        })
        .shouldDisplayExitPage('delius')
    })

    it('links to previous orders page from view all orders link', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('compliance')
        .shouldRenderOffenderTab('compliance', page => page.viewAllOrdersLink.click())
        .shouldRenderPreviousOrdersPage(page => {
          page.previousOrdersTable(table => {
            table.cell(0, 1).contains(`Ended on ${previousTerminationDate.toFormat('d MMMM yyyy')}`)
            table.cell(0, 0).contains('Common Assault and Battery (2 counts)')
            table.cell(0, 0).contains('24 month CJA Community Order').click()
          })
        })
    })

    it('links to delius interstitial from start breach link', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('compliance')
        .shouldRenderOffenderTab('compliance', page => page.startBreachLink.click())
        .shouldDisplayExitPage('delius')
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
      contacts: complianceAppointments({ complied: 1, ftc: 2, absence: 3, noOutcome: 1 }),
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
        total: '7 national standard appointments',
        withoutAnOutcome: '1 appointment without a recorded outcome',
        complied: '1 complied',
        ftc: '2 unacceptable absences',
        absences: '3 acceptable absences',
      })
  })

  it('displays breach pending failure to comply compliance page with link to start breach', () => {
    cy.seed({
      convictions: {
        active: {
          conviction: { inBreach: false, sentence: { failureToComplyLimit: 3 } },
          nsis: [],
        },
      },
      contacts: complianceAppointments({ complied: 0, ftc: 3, absence: 0, noOutcome: 1 }),
    })
    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('compliance')
      .shouldRenderOffenderTab('compliance', page => {
        page.currentStatus.contains('3 failures to comply within 12 months')
        page.currentStatus.find('a').contains('Start a breach').click()
      })
      .shouldDisplayExitPage('delius')
  })

  it('displays multiple current breach warning', () => {
    cy.seed({
      convictions: {
        active: {
          conviction: { inBreach: true },
          nsis: [
            {
              active: true,
              nsiType: { code: 'BRE' },
              actualStartDate: '2020-12-01',
              nsiStatus: {
                description: 'Ignored as not latest breach',
              },
            },
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
    })

    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('compliance')
      .shouldRenderOffenderTab('compliance', page => {
        page.currentStatus.contains('Breach in progress')
        page.multipleBreachWarning.contains('There are multiple breach NSIs in progress on Delius')
        page.multipleBreachWarning.find('a').contains('Go to Delius').click()
      })
      .shouldDisplayExitPage('delius')
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
      contacts: complianceAppointments({ complied: 1, ftc: 2, absence: 3, noOutcome: 1 }),
    })
    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('compliance')
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('compliance', page => {
        page.currentStatus.contains('Breach in progress')
        page.multipleBreachWarning.should('not.exist')
        page.breachDetails(card => {
          card.value('Breach started').contains('2 December 2020')
          card.value('Status').contains('Warrant Issued')
        })
      })
      .shouldRenderSentence({ breaches: 'None', breachesLabel: 'Previous breaches' })
      .shouldRenderRequirement({
        total: '7 national standard appointments',
        withoutAnOutcome: '1 appointment without a recorded outcome',
        complied: '1 complied',
        ftc: '2 unacceptable absences',
        absences: '3 acceptable absences',
      })
  })

  it('displays previous breach compliance page', () => {
    const from = DateTime.now().minus({ years: 1 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    const endDate = '2020-12-03'
    const sinceLastBreach = DateTime.fromISO(endDate) > from
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
              actualEndDate: endDate,
            },
          ],
        },
      },
      contacts: complianceAppointments({ complied: 1, ftc: 2, absence: 3, noOutcome: 1 }),
    })
    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('compliance')
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('compliance', page => {
        page.currentStatus.contains(
          sinceLastBreach ? '2 failures to comply since last breach' : '2 failures to comply within 12 months',
        )
      })
      .shouldRenderSentence({ breaches: 'Breach proven Resolved 3 December 2020' })
      .shouldRenderRequirement({
        total: '7 national standard appointments',
        withoutAnOutcome: '1 appointment without a recorded outcome',
        complied: '1 complied',
        ftc: '2 unacceptable absences',
        absences: '3 acceptable absences',
        sinceLastBreach,
      })
  })
})
