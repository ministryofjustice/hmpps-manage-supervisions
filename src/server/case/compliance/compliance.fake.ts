import { fake } from '../../util/util.fake'
import { fakeBreachSummary } from '../../community-api/breach/breach.fake'
import { DateTime } from 'luxon'
import * as faker from 'faker'
import { ComplianceActiveBreachSummary, ComplianceConvictionSummary } from './compliance.types'

export const fakeComplianceConvictionSummary = fake<ComplianceConvictionSummary>((options, partial = {}) => {
  const activeBreach = fakeBreachSummary({
    active: true,
    ...partial.activeBreach,
  }) as ComplianceActiveBreachSummary
  const previousBreaches = (partial.previousBreaches || [{}]).map(x => fakeBreachSummary({ active: false, ...x }))
  return {
    name: '12 month Community Order',
    startDate: DateTime.fromJSDate(faker.date.past()),
    length: '12 months',
    progress: '6 months',
    mainOffence: faker.company.bs(),
    inBreach: true,
    activeBreach,
    previousBreaches,
    allBreaches: [activeBreach, ...previousBreaches],
    lastRecentBreachEnd: DateTime.fromJSDate(faker.date.past()),
  }
})
