import { StaffCaseloadEntry } from '../../src/server/community-api/client'
import { fakePaginated, fakeStaffCaseloadEntry } from '../../src/server/community-api/community-api.fake'
import { SeedFn } from './wiremock'
import { STAFF_CODE } from './staff'
import { CRN } from './offender'

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
    context.client.community.get(`/secure/staff/username/${STAFF_CODE}/cases`).returns(fakePaginated(cases))
  }
}
