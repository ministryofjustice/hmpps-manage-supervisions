import { Registration, Registrations } from '../../src/server/community-api/client'
import { SeedFn } from './wiremock'
import { fakeRegistration } from '../../src/server/community-api/community-api.fake'

export const REGISTRATIONS: DeepPartial<Registration>[] = [
  {
    active: true,
    type: {
      code: 'RSTO',
      description: 'Restraining Order',
    },
    riskColour: 'Amber',
    startDate: '2021-07-02',
    nextReviewDate: '2022-01-02',
    notes: 'Harassment of ex-wife',
  },
  {
    active: true,
    type: { code: 'RMRH', description: 'High RoSH' },
    notes: 'This registration is on the ignore list so will be excluded from the ui',
  },
  { active: false },
  { active: false },
]

export function registrations(crn: string, partials: DeepPartial<Registration>[] = REGISTRATIONS): SeedFn {
  return context => {
    const registrations = partials.map(p => fakeRegistration(p))
    context.client.community
      .get(`/secure/offenders/crn/${crn}/registrations`)
      .returns({ registrations } as Registrations)
  }
}
