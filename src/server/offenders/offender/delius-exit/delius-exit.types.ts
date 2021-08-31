import { ViewModel } from '../../../common'
import { DateTime } from 'luxon'

export interface DeliusExitViewModel extends ViewModel {
  ids: {
    crn: string
    pnc?: string
  }
  links: {
    deliusContactLog: string
    deliusHomePage: string
  }
  displayName: string
  shortName: string
  dateOfBirth?: DateTime
}
