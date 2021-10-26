import { StaffDetails } from '../../src/server/community-api/client'
import { TEAM_CODE } from './teams'
import { SeedFn } from './wiremock'
import { fakeStaffDetails } from '../../src/server/community-api/community-api.fake'
import { USERNAME } from './hmpps-auth'
import { DeepPartial } from '../../src/server/app.types'

export const STAFF_CODE = 'CRSSTAFF1'

const STAFF: StaffDetails = {
  username: USERNAME,
  email: 'john.smith@test',
  staffCode: STAFF_CODE,
  staffIdentifier: 1234567,
  staff: {
    forenames: 'John',
    surname: 'Smith',
  },
  teams: [
    {
      code: TEAM_CODE,
      description: 'Unallocated',
      localDeliveryUnit: {
        code: 'CRSUAT',
        description: 'Unallocated LDU',
      },
      teamType: {
        code: 'CRSUAT',
        description: 'Unallocated Team Type',
      },
      district: {
        code: 'CRSUAT',
        description: 'Unallocated LDU',
      },
      borough: {
        code: 'CRSUAT',
        description: 'Unallocated Cluster',
      },
    },
  ],
  probationArea: {
    probationAreaId: 1,
    description: 'NPS Yorkshire and The Humber',
  },
}

export function staff(partial: DeepPartial<StaffDetails> = {}): SeedFn {
  return context => {
    const staff = fakeStaffDetails([STAFF, partial])
    context.client.community.get(`/secure/staff/username/${staff.username}`).returns(staff)
  }
}
