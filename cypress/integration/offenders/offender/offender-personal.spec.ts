import { ViewOffenderFixture } from './view-offender.fixture'
import { ADDRESS, OffenderAddressesPage } from '../../../pages/offender-addresses.page'

class Fixture extends ViewOffenderFixture {
  whenClickingViewAllAddresses(): this {
    return this.shouldRenderOffenderTab('personal', page => {
      page.tableValue('contact', 'Other addresses').contains('View all addresses').click()
    })
  }

  shouldRenderAddressesPage(assert: (page: OffenderAddressesPage) => void): this {
    const addresses = new OffenderAddressesPage()
    assert(addresses)
    return this
  }

  shouldRenderAddress(type: ADDRESS, expected: ExpectedAddress) {
    return this.shouldRenderAddressesPage(page => {
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
    })
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
        page.tableValue('contact', 'Personal contacts').contains('Next of Kin: Pippa Wade - Wife')
        page.tableValue('contact', 'Personal contacts').contains('Family member: Jonathon Bacon - Father')

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
      .shouldRenderAddressesPage(page => {
        page.header.contains('Addresses')
      })
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
})
