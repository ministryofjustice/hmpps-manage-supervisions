import { ViewCaseFixture } from './view-case.fixture'
import { ADDRESS, CaseAddressesPage } from '../../pages/case/case-addresses.page'
import { CaseDisabilitiesPage } from '../../pages/case/case-disabilities.page'
import { CasePersonalCircumstancesPage } from '../../pages/case/case-personal-circumstances.page'
import { CasePersonalContactPage } from '../../pages/case/case-personal-contact.page'

class Fixture extends ViewCaseFixture {
  whenClickingViewAllAddresses(): this {
    return this.shouldRenderOffenderTab('personal', page => {
      page.contactDetails(card => card.value('Other addresses').contains('View all addresses').click())
    })
  }

  whenClickingViewAllDisabilities() {
    return this.shouldRenderOffenderTab('personal', page => {
      page.personalDetails(card =>
        card.value('Disabilities and adjustments').contains('View details and notes').click(),
      )
    })
  }

  whenClickingViewAllPersonalCircumstances() {
    return this.shouldRenderOffenderTab('personal', page => {
      page.personalDetails(card =>
        card.value('Current circumstances').contains('View details and previous circumstances').click(),
      )
    })
  }

  whenClickingViewPersonalContact(name: string) {
    return this.shouldRenderOffenderTab('personal', page => {
      page.contactDetails(card => card.value('Personal contacts').contains(name).click())
    })
  }

  whenClickingChangeContactDetails(title: string) {
    return this.shouldDisplayPersonalContact(title, page => {
      page.changeContactDetailsLink.click()
    })
  }

  shouldRenderAddress(type: ADDRESS, expected: ExpectedAddress): this {
    const page = new CaseAddressesPage()
    page.pageTitle.contains('Addresses')
    page.addressTitle(type).contains(expected.name)
    page.address(type, 'Status').contains(expected.status)
    page.address(type, 'Address').contains(expected.address)
    if (expected.phone) {
      page.address(type, 'Address telephone').contains(expected.phone)
    } else {
      page.addressCell(type, 'Address telephone').should('not.exist')
    }
    if (expected.type) {
      page.address(type, 'Type of address').contains(expected.type)
    } else {
      page.addressCell(type, 'Type of address').should('not.exist')
    }
    page.address(type, 'Start date').contains(expected.startDate)
    if (expected.endDate) {
      page.address(type, 'End date').contains(expected.endDate)
    } else {
      page.addressCell(type, 'End date').should('not.exist')
    }
    if (expected.notes) {
      page.address(type, 'Notes').contains(expected.notes)
    } else {
      page.addressCell(type, 'Notes').should('not.exist')
    }

    return this
  }

  shouldRenderDisability(expected: ExpectedDisability): this {
    const page = new CaseDisabilitiesPage()

    page.pageTitle.contains('Disabilities and adjustments')
    page.disability(expected.name, card => {
      card.value('Disability').contains(expected.name)
      card.value('Start date').contains(expected.startDate)
      if (expected.endDate) {
        card.value('End date').contains(expected.endDate)
      } else {
        card.cell('End date').should('not.exist')
      }
      if (expected.notes) {
        card.value('Notes').contains(expected.notes)
      } else {
        card.cell('Notes').should('not.exist')
      }

      for (const adjustment of expected.adjustments) {
        card.adjustment(adjustment.name, subject => {
          subject.open()
          subject.value('Adjustment').contains(adjustment.name)
          subject.value('Start date').contains(adjustment.startDate)
          if (adjustment.endDate) {
            subject.value('End date').contains(adjustment.endDate)
          } else {
            subject.cell('End date').should('not.exist')
          }

          if (adjustment.notes) {
            subject.value('Notes').contains(adjustment.notes)
          } else {
            subject.cell('Notes').should('not.exist')
          }
        })
      }

      if (expected.adjustments.length === 0) {
        card.value('Adjustments').contains('None')
      }
    })
    return this
  }

  shouldRenderPersonalCircumstance(expected: ExpectedCircumstance): this {
    const page = new CasePersonalCircumstancesPage()
    page.pageTitle.contains('Personal circumstances')
    page.circumstance(`${expected.type} ${expected.subType}`, card => {
      card.value('Type').contains(expected.type)
      card.value('Sub-type').contains(expected.subType)
      card.value('Start date').contains(expected.startDate)
      if (expected.endDate) {
        card.value('End date').contains(expected.endDate)
      } else {
        card.cell('End date').should('not.exist')
      }
      card.value('Verified').contains(expected.verified ? 'Yes' : 'No')
      card.value('Notes').contains(expected.notes || 'No Notes')
      card.lastUpdated.contains(expected.lastUpdated)
      if (expected.previous) {
        card.previousCircumstance.contains('Previous circumstance')
      }
    })
    return this
  }

  shouldDisplayPersonalContact(name: string, assert: (page: CasePersonalContactPage) => void) {
    const page = new CasePersonalContactPage()
    page.pageTitle.contains(name)
    assert(page)
    return this
  }
}

interface ExpectedAddress {
  name: string
  status: string
  address: string
  phone?: string
  type?: string
  startDate: string
  endDate?: string
  notes?: string
}

interface ExpectedDisability {
  name: string
  startDate: string
  endDate?: string
  notes?: string
  adjustments: {
    name: string
    startDate: string
    endDate?: string
    notes?: string
  }[]
}

interface ExpectedCircumstance {
  type: string
  subType: string
  startDate: string
  endDate?: string
  verified: boolean
  previous: boolean
  notes?: string
  lastUpdated: string
}

