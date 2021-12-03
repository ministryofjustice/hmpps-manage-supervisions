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

  get rar() {
    return {
      get errorMessages() {
        return {
          get isRar() {
            return cy.get('#isRar-error')
          },
        }
      },

      radio(name: string) {
        return cy.get('[data-qa="record-outcome/rar"] input[type=radio]').siblings('label').contains(name)
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
  get 'failed-to-attend'() {
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
  get 'add-notes'() {
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
  get notes() {
    return {
      get notesTextField() {
        return cy.get('#notes')
      },
    }
  }
  get sensitive() {
    return {
      get yes() {
        return cy.get('#sensitive-yes')
      },

      get no() {
        return cy.get('#sensitive-no')
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
      get appointment() {
        return cy.get('.qa-appointment .govuk-summary-list__value')
      },

      get compliance() {
        return cy.get('.qa-compliance .govuk-summary-list__value')
      },

      get complianceChangeLink() {
        return cy.get('.qa-compliance .qa-change')
      },

      get outcome() {
        return cy.get('.qa-outcome .govuk-summary-list__value')
      },

      get outcomeChangeLink() {
        return cy.get('.qa-outcome .qa-change')
      },

      get enforcement() {
        return cy.get('.qa-enforcement .govuk-summary-list__value')
      },

      get enforcementChangeLink() {
        return cy.get('.qa-enforcement .qa-change')
      },

      get sensitive() {
        return cy.get('.qa-sensitive .govuk-summary-list__value')
      },

      get sensitiveChangeLink() {
        return cy.get('.qa-sensitive .qa-change')
      },

      get notes() {
        return cy.get('.qa-notes .govuk-summary-list__value')
      },

      get notesChangeLink() {
        return cy.get('.qa-notes .qa-change')
      },
    }
  }
  get confirm() {
    return {
      get timeMessage() {
        return cy.get('span[data-qa="confirm-outcome-appointment/times"]')
      },

      get descriptionMessage() {
        return cy.get('span[data-qa="confirm-outcome-appointment/description"]')
      },

      get finishButton() {
        return cy.get('a[data-qa="confirm-outcome/finish-button"]')
      },
    }
  }
}
