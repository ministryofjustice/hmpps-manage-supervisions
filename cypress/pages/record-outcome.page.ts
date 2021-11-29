import { PageBase } from './page'

export class RecordOutcomePage extends PageBase {
  get continueButton() {
    return cy.get('button[data-qa="wizard/continue-button"]')
  }
  get landingPageContinueButton() {
    return cy.get('[data-qa="wizard/continue"]')
  }

  get backLink() {
    return cy.get('.govuk-back-link')
  }

  get errorSummary() {
    return cy.get('#error-summary-title')
  }

  get init() {
    return {
      get appointmentDetails() {
        return cy.get('[data-qa="record-outcome/appointment-details"]')
      },
    }
  }

  get compliance() {
    return {
      get compliedYes() {
        return cy.get('#complied-yes')
      },
      get compliedNoFailedToAttend() {
        return cy.get('#complied-no-not-attended')
      },
      get errorMessages() {
        return {
          get compliance() {
            return cy.get('#compliance-error')
          },
        }
      },
      get compliedNo() {
        return cy.get('#complied-no')
      },
    }
  }

  get outcome() {
    return {
      get outcomeRadios() {
        return cy.get('[data-qa="record-outcome/outcome"]')
      },
      get errorMessages() {
        return {
          get outcome() {
            return cy.get('#outcome-error')
          },
        }
      },
      radio(name: string) {
        return cy.get('[data-qa="record-outcome/outcome"] input[type=radio]').siblings('label').contains(name)
      },
    }
  }
  get failedToAttend() {
    return {
      get yes() {
        return cy.get('#acceptableAbsence-acceptable')
      },

      get no() {
        return cy.get('#acceptableAbsence-unacceptable')
      },
      get errorMessages() {
        return {
          get acceptableAbsence() {
            return cy.get('#acceptableAbsence-error')
          },
        }
      },
      get absenceRadios() {
        return cy.get('[data-qa="record-outcome/acceptableAbsence"]')
      },
    }
  }

  get enforcement() {
    return {
      select(name: string) {
        return cy.get('#record-outcome-enforcement-select').select(name)
      },
      get errorMessages() {
        return {
          get enforcement() {
            return cy.get('#record-outcome-enforcement-select-error')
          },
        }
      },
    }
  }
  get addNotes() {
    return {
      get yes() {
        return cy.get('#addNotes-yes')
      },

      get no() {
        return cy.get('#addNotes-no')
      },
      get errorMessages() {
        return {
          get addNotes() {
            return cy.get('#addNotes-error')
          },
        }
      },
      get addNotesRadios() {
        return cy.get('[data-qa="record-outcome/addNotes"]')
      },
    }
  }
}
