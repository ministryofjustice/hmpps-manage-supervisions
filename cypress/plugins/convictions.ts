import { Conviction } from '../../src/server/community-api/client'
import { fakeConviction } from '../../src/server/community-api/community-api.fake'
import { SeedFn } from './wiremock'
import { DeepPartial } from '../../src/server/app.types'

export const ACTIVE_CONVICTION_ID = 100
export const PREVIOUS_CONVICTION_IDS = [101, 102]

export const ACTIVE_CONVICTION: DeepPartial<Conviction> = {
  convictionId: ACTIVE_CONVICTION_ID,
  active: true,
  inBreach: false,
  convictionDate: '2020-02-05',
  offences: [
    {
      mainOffence: true,
      detail: {
        code: '05600',
        mainCategoryDescription: 'Betting, Gaming and Lotteries (Indictable)',
        subCategoryDescription: 'Cheats at gambling or enables or assists person to cheat (Gambling Act 2005)',
      },
      offenceDate: '2021-02-01T00:00:00',
      offenceCount: 1,
    },
    {
      mainOffence: false,
      detail: {
        code: '80701',
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
    cja2003Order: true,
    legacyOrder: false,
  },
  responsibleCourt: {
    courtName: 'Sheffield Magistrates Court',
  },
  courtAppearance: {
    courtName: 'Nottingham Crown Court',
  },
}

export const PREVIOUS_CONVICTIONS: DeepPartial<Conviction>[] = [
  {
    convictionId: PREVIOUS_CONVICTION_IDS[0],
    active: false,
    convictionDate: '2018-11-01',
    sentence: {
      sentenceType: {
        description: 'ORA Community Order',
      },
      startDate: '2018-12-01',
      terminationDate: '2020-12-01',
      originalLength: 24,
      originalLengthUnits: 'Months',
      cja2003Order: true,
      legacyOrder: false,
    },
    offences: [{ mainOffence: true, offenceCount: 2, detail: { subCategoryDescription: 'Assault on Police Officer' } }],
  },
  {
    convictionId: PREVIOUS_CONVICTION_IDS[1],
    active: false,
    convictionDate: '2016-11-01',
    sentence: {
      sentenceType: {
        description: 'ORA Community Order',
      },
      startDate: '2016-12-01',
      terminationDate: '2018-12-01',
      originalLength: 24,
      originalLengthUnits: 'Months',
      cja2003Order: true,
      legacyOrder: false,
    },
    offences: [{ mainOffence: true, offenceCount: 1, detail: { subCategoryDescription: 'Drinking and Driving' } }],
  },
]

export function convictions(
  crn: string,
  active: DeepPartial<Conviction> | null,
  previous: DeepPartial<Conviction>[],
): SeedFn {
  return context => {
    const convictions = [
      active === null ? null : fakeConviction([ACTIVE_CONVICTION, active]),
      ...previous.map((p, i) =>
        fakeConviction([i < PREVIOUS_CONVICTIONS.length ? PREVIOUS_CONVICTIONS[i] : { active: false }, p]),
      ),
    ].filter(x => x)

    const url = `/secure/offenders/crn/${crn}/convictions`
    context.client.community
      .get(url)
      .query({ activeOnly: true })
      .priority(1)
      .returns(convictions.filter(x => x.active))
    context.client.community.get(url).priority(2).returns(convictions)
  }
}
