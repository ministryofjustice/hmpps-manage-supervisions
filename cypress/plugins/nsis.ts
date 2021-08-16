import { Nsi, NsiWrapper } from '../../src/server/community-api/client'
import { SeedFn } from './wiremock'
import { fakeNsi } from '../../src/server/community-api/community-api.fake'

const NSIS: Nsi[] = [
  {
    nsiType: {
      code: 'BRE',
      description: 'Breach Request',
    },
    nsiSubType: {
      code: 'BRE01',
      description: 'Community Order',
    },
    nsiStatus: {
      code: 'BRE01',
      description: 'Breach Initiated',
    },
    referralDate: '2020-03-05',
    active: true,
    actualStartDate: '2020-04-05',
  },
  {
    nsiType: {
      code: 'BRE',
      description: 'Breach Request',
    },
    nsiSubType: {
      code: 'BRE01',
      description: 'Community Order',
    },
    nsiStatus: {
      code: 'BRE08',
      description: 'Breach Proven - Order to Continue',
    },
    nsiOutcome: {
      code: 'BRE09',
      description: 'Withdrawn',
    },
    referralDate: '2019-03-05',
    active: false,
    actualStartDate: '2019-04-05',
    actualEndDate: '2019-05-05',
  },
]

export function nsis(crn: string, convictionId: number, partials: DeepPartial<Nsi>[] = NSIS): SeedFn {
  return context => {
    const nsis = partials.map(p => fakeNsi(p))

    const url = `/secure/offenders/crn/${crn}/convictions/${convictionId}/nsis`
    context.client.community
      .get(url)
      .query({ nsiCodes: 'BRE' })
      .priority(1)
      .returns({ nsis: nsis.filter(x => x.nsiType.code === 'BRE') } as NsiWrapper)
    context.client.community
      .get(url)
      .priority(2)
      .returns({ nsis } as NsiWrapper)
  }
}
