import { Registration, Registrations } from '../../src/server/community-api/client'
import { SeedFn } from './wiremock'
import { fakeRegistration } from '../../src/server/community-api/community-api.fake'
import { riskReferenceData } from '../../src/server/case/risk/registration-reference-data'
import { DeepPartial } from '../../src/server/app.types'

const templateRegistration: DeepPartial<Registration> = {
  active: true,
  riskColour: 'Amber',
  startDate: '2021-07-02',
  nextReviewDate: '2021-11-19',
  registrationReviews: [
    {
      reviewDate: '2021-11-19',
      completed: false,
      reviewingOfficer: {
        code: 'ABC123',
        forenames: 'Brian',
        surname: 'Peashoots',
      },
      reviewingTeam: {
        code: 'N07UAT',
        description: 'Unallocated Team',
      },
    },
    {
      reviewDate: '2021-08-23',
      reviewDateDue: '2021-11-19',
      notes: 'Well bad',
      completed: true,
      reviewingOfficer: {
        code: 'ABC123',
        forenames: 'Brian',
        surname: 'Peashoots',
      },
      reviewingTeam: {
        code: 'N07UAT',
        description: 'Unallocated Team',
      },
    },
  ],
}

export const REGISTRATIONS: DeepPartial<Registration>[] = Object.entries(riskReferenceData)
  .filter(([code]) => !['ALAN', 'ALERT', 'RMRH', 'REG26', 'RVAD'].includes(code))
  .map(([code, meta]) => {
    return { ...templateRegistration, type: { code, description: meta.description } }
  })
  .concat([
    {
      active: true,
      type: { code: 'ALERT', description: 'Alert Notice' },
      notes: 'Major alert about this offender https://gov.uk',
      nextReviewDate: '2022-01-02',
      startDate: '2020-05-14',
      registeringOfficer: {
        code: 'ABC999',
        forenames: 'Yolanda',
        surname: 'Gubbins',
      },
      registrationReviews: [
        {
          reviewDate: '2022-01-02',
          completed: false,
        },
        {
          reviewDate: '2021-08-23',
          reviewDateDue: '2022-01-02',
          notes: 'Registration still relevant',
          completed: true,
          reviewingOfficer: {
            code: 'ABC562',
            forenames: 'Cindy',
            surname: 'Legford',
          },
          reviewingTeam: {
            code: 'N07UAT',
            description: 'Unallocated Team',
          },
        },
      ],
    },
    {
      active: true,
      type: { code: 'RMRH', description: 'High RoSH' },
      notes: 'This registration is on the ignore list so will be excluded from the ui',
    },
    {
      active: false,
      type: { code: 'REG26', description: 'Organised Crime' },
      startDate: '2020-05-06',
      endDate: '2021-07-19',
      nextReviewDate: '2022-01-02',
      notes: 'Deals in stolen weapons',
      deregisteringNotes: 'No longer a risk https://gov.uk',
      registeringOfficer: {
        code: 'ZXU221',
        forenames: 'Wamberto',
        surname: 'Grundy',
      },
      deregisteringOfficer: {
        code: 'ABC123',
        forenames: 'Brian',
        surname: 'Peashoots',
      },
      registrationReviews: [
        {
          reviewDate: '2021-11-19',
          completed: false,
        },
        {
          reviewDate: '2021-08-23',
          reviewDateDue: '2021-11-19',
          notes: 'A review was performed',
          completed: true,
          reviewingOfficer: {
            code: 'ABC123',
            forenames: 'Brian',
            surname: 'Peashoots',
          },
          reviewingTeam: {
            code: 'N07UAT',
            description: 'Unallocated Team',
          },
        },
      ],
    },
    {
      active: false,
      type: { code: 'RVAD', description: 'Safeguarding – Adult at Risk' },
      deregisteringNotes: 'Replaced with another registration',
      endDate: '2021-01-05',
      deregisteringOfficer: {
        code: 'ABC123',
        forenames: 'Brian',
        surname: 'Peashoots',
      },
    },
  ])

export function registrations(crn: string, partials: DeepPartial<Registration>[] = REGISTRATIONS): SeedFn {
  return context => {
    const registrations = partials.map(p => fakeRegistration(p))
    context.client.community
      .get(`/secure/offenders/crn/${crn}/registrations`)
      .returns({ registrations } as Registrations)

    for (const registration of registrations) {
      context.client.community
        .get(`/secure/offenders/crn/${crn}/registrations/${registration.registrationId}`)
        .returns(registration)
    }
  }
}
