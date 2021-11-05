import { DateTime } from 'luxon'

export interface OffenderExitViewModel {
  displayName: string
  shortName: string
  dateOfBirth?: DateTime
  ids: { crn: string; pnc?: string }
}

export interface ToDeliusViewModel {
  offender: OffenderExitViewModel
  links: {
    /**
     * If provided then render 'Go directly to offender on Delius' section
     */
    deliusContactLog?: string

    /**
     * If provided then render 'Go to the Delius homepage' section
     */
    deliusHomePage?: string
  }
}
