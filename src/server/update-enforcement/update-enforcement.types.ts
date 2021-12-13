import { ViewModel } from '../common'
import { EnforcementAction } from '../community-api/client'
import { IsString, ValidationError } from 'class-validator'
import { ValidationGroup } from '../validators'
import { IsInFn } from '../validators/IsInFn'
import { ExposeDefault } from '../util/mapping'

export interface UpdateEnforcementAppointmentSummary {
  id: number
  name: string
  contactTypeCode: string
  outcomeCode: string
  enforcementCode?: string
}

export interface UpdateEnforcementViewModel extends ViewModel {
  enforcementActions: EnforcementAction[]
  enforcement?: string
  paths: {
    back: string
  }
  errors?: ValidationError[]
}

export const ENFORCEMENT_GROUP = 'enforcement'

export class UpdateEnforcementDto {
  @ExposeDefault()
  enforcementActions: EnforcementAction[]

  @ExposeDefault({ groups: [ENFORCEMENT_GROUP] })
  @IsString({ message: 'Select an enforcement' })
  @ValidationGroup({ message: 'Select an enforcement' }, IsString, options =>
    IsInFn((obj: UpdateEnforcementDto) => obj.enforcementActions?.map(x => x.code), options),
  )
  enforcement?: string
}
