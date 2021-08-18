import {
  AllRoshRiskDto,
  OtherRoshRisksDtoBreachOfTrust,
  OtherRoshRisksDtoControlIssuesDisruptiveBehaviour,
  OtherRoshRisksDtoEscapeOrAbscond,
  OtherRoshRisksDtoRiskToOtherPrisoners,
  RiskDto,
  RiskDtoCurrent,
  RiskDtoPrevious,
  RiskDtoRisk,
} from './client'
import { fake, fakeEnum, fakeRandomArray } from '../util/util.fake'
import * as faker from 'faker'
import { toList } from '../util'

const fakeRiskDto = fake<RiskDto>((options, partial = {}) => {
  const current = partial.current || fakeEnum(RiskDtoCurrent)
  const previous = partial.previous || fakeEnum(RiskDtoPrevious)
  return {
    risk: fakeEnum(RiskDtoRisk),
    previous,
    previousConcernsText:
      previous === RiskDtoPrevious.Yes && faker.datatype.boolean() ? faker.lorem.paragraphs() : null,
    current,
    currentConcernsText: current === RiskDtoCurrent.Yes && faker.datatype.boolean() ? faker.lorem.paragraphs() : null,
  }
})

function fakeRiskSubject() {
  return faker.random.arrayElement(['Children', 'Staff', 'Public', 'Known Adult', 'Prisoners'])
}

function fakeRiskLevels() {
  return {
    VERY_HIGH: fakeRandomArray(fakeRiskSubject),
    HIGH: fakeRandomArray(fakeRiskSubject),
    MEDIUM: fakeRandomArray(fakeRiskSubject),
    LOW: fakeRandomArray(fakeRiskSubject),
  }
}

export const fakeAllRoshRiskDto = fake<AllRoshRiskDto>((options, partial = {}) => ({
  riskToSelf: {
    suicide: fakeRiskDto(),
    selfHarm: fakeRiskDto(),
    custody: fakeRiskDto(),
    hostelSetting: fakeRiskDto(),
    vulnerability: fakeRiskDto(),
  },
  otherRisks: {
    escapeOrAbscond: fakeEnum(OtherRoshRisksDtoEscapeOrAbscond),
    controlIssuesDisruptiveBehaviour: fakeEnum(OtherRoshRisksDtoControlIssuesDisruptiveBehaviour),
    breachOfTrust: fakeEnum(OtherRoshRisksDtoBreachOfTrust),
    riskToOtherPrisoners: fakeEnum(OtherRoshRisksDtoRiskToOtherPrisoners),
  },
  summary: {
    whoIsAtRisk: toList(fakeRandomArray(fakeRiskSubject)),
    natureOfRisk: 'Some nature of risk',
    riskImminence: 'Some risk imminence',
    riskIncreaseFactors: 'Some risk increase factors',
    riskMitigationFactors: 'Some risk mitigation factors',
    riskInCommunity: partial.summary?.riskInCommunity || fakeRiskLevels(),
    riskInCustody: partial.summary?.riskInCustody || fakeRiskLevels(),
  },
}))
