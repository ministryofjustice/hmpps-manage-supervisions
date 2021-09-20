import { PageBase } from '../page'
import { SummaryList, SummaryListCallback } from '../components/summary-list'

export type ExitPageName = keyof typeof CaseExitPage.TITLES

export class CaseExitPage extends PageBase {
  static TITLES = {
    delius: 'Continue on National Delius',
    oasys: 'Continue on OASys',
  }

  get delius() {
    return {
      get contactLog() {
        return cy.get('a[data-qa="offender/to-delius/contact-log"]')
      },

      get contactLogTitle() {
        return cy.get('[data-qa="offender/to-delius/contact-log-title"]')
      },

      get homepage() {
        return cy.get('a[data-qa="offender/to-delius/homepage"]')
      },

      get homepageExplanation() {
        return cy.get('[data-qa="offender/to-delius/homepage-explanation"]')
      },
    }
  }

  get oasys() {
    return {
      get homepage() {
        return cy.get('a[data-qa="offender/to-oasys/homepage"]')
      },

      get homepageExplanation() {
        return cy.get('[data-qa="offender/to-oasys/homepage-explanation"]')
      },
    }
  }

  offenderDetails(callback: SummaryListCallback) {
    SummaryList.selectFromQa('offender/exit/offender-details', callback)
  }
}
