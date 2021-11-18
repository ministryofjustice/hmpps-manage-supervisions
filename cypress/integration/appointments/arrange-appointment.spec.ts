import { ArrangeAppointmentPage } from '../../pages'
import { DateTime } from 'luxon'

import { ArrangeAppointmentFixture, testCase } from '../../fixtures/arrange-appointment.fixture'
import { CRN, OFFENDER } from '../../plugins/offender'

context('Arrange appointment happy path & validation', () => {
  const page = new ArrangeAppointmentPage()
  const fixture = new ArrangeAppointmentFixture()

  before(() => {
    cy.seed()
  })

  it('can book an office visit appointment', () => {
    const test = testCase({
      type: { code: 'COAP', name: 'Office visit' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      addNotes: true,
      notes: 'These are some notes',
      sensitive: true,
      crn: CRN,
      firstName: OFFENDER.firstName,
      phoneNumber: OFFENDER.contactDetails.phoneNumbers[0].number,
    })

    cy.arrangeAppointment()

    fixture
      .shouldBeAccessible()
      .whenSelectingTypeRadio(test.type.name)
      .whenSubmittingCurrentStep()

      .shouldBeAccessible()

      .whenSelectingIsRar(false)
      .whenSubmittingCurrentStep()

      .shouldBeAccessible()

      .whenSelectingLocationRadio(test.location.name)
      .whenSubmittingCurrentStep()

      .shouldBeAccessible()

      .whenEnteringAppointmentDateAndTimes(test)

      .shouldBeAccessible()

      .whenAskingToEnterNotes(test)
      .whenEnteringNotes(test)

      .whenSelectingSensitive(test)

      .shouldBeAccessible()

      .shouldDisplayCorrectAppointmentSummary(test, true)

      .whenSubmittingCurrentStep()
      .shouldDisplayAppointmentBookingConfirmation(test)

      .shouldHaveBookedAppointment(test)

      .shouldBeAccessible()
  })

  it('can book an "other" appointment by searching', () => {
    const test = testCase({
      type: { code: 'C243', name: 'Alcohol Group Work Session (NS)' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      sensitive: false,
      addNotes: true,
      notes: 'These are some notes',
      crn: CRN,
      firstName: OFFENDER.firstName,
      phoneNumber: OFFENDER.contactDetails.phoneNumbers[0].number,
    })
    cy.arrangeAppointment()

    fixture
      .attemptBookingOtherAppointment(test)
      .shouldDisplayAppointmentBookingConfirmation(test)
      .shouldHaveBookedAppointment(test)
  })

  it('displays page about adjusting the time if there is a clash', () => {
    cy.seed({ appointmentBookingStatus: 409 })
    const test = testCase({
      type: { code: 'C243', name: 'Alcohol Group Work Session (NS)' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      sensitive: false,
      addNotes: true,
      notes: 'These are some notes',
      crn: CRN,
      firstName: OFFENDER.firstName,
      phoneNumber: OFFENDER.contactDetails.phoneNumbers[0].number,
    })
    cy.arrangeAppointment()

    fixture.attemptBookingOtherAppointment(test).shouldDisplayClashError(test)
  })

  it('displays page about adjusting the time if there is a bad request', () => {
    cy.seed({ appointmentBookingStatus: 400 })
    const test = testCase({
      type: { code: 'C243', name: 'Alcohol Group Work Session (NS)' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      sensitive: false,
      addNotes: true,
      notes: 'These are some notes',
      crn: CRN,
      firstName: OFFENDER.firstName,
      phoneNumber: OFFENDER.contactDetails.phoneNumbers[0].number,
    })
    cy.arrangeAppointment()

    fixture.attemptBookingOtherAppointment(test).shouldDisplayClashError(test)
  })

  it('validates appointment type', () => {
    cy.arrangeAppointment()

    // nothing selected
    fixture
      .whenSubmittingCurrentStep()
      .shouldRenderTypeValidationMessages({
        type: 'Select an appointment type',
      })

      // select 'other' but do not select an 'other' type
      .whenSelectingTypeRadio('Other')
      .whenSubmittingCurrentStep()
      .shouldRenderTypeValidationMessages({
        other: 'Select an appointment type',
      })

      .shouldBeAccessible()
  })

  it('validates location', () => {
    const test = testCase({
      type: { code: 'APAT', name: 'Office visit' },
      sensitive: true,
      crn: CRN,
      firstName: OFFENDER.firstName,
      phoneNumber: OFFENDER.contactDetails.phoneNumbers[0].number,
    })

    cy.arrangeAppointment()

    fixture
      .whenSelectingTypeRadio(test.type.name)
      .whenSubmittingCurrentStep()

      .whenSelectingIsRar(false)
      .whenSubmittingCurrentStep()

      // nothing selected
      .whenSubmittingCurrentStep()
      .shouldRenderLocationValidationMessages('Select a location')

      .shouldBeAccessible()
  })

  it('redirects to unavailable when unavailable location selected', () => {
    cy.arrangeAppointment()

    fixture
      .whenSelectingTypeRadio('Office visit')
      .whenSubmittingCurrentStep()

      .whenSelectingIsRar(false)
      .whenSubmittingCurrentStep()

      .whenSelectingLocationRadio('The location I’m looking for is not in this list')
      .whenSubmittingCurrentStep()
      .shouldRedirectToLocationUnavailablePage()

      .shouldBeAccessible()
  })

  it('validates rar options and redirects to unavailable when rar selected', () => {
    cy.arrangeAppointment()

    fixture
      .whenSelectingTypeRadio('Office visit')
      .whenSubmittingCurrentStep()

      .whenSubmittingCurrentStep()
    page.rar.errorMessages.isRar.contains('Select yes if this appointment will count towards RAR')

    fixture
      .whenSelectingIsRar(true)
      .whenSubmittingCurrentStep()

      .shouldRedirectToRarUnavailablePage()

      .shouldBeAccessible()
  })

  it('validates time and dates', () => {
    const test = testCase({
      type: { code: 'CHVS', name: 'Home visit' },
      sensitive: true,
      crn: CRN,
      firstName: OFFENDER.firstName,
      phoneNumber: OFFENDER.contactDetails.phoneNumbers[0].number,
    })

    cy.arrangeAppointment()

    fixture
      .whenSelectingTypeRadio(test.type.name)
      .whenSubmittingCurrentStep()

      .whenSelectingIsRar(false)
      .whenSubmittingCurrentStep()

      .offendersCircumstancesAreShown()

      .whenEnteringDateStrings('', '', '')
      .whenSubmittingCurrentStep()
      .aDateErrorIsShown('Enter the date of the appointment')

      .whenEnteringDateStrings('80', '', '')
      .whenSubmittingCurrentStep()
      .aDateErrorIsShown('Date must include a month and year')

      .whenEnteringDateStrings('', '20', '')
      .whenSubmittingCurrentStep()
      .aDateErrorIsShown('Date must include a day and year')

      .whenEnteringDateStrings('80', '20', '6')
      .whenSubmittingCurrentStep()
      .aDateErrorIsShown('Date must be a real date')
      .aStartTimeErrorIsShown('Enter a valid start time')
      .aEndTimeErrorIsShown('Enter a valid end time')

      .whenEnteringDateStrings('15', '01', '2021')
      .whenSubmittingCurrentStep()
      .aDateErrorIsShown('Enter a date in the future')
      .aStartTimeErrorIsShown('Enter a valid start time')
      .aEndTimeErrorIsShown('Enter a valid end time')

    const now = DateTime.now()

    fixture
      .whenEnteringDate(now)
      .whenEnteringStartTime(now)
      .whenSubmittingCurrentStep()
      .aStartTimeErrorIsShown('Enter a time in the future')

      .whenEnteringEndTime(now.minus({ minutes: 1 }))
      .whenSubmittingCurrentStep()
      .aStartTimeErrorIsShown('Enter a time in the future')
      .aEndTimeErrorIsShown('Enter an end time after the start time')

      .shouldBeAccessible()
  })

  it('validates selecting to add notes', () => {
    const test = testCase({
      type: { code: 'APAT', name: 'Office visit' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      notes: 'Some note text',
      sensitive: true,
      crn: CRN,
      firstName: OFFENDER.firstName,
      phoneNumber: OFFENDER.contactDetails.phoneNumbers[0].number,
    })

    cy.arrangeAppointment()

    fixture
      .whenSelectingTypeRadio(test.type.name)
      .whenSubmittingCurrentStep()

      .whenSelectingIsRar(false)
      .whenSubmittingCurrentStep()

      .whenSelectingLocationRadio(test.location.name)
      .whenSubmittingCurrentStep()

      .whenEnteringAppointmentDateAndTimes(test)

    page.pageTitle.contains('Would you like to add notes about this appointment?')

    // nothing selected
    fixture.whenSubmittingCurrentStep()
    page.addNotes.errorMessages.addNotes.contains('Select yes if you would like to add notes')

    // no skips to sensitive page
    fixture.whenAskingToEnterNotes({ ...test, addNotes: false })
    page.pageTitle.contains('Does this appointment include sensitive information?')
    page.backLink.click()

    // yes goes to notes entry page
    fixture
      .whenAskingToEnterNotes({ ...test, addNotes: true })
      .whenEnteringNotes(test)

      .shouldBeAccessible()
  })

  it('validates sensitive & sensitive help text', () => {
    const test = testCase({
      type: { code: 'APAT', name: 'Office visit' },
      location: { code: 'LDN_BCR', name: '29/33 VICTORIA ROAD' },
      addNotes: true,
      notes: 'Some note text',
      sensitive: true,
      crn: CRN,
      firstName: OFFENDER.firstName,
      phoneNumber: OFFENDER.contactDetails.phoneNumbers[0].number,
    })

    cy.arrangeAppointment()

    fixture
      .whenSelectingTypeRadio(test.type.name)
      .whenSubmittingCurrentStep()

      .whenSelectingIsRar(false)
      .whenSubmittingCurrentStep()

      .whenSelectingLocationRadio(test.location.name)
      .whenSubmittingCurrentStep()

      .whenEnteringAppointmentDateAndTimes(test)

      .whenAskingToEnterNotes(test)
      .whenEnteringNotes(test)

    page.sensitive.help.should('not.have.attr', 'open')
    page.sensitive.help.contains('Help with sensitive content').click()
    page.sensitive.help.should('have.attr', 'open')
    page.sensitive.helpText.contains('Marking information as sensitive means that')

    // nothing selected
    fixture.whenSubmittingCurrentStep()
    page.sensitive.errorMessages.sensitive.contains('Select yes if the appointment contains sensitive information')

    fixture.shouldBeAccessible()
  })
})
