import { ViewOffenderFixture } from './view-offender.fixture'
import { TABLE } from '../../../pages/offender.page'

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
      page.tableData(table, row, 'date').contains(date)
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

  describe('populated schedule', () => {
    before(() => cy.seed())

    it('displays populated offender schedule', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('schedule')
        .shouldDisplayCommonHeader()

        .shouldRenderAppointmentTableFurniture('future', 'Future appointments')
        .shouldRenderAppointmentTableRow(
          'future',
          0,
          'Thursday 2 January 2200',
          '1:30pm to 2pm',
          'Home visit with Catherine Ellis',
        )

        .shouldRenderAppointmentTableFurniture('recent', 'Recent appointments')
        .shouldRenderAppointmentTableRow(
          'recent',
          0,
          'Monday 3 February 2020',
          '10am to 11am',
          'Some recent appointment',
        )
    })
  })

  describe('empty schedule', () => {
    before(() => {
      cy.seed({ appointments: [] })
    })

    it('displays empty offender schedule', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('schedule')
        .shouldDisplayCommonHeader()
        .shouldDisplayEmptyWarning('future', 'Future appointments', 'There are no future appointments scheduled.')
        .shouldDisplayEmptyWarning('recent', 'Recent appointments', 'There have been no recent appointments.')
    })

    it('can arrange an appointment from offender schedule', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('schedule')
        .shouldRenderOffenderTab('schedule', page => {
          page.arrangeAppointmentButton.contains('Arrange an appointment').click()
          cy.url().should('include', `/arrange-appointment/${fixture.crn}`)
        })
    })
  })
})
