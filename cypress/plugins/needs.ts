import { AssessmentNeedDtoSeverity, AssessmentNeedsDto } from '../../src/server/assess-risks-and-needs-api/client'
import { fakeAssessmentNeedsDto } from '../../src/server/assess-risks-and-needs-api/assess-risks-and-needs-api.fake'
import { SeedFn } from './wiremock'
import { NeedsAssessmentSection } from '../../src/server/assess-risks-and-needs-api'
import { DeepPartial } from '../../src/server/app.types'

export const NEEDS: DeepPartial<AssessmentNeedsDto> = {
  identifiedNeeds: [
    { section: NeedsAssessmentSection.Accommodation, severity: AssessmentNeedDtoSeverity.Severe },
    { section: NeedsAssessmentSection.EducationTrainingAndEmployability, severity: AssessmentNeedDtoSeverity.NoNeed },
    { section: NeedsAssessmentSection.FinancialManagementAndIncome, severity: AssessmentNeedDtoSeverity.NoNeed },
    { section: NeedsAssessmentSection.Relationships, severity: AssessmentNeedDtoSeverity.NoNeed },
    { section: NeedsAssessmentSection.LifestyleAndAssociates, severity: AssessmentNeedDtoSeverity.NoNeed },
    { section: NeedsAssessmentSection.DrugMisuse, severity: AssessmentNeedDtoSeverity.Standard },
    { section: NeedsAssessmentSection.AlcoholMisuse, severity: AssessmentNeedDtoSeverity.Standard },
    { section: NeedsAssessmentSection.EmotionalWellBeing, severity: AssessmentNeedDtoSeverity.NoNeed },
    { section: NeedsAssessmentSection.ThinkingAndBehaviour, severity: AssessmentNeedDtoSeverity.NoNeed },
    { section: NeedsAssessmentSection.Attitudes, severity: AssessmentNeedDtoSeverity.NoNeed },
  ],
}

export function needs(crn: string, partial: DeepPartial<AssessmentNeedsDto> = NEEDS): SeedFn {
  return context => {
    const needs = fakeAssessmentNeedsDto(partial)
    context.client.assessRisksAndNeeds.get(`/needs/crn/${crn}`).returns(needs)
  }
}
