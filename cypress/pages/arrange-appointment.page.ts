import { PageBase } from './page'

export class ArrangeAppointmentPage extends PageBase {
  get continueButton() {
    return cy.get('button[data-qa="wizard/continue-button"]')
  }

  get backLink() {
    return cy.get('.govuk-back-link')
  }

  get type() {
    return {
      radio(name: string) {
        return cy
          .get(`[data-qa="arrange-appointment/featured-type"] input[type=radio]`)
          .siblings('label')
          .contains(name)
      },

      get otherAutoComplete() {
        return cy.get('#arrange-appointment-other-select')
      },

      autoCompleteResult(name: string) {
        return cy.get('#arrange-appointment-other-select__listbox > li').contains(name)
      },

      get errorMessages() {
        return {
          get type() {
            return cy.get('#type-error')
          },

          get other() {
            return cy.get('#arrange-appointment-other-select-error')
          },
        }
      },
    }
  }

  get rar() {
    return {
      get yes() {
        return cy.get('#isRar-yes')
      },

      get no() {
        return cy.get('#isRar-no')
      },

      get errorMessages() {
        return {
          get isRar() {
            return cy.get('#isRar-error')
          },
        }
      },
    }
  }

  get where() {
    return {
      radio(name: string) {
        return cy.get(`[data-qa="arrange-appointment/location"] input[type=radio]`).siblings('label').contains(name)
      },

      get errorMessages() {
        return {
          get location() {
            return cy.get('#location-error')
          },
        }
      },
    }
  }

  get when() {
    return {
      get dayField() {
        return cy.get('input[name="date[day]"]')
      },

      get monthField() {
        return cy.get('input[name="date[month]"]')
      },

      get yearField() {
        return cy.get('input[name="date[year]"]')
      },

      get startTimeField() {
        return cy.get('input[name="startTime"]')
      },

      get endTimeField() {
        return cy.get('input[name="endTime"]')
      },

      get startTimeErrorMessage() {
        return cy.get('#startTime-error')
      },

      get endTimeErrorMessage() {
        return cy.get('#endTime-error')
      },

      get dateErrorMessage() {
        return cy.get('#session-date-error')
      },
      get circumstancesDetailLink() {
        return cy.get('.govuk-details__summary-text')
      },
      get preferredLaguageText() {
        return cy.get('[data-qa="arrange-appointment/where/language"]')
      },
      get disabilitiesText() {
        return cy.get('[data-qa="arrange-appointment/where/disabilities"]')
      },
      get employmentText() {
        return cy.get('[data-qa="arrange-appointment/where/employment"]')
      },
    }
  }

  get addNotes() {
    return {
      get yesField() {
        return cy.get('#addNotes')
      },
      get noField() {
        return cy.get('#addNotes-no')
      },
      get errorMessages() {
        return {
          get addNotes() {
            return cy.get('#addNotes-error')
          },
        }
      },
    }
  }

  get notes() {
    return {
      get notesField() {
        return cy.get('#notes')
      },
    }
  }

  get sensitive() {
    return {
      radio(value: boolean) {
        const label = value ? 'Yes, it includes sensitive information' : 'No, it is not sensitive'
        return cy.get(`[data-qa="arrange-appointment/sensitive"] input[type=radio]`).siblings('label').contains(label)
      },

      get help() {
        return cy.get('details[data-qa="arrange-appointment/sensitive-help"]')
      },

      get helpText() {
        return this.help.get('.govuk-details__text')
      },

      get errorMessages() {
        return {
          get sensitive() {
            return cy.get('#sensitive-error')
          },
        }
      },
    }
  }

  get check() {
    return {
      get appointmentType() {
        return cy.get('.qa-type .govuk-summary-list__value')
      },

      get appointmentTypeChangeLink() {
        return cy.get('.qa-type .qa-change')
      },

      get appointmentLocation() {
        return cy.get('.qa-location .govuk-summary-list__value')
      },

      get appointmentLocationChangeLink() {
        return cy.get('.qa-location .qa-change')
      },

      get appointmentDate() {
        return cy.get('.qa-date .govuk-summary-list__value')
      },

      get appointmentDateChangeLink() {
        return cy.get('.qa-date .qa-change')
      },

      get appointmentTime() {
        return cy.get('.qa-time .govuk-summary-list__value')
      },

      get appointmentTimeChangeLink() {
        return cy.get('.qa-time .qa-change')
      },
      get notes() {
        return cy.get('.qa-notes .govuk-summary-list__value')
      },

      get notesChangeLink() {
        return cy.get('.qa-notes .qa-change')
      },

      get sensitive() {
        return cy.get('.qa-sensitive .govuk-summary-list__value')
      },

      get sensitiveChangeLink() {
        return cy.get('.qa-sensitive .qa-change')
      },
    }
  }

  get confirm() {
    return {
      get timeMessage() {
        return cy.get('span[data-qa="confirm-appointment/times"]')
      },

      get descriptionMessage() {
        return cy.get('span[data-qa="confirm-appointment/description"]')
      },

      get phoneMessage() {
        return cy.get('span[data-qa="confirm-appointment/phone"]')
      },

      get finishButton() {
        return cy.get('a[data-qa="confirm-appointment/finish-button"]')
      },
    }
  }

  get errorSummary() {
    return cy.get('#error-summary-title')
  }
}
