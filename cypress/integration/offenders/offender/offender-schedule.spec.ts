import { ViewOffenderFixture } from './view-offender.fixture'
import { getDateRange } from '../../../util/getDateRange'
import { TABLE } from '../../../pages/offender.page'
import { DateTime } from 'luxon'

class Fixture extends ViewOffenderFixture {
  shouldRenderAppointmentTableFurniture(table: TABLE, caption: string): this {
    return this.shouldRenderOffenderTab('schedule', page => {
      page.emptyHeader(table).should('not.exist')
      page.tableCaption(table).contains(caption)
      page.tableHeader(table, 'date').contains('Date')
      page.tableHeader(table, 'time').contains('Time')
      page.tableHeader(table, 'appointment').contains('Appointment')
    })
  }

  shouldRenderAppointmentTableRow(table: TABLE, row: number, date: string, time: string, name: string): this {
    return this.shouldRenderOffenderTab('schedule', page => {
      page.tableData(table, row, 'date').contains(DateTime.fromISO(date).toFormat('cccc d MMMM yyyy'))
      page.tableData(table, row, 'time').contains(time)
      page.tableData(table, row, 'appointment').contains(name)
    })
  }

  shouldDisplayEmptyWarning(table: TABLE, title: string, message: string): this {
    return this.shouldRenderOffenderTab('schedule', page => {
      page.emptyHeader(table).contains(title)
      page.emptyMessage(table).contains(message)
    })
  }
}

context('ViewOffenderSchedule', () => {
  const fixture = new Fixture()

  beforeEach(() => fixture.reset())

  it('displays populated offender schedule', () => {
    const future = getDateRange('future', { hour: 13, minute: 30 }, { minutes: 30 })
    const recent = getDateRange('past', { hour: 10, minute: 0 }, { hour: 1 })
    fixture
      .havingOffender({
        appointments: [
          {
            ...future,
            type: { code: 'F123', name: 'Future appointment' },
            staff: { forenames: 'Future First', surname: 'Future Last' },
          },
          {
            ...recent,
            type: { code: 'P123', name: 'Recent appointment' },
            staff: { forenames: 'Recent First', surname: 'Recent Last' },
          },
        ],
      })
      .whenViewingOffender()
      .whenClickingSubNavTab('schedule')
      .shouldDisplayCommonHeader()

      .shouldRenderAppointmentTableFurniture('future', 'Future appointments')
      .shouldRenderAppointmentTableRow(
        'future',
        0,
        future.start,
        '1:30pm to 2pm',
        'Future appointment with Future First Future Last',
      )

      .shouldRenderAppointmentTableFurniture('recent', 'Recent appointments')
      .shouldRenderAppointmentTableRow(
        'recent',
        0,
        recent.start,
        '10am to 11am',
        'Recent appointment with Recent First Recent Last',
      )
  })

  it('displays empty offender schedule', () => {
    fixture
      .havingOffender()
      .whenViewingOffender()
      .whenClickingSubNavTab('schedule')
      .shouldDisplayCommonHeader()
      .shouldDisplayEmptyWarning('future', 'Future appointments', 'There are no future appointments scheduled.')
      .shouldDisplayEmptyWarning('recent', 'Recent appointments', 'There have been no recent appointments.')
  })

  it('can arrange an appointment from offender schedule', () => {
    fixture
      .havingOffender()
      .whenViewingOffender()
      .whenClickingSubNavTab('schedule')
      .shouldRenderOffenderTab('schedule', page => {
        page.arrangeAppointmentButton.contains('Arrange an appointment').click()
        cy.url().should('include', '/arrange-appointment/ABC123')
      })
  })
})
