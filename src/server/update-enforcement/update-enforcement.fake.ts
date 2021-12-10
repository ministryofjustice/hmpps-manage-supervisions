import { UpdateEnforcementAppointmentSummary } from './update-enforcement.types'
import { fake } from '../util/util.fake'
import * as faker from 'faker'

export const fakeUpdateEnforcementAppointmentSummary = fake<UpdateEnforcementAppointmentSummary>(() => ({
  id: faker.datatype.number(),
  name: faker.company.bs(),
  outcomeCode: faker.datatype.uuid(),
  enforcementCode: faker.datatype.uuid(),
  contactTypeCode: faker.datatype.uuid(),
}))
