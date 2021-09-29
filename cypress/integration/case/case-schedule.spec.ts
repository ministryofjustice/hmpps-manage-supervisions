import { ViewCaseFixture } from './view-case.fixture'
import { SCHEDULE_TABLE } from '../../pages/case/case.page'
import { DateTime } from 'luxon'
import { Role } from '../../plugins/hmpps-auth'

class Fixture extends ViewCaseFixture {
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

  shouldDisplayEmptyWarning(table: SCHEDULE_TABLE, message: string): this {
    return this.shouldRenderOffenderTab('schedule', page => {
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

context('Case schedule tab', () => {
  const fixture = new Fixture()
  const start = DateTime.now().startOf('day')
  const end = DateTime.now().startOf('day').plus({ hours: 1 })
  describe('populated schedule', () => {
    before(() =>
      cy.seed({
        appointments: [
          {
            appointmentId: 1,
            appointmentStart: '2200-01-02T13:30:00',
            appointmentEnd: '2200-01-02T14:00:00',
            notes: 'Some home visit appointment\n\nWith a new line!',
            outcome: null,
            sensitive: true,
            type: { contactType: 'CHVS', description: 'Home Visit to Case (NS)' },
            staff: { forenames: 'Catherine', surname: 'Ellis', unallocated: false },
            rarActivity: true,
            requirement: {
              isRar: true,
              isActive: true,
            },
          },
          {
            appointmentId: 2,
            appointmentStart: start.toISO(),
            appointmentEnd: end.toISO(),
            notes: 'Some unknown appointment type',
            outcome: {
              attended: true,
              complied: true,
              description: 'Some outcome description',
            },
            sensitive: true,
            type: {
              contactType: 'P123',
              description: 'Some recent appointment',
            },
            staff: { forenames: 'Unallocated', surname: 'Staff', unallocated: true },
            rarActivity: true,
            requirement: {
              isRar: true,
              isActive: true,
            },
          },
        ],
      }),
    )

    it('displays populated offender schedule', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('schedule')
        .shouldDisplayCommonHeader()
        .shouldBeAccessible()

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
        .shouldBeAccessible()
        .shouldDisplayPageWithTitle('Home visit with Catherine Ellis')
    })

    it('can arrange an appointment from offender schedule', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('schedule')
        .shouldRenderOffenderTab('schedule', page => {
          page.arrangeAppointmentButton.contains('Arrange an appointment').click()
          cy.url().should('include', `/arrange-appointment/${fixture.crn}`)
        })
        .shouldBeAccessible()
    })
  })

  describe('empty schedule with read-only role', () => {
    before(() => {
      cy.seed({ appointments: [], role: Role.Read })
    })

    it('displays empty offender schedule', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('schedule')
        .shouldDisplayCommonHeader()
        .shouldDisplayEmptyWarning('future', 'There are no appointments scheduled')
    })

    it('cannot arrange an appointment without write permission', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('schedule')
        .shouldRenderOffenderTab('schedule', page => page.arrangeAppointmentButton.should('not.exist'))
    })
  })
})
