import { StaffCaseloadEntry } from '../../src/server/community-api/client'
import { fakePaginated, fakeStaffCaseloadEntry } from '../../src/server/community-api/community-api.fake'
import { SeedFn } from './wiremock'
import { CRN } from './offender'
import { USERNAME } from './hmpps-auth'
import { DeepPartial } from '../../src/server/app.types'

const CASES: DeepPartial<StaffCaseloadEntry>[] = [
  {
    crn: CRN,
    firstName: 'Liz',
    middleNames: ['Danger'],
    surname: 'Haggis',
    preferredName: 'Bob',
  },
]

export function cases(partials: DeepPartial<StaffCaseloadEntry>[] = CASES): SeedFn {
  return context => {
    const cases = partials.map(p => fakeStaffCaseloadEntry(p))
    context.client.community
      .get(`/secure/staff/username/${USERNAME}/manage-supervisions-eligible-offenders`)
      .returns(fakePaginated(cases))

    for (const aCase of cases) {
      context.client.community.get(`/secure/offenders/crn/${aCase.crn}/manage-supervisions-eligibility`).returns(aCase)
    }
  }
}
