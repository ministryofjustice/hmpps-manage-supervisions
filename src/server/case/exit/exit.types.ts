import { ViewModel } from '../../common'
import { OffenderExitViewModel, ToDeliusViewModel } from '../../views/partials/exit/exit.types'

export type DeliusExitViewModel = ToDeliusViewModel & ViewModel

export interface OASysExitViewModel extends ViewModel {
  offender: OffenderExitViewModel
  links: {
    oasysHomePage: string
  }
}
