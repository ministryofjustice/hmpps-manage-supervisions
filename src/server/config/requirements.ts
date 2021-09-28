import { WellKnownRequirementTypeConfig, WellKnownRequirementTypePattern } from './types'

export const requirements: WellKnownRequirementTypeConfig = Object.freeze({
  R: { pattern: `Prohibited activity: ${WellKnownRequirementTypePattern.SubCategory}` },
  T: { pattern: `${WellKnownRequirementTypePattern.LengthAndUnit} alcohol abstinence and monitoring` },
  H: { pattern: `${WellKnownRequirementTypePattern.LengthAndUnit} alcohol treatment` },
  N: { pattern: `Attendance centre (${WellKnownRequirementTypePattern.LengthAndUnit})` },
  M: { pattern: `${WellKnownRequirementTypePattern.LengthAndUnit} curfew` },
  RM49: { pattern: `${WellKnownRequirementTypePattern.LengthAndUnit} electronic monitoring` },
  X: {
    pattern: `${WellKnownRequirementTypePattern.LengthAndUnit} exclusion: ${WellKnownRequirementTypePattern.SubCategory}`,
  },
  P: { pattern: `${WellKnownRequirementTypePattern.LengthAndUnit} mental health treatment` },
  RM38: { pattern: `Accredited programmes: ${WellKnownRequirementTypePattern.SubCategory}` },
  '3': { pattern: `Residential (${WellKnownRequirementTypePattern.LengthAndUnit})` },
  W0: { pattern: `${WellKnownRequirementTypePattern.LengthAndUnit} unpaid work, to be worked concurrently` },
  W: {
    pattern: `${WellKnownRequirementTypePattern.LengthAndUnit} unpaid work`,
    subTypePatterns: {
      W03: `${WellKnownRequirementTypePattern.Length} additional ${WellKnownRequirementTypePattern.Unit} unpaid work`,
    },
  },
  F: { pattern: `${WellKnownRequirementTypePattern.LengthAndUnit} RAR`, isRar: true },
})
