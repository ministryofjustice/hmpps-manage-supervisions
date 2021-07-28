import { Conviction } from '../../src/server/community-api/client'
import { fakeConviction } from '../../src/server/community-api/community-api.fake'
import { SeedFn } from './wiremock'

export const ACTIVE_CONVICTION_ID = 100

export const ACTIVE_CONVICTION: DeepPartial<Conviction> = {
  convictionId: ACTIVE_CONVICTION_ID,
  active: true,
  convictionDate: '2020-02-05',
  offences: [
    {
      mainOffence: true,
      detail: {
        mainCategoryDescription: 'Betting, Gaming and Lotteries (Indictable)',
        subCategoryDescription: 'Cheats at gambling or enables or assists person to cheat (Gambling Act 2005)',
      },
      offenceDate: '2021-02-01T00:00:00',
      offenceCount: 1,
    },
    {
      mainOffence: false,
      detail: {
        mainCategoryDescription: 'Assault on Police Officer',
        subCategoryDescription: 'Assault on Police Officer',
      },
      offenceDate: '2019-09-09T00:00:00',
      offenceCount: 1,
    },
  ],
  sentence: {
    originalLength: 12,
    originalLengthUnits: 'Months',
    expectedSentenceEndDate: '2021-02-16',
    startDate: '2020-02-17',
    sentenceType: {
      code: 'SP',
      description: 'ORA Community Order',
    },
    additionalSentences: [
      {
        type: { description: 'Fine' },
        amount: 500,
        notes: '£500 fine',
      },
      {
        type: { description: 'Disqualified from Driving' },
        length: 6,
        notes: null,
      },
    ],
  },
  responsibleCourt: {
    courtName: 'Sheffield Magistrates Court',
  },
  courtAppearance: {
    courtName: 'Nottingham Crown Court',
  },
}

export const PREVIOUS_CONVICTIONS: DeepPartial<Conviction>[] = [{ active: false, convictionDate: '2020-12-01' }]

export function convictions(
  crn: string,
  active: DeepPartial<Conviction> | null,
  previous: DeepPartial<Conviction>[] = PREVIOUS_CONVICTIONS,
): SeedFn {
  return async context => {
    const convictions = [
      active === null ? null : fakeConviction([ACTIVE_CONVICTION, active]),
      ...previous.map(p => fakeConviction(p)),
    ].filter(x => x)

    await Promise.all([
      context.client.community
        .get(`/secure/offenders/crn/${crn}/convictions`)
        .query({ activeOnly: true })
        .priority(1)
        .returns(convictions.filter(x => x.active)),
      context.client.community.get(`/secure/offenders/crn/${crn}/convictions`).priority(2).returns(convictions),
    ])
  }
}
