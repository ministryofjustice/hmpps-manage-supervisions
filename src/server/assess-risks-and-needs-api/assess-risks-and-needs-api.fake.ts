import {
  AllRoshRiskDtoAllRisksView,
  AssessmentNeedDto,
  AssessmentNeedDtoSeverity,
  AssessmentNeedsDto,
  OtherRoshRisksDtoAllRisksViewBreachOfTrust,
  OtherRoshRisksDtoAllRisksViewControlIssuesDisruptiveBehaviour,
  OtherRoshRisksDtoAllRisksViewEscapeOrAbscond,
  OtherRoshRisksDtoAllRisksViewRiskToOtherPrisoners,
  RiskDtoAllRisksView,
  RiskDtoAllRisksViewCurrent,
  RiskDtoAllRisksViewPrevious,
  RiskDtoAllRisksViewRisk,
} from './client'
import { fake, fakeEnum, fakeRandomArray } from '../util/util.fake'
import * as faker from 'faker'
import { startCase } from 'lodash'
import { toList } from '../util'

import { NeedsAssessmentSection } from './well-known'
import { DeepPartial } from '../app.types'

const fakeRiskDto = fake<RiskDtoAllRisksView>((options, partial = {}) => {
  const current = partial.current || fakeEnum(RiskDtoAllRisksViewCurrent)
  const previous = partial.previous || fakeEnum(RiskDtoAllRisksViewPrevious)
  return {
    risk: fakeEnum(RiskDtoAllRisksViewRisk),
    previous,
    previousConcernsText:
      previous === RiskDtoAllRisksViewPrevious.Yes && faker.datatype.boolean() ? faker.lorem.paragraphs() : null,
    current,
    currentConcernsText:
      current === RiskDtoAllRisksViewCurrent.Yes && faker.datatype.boolean() ? faker.lorem.paragraphs() : null,
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

export const fakeAllRoshRiskDto = fake<AllRoshRiskDtoAllRisksView>((options, partial = {}) => ({
  riskToSelf: {
    suicide: fakeRiskDto(),
    selfHarm: fakeRiskDto(),
    custody: fakeRiskDto(),
    hostelSetting: fakeRiskDto(),
    vulnerability: fakeRiskDto(),
  },
  otherRisks: {
    escapeOrAbscond: fakeEnum(OtherRoshRisksDtoAllRisksViewEscapeOrAbscond),
    controlIssuesDisruptiveBehaviour: fakeEnum(OtherRoshRisksDtoAllRisksViewControlIssuesDisruptiveBehaviour),
    breachOfTrust: fakeEnum(OtherRoshRisksDtoAllRisksViewBreachOfTrust),
    riskToOtherPrisoners: fakeEnum(OtherRoshRisksDtoAllRisksViewRiskToOtherPrisoners),
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

export const fakeAssessmentNeedDto = fake<AssessmentNeedDto>(
  (options, { severity = fakeEnum(AssessmentNeedDtoSeverity), section = fakeEnum(NeedsAssessmentSection) } = {}) => ({
    section,
    name: startCase(section.toLowerCase()),
    overThreshold: faker.datatype.boolean(),
    riskOfHarm: faker.datatype.boolean(),
    riskOfReoffending: faker.datatype.boolean(),
    flaggedAsNeed: faker.datatype.boolean(),
    identifiedAsNeed: faker.datatype.boolean(),
    severity,
    needScore:
      severity === AssessmentNeedDtoSeverity.NoNeed
        ? undefined
        : faker.datatype.number(
            severity === AssessmentNeedDtoSeverity.Standard ? { min: 1, max: 5 } : { min: 6, max: 10 },
          ),
  }),
)

export const fakeAssessmentNeedsDto = fake<AssessmentNeedsDto>((options, { identifiedNeeds } = {}) => {
  return {
    assessedOn: faker.date.past().toISOString(),
    identifiedNeeds:
      identifiedNeeds?.map(fakeAssessmentNeedDto) ||
      Object.values(NeedsAssessmentSection).map<DeepPartial<AssessmentNeedDto>>(section => ({ section })),
    notIdentifiedNeeds: [],
    unansweredNeeds: [],
  }
})
