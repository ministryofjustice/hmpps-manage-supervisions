import { AllRoshRiskDto } from '../../src/server/assess-risks-and-needs-api'
import { SeedFn } from './wiremock'
import { fakeAllRoshRiskDto } from '../../src/server/assess-risks-and-needs-api/assess-risks-and-needs-api.fake'

export const RISKS: DeepPartial<AllRoshRiskDto> = {
  summary: {
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
