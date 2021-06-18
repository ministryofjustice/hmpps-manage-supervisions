import { OffenderPage, TABLE, TABS } from '../../pages/offender.page'
import { StubContactSummaryOptions, StubOffenderAppointmentOptions } from '../../mockApis/community-api'
import { DateTime } from 'luxon'
import { getDateRange } from '../../util/getDateRange'
import * as faker from 'faker'

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
        staff: { forenames: 'Future First', surname: 'Future Last' },
      },
      {
        ...recent,
        type: { code: 'P123', name: 'Recent appointment' },
        staff: { forenames: 'Recent First', surname: 'Recent Last' },
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
      'Future appointment with Future First Future Last',
    )

    shouldRenderAppointmentTableFurniture('recent', 'Recent appointments')
    shouldRenderAppointmentTableRow(
      'recent',
      0,
      recent.start,
      '10am to 11am',
      'Recent appointment with Recent First Recent Last',
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

  it('can add log entry from activity log', () => {
    havingOffenderContacts()
    havingViewedOffender()
    whenClickingSubNavTab('activity')
    page.activity.addToLogButton.contains('Add to log').click()
    cy.url().should('include', `/offender/${crn}/activity/new`)
  })

  it('displays empty activity log', () => {
    havingOffenderContacts()
    havingViewedOffender()
    whenClickingSubNavTab('activity')
    shouldDisplayCommonHeader()
    page.activity.emptyMessage.contains('There are no entries in the activity log.')
  })

  it('displays activity log', () => {
    const longNotes = faker.lorem.sentence(300)
    havingOffenderContacts(
      {
        type: { code: 'CHVS' },
        contactStart: '2020-09-04T12:00:00+01:00',
        contactEnd: '2020-09-04T13:00:00+01:00',
        notes: 'Some home visit appointment',
        outcome: { complied: true, attended: true },
      },
      {
        type: { code: 'APAT' },
        contactStart: '2020-09-03T10:30:00+01:00',
        contactEnd: '2020-09-03T11:15:00+01:00',
        notes: longNotes,
        staff: { unallocated: true },
        outcome: { complied: false, attended: true },
      },
      {
        type: { code: 'APAT' },
        contactStart: '2020-09-03T10:30:00+01:00',
        contactEnd: '2020-09-03T11:15:00+01:00',
        notes: longNotes,
        staff: { unallocated: true },
        outcome: { complied: true, attended: false },
        sensitive: true,
      },
      {
        type: { code: 'APAT' },
        contactStart: '2020-09-03T10:30:00+01:00',
        contactEnd: '2020-09-03T11:15:00+01:00',
        notes: longNotes,
        staff: { unallocated: true },
        outcome: { complied: false, attended: false },
        rarActivity: true,
      },
      {
        type: { code: 'NOT_WELL_KNOWN', description: 'Not a well known appointment', appointment: true },
        contactStart: '2020-09-02T11:00:00+01:00',
        contactEnd: '2020-09-02T13:00:00+01:00',
        notes: 'Some unknown appointment',
        outcome: null,
      },
    )
    havingViewedOffender()
    whenClickingSubNavTab('activity')
    shouldDisplayCommonHeader()

    shouldRenderActivity({
      id: 1,
      date: 'Friday 4 September 2020',
      time: '12pm to 1pm',
      name: 'Home visit with Mark Berridge',
      notes: 'Some home visit appointment',
      tags: [{ colour: 'green', text: 'complied' }],
    })

    shouldRenderActivity({
      id: 2,
      date: 'Thursday 3 September 2020',
      time: '10:30am to 11:15am',
      name: 'Office visit',
      notes: longNotes,
      tags: [{ colour: 'red', text: 'failed to comply' }],
      havingLongNotes: true,
    })

    shouldRenderActivity({
      id: 3,
      date: 'Thursday 3 September 2020',
      time: '10:30am to 11:15am',
      name: 'Office visit',
      notes: longNotes,
      tags: [
        { colour: 'grey', text: 'sensitive' },
        { colour: 'green', text: 'acceptable absence' },
      ],
      havingLongNotes: true,
    })

    shouldRenderActivity({
      id: 4,
      date: 'Thursday 3 September 2020',
      time: '10:30am to 11:15am',
      name: 'Office visit',
      notes: longNotes,
      tags: [
        { colour: 'purple', text: 'rar' },
        { colour: 'red', text: 'unacceptable absence' },
      ],
      havingLongNotes: true,
    })

    shouldRenderActivity({
      id: 5,
      date: 'Wednesday 2 September 2020',
      time: '11am to 1pm',
      name: 'Not a well known appointment with Mark Berridge',
      notes: 'Some unknown appointment',
      havingAttendanceMissing: true,
    })
  })

  it('displays personal details', () => {
    havingViewedOffender()
    whenClickingSubNavTab('personal')
    shouldDisplayCommonHeader()

    page.personal.tableValue('contact', 'Address').contains('1 High Street Sheffield South Yorkshire S10 1AG')
    page.personal.tableValue('contact', 'Phone number').contains('07734 111992 01234 111222')
    page.personal.tableValue('contact', 'Email').contains('example@example.com example2@example2.com')

    page.personal.tableValue('personal', 'Name').contains('Brian Cheese')
    page.personal.tableValue('personal', 'Aliases').contains('Dylan Meyer Romario Montgomery')
    page.personal.tableValue('personal', 'Date of birth').contains('10 June 1980')
    page.personal.tableValue('personal', 'Preferred language').contains('Bengali')
    page.personal
      .tableValue('personal', 'Disabilities and adjustments')
      .contains('Learning Difficulties Speech Impairment')
  })

  function shouldRenderActivity({
    id,
    date,
    time,
    name,
    notes,
    tags = [],
    havingAttendanceMissing = false,
    havingLongNotes = false,
  }: {
    id: number
    date: string
    time: string
    name: string
    notes: string
    tags?: { colour: string; text: string }[]
    havingAttendanceMissing?: boolean
    havingLongNotes?: boolean
  }) {
    const link = `/offender/${crn}/appointment/${id}`
    const entry = page.activity.entry(id)
    entry.title.contains(date).contains(time)
    entry.title.children(`a[href="${link}"]`).contains(name)

    entry.tags.should('have.length', tags.length)
    for (const { colour, text } of tags) {
      entry.tags.contains(text).should('have.class', `govuk-tag--${colour}`)
    }

    if (havingLongNotes) {
      entry.notes.contains(notes.substr(0, 200)) // just assert first 200 chars as it can cut off in the last word
      entry.longNotesLink.contains('View full details').should('have.attr', 'href').and('include', link)
    } else {
      entry.notes.contains(notes)
    }

    if (havingAttendanceMissing) {
      entry.attendanceMissing.contains('Attendance not recorded')
      entry.attendanceMissing
        .get(`a[href="/offender/${crn}/appointment/${id}/record-outcome"]`)
        .contains('Record attendance')
    }
  }

  function havingOffenderAppointments(...partials: StubOffenderAppointmentOptions['partials']) {
    cy.task('stubOffenderAppointments', { crn, partials })
  }

  function havingOffenderContacts(...partials: StubContactSummaryOptions['partials']) {
    cy.task('stubContactSummary', { crn, partials })
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