context('Case personal details tab', () => {
  const fixture = new Fixture()

  before(() => cy.seed())

  it('displays personal details', () => {
    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('personal')
      .shouldBeAccessible()
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('personal', page => {
        page.contactDetails(card => {
          card.value('Mobile number').contains('07734 111992')
          card.value('Telephone number').contains('01234 111222')
          card.value('Email address').contains('example2@example2.com example@example.com')

          card.value('Main address').contains('1 High Street Sheffield South Yorkshire S10 1AG')
          card.detailsList('Main address', 'View address details', list => {
            list.value('Address telephone').contains('0123456789')
            list.value('Type of address').contains('Approved Premises (verified)')
            list.value('Start date').contains('16 July 2015')
            list.value('Notes').contains('Sleeping on sofa')
          })

          card.value('Other addresses').contains('1 other current address 1 previous address')
          card.value('Personal contacts').contains('Next of Kin: Pippa Wade – Wife')
          card.value('Personal contacts').contains('Family member: Jonathon Bacon – Father')
        })

        page.personalDetails(card => {
          card.value('Name').contains('Liz Danger Haggis')
          card.value('Date of birth').contains('10 June 1980')
          card.value('Preferred name/Known as').contains('Bob')
          card.value('Aliases').contains('Dylan Meyer Romario Montgomery')
          card.value('Previous name').contains('Scotland')
          card.value('Preferred language').contains('Bengali (interpreter required)')
          card.value('Current circumstances').contains('Employment: Temporary/casual work (30 or more hours per week)')
          card.title('Current circumstances').contains('Last updated')
          card.value('Disabilities and adjustments').contains('Learning Difficulties: Other Speech Impairment: None')
          card.title('Disabilities and adjustments').contains('Last updated')
          card.value('Criminogenic needs').contains('Accommodation Alcohol Misuse Drug Misuse')
          card.valueAbbr('CRN').contains(fixture.crn)
          card.valueAbbr('PNC').contains('2012/123400000F')
        })

        page.equalityMonitoring(card => {
          card.value('Religion or belief').contains('Christian')
          card.value('Sex').contains('Female')
          card.value('Gender identity').contains('Prefer to self-describe')
          card.value('Self-described gender').contains('Jedi')
          card.value('Sexual orientation').contains('Bisexual')
        })
      })
  })

  it('links to oasys interstitial from criminogenic needs', () => {
    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('personal')
      .shouldRenderOffenderTab('personal', page => {
        page.personalDetails(card =>
          card.value('Criminogenic needs').find('a').contains('View sentence plan in OASys').click(),
        )
      })
      .shouldDisplayExitPage('oasys')
  })

  it('displays all address details', () => {
    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('personal')
      .whenClickingViewAllAddresses()
      .shouldBeAccessible()
      .shouldRenderAddress('main', {
        name: 'Main address – Since 16 July 2015',
        status: 'Main address',
        address: '1 High Street Sheffield South Yorkshire S10 1AG',
        phone: '0123456789',
        type: 'Approved Premises (verified)',
        startDate: '16 July 2015',
        notes: 'Sleeping on sofa',
      })
      .shouldRenderAddress('other', {
        name: 'Secondary address – Since 8 January 2016',
        status: 'Secondary address',
        address: '24 The Mill Sherbourne Street Birmingham West Midlands B16 8TP',
        startDate: '8 January 2016',
      })
      .shouldRenderAddress('previous', {
        name: 'Main address – 16 July 2001 to 16 July 2015',
        status: 'Main address',
        address: 'No fixed abode Tent',
        type: 'Tent (not verified)',
        startDate: '16 July 2001',
        endDate: '16 July 2015',
      })
  })

  it('displays all disability details', () => {
    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('personal')
      .whenClickingViewAllDisabilities()
      .shouldBeAccessible()
      .shouldRenderDisability({
        name: 'Learning Difficulties',
        startDate: '1 February 2021',
        adjustments: [{ name: 'Other', startDate: '10 May 2021', notes: 'Extra tuition' }],
      })
      .shouldRenderDisability({
        name: 'Speech Impairment',
        startDate: '1 March 2021',
        notes: 'Talks like a pirate',
        adjustments: [],
      })
      .shouldRenderDisability({
        name: 'Dyslexia',
        startDate: '1 April 2020',
        endDate: '1 May 2020',
        adjustments: [],
      })
  })

  it('displays all personal circumstances', () => {
    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('personal')
      .whenClickingViewAllPersonalCircumstances()
      .shouldBeAccessible()
      .shouldRenderPersonalCircumstance({
        type: 'Employment',
        subType: 'Temporary/casual work (30 or more hours per week)',
        startDate: '3 March 2021',
        verified: false,
        lastUpdated: '4 March 2021',
      })
      .shouldRenderPersonalCircumstance({
        type: 'Relationship',
        subType: 'Married / Civil partnership',
        startDate: '1 April 2005',
        endDate: '2 July 2021',
        verified: true,
        previous: true,
        notes: 'Divorced',
        lastUpdated: '2 July 2021',
      })
  })

  it('displays personal contact', () => {
    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('personal')
      .whenClickingViewPersonalContact('Pippa Wade – Wife')
      .shouldBeAccessible()
      .shouldDisplayPersonalContact('Next of Kin Pippa Wade – Wife', page => {
        page.value('Name').contains('Pippa Wade')
        page.value('Relationship type').contains('Next of Kin')
        page.value(/^\s*Relationship\s*$/).contains('Wife')
        page.value('Address').contains('64 Ermin Street Wrenthorpe West Yorkshire WF2 8WT')
        page.value('Phone number').contains('07700 900 141')
        page.value('Notes').contains('Divorced')
      })
      .whenClickingChangeContactDetails('Pippa Wade – Wife')
      .shouldDisplayExitPage('delius')
  })
})
