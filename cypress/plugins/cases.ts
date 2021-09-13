import { StaffCaseloadEntry } from '../../src/server/community-api/client'
import { fakePaginated, fakeStaffCaseloadEntry } from '../../src/server/community-api/community-api.fake'
import { SeedFn } from './wiremock'
import { CRN } from './offender'
import { USERNAME } from './hmpps-auth'

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
    context.client.community.get(`/secure/staff/username/${USERNAME}/cases`).returns(fakePaginated(cases))
  }
}
