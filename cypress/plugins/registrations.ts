import { Registration, Registrations } from '../../src/server/community-api/client'
import { SeedFn } from './wiremock'
import { fakeRegistration } from '../../src/server/community-api/community-api.fake'

export const REGISTRATIONS: DeepPartial<Registration>[] = [
  {
    register: {
      code: '2',
      description: 'Alerts',
    },
    type: {
      code: 'RSTO',
      description: 'Restraining Order',
    },
    riskColour: 'Amber',
    startDate: '2021-07-02',
    nextReviewDate: '2022-01-02',
    reviewPeriodMonths: 6,
    registeringTeam: {
      code: 'N07T01',
      description: 'OMU A',
    },
    registeringOfficer: {
      code: 'N07P007',
      forenames: 'Archibald ZZ',
      surname: 'Queeny',
      unallocated: false,
    },
    registeringProbationArea: {
      code: 'N07',
      description: 'NPS London',
    },
    warnUser: false,
    active: true,
    numberOfPreviousDeregistrations: 0,
  },
  {
    register: {
      code: '1',
      description: 'RoSH',
    },
    type: {
      code: 'RMRH',
      description: 'High RoSH',
    },
    riskColour: 'Red',
    startDate: '2021-07-05',
    nextReviewDate: '2022-01-05',
    reviewPeriodMonths: 6,
    registeringTeam: {
      code: 'N07CHT',
      description: 'Automation SPG',
    },
    registeringOfficer: {
      code: 'N07A060',
      forenames: 'NDelius26',
      surname: 'NDelius26',
      unallocated: false,
    },
    registeringProbationArea: {
      code: 'N07',
      description: 'NPS London',
    },
    warnUser: false,
    active: true,
    numberOfPreviousDeregistrations: 0,
  },
]

export function registrations(crn: string, partials: DeepPartial<Registration>[] = REGISTRATIONS): SeedFn {
  return context => {
    const registrations = partials.map(p => fakeRegistration(p))
    context.client.community
      .get(`/secure/offenders/crn/${crn}/registrations`)
      .returns({ registrations } as Registrations)
  }
}
