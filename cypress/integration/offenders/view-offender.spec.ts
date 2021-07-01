import { OffenderPage, TABLE, TABS } from '../../pages/offender.page'
import {
  StubContactSummaryOptions,
  StubGetConvictionsOptions,
  StubOffenderAppointmentOptions,
} from '../../mockApis/community-api'
import { DateTime } from 'luxon'
import { getDateRange } from '../../util/getDateRange'
import * as faker from 'faker'

const crn = 'ABC123'

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
    const past = getDateRange('past', { hour: 10, minute: 0 }, { hour: 1 })
    havingOffender({
      convictions: { previous: true },
      appointments: [
        { start: '2100-05-25T12:00:00+01:00', end: '2100-05-25T13:00:00+01:00' },
        { ...past, outcome: { complied: true, attended: true } },
        { ...past, outcome: { complied: false, attended: true } },
        { ...past, outcome: { complied: true, attended: false } },
      ],
    })
    whenViewedOffender()

    // redirects to overview page by default
    page.currentTab.should('eq', 'overview')

    whenClickingSubNavTab('overview')
    shouldDisplayCommonHeader()

    page.overview.mainOffence.contains(
      'Cheats at gambling or enables or assists person to cheat (Gambling Act 2005) - 07539',
    )
    page.overview.additionalOffences.contains('Assault on Police Officer - 10400')

    page.overview.sentence.contains('ORA Community Order')
    page.overview.progress('Sentence').contains('12 months elapsed (of 12 months)')
    page.overview.progress('RAR').contains('5 days completed (of 20 days)')

    page.overview.previousOrders.contains('Previous orders (1) Last ended on 1 December 2020')

    page.overview.nextAppointment.contains(
      `The next appointment is Tuesday 25 May 2100 at 12pm Office visit with Some Staff`,
    )
    page.overview.appointmentAttendance.contains('1 Complied')
    page.overview.appointmentAttendance.contains('1 Acceptable absence')
    page.overview.appointmentAttendance.contains('1 Failure to comply')
  })

  it('displays populated offender schedule', () => {
    const future = getDateRange('future', { hour: 13, minute: 30 }, { minutes: 30 })
    const recent = getDateRange('past', { hour: 10, minute: 0 }, { hour: 1 })
    havingOffender({
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
    whenViewedOffender()
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
    havingOffender()
    whenViewedOffender()
    whenClickingSubNavTab('schedule')
    shouldDisplayCommonHeader()

    shouldDisplayEmptyWarning('future', 'Future appointments', 'There are no future appointments scheduled.')
    shouldDisplayEmptyWarning('recent', 'Recent appointments', 'There have been no recent appointments.')
  })

  it('can arrange an appointment from offender schedule', () => {
    havingOffender()
    whenViewedOffender()
    whenClickingSubNavTab('schedule')
    page.arrangeAppointmentButton.contains('Arrange an appointment').click()
    cy.url().should('include', `/arrange-appointment/${crn}`)
  })

  it('can add log entry from activity log', () => {
    havingOffender()
    havingOffenderContacts()
    whenViewedOffender()
    whenClickingSubNavTab('activity')
    page.activity.addToLogButton.contains('Add to log').click()
    cy.url().should('include', `/offender/${crn}/activity/new`)
  })

  it('displays empty activity log', () => {
    havingOffender()
    havingOffenderContacts()
    whenViewedOffender()
    whenClickingSubNavTab('activity')
    shouldDisplayCommonHeader()
    page.activity.emptyMessage.contains('There are no entries in the activity log.')
  })

  it('displays activity log', () => {
    const longNotes = faker.lorem.sentence(300)
    havingOffender()
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

    whenViewedOffender()
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
    havingOffender()
    whenViewedOffender()
    whenClickingSubNavTab('personal')
    shouldDisplayCommonHeader()

    page.personal.tableValue('contact', 'Mobile number').contains('07734 111992')
    page.personal.tableValue('contact', 'Telephone number').contains('01234 111222')
    page.personal.tableValue('contact', 'Email address').contains('example2@example2.com example@example.com')
    page.personal.tableValue('contact', 'Main address').contains('1 High Street Sheffield South Yorkshire S10 1AG')

    // TODO main address details

    page.personal.tableValue('contact', 'Other addresses').contains('1 other current address 1 previous address')
    page.personal.tableValue('contact', 'Personal contacts').contains('Next of Kin: Pippa Wade - Wife')
    page.personal.tableValue('contact', 'Personal contacts').contains('Family member: Jonathon Bacon - Father')

    page.personal.tableValue('personal', 'Name').contains('Brian Cheese')
    page.personal.tableValue('personal', 'Date of birth').contains('10 June 1980')
    page.personal.tableValue('personal', 'Preferred name/Known as').contains('Bob')
    page.personal.tableValue('personal', 'Aliases').contains('Dylan Meyer Romario Montgomery')
    page.personal.tableValue('personal', 'Previous name').contains('Smith')
    page.personal.tableValue('personal', 'Preferred language').contains('Bengali (interpreter required)')
    page.personal
      .tableValue('personal', 'Current circumstances')
      .contains('Employment: Temporary/casual work (30 or more hours per week)')
    page.personal
      .tableValue('personal', 'Disabilities and adjustments')
      .contains('Learning Difficulties: Other Speech Impairment: None')
    page.personal.tableValue('personal', 'CRN').contains(crn)
    page.personal.tableValue('personal', 'PNC').contains('2012/123400000F')

    page.personal.tableValue('equality', 'Religion or belief').contains('Christian')
    page.personal.tableValue('equality', 'Sex').contains('Male')
    page.personal.tableValue('equality', 'Gender identity').contains('Prefer to self-describe')
    page.personal.tableValue('equality', 'Self-described gender').contains('Jedi')
    page.personal.tableValue('equality', 'Sexual orientation').contains('Bisexual')
  })

  it('displays sentence details', () => {
    havingOffender({ convictions: { previous: true } })

    whenViewedOffender()
    whenClickingSubNavTab('sentence')

    shouldDisplayCommonHeader()

    page.sentence
      .mainOffence('Main offence')
      .contains('Cheats at gambling or enables or assists person to cheat (Gambling Act 2005) - 07539')
    page.sentence.mainOffence('Offence date').contains('1 February 2021')
    page.sentence.additionalOffence('M2500297061', 'Additional offence').contains('Assault on Police Officer - 10400')
    page.sentence.additionalOffence('M2500297061', 'Offence date').contains('9 September 2019')

    page.sentence.details('Sentence').contains('ORA Community Order')
    page.sentence.details('Length').contains('12 months')
    page.sentence.details('Start date').contains('17 February 2020')
    page.sentence.details('End date').contains('16 February 2021')
    page.sentence.details('Time elapsed').contains('12 months elapsed (of 12 months)')
    page.sentence.details('Conviction date').contains('5 February 2020')
    page.sentence.details('Court').contains('Nottingham Crown Court')
    page.sentence.details('Responsible court').contains('Sheffield Magistrates Court')

    page.sentence.requirements('RAR').contains('20 days')

    page.sentence.previous.contains('Previous orders (1) Last ended on 1 December 2020')
  })

  it('displays empty sentence details', () => {
    havingOffender({ convictions: { current: false } })
    whenViewedOffender()

    whenClickingSubNavTab('sentence')
    shouldDisplayCommonHeader()

    page.sentence.noOffences.contains('Offence details are unavailable.')
    page.sentence.noDetails.contains('Sentence details are unavailable.')
    page.sentence.previous.should('not.exist')
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

  function havingOffenderContacts(...partials: StubContactSummaryOptions['partials']) {
    cy.task('stubContactSummary', { crn, partials })
  }

  function havingOffender(
    options: {
      convictions?: Omit<StubGetConvictionsOptions, 'crn'>
      appointments?: StubOffenderAppointmentOptions['partials']
    } = {},
  ) {
    cy.task('stubOffenderDetails', { crn })
    cy.task('stubGetConvictions', { crn, ...options.convictions })
    cy.task('stubGetRequirements', { crn })
    cy.task('stubOffenderAppointments', { crn, partials: options.appointments })
    cy.task('stubGetPersonalCircumstances', { crn })
    cy.task('stubGetPersonalContacts', { crn })
    cy.task('stubOffenderRegistrations', { crn })
    cy.task('stubOffenderRisks', { crn })
  }

  function whenViewedOffender() {
    cy.login()
    cy.viewOffender(crn)
  }

  function whenClickingSubNavTab(tab: TABS) {
    page.subNavTab(tab).click()
    page.currentTab.should('eq', tab)
  }

  function shouldDisplayCommonHeader() {
    page.pageTitle.contains(`CRN: ${crn}`)
    page.pageTitle.contains('Brian Cheese (Bob)')
    page.registrations.should('have.length', 2)
    console.log(page.registrations)
    page.registrations.contains('High RoSH').parent().should('have.class', 'govuk-tag--red')
    page.registrations.contains('Restraining Order').parent().should('have.class', 'govuk-tag--orange')
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
