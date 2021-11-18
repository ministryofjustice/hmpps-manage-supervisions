import { PersonalCircumstance, PersonalCircumstances } from '../../src/server/community-api/client'
import { SeedFn } from './wiremock'
import { fakePersonalCircumstance } from '../../src/server/community-api/community-api.fake'
import { DeepPartial } from '../../src/server/app.types'

export const PERSONAL_CIRCUMSTANCES: DeepPartial<PersonalCircumstance>[] = [
  {
    personalCircumstanceType: {
      code: 'B',
      description: 'Employment',
    },
    personalCircumstanceSubType: {
      description: 'Temporary/casual work (30 or more hours per week)',
    },
    startDate: '2021-03-03',
    evidenced: false,
    notes: null,
    createdDatetime: '2021-03-03T12:02:00',
    lastUpdatedDatetime: '2021-03-04T13:04:00',
  },
  {
    personalCircumstanceType: {
      code: 'H',
      description: 'Relationship',
    },
    personalCircumstanceSubType: {
      description: 'Married / Civil partnership',
    },
    startDate: '2005-04-01',
    endDate: '2021-07-02',
    evidenced: true,
    notes: "Divorced, here's a random link to https://gov.uk",
    createdDatetime: '2005-04-01T12:02:00',
    lastUpdatedDatetime: '2021-07-02T13:04:00',
  },
]

export function personalCircumstances(
  crn: string,
  partials: DeepPartial<PersonalCircumstance>[] = PERSONAL_CIRCUMSTANCES,
): SeedFn {
  return context => {
    const personalCircumstances = partials.map(p => fakePersonalCircumstance(p))
    context.client.community
      .get(`/secure/offenders/crn/${crn}/personalCircumstances`)
      .returns({ personalCircumstances } as PersonalCircumstances)
  }
}
