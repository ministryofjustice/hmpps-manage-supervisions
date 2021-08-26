import { OffenderRemovedRisksPage } from '../../../pages/offender-removed-risks.page'
import { OffenderRiskDetailPage } from '../../../pages/offender-risk-detail.page'
import { ViewOffenderFixture } from './view-offender.fixture'

class Fixture extends ViewOffenderFixture {
  shouldRenderRiskDetails(pageTitle: string, assert: (page: OffenderRiskDetailPage) => void): this {
    const page = new OffenderRiskDetailPage()
    page.pageTitle.contains(pageTitle)
    assert(page)
    return this
  }

  shouldRenderRemovedRiskFlagPage(assert: (page: OffenderRemovedRisksPage) => void): this {
    const page = new OffenderRemovedRisksPage()
    page.pageTitle.contains('Removed risk flags')
    assert(page)
    return this
  }
}

context('ViewOffenderPersonalDetails', () => {
  const fixture = new Fixture()

  describe('empty risk page', () => {
    before(() => cy.seed({ risks: null, registrations: [] }))

    it('displays no risk assessment warning', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('risk')
        .shouldDisplayCommonHeader()
        .shouldRenderOffenderTab('risk', page => {
          page.noRisksWarning.contains('There is no OASys risk assessment for Liz Haggis')
          page.noActiveRegistrations.contains('There are no current risk flags. Add risk flags in Delius.')
        })
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
          page.roshCommunity(card => {
            card.value('Overall').contains('Very high risk of serious harm')
            card.value('Very high risk').contains('Children Staff')
            card.value('High risk').contains('Public')
            card.title('Medium risk').should('not.exist')
            card.value('Low risk').contains('Known Adult')
            card.value('Who is at risk').contains('Someone at risk')
            card.value('Nature of risk').contains('Some nature of risk')
            card.value('When is risk greatest').contains('Some risk imminence')
          })

          page.roshThemselves(card => {
            card.value('Risk of suicide or self harm').contains('There are concerns about self-harm and suicide')
            card.details(
              'Coping in custody or a hostel',
              'There were concerns about coping in a hostel and in custody',
              () => {
                page.currentNotes.contains('No detail given')
                page.previousNotes.contains(
                  'Soluta tempore nemo et velit est perspiciatis. Neque error aut est nemo quasi. Et labore impedit omnis numquam id et eaque facere itaque. Ipsam et atque eos tempora possimus.',
                )
              },
            )
            card.value('Vulnerability').contains('No concerns')
          })

          page.riskFlags(table => {
            table.cell(0, 0).contains('Alert Notice')
            table.cell(0, 1).contains('Major alert about this offender')
            table.cell(0, 2).contains('2 January 2022')
          })

          page.viewInactiveRegistrations.contains('View removed risk flags (2)')
          page.noActiveRegistrations.should('not.exist')
        })
    })
  })

  describe('risk detail page', () => {
    before(() => cy.seed())
    it('displays risk details', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('risk')
        .shouldRenderOffenderTab('risk', page => {
          page.whenClickingRiskRegistration('Alert Notice')
        })
        .shouldRenderRiskDetails('Alert Notice', page => {
          page.registrationDetails(card => {
            card.value('Notes').contains('Major alert about this offender')
            card.value('Next review').contains('2 January 2022')
            card.value('Most recent review').contains('23 August 2021 by Cindy Legford')
            card.value('Date added').contains('14 May 2020 by Yolanda Gubbins')
          })

          // These texts are long, so just check for a substring
          page.purposeText.contains('To distribute priority information/warning/alerts relating to an offender')
          page.frequencyText.contains('Every 6 months')
          page.terminationText.contains("Don't remove at termination")
          page.furtherInfoText.contains('Should only be used when a national alert notice has been issued')
        })
    })
  })

  describe('removed risk list page', () => {
    before(() => cy.seed())
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
  })

  describe('removed risk detail page', () => {
    before(() => cy.seed())
    it('displays removed risk details', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('risk')
        .shouldRenderOffenderTab('risk', page => {
          page.viewInactiveRegistrations.children().click()
        })
        .shouldRenderRemovedRiskFlagPage(page => {
          page.whenClickingRiskRegistration('Organised Crime')
        })
        .shouldRenderRiskDetails('Organised Crime', page => {
          page.beforeItWasRemoved(card => {
            card.value('Notes').contains('Deals in stolen weapons')
            card.value('Next review').contains('2 January 2022')
            card.value('Most recent review').contains('23 August 2021 by Brian Peashoots')
            card.value('Date added').contains('6 May 2020 by Wamberto Grundy')
          })

          page.removalDetails(card => {
            card.value('Date removed').contains('19 July 2021 by Brian Peashoots')
            card.value('Why it was removed').contains('No longer a risk')
          })
          // These texts are long, so just check for a substring
          page.purposeText.contains('To denote those individuals typically involved in drug or people trafficking')
          page.frequencyText.contains('Every 6 months')
          page.terminationText.contains('Remove at termination. ALT register can be added')
          page.furtherInfoText.contains('There is no legal definition of organised crime in England and Wales.')
        })
    })
  })
})
