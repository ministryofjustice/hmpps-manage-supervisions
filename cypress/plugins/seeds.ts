import { SeedModule, seedModule } from './wiremock'
import { SeedTeamOfficeLocationsOptions, teamOfficeLocations } from './teams'
import {
  ActivityLogGroup,
  AppointmentDetail,
  Conviction,
  Nsi,
  OffenderDetail,
  PersonalCircumstance,
  PersonalContact,
  Registration,
  Requirement,
  StaffCaseloadEntry,
  StaffDetails,
} from '../../src/server/community-api/client'
import { appointmentTypes } from './appointment-types'
import { staff } from './staff'
import { get, set } from 'lodash'
import { AssessmentNeedsDto, AllRoshRiskDtoAllRisksView } from '../../src/server/assess-risks-and-needs-api/client'
import { CRN, offender } from './offender'
import { ACTIVE_CONVICTION_ID, convictions, PREVIOUS_CONVICTION_IDS } from './convictions'
import { personalContacts } from './personal-contacts'
import { personalCircumstances } from './personal-circumstances'
import { registrations } from './registrations'
import { risks } from './risks'
import { requirements } from './requirements'
import { appointments } from './appointments'
import { contacts } from './contacts'
import { nsis } from './nsis'
import * as faker from 'faker'
import { needs } from './needs'
import { cases } from './cases'
import { DeepPartial } from '../../src/server/app.types'
import { exit } from './exit'
import { deliusApiContact } from './delius-api'

/**
 * Resets the wiremock server, this should always be the first seed module loaded.
 */
export const reset = seedModule(
  { title: 'Reset' },
  context => {
    context.client.setReset()
    context.client.community.stubPing()
    context.client.community.stubPing(true)
    context.client.community.stubApiInfo('2100-01-01.999999.1680c86')
    context.client.assessRisksAndNeeds.stubPing()
    context.client.assessRisksAndNeeds.stubApiInfo('2100-01-01.999999.c482abe')
    context.client.delius.stubPing()
    context.client.delius.stubPing(true)
    context.client.delius.stubApiInfo('2100-01-01.999999.1680c86')
    context.client.hmppsAuth.stubPing()
  },
  exit,
)

export interface ReferenceDataSeedOptions extends SeedTeamOfficeLocationsOptions {
  staff?: DeepPartial<StaffDetails>
}

/**
 * Seed reference data: contact types, appointment types, team office locations, staff details
 */
export function referenceDataSeed(options: ReferenceDataSeedOptions = {}) {
  return seedModule({ title: 'Reference data' }, appointmentTypes, teamOfficeLocations(options), staff(options.staff))
}

function getOrSet<T>(object: any, path: string, value: T): T {
  let result = get(object, path)
  if (result === undefined) {
    result = value
    set(object, path, result)
  }
  return result
}

export interface ConvictionSeedOptions {
  conviction?: DeepPartial<Conviction>
  requirements?: DeepPartial<Requirement>[]
  nsis?: DeepPartial<Nsi>[]
}

export interface OffenderSeedOptions {
  offender?: DeepPartial<OffenderDetail>
  personalContacts?: DeepPartial<PersonalContact>[]
  personalCircumstances?: DeepPartial<PersonalCircumstance>[]
  registrations?: DeepPartial<Registration>[]
  risks?: DeepPartial<AllRoshRiskDtoAllRisksView> | 'unavailable'
  needs?: DeepPartial<AssessmentNeedsDto> | 'unavailable'
  convictions?: { active: ConvictionSeedOptions | null; previous?: ConvictionSeedOptions[] }
}

/**
 * Seeds offenders based on specified partials or just Liz Haggis otherwise.
 */
export function offenderSeed(options: OffenderSeedOptions = {}) {
  // create some common identifiers so all tasks can run async
  const crn = getOrSet(options, 'offender.otherIds.crn', CRN)

  const defaultPreviousConvictions = PREVIOUS_CONVICTION_IDS.map(convictionId => ({ conviction: { convictionId } }))
  if (!options.convictions) {
    options.convictions = {
      active: { conviction: { convictionId: ACTIVE_CONVICTION_ID } },
      previous: defaultPreviousConvictions,
    }
  } else {
    // null is a special case to remove the active conviction, otherwise (undefined), Liz's active conviction will be used.
    if (options.convictions.active !== null) {
      getOrSet(options, 'convictions.active.conviction.convictionId', ACTIVE_CONVICTION_ID)
    }

    if (!options.convictions.previous) {
      options.convictions.previous = defaultPreviousConvictions
    }

    for (let i = 0; i < options.convictions.previous.length; i++) {
      getOrSet(
        options.convictions.previous[i],
        'conviction.convictionId',
        // prefer to use the well known previous conviction ids otherwise fallback to a random number
        i < PREVIOUS_CONVICTION_IDS.length ? PREVIOUS_CONVICTION_IDS[i] : faker.datatype.number(),
      )
    }
  }

  const { active, previous } = options.convictions

  return seedModule(
    { title: 'Offender' },
    offender(options.offender),
    personalContacts(crn, options.personalContacts),
    personalCircumstances(crn, options.personalCircumstances),
    registrations(crn, options.registrations),
    risks(crn, options.risks),
    needs(crn, options.needs),
    convictions(
      crn,
      active === null ? null : active?.conviction,
      previous.map(x => x.conviction),
    ),
    ...(active?.conviction
      ? [
          requirements(crn, active.conviction.convictionId, active.requirements),
          nsis(crn, active.conviction.convictionId, active.nsis),
        ]
      : []),
    ...previous
      .map(x => [
        // prefer no requirements or nsis for previous convictions
        requirements(crn, x.conviction.convictionId, x.requirements || []),
        nsis(crn, x.conviction.convictionId, x.nsis || []),
      ])
      .reduce((agg, x) => [...agg, ...x], []),
    deliusApiContact(),
  )
}

export interface ContactSeedOptions {
  crn?: string
  activeConvictionId?: number
  appointments?: DeepPartial<AppointmentDetail>[]
  contacts?: DeepPartial<ActivityLogGroup>[]
  appointmentBookingStatus?: number
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
    appointments(crn, activeConvictionId, options.appointments, options.appointmentBookingStatus),
    contacts(crn, options.contacts),
  )
}

export interface CasesSeedOptions {
  cases?: DeepPartial<StaffCaseloadEntry>[]
}

/**
 * Seeds cases
 */
export function casesSeed(options: CasesSeedOptions = {}): SeedModule {
  return seedModule({ title: 'Cases' }, cases(options.cases))
}
