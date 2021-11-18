import { Requirement } from '../../src/server/community-api/client'
import { SeedFn } from './wiremock'
import { fakeRequirement } from '../../src/server/community-api/community-api.fake'
import { DeepPartial } from '../../src/server/app.types'

export const REQUIREMENTS: DeepPartial<Requirement>[] = [
  {
    requirementId: 2500076972,
    startDate: '2018-08-01',
    expectedStartDate: '2019-04-03',
    terminationDate: '2019-04-04',
    createdDatetime: '2019-04-09T14:20:39',
    active: false,
    terminationReason: { description: 'CBA' },
    requirementTypeSubCategory: {
      code: 'W06',
      description: 'Hours Concurrent to another Order',
    },
    requirementTypeMainCategory: {
      code: 'W',
      description: 'Unpaid Work',
    },
    requirementNotes: 'Some inactive unpaid work requirement',
    length: 1,
    lengthUnit: 'Hours',
  },
  {
    requirementNotes: 'CHANGE HOUSRS FROM 22 TO 19',
    startDate: '2018-08-01',
    expectedStartDate: '2019-04-01',
    expectedEndDate: '2019-06-01',
    createdDatetime: '2019-04-08T14:48:17',
    active: true,
    requirementTypeSubCategory: {
      code: 'W01',
      description: 'Regular',
    },
    requirementTypeMainCategory: {
      code: 'W',
      description: 'Unpaid Work',
    },
    length: 18,
    lengthUnit: 'Hours',
  },
  {
    requirementNotes: '3 ADD HOURS',
    startDate: '2018-08-01',
    expectedStartDate: '2019-04-03',
    createdDatetime: '2019-04-08T15:04:01',
    active: true,
    requirementTypeSubCategory: {
      code: 'W03',
      description: 'Additional Hours',
    },
    requirementTypeMainCategory: {
      code: 'W',
      description: 'Unpaid Work',
    },
    length: 3,
    lengthUnit: 'Hours',
  },
  {
    requirementId: 2500199144,
    requirementNotes: 'This is a requirement note with a link to https://gov.uk',
    commencementDate: '2018-08-01',
    startDate: '2018-08-01',
    expectedEndDate: '2021-11-07',
    createdDatetime: '2019-04-08T13:59:45',
    active: true,
    requirementTypeMainCategory: { code: 'F' },
    length: 34,
    rarCount: 20,
    lengthUnit: 'Days',
  },
  {
    requirementId: 2500199145,
    requirementNotes: null,
    commencementDate: '2018-08-01',
    startDate: '2018-09-01',
    expectedEndDate: null,
    createdDatetime: '2019-04-08T13:59:45',
    active: true,
    requirementTypeMainCategory: { code: 'F' },
    length: 10,
    rarCount: 9,
    lengthUnit: 'Days',
    restrictive: false,
  },
  {
    requirementNotes: null,
    startDate: '2018-08-01',
    expectedStartDate: '2019-04-01',
    createdDatetime: '2019-04-08T14:01:41',
    active: true,
    requirementTypeSubCategory: {
      code: 'W03',
      description: 'Additional Hours',
    },
    requirementTypeMainCategory: {
      code: 'W',
      description: 'Unpaid Work',
    },
    length: 7,
    lengthUnit: 'Hours',
    softDeleted: true,
  },
]

export function requirements(
  crn: string,
  convictionId: number,
  partials: DeepPartial<Requirement>[] = REQUIREMENTS,
): SeedFn {
  return context => {
    const requirements = partials.map(p => fakeRequirement(p))
    context.client.community
      .get(`/secure/offenders/crn/${crn}/convictions/${convictionId}/requirements`)
      .returns({ requirements })
  }
}
