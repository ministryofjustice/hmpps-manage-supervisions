import { seedModule } from './wiremock'
import { SeedTeamOfficeLocationsOptions, teamOfficeLocations } from './teams'
import {
  AppointmentDetail,
  ContactSummary,
  Conviction,
  OffenderDetail,
  PersonalCircumstance,
  PersonalContact,
  Registration,
  Requirement,
  StaffDetails,
} from '../../src/server/community-api/client'
import { appointmentTypes } from './appointment-types'
import { staff } from './staff'
import { get, set } from 'lodash'
import { AllRoshRiskDto } from '../../src/server/assess-risks-and-needs-api'
import { CRN, offender } from './offender'
import { ACTIVE_CONVICTION_ID, convictions } from './convictions'
import { personalContacts } from './personal-contacts'
import { personalCircumstances } from './personal-circumstances'
import { registrations } from './registrations'
import { risks } from './risks'
import { requirements } from './requirements'
import { appointments } from './appointments'
import { contacts } from './contacts'
import { contactTypes } from './contact-types'

/**
 * Resets the wiremock server, this should always be the first seed module loaded.
 */
export const reset = seedModule({ title: 'Reset' }, async context => {
  await context.client.reset()
  await Promise.all([
    context.client.community.stubPing(),
    context.client.assessRisksAndNeeds.stubPing(),
    context.client.hmppsAuth.stubPing(),
  ])
})

export interface ReferenceDataSeedOptions extends SeedTeamOfficeLocationsOptions {
  staff?: DeepPartial<StaffDetails>
}

/**
 * Seed reference data: contact types, appointment types, team office locations, staff details
 */
export function referenceDataSeed(options: ReferenceDataSeedOptions = {}) {
  return seedModule(
    { title: 'Reference data' },
    appointmentTypes,
    contactTypes,
    teamOfficeLocations(options),
    staff(options.staff),
  )
}

function getOrSet<T>(object: any, path: string, value: T): T {
  let result = get(object, path)
  if (!result) {
    result = value
    set(object, path, result)
  }
  return result
}

export interface OffenderSeedOptions {
  offender?: DeepPartial<OffenderDetail>
  personalContacts?: DeepPartial<PersonalContact>[]
  personalCircumstances?: DeepPartial<PersonalCircumstance>[]
  registrations?: DeepPartial<Registration>[]
  risks?: DeepPartial<AllRoshRiskDto>
  convictions?: { active: DeepPartial<Conviction> | null; previous: DeepPartial<Conviction>[] }
  requirements?: DeepPartial<Requirement>[]
}

/**
 * Seeds offenders based on specified partials or just Liz Haggis otherwise.
 */
export function offenderSeed(options: OffenderSeedOptions = {}) {
  // create some common identifiers so all tasks can run async
  const crn = getOrSet(options, 'offender.otherIds.crn', CRN)
  const activeConvictionId =
    options.convictions?.active === null
      ? null // pass in null for the active conviction to remove it, otherwise Liz's active conviction will be used.
      : getOrSet(options, 'convictions.active.convictionId', ACTIVE_CONVICTION_ID)

  return seedModule(
    { title: 'Offender' },
    offender(options.offender),
    personalContacts(crn, options.personalContacts),
    personalCircumstances(crn, options.personalCircumstances),
    registrations(crn, options.registrations),
    risks(crn, options.risks),
    convictions(crn, options.convictions?.active, options.convictions?.previous),
    ...(activeConvictionId ? [requirements(crn, activeConvictionId, options.requirements)] : []),
  )
}

export interface ContactSeedOptions {
  crn?: string
  activeConvictionId?: number
  appointments?: DeepPartial<AppointmentDetail>[]
  contacts?: DeepPartial<ContactSummary>[]
}

/**
 * Seeds contacts & contact derived data.
 */
export function contactsSeed({
  crn = CRN,
  activeConvictionId = ACTIVE_CONVICTION_ID,
  ...options
}: ContactSeedOptions = {}) {
  return seedModule(
    { title: 'Contacts' },
    appointments(crn, activeConvictionId, options.appointments),
    contacts(crn, options.contacts),
  )
}
