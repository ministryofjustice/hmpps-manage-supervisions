import { CaseRemovedRisksPage } from '../../pages/case/case-removed-risks.page'
import { CaseRiskDetailPage } from '../../pages/case/case-risk-detail.page'
import { ViewCaseFixture } from './view-case.fixture'

class Fixture extends ViewCaseFixture {
  shouldRenderRiskDetails(pageTitle: string, assert: (page: CaseRiskDetailPage) => void): this {
    const page = new CaseRiskDetailPage()
    page.documentTitle.contains(pageTitle)
    page.pageTitle.contains(pageTitle)
    assert(page)
    return this
  }

  shouldRenderRemovedRiskFlagPage(assert: (page: CaseRemovedRisksPage) => void): this {
    const page = new CaseRemovedRisksPage()
    page.documentTitle.contains('Removed risk flags')
    page.pageTitle.contains('Removed risk flags')
    assert(page)
    return this
  }
}

context('Case risk tab', () => {
  const fixture = new Fixture()

  describe('empty risk page', () => {
    before(() => cy.seed({ risks: null, registrations: [] }))

    it('displays no risk assessment warning', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('risk')
        .shouldBeAccessible()
        .shouldDisplayCommonHeader()
        .shouldRenderOffenderTab('risk', page => {
          page.noActiveRegistrations.contains('There are no current risk flags. Add risk flags in Delius.')
          page.noRisksWarning.contains('There is no OASys risk assessment for Liz Haggis')
          page.noRisksWarning.find('a').contains('View OASys').click()
        })
        .shouldDisplayExitPage('oasys')
    })
  })

  describe('populated risk page', () => {
    before(() => cy.seed())

    it('displays risk', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('risk')
        .shouldDisplayCommonHeader()
        .shouldRenderOffenderTab('risk', page => {
          page.roshCommunity(card =>
            card.summaryList(list => {
              list.value('OASys assessment date').contains('2 January 2000')
              list.value('Overall').contains('Very high risk of serious harm')
              list.value('Very high risk').contains('Children Staff')
              list.value('High risk').contains('Public')
              list.title('Medium risk').should('not.exist')
              list.value('Low risk').contains('Known Adult')
              list.value('Who is at risk').contains('Someone at risk')
              list.value('Nature of risk').contains('Some nature of risk')
              list.value('When is risk greatest').contains('Some risk imminence')
            }),
          )

          page.roshThemselves(card =>
            card.summaryList(list => {
              list.value('Risk of suicide or self harm').contains('There are concerns about self-harm and suicide')
              list.details(
                'Coping in custody or a hostel',
                'There were concerns about coping in a hostel and in custody',
                () => {
                  page.currentNotes.contains('No detail given')
                  page.previousNotes.contains(
                    'Soluta tempore nemo et velit est perspiciatis. Neque error aut est nemo quasi. Et labore impedit omnis numquam id et eaque facere itaque. Ipsam et atque eos tempora possimus.',
                  )
                },
              )
              list.value('Vulnerability').contains('No concerns')
            }),
          )

          page.riskFlags(table => {
            table.cell(0, 0).contains('Alert Notice')
            table.cell(0, 1).contains('Major alert about this offender')
            table.cell(0, 2).contains('2 January 2022')
          })

          page.viewInactiveRegistrations.contains('View removed risk flags (2)')
          page.noActiveRegistrations.should('not.exist')
        })
    })

    it('links to oasys interstitial from risk to community card', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('risk')
        .shouldRenderOffenderTab('risk', page => {
          page.roshCommunity(card => card.actionLinks.contains('View OASys').click())
        })
        .shouldDisplayExitPage('oasys')
    })

    it('links to oasys interstitial from risk to themselves card', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('risk')
        .shouldRenderOffenderTab('risk', page => {
          page.roshThemselves(card => card.actionLinks.contains('View OASys').click())
        })
        .shouldDisplayExitPage('oasys')
    })

    it('displays risk details', () => {
      const flagName = 'Alert Notice'
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('risk')
        .shouldRenderOffenderTab('risk', page => {
          page.whenClickingRiskRegistration(flagName)
        })
        .shouldBeAccessible()
        .shouldRenderRiskDetails(flagName, page => {
          // These texts are long, so just check for a substring
          page.purposeText.contains('To distribute priority information/warning/alerts relating to an offender')
          page.frequencyText.contains('Every 6 months')
          page.terminationText.contains("Don't remove at termination")
          page.furtherInfoText.contains('Should only be used when a national alert notice has been issued')

          page.registrationDetails(card => {
            card.summaryList(list => {
              list.value('Notes').contains('Major alert about this offender')
              list.value('Next review').contains('2 January 2022')
              list.value('Most recent review').contains('23 August 2021 by Cindy Legford')
              list.value('Date added').contains('14 May 2020 by Yolanda Gubbins')
            })

            card.actionLinks.contains('Remove this flag on Delius').click()
          })
        })
        .shouldDisplayExitPage('delius')
        .thenWhenGoingBack()
        .shouldRenderRiskDetails(flagName, page =>
          page.registrationDetails(card => card.summaryList(list => list.actions('Notes').contains('Change').click())),
        )
        .shouldDisplayExitPage('delius')
        .thenWhenGoingBack()
        .shouldRenderRiskDetails(flagName, page =>
          page.registrationDetails(card =>
            card.summaryList(list => list.actions('Next review').contains('Review risk flag').click()),
          ),
        )
        .shouldDisplayExitPage('delius')
        .thenWhenGoingBack()
        .shouldRenderRiskDetails(flagName, page =>
          page.registrationDetails(card =>
            card.summaryList(list => list.actions('Most recent review').contains('View review').click()),
          ),
        )
        .shouldDisplayExitPage('delius')
    })

    it('displays removed risks list', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('risk')
        .shouldRenderOffenderTab('risk', page => {
          page.viewInactiveRegistrations.children().click()
        })
        .shouldRenderRemovedRiskFlagPage(page => {
          page.removedRisksTable(table => {
            table.cell(0, 0).contains('Organised Crime')
            table.cell(0, 1).contains('No longer a risk')
            table.cell(0, 2).contains('19 July 2021')
          })
        })
    })

    it('displays removed risk details', () => {
      const flagName = 'Organised Crime'
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('risk')
        .shouldRenderOffenderTab('risk', page => {
          page.viewInactiveRegistrations.children().click()
        })
        .shouldRenderRemovedRiskFlagPage(page => {
          page.whenClickingRiskRegistration(flagName)
        })
        .shouldBeAccessible()
        .shouldRenderRiskDetails(flagName, page => {
          page.removalDetails(card => {
            card.value('Date removed').contains('19 July 2021 by Brian Peashoots')
            card.value('Why it was removed').contains('No longer a risk')
          })

          // These texts are long, so just check for a substring
          page.purposeText.contains('To denote those individuals typically involved in drug or people trafficking')
          page.frequencyText.contains('Every 6 months')
          page.terminationText.contains('Remove at termination. ALT register can be added')
          page.furtherInfoText.contains('There is no legal definition of organised crime in England and Wales.')

          page.beforeItWasRemoved(list => {
            list.value('Notes').contains('Deals in stolen weapons')
            list.value('Most recent review').contains('23 August 2021 by Brian Peashoots')
            list.value('Date added').contains('6 May 2020 by Wamberto Grundy')

            list.actions('Notes').contains('Change').click()
          })
        })
        .shouldDisplayExitPage('delius')
        .thenWhenGoingBack()
        .shouldRenderRiskDetails(flagName, page =>
          page.beforeItWasRemoved(list => list.actions('Most recent review').contains('View review').click()),
        )
        .shouldDisplayExitPage('delius')
    })
  })
})
