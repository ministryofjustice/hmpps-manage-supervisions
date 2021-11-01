import {
  AllRoshRiskDtoAllRisksView,
  RiskDtoAllRisksViewCurrent,
  RiskDtoAllRisksViewPrevious,
} from '../../src/server/assess-risks-and-needs-api/client'
import { SeedFn } from './wiremock'
import { fakeAllRoshRiskDto } from '../../src/server/assess-risks-and-needs-api/assess-risks-and-needs-api.fake'
import { DeepPartial } from '../../src/server/app.types'

export const RISKS: DeepPartial<AllRoshRiskDtoAllRisksView> = {
  riskToSelf: {
    suicide: {
      previous: RiskDtoAllRisksViewPrevious.No,
      previousConcernsText: null,
      current: RiskDtoAllRisksViewCurrent.Yes,
      currentConcernsText: null,
    },
    selfHarm: {
      previous: RiskDtoAllRisksViewPrevious.Yes,
      previousConcernsText: null,
      current: RiskDtoAllRisksViewCurrent.Yes,
      currentConcernsText: null,
    },
    custody: {
      previous: RiskDtoAllRisksViewPrevious.Yes,
      previousConcernsText:
        'Soluta tempore nemo et velit est perspiciatis.\n\nNeque error aut est nemo quasi. Et labore impedit omnis numquam id et eaque facere itaque. Ipsam et atque eos tempora possimus.',
      current: RiskDtoAllRisksViewCurrent.No,
      currentConcernsText: null,
    },
    hostelSetting: {
      previous: RiskDtoAllRisksViewPrevious.Yes,
      previousConcernsText: 'A hostel setting would pose significant risk for this case.',
      current: RiskDtoAllRisksViewCurrent.No,
      currentConcernsText: null,
    },
    vulnerability: {
      previous: RiskDtoAllRisksViewPrevious.No,
      previousConcernsText: null,
      current: RiskDtoAllRisksViewCurrent.No,
      currentConcernsText: null,
    },
  },
  summary: {
    whoIsAtRisk: 'Someone at risk',
    natureOfRisk: 'Some nature of risk',
    riskImminence: 'Some risk imminence',
    riskInCommunity: {
      VERY_HIGH: ['Children', 'Staff'],
      HIGH: ['Public'],
      LOW: ['Known Adult'],
    },
  },
  assessedOn: '2000-01-02T13:30:00',
}

export function risks(crn: string, partial?: DeepPartial<AllRoshRiskDtoAllRisksView> | 'unavailable'): SeedFn {
  return context => {
    const request = context.client.assessRisksAndNeeds.get(`/risks/crn/${crn}`)
    if (partial === 'unavailable') {
      // special case, api down, return a 500
      request.serverError()
    } else if (partial === null) {
      // special case, no risk data return a 404
      request.notFound()
    } else {
      const risks = fakeAllRoshRiskDto([RISKS, partial])
      request.returns(risks)
    }
  }
}
