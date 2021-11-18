import { DateTime } from 'luxon'
import { ArrangeAppointmentPage } from '../pages'
import { AppointmentCreateRequest } from '../../src/server/community-api/client'
import { getDateRange } from '../util/getDateRange'

export function testCase(partial: Omit<AppointmentBookingTestCase, 'start' | 'end'>) {
  const { start, end } = getDateRange('future')
  return {
    ...partial,
    start: DateTime.fromISO(start),
    end: DateTime.fromISO(end),
  }
}

export interface AppointmentBookingTestCase {
  start: DateTime
  end: DateTime
  type: {
    code: string
    name: string
  }
  location?: {
    code: string
    name: string
  }
  addNotes?: boolean
  notes?: string
  sensitive: boolean
  crn: string
  firstName: string
  phoneNumber?: string
}

export class ArrangeAppointmentFixture {
  page = new ArrangeAppointmentPage()

  whenSubmittingCurrentStep() {
    this.page.continueButton.click()
    return this
  }

  whenSelectingTypeRadio(name: string) {
    this.page.pageTitle.contains('What type of appointment are you arranging?')
    this.page.type.radio(name).click()
    return this
  }

  whenSelectingIsRar(value: boolean) {
    this.page.pageTitle.contains('Will this be a RAR session?')
    if (value) {
      this.page.rar.yes.click()
    } else {
      this.page.rar.no.click()
    }
    return this
  }

  whenSelectingOtherAppointmentType(search: string, { type }: AppointmentBookingTestCase) {
    if (!search) {
      this.page.type.otherAutoComplete.click()
    } else {
      this.page.type.otherAutoComplete.type(search)
    }

    this.page.type.autoCompleteResult(type.name).click()
    return this
  }

  whenSelectingLocationRadio(name: string) {
    this.page.pageTitle.contains('Where will the appointment be?')
    if (!name) {
      this.page.where.firstRadio().click()
    } else {
      this.page.where.radio(name).click()
    }
    return this
  }

  whenEnteringAppointmentDateAndTimes({ start, end }: AppointmentBookingTestCase) {
    this.whenEnteringDate(start)
    this.whenEnteringStartTime(start)
    this.whenEnteringEndTime(end)
    this.page.continueButton.click()
    return this
  }

  whenAskingToEnterNotes({ addNotes }: AppointmentBookingTestCase) {
    this.page.pageTitle.contains('Would you like to add notes about this appointment?')
    addNotes ? this.page.addNotes.yesField.click() : this.page.addNotes.noField.click()
    this.page.continueButton.click()
    return this
  }

  whenEnteringNotes({ addNotes, notes }: AppointmentBookingTestCase) {
    if (addNotes) {
      this.page.pageTitle.contains('Add appointment notes')
      this.page.notes.notesField.type(notes)
      this.page.continueButton.click()
    }
    return this
  }

  whenSelectingSensitive({ sensitive }: AppointmentBookingTestCase) {
    this.page.pageTitle.contains('Does this appointment include sensitive information?')
    this.page.sensitive.radio(sensitive).click()
    this.page.continueButton.click()
    return this
  }

  whenClickingFinish() {
    this.page.confirm.finishButton.click()
  }

  shouldDisplayCorrectAppointmentSummary(
    {
      start,
      end,
      type,
      addNotes,
      notes,
      sensitive,
      location: { name: locationDescription },
      crn,
    }: AppointmentBookingTestCase,
    checkLocationLink: boolean,
  ) {
    this.page.pageTitle.contains('Check your answers')
    this.page.check.appointmentType.contains(type.name)
    this.page.check.appointmentTypeChangeLink
      .should('have.attr', 'href')
      .and('include', `${crn}/arrange-appointment/type`)

    if (locationDescription) {
      this.page.check.appointmentLocation.contains(locationDescription)
    }

    if (checkLocationLink) {
      this.page.check.appointmentLocationChangeLink
        .should('have.attr', 'href')
        .and('include', `${crn}/arrange-appointment/where`)
    }

    this.page.check.appointmentDate.contains(this.longDate(start))
    this.page.check.appointmentDateChangeLink
      .should('have.attr', 'href')
      .and('include', `${crn}/arrange-appointment/when`)

    this.page.check.appointmentTime.contains(`${this.time(start)} to ${this.time(end)}`)
    this.page.check.appointmentTimeChangeLink
      .should('have.attr', 'href')
      .and('include', `${crn}/arrange-appointment/when`)

    this.page.check.notes.contains(addNotes ? notes : 'None')
    this.page.check.notesChangeLink.should('have.attr', 'href').and('include', `${crn}/arrange-appointment/notes`)

    this.page.check.sensitive.contains(sensitive ? 'Yes' : 'No')
    this.page.check.sensitiveChangeLink
      .should('have.attr', 'href')
      .and('include', `${crn}/arrange-appointment/sensitive`)
    return this
  }

  longDate(date: DateTime) {
    const format = date.year === DateTime.now().year ? 'cccc d MMMM' : 'cccc d MMMM yyyy'
    return date.toFormat(format)
  }

  time(date: DateTime) {
    const hourMinuteFormat = date.minute === 0 ? 'ha' : 'h:mma'
    return date.toFormat(hourMinuteFormat).toLowerCase()
  }

  shouldDisplayClashError({ crn }: AppointmentBookingTestCase) {
    this.page.pageTitle.contains('You need to choose a different appointment slot')
    this.page.check.appointmentDateChangeLink
      .should('have.attr', 'href')
      .and('include', `${crn}/arrange-appointment/when`)
  }

