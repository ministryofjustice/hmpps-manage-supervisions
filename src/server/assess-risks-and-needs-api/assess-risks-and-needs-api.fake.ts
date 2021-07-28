import {
  AllRoshRiskDto,
  OtherRoshRisksDtoBreachOfTrust,
  OtherRoshRisksDtoControlIssuesDisruptiveBehaviour,
  OtherRoshRisksDtoEscapeOrAbscond,
  OtherRoshRisksDtoRiskToOtherPrisoners,
  RiskDtoCurrent,
  RiskDtoPrevious,
  RiskDtoRisk,
} from './client'
import { fake } from '../util/util.fake'

export const fakeAllRoshRiskDto = fake<AllRoshRiskDto>(() => ({
  riskToSelf: {
    suicide: {
      risk: RiskDtoRisk.Yes,
      previous: RiskDtoPrevious.Yes,
      previousConcernsText: 'lkdlskf;k',
      current: RiskDtoCurrent.Yes,
      currentConcernsText: 'fskdkf;lk',
    },
    selfHarm: {
      risk: RiskDtoRisk.Yes,
      previous: RiskDtoPrevious.Yes,
      previousConcernsText: 'lkdlskf;k',
      current: RiskDtoCurrent.Yes,
      currentConcernsText: 'fskdkf;lk',
    },
    custody: {
      risk: RiskDtoRisk.Yes,
      previous: RiskDtoPrevious.Yes,
      previousConcernsText: 'dsjflksdkljfksdj',
      current: RiskDtoCurrent.Yes,
      currentConcernsText: 'skjdfkljlksd',
    },
    hostelSetting: {
      risk: RiskDtoRisk.Yes,
      previous: RiskDtoPrevious.Yes,
      previousConcernsText: 'dsjflksdkljfksdj',
      current: RiskDtoCurrent.Yes,
      currentConcernsText: 'skjdfkljlksd',
    },
    vulnerability: {
      risk: RiskDtoRisk.Yes,
      previous: RiskDtoPrevious.Yes,
      previousConcernsText: 'lksdlfkd;lk',
      current: RiskDtoCurrent.Yes,
      currentConcernsText: 'jdshfkhskdjhfksd',
    },
  },
  otherRisks: {
    escapeOrAbscond: OtherRoshRisksDtoEscapeOrAbscond.Yes,
    controlIssuesDisruptiveBehaviour: OtherRoshRisksDtoControlIssuesDisruptiveBehaviour.Yes,
    breachOfTrust: OtherRoshRisksDtoBreachOfTrust.Yes,
    riskToOtherPrisoners: OtherRoshRisksDtoRiskToOtherPrisoners.Yes,
  },
  summary: {
    whoIsAtRisk: 'kjlkj',
    natureOfRisk: 'jjlklkkj',
    riskImminence: 'kjjkjlkj',
    riskIncreaseFactors: 'kjkjlk',
    riskMitigationFactors: 'jbjkhk',
    riskInCommunity: {
      VERY_HIGH: ['Children', 'Staff'],
      HIGH: ['Public'],
      LOW: ['Known Adult'],
    },
    riskInCustody: {
      MEDIUM: ['Children'],
      VERY_HIGH: ['Public', 'Staff'],
      LOW: ['Known Adult'],
      HIGH: ['Prisoners'],
    },
  },
}))
