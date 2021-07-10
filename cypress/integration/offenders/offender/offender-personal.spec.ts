import { ViewOffenderFixture } from './view-offender.fixture'
import { ADDRESS, OffenderAddressesPage } from '../../../pages/offender-addresses.page'
import { OffenderDisabilitiesPage } from '../../../pages/offender-disabilities.page'
import { OffenderPersonalCircumstancesPage } from '../../../pages/offender-personal-circumstances.page'
import { OffenderPersonalContactPage } from '../../../pages/offender-personal-contact.page'

class Fixture extends ViewOffenderFixture {
  whenClickingViewAllAddresses(): this {
    return this.shouldRenderOffenderTab('personal', page => {
      page.tableValue('contact', 'Other addresses').contains('View all addresses').click()
    })
  }

  whenClickingViewAllDisabilities() {
    return this.shouldRenderOffenderTab('personal', page => {
      page.tableValue('personal', 'Disabilities and adjustments').contains('View details and notes').click()
    })
  }

  whenClickingViewAllPersonalCircumstances() {
    return this.shouldRenderOffenderTab('personal', page => {
      page.tableValue('personal', 'Current circumstances').contains('View details and previous circumstances').click()
    })
  }

  whenClickingViewPersonalContact(name: string) {
    return this.shouldRenderOffenderTab('personal', page => {
      page.tableValue('contact', 'Personal contacts').contains(name).click()
    })
  }

  shouldRenderAddress(type: ADDRESS, expected: ExpectedAddress): this {
    const page = new OffenderAddressesPage()
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
    const page = new OffenderDisabilitiesPage()

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
    const page = new OffenderPersonalCircumstancesPage()
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
    })
    return this
  }

  shouldDisplayPersonalContact(name: string, assert: (page: OffenderPersonalContactPage) => void) {
    const page = new OffenderPersonalContactPage()
    page.pageTitle.contains(name)
    assert(page)
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
  notes?: string
  lastUpdated: string
}

context('ViewOffenderPersonalDetails', () => {
  const fixture = new Fixture()

  beforeEach(() => fixture.reset())

  it('displays personal details', () => {
    fixture
      .havingOffender()
      .whenViewingOffender()
      .whenClickingSubNavTab('personal')
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('personal', page => {
        page.tableValue('contact', 'Mobile number').contains('07734 111992')
        page.tableValue('contact', 'Telephone number').contains('01234 111222')
        page.tableValue('contact', 'Email address').contains('example2@example2.com example@example.com')
        page.tableValue('contact', 'Main address').contains('1 High Street Sheffield South Yorkshire S10 1AG')

        page.viewMainAddressDetails.should('not.have.attr', 'open')
        page.viewMainAddressDetails.contains('View address details').click()
        page.viewMainAddressDetails.should('have.attr', 'open')
        page.mainAddressDetails('Address telephone').contains('0123456789')
        page.mainAddressDetails('Type of address').contains('Approved Premises (verified)')
        page.mainAddressDetails('Start date').contains('16 July 2015')
        page.mainAddressDetails('Notes').contains('Sleeping on sofa')

        page.tableValue('contact', 'Other addresses').contains('1 other current address 1 previous address')
        page.tableValue('contact', 'Personal contacts').contains('Next of Kin: Pippa Wade – Wife')
        page.tableValue('contact', 'Personal contacts').contains('Family member: Jonathon Bacon – Father')

        page.tableValue('personal', 'Name').contains('Brian Cheese')
        page.tableValue('personal', 'Date of birth').contains('10 June 1980')
        page.tableValue('personal', 'Preferred name/Known as').contains('Bob')
        page.tableValue('personal', 'Aliases').contains('Dylan Meyer Romario Montgomery')
        page.tableValue('personal', 'Previous name').contains('Smith')
        page.tableValue('personal', 'Preferred language').contains('Bengali (interpreter required)')
        page
          .tableValue('personal', 'Current circumstances')
          .contains('Employment: Temporary/casual work (30 or more hours per week)')
        page
          .tableValue('personal', 'Disabilities and adjustments')
          .contains('Learning Difficulties: Other Speech Impairment: None')
        page.tableValue('personal', 'CRN').contains('ABC123')
        page.tableValue('personal', 'PNC').contains('2012/123400000F')

        page.tableValue('equality', 'Religion or belief').contains('Christian')
        page.tableValue('equality', 'Sex').contains('Male')
        page.tableValue('equality', 'Gender identity').contains('Prefer to self-describe')
        page.tableValue('equality', 'Self-described gender').contains('Jedi')
        page.tableValue('equality', 'Sexual orientation').contains('Bisexual')
      })
  })

  it('displays all address details', () => {
    fixture
      .havingOffender()
      .whenViewingOffender()
      .whenClickingSubNavTab('personal')
      .whenClickingViewAllAddresses()
      .shouldRenderAddress('main', {
        name: 'Main address - Since 16 July 2015',
        status: 'Main address',
        address: '1 High Street Sheffield South Yorkshire S10 1AG',
        phone: '0123456789',
        type: 'Approved Premises (verified)',
        startDate: '16 July 2015',
        notes: 'Sleeping on sofa',
      })
      .shouldRenderAddress('other', {
        name: 'Secondary address - Since 8 January 2016',
        status: 'Secondary address',
        address: '24 The Mill Sherbourne Street Birmingham West Midlands B16 8TP',
        startDate: '8 January 2016',
      })
      .shouldRenderAddress('previous', {
        name: 'Main address - 16 July 2001 to 16 July 2015',
        status: 'Main address',
        address: 'No fixed abode Tent',
        type: 'Tent (not verified)',
        startDate: '16 July 2001',
        endDate: '16 July 2015',
      })
  })

  it('displays all disability details', () => {
    fixture
      .havingOffender()
      .whenViewingOffender()
      .whenClickingSubNavTab('personal')
      .whenClickingViewAllDisabilities()
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
      .havingOffender()
      .whenViewingOffender()
      .whenClickingSubNavTab('personal')
      .whenClickingViewAllPersonalCircumstances()
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
        notes: 'Divorced',
        lastUpdated: '2 July 2021',
      })
  })

  it('displays personal contact', () => {
    fixture
      .havingOffender()
      .whenViewingOffender()
      .whenClickingSubNavTab('personal')
      .whenClickingViewPersonalContact('Pippa Wade – Wife')
      .shouldDisplayPersonalContact('Next of Kin Pippa Wade – Wife', page => {
        page.value('Name').contains('Pippa Wade')
        page.value('Relationship type').contains('Next of Kin')
        page.value(/^\s*Relationship\s*$/).contains('Wife')
        page.value('Address').contains('64 Ermin Street Wrenthorpe West Yorkshire WF2 8WT')
        page.value('Phone number').contains('07700 900 141')
        page.value('Notes').contains('Divorced')
      })
  })
})
