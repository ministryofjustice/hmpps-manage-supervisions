import { AllRoshRiskDto, RiskDtoCurrent, RiskDtoPrevious } from '../../src/server/assess-risks-and-needs-api'
import { SeedFn } from './wiremock'
import { fakeAllRoshRiskDto } from '../../src/server/assess-risks-and-needs-api/assess-risks-and-needs-api.fake'

export const RISKS: DeepPartial<AllRoshRiskDto> = {
  riskToSelf: {
    suicide: {
      previous: RiskDtoPrevious.No,
      previousConcernsText: null,
      current: RiskDtoCurrent.Yes,
      currentConcernsText: null,
    },
    selfHarm: {
      previous: RiskDtoPrevious.Yes,
      previousConcernsText: null,
      current: RiskDtoCurrent.Yes,
      currentConcernsText: null,
    },
    custody: {
      previous: RiskDtoPrevious.Yes,
      previousConcernsText:
        'Soluta tempore nemo et velit est perspiciatis.\n\nNeque error aut est nemo quasi. Et labore impedit omnis numquam id et eaque facere itaque. Ipsam et atque eos tempora possimus.',
      current: RiskDtoCurrent.No,
      currentConcernsText: null,
    },
    hostelSetting: {
      previous: RiskDtoPrevious.Yes,
      previousConcernsText: null,
      current: RiskDtoCurrent.No,
      currentConcernsText: null,
    },
    vulnerability: {
      previous: RiskDtoPrevious.No,
      previousConcernsText: null,
      current: RiskDtoCurrent.No,
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
}

export function risks(crn: string, partial?: DeepPartial<AllRoshRiskDto>): SeedFn {
  return context => {
    if (partial === null) {
      // special case, no risk data return a 404
      context.client.assessRisksAndNeeds.get(`/risks/crn/${crn}`).notFound()
    } else {
      const risks = fakeAllRoshRiskDto([RISKS, partial])
      context.client.assessRisksAndNeeds.get(`/risks/crn/${crn}`).returns(risks)
    }
  }
}
