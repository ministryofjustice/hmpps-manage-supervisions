import { OffenderPage, TABLE, TABS } from '../../pages/offender.page'
import { StubOffenderAppointmentOptions } from '../../mockApis/community-api'
import { DateTime } from 'luxon'
import { getDateRange } from '../../util/getDateRange'

const crn = 'ABC123'
const convictionId = 12345

context('ViewOffender', () => {
  const page = new OffenderPage()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubGetStaffDetails')
  })

  it('requires authentication', () => {
    cy.viewOffender('somecrn')
    cy.task('getLoginAttempts').should('have.length', 1)
  })

  it('displays offender overview', () => {
    havingViewedOffender()

    // redirects to overview page by default
    page.currentTab.should('eq', 'overview')

    whenClickingSubNavTab('overview')
    shouldDisplayCommonHeader()
  })

  it('displays populated offender schedule', () => {
    const future = getDateRange('future', { hour: 13, minute: 30 }, { minutes: 30 })
    const recent = getDateRange('past', { hour: 10, minute: 0 }, { hour: 1 })
    havingOffenderAppointments(
      {
        ...future,
        type: { code: 'F123', name: 'Future appointment' },
        staff: { forenames: 'Future first', surname: 'Future last' },
      },
      {
        ...recent,
        type: { code: 'P123', name: 'Recent appointment' },
        staff: { forenames: 'Recent first', surname: 'Recent last' },
      },
    )
    havingViewedOffender()
    whenClickingSubNavTab('schedule')
    shouldDisplayCommonHeader()

    shouldRenderAppointmentTableFurniture('future', 'Future appointments')
    shouldRenderAppointmentTableRow(
      'future',
      0,
      future.start,
      '1:30pm to 2pm',
      'Future appointment with Future first Future last',
    )

    shouldRenderAppointmentTableFurniture('recent', 'Recent appointments')
    shouldRenderAppointmentTableRow(
      'recent',
      0,
      recent.start,
      '10am to 11am',
      'Recent appointment with Recent first Recent last',
    )
  })

  it('displays empty offender schedule', () => {
    havingOffenderAppointments()
    havingViewedOffender()
    whenClickingSubNavTab('schedule')
    shouldDisplayCommonHeader()

    shouldDisplayEmptyWarning('future', 'Future appointments', 'There are no future appointments scheduled.')
    shouldDisplayEmptyWarning('recent', 'Recent appointments', 'There have been no recent appointments.')
  })

  it('can arrange an appointment from offender schedule', () => {
    havingOffenderAppointments()
    havingViewedOffender()
    whenClickingSubNavTab('schedule')
    page.arrangeAppointmentButton.contains('Arrange an appointment').click()
    cy.url().should('include', `/arrange-appointment/${crn}`)
  })

  function havingOffenderAppointments(...partials: StubOffenderAppointmentOptions['partials']) {
    cy.task('stubOffenderAppointments', { crn, partials })
  }

  function havingViewedOffender() {
    cy.task('stubOffenderDetails', { crn })
    cy.task('stubGetConvictions', { crn, convictionId })
    cy.task('stubGetRequirements', { crn, convictionId })
    cy.login()
    cy.viewOffender(crn)
  }

  function whenClickingSubNavTab(tab: TABS) {
    page.subNavTab(tab).click()
    page.currentTab.should('eq', tab)
  }

  function shouldDisplayCommonHeader() {
    page.pageTitle.contains(`CRN: ${crn}`)
    page.pageTitle.contains('Brian Cheese')
  }

  function shouldRenderAppointmentTableFurniture(table: TABLE, caption: string) {
    page.schedule.emptyHeader(table).should('not.exist')
    page.schedule.tableCaption(table).contains(caption)
    page.schedule.tableHeader(table, 'date').contains('Date')
    page.schedule.tableHeader(table, 'time').contains('Time')
    page.schedule.tableHeader(table, 'appointment').contains('Appointment')
  }

  function shouldRenderAppointmentTableRow(table: TABLE, row: number, date: string, time: string, name: string) {
    page.schedule.tableData(table, row, 'date').contains(DateTime.fromISO(date).toFormat('cccc d MMMM yyyy'))
    page.schedule.tableData(table, row, 'time').contains(time)
    page.schedule.tableData(table, row, 'appointment').contains(name)
  }

  function shouldDisplayEmptyWarning(table: TABLE, title: string, message: string) {
    page.schedule.emptyHeader(table).contains(title)
    page.schedule.emptyMessage(table).contains(message)
  }
})
