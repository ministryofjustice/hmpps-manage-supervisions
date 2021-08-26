import {
  AssessmentNeedDtoSeverity,
  AssessmentNeedsDto,
  NeedsAssessmentSection,
} from '../../src/server/assess-risks-and-needs-api'
import { fakeAssessmentNeedsDto } from '../../src/server/assess-risks-and-needs-api/assess-risks-and-needs-api.fake'
import { SeedFn } from './wiremock'

export const NEEDS: DeepPartial<AssessmentNeedsDto> = {
  identifiedNeeds: [
    { section: NeedsAssessmentSection.Accommodation, severity: AssessmentNeedDtoSeverity.Severe },
    { section: NeedsAssessmentSection.EducationTrainingAndEmployability, severity: AssessmentNeedDtoSeverity.Severe },
    { section: NeedsAssessmentSection.FinancialManagementAndIncome, severity: AssessmentNeedDtoSeverity.Severe },
    { section: NeedsAssessmentSection.Relationships, severity: AssessmentNeedDtoSeverity.Severe },
    { section: NeedsAssessmentSection.LifestyleAndAssociates, severity: AssessmentNeedDtoSeverity.Severe },
    { section: NeedsAssessmentSection.DrugMisuse, severity: AssessmentNeedDtoSeverity.Severe },
    { section: NeedsAssessmentSection.AlcoholMisuse, severity: AssessmentNeedDtoSeverity.Severe },
    { section: NeedsAssessmentSection.EmotionalWellBeing, severity: AssessmentNeedDtoSeverity.Severe },
    { section: NeedsAssessmentSection.ThinkingAndBehaviour, severity: AssessmentNeedDtoSeverity.Severe },
    { section: NeedsAssessmentSection.Attitudes, severity: AssessmentNeedDtoSeverity.Severe },
  ],
}

export function needs(crn: string, partial: DeepPartial<AssessmentNeedsDto> = NEEDS): SeedFn {
  return context => {
    const needs = fakeAssessmentNeedsDto(partial)
    context.client.assessRisksAndNeeds.get(`/needs/crn/${crn}`).returns(needs)
  }
}