  shouldDisplayAppointmentBookingConfirmation({
    start,
    type,
    firstName,
    phoneNumber,
    crn,
  }: AppointmentBookingTestCase) {
    this.page.pageTitle.contains('Appointment arranged')
    this.page.confirm.descriptionMessage.contains(type.name)
    this.page.confirm.timeMessage.contains(`${this.longDate(start)} from ${this.time(start)}`)
    this.page.confirm.phoneMessage.contains(firstName)
    if (phoneNumber) {
      this.page.confirm.phoneMessage.contains(phoneNumber)
    }
    this.page.confirm.finishButton.should('have.attr', 'href').and('include', `case/${crn}/overview`)
    return this
  }

  shouldHaveBookedAppointment({ start, end, type, location, notes, sensitive }: AppointmentBookingTestCase) {
    cy.task<AppointmentCreateRequest[]>('getCreatedAppointments')
      .then(apts => apts.find(a => a.contactType === type.code))
      .should('deep.eq', {
        providerCode: 'N07',
        staffCode: 'CRSSTAFF1',
        teamCode: 'N07UAT',
        appointmentStart: start.toISO(),
        appointmentEnd: end.toISO(),
        contactType: type.code,
        officeLocationCode: location?.code,
        notes,
        sensitive,
      })
    return this
  }

  shouldRenderTypeValidationMessages(expected: { type?: string; other?: string }) {
    this.page.documentTitle.contains('Error')
    this.page.errorSummary.contains('There is a problem')
    for (const name of Object.keys(this.page.type.errorMessages)) {
      if (expected[name]) {
        this.page.type.errorMessages[name].contains(expected[name])
      } else {
        this.page.type.errorMessages[name].should('not.exist')
      }
    }
    return this
  }

  shouldRenderLocationValidationMessages(expected: string) {
    this.page.documentTitle.contains('Error')
    this.page.errorSummary.contains('There is a problem')
    this.page.where.errorMessages.location.contains(expected)
    return this
  }

  shouldRedirectToLocationUnavailablePage() {
    this.page.pageTitle.contains('Arrange an appointment in another location')
    this.page.documentTitle.contains('Arrange an appointment in another location')
    return this
  }

  shouldRedirectToRarUnavailablePage() {
    this.page.pageTitle.contains('You need to arrange this appointment on National Delius')
    this.page.documentTitle.contains('You need to arrange this appointment on National Delius')
    return this
  }

  whenEnteringDate(date: DateTime) {
    this.whenEnteringDateStrings(date.day.toString(), date.month.toString(), date.year.toString())
    return this
  }

  whenEnteringDateStrings(day: string, month: string, year: string) {
    this.page.when.dayField.clear()
    this.page.when.monthField.clear()
    this.page.when.yearField.clear()
    if (day) this.page.when.dayField.type(day)
    if (month) this.page.when.monthField.type(month)
    if (year) this.page.when.yearField.type(year)
    return this
  }

  whenEnteringStartTime(time: DateTime) {
    this.page.when.startTimeField.clear().type(time.toFormat('h:mma').toString()).type('{esc}')
    return this
  }

  whenEnteringEndTime(time: DateTime) {
    this.page.when.endTimeField.clear().type(time.toFormat('h:mma').toString()).type('{esc}')
    return this
  }

  aStartTimeErrorIsShown(message: string) {
    this.page.when.startTimeErrorMessage.contains(message)
    return this
  }

  aEndTimeErrorIsShown(message: string) {
    this.page.when.endTimeErrorMessage.contains(message)
    return this
  }

  aDateErrorIsShown(message: string) {
    this.page.when.dateErrorMessage.contains(message)
    return this
  }

  offendersCircumstancesAreShown() {
    this.page.when.circumstancesDetailLink.click()
    this.page.when.preferredLaguageText.contains('Bengali')
    this.page.when.disabilitiesText.contains('Learning Difficulties')
    this.page.when.employmentText.contains('Temporary/casual work (30 or more hours per week)')
    return this
  }

  shouldBeAccessible() {
    cy.testA11y()
    return this
  }

  attemptBookingOtherAppointment(test: AppointmentBookingTestCase) {
    let locationEntered = false
    this.whenSelectingTypeRadio('Other')
      .whenSelectingOtherAppointmentType(test.type.name.substring(0, Math.max(10, test.type.name.length - 1)), test)
      .whenSubmittingCurrentStep()

      .whenSelectingIsRar(false)
      .whenSubmittingCurrentStep()

    this.page.pageTitle.then(el => {
      console.log(el.text())
      if (el.text().trim() == 'Where will the appointment be?') {
        this.whenSelectingLocationRadio(test.location.name).whenSubmittingCurrentStep()
        locationEntered = true
      }
    })

    this.whenEnteringAppointmentDateAndTimes(test)

      .whenAskingToEnterNotes(test)
      .whenEnteringNotes(test)

      .whenSelectingSensitive(test)

      .shouldDisplayCorrectAppointmentSummary(test, locationEntered)

      .whenSubmittingCurrentStep()

    return this
  }

  getOtherContactTypes(CRN: string) {
    cy.arrangeAppointment(CRN)

    this.whenSelectingTypeRadio('Other')
    this.page.type.otherAutoComplete.click()
    return this.page.type.allOtherOptions()
  }
}
