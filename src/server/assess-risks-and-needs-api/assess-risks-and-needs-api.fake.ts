import { AllRoshRiskDto } from './client'
import { fake } from '../util/util.fake'

export const fakeAllRoshRiskDto = fake<AllRoshRiskDto>(() => ({
  otherRisks: {},
  riskToSelf: {},
  summary: {
    riskInCommunity: {
      VERY_HIGH: ['Children', 'Staff'],
      HIGH: ['Public'],
      LOW: ['Known Adult'],
    },
    riskInCustody: {},
  },
}))
