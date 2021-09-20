import { ViewModel } from '../../common'
import { DateTime } from 'luxon'

export interface ExitViewModel extends ViewModel {
  offender: {
    ids: {
      crn: string
      pnc?: string
    }
    displayName: string
    shortName: string
    dateOfBirth?: DateTime
  }
}

export interface DeliusExitViewModel extends ExitViewModel {
  links: {
    deliusContactLog: string
    deliusHomePage: string
  }
}

export interface OASysExitViewModel extends ExitViewModel {
  links: {
    oasysHomePage: string
  }
}
