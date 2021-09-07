import { ViewOffenderFixture } from './view-offender.fixture'
import { SCHEDULE_TABLE } from '../../../pages/offender.page'
import { DateTime } from 'luxon'

class Fixture extends ViewOffenderFixture {
  shouldRenderAppointmentTableFurniture(table: SCHEDULE_TABLE): this {
    return this.shouldRenderOffenderTab('schedule', page => {
      page.emptyHeader(table).should('not.exist')
      page.tableHeader(table, 'date').contains('Date')
      page.tableHeader(table, 'time').contains('Time')
      page.tableHeader(table, 'appointment').contains('Appointment')
    })
  }

  shouldRenderAppointmentTableRow(
    table: SCHEDULE_TABLE,
    row: number,
    start: DateTime,
    end: DateTime,
    name: string,
  ): this {
    const isToday = new Date() === start.toJSDate()
    return this.shouldRenderOffenderTab('schedule', page => {
      page
        .tableData(table, row, 'date')
        .contains(isToday ? 'Today '.concat(this.longDate(start)) : this.longDate(start))
      page.tableData(table, row, 'time').contains(`${this.time(start)} to ${this.time(end)}`)
      page.tableData(table, row, 'appointment').contains(name)
    })
  }

  shouldDisplayEmptyWarning(table: SCHEDULE_TABLE, title: string, message: string): this {
    return this.shouldRenderOffenderTab('schedule', page => {
      page.emptyHeader(table).contains(title)
      page.emptyMessage(table).contains(message)
    })
  }
  longDate(date: DateTime) {
    const format = date.year === DateTime.now().year ? 'cccc d MMMM' : 'cccc d MMMM yyyy'
    return date.toFormat(format)
  }
  time(date: DateTime) {
    const hourMinuteFormat = date.minute === 0 ? 'ha' : 'h:mma'
    return date.toFormat(hourMinuteFormat).toLowerCase()
  }
}

context('Offender schedule tab', () => {
  const fixture = new Fixture()
  const start = DateTime.now().startOf('day')
  const end = DateTime.now().startOf('day').plus({ hour: 1 })
  describe('populated schedule', () => {
    before(() => cy.seed())

    it('displays populated offender schedule', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('schedule')
        .shouldDisplayCommonHeader()

        .shouldRenderAppointmentTableFurniture('future')
        .shouldRenderAppointmentTableRow('future', 0, start, end, 'Some recent appointment')
        .shouldRenderAppointmentTableRow(
          'future',
          1,
          DateTime.fromISO('2200-01-02T13:30:00'),
          DateTime.fromISO('2200-01-02T14:00:00'),
          'Home visit with Catherine Ellis',
        )
    })

    it('renders appointment detail (the content of this page is tested in the activity log)', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('schedule')
        .shouldRenderOffenderTab('schedule', page => {
          page.tableData('future', 1, 'appointment').contains('Home visit with Catherine Ellis').click()
        })
        .shouldDisplayPageWithTitle('Home visit with Catherine Ellis')
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
