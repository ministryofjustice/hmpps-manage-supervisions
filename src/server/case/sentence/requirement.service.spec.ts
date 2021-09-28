import { Test } from '@nestjs/testing'
import { RequirementService } from './requirement.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../../community-api/community-api.mock'
import { FakeConfigModule } from '../../config/config.fake'
import { fakeRequirement } from '../../community-api/community-api.fake'
import { ConvictionRequirement, ConvictionRequirementType, GetConvictionRequirementsOptions } from './sentence.types'
import { fakeOkResponse } from '../../common/rest/rest.fake'
import { CommunityApiService } from '../../community-api'
import { DateTime } from 'luxon'

describe('RequirementService', () => {
  let subject: RequirementService
  let community: MockCommunityApiService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [MockCommunityApiModule.register(), FakeConfigModule.register()],
      providers: [RequirementService],
    }).compile()

    subject = module.get(RequirementService)
    community = module.get(CommunityApiService)
  })

  it('should be defined', async () => {
    const options: GetConvictionRequirementsOptions = { crn: 'some-crn', convictionId: 100 }
    const rarRequirement1 = fakeRequirement({
      requirementId: 1,
      length: 4,
      lengthUnit: 'Day',
      requirementNotes: 'RAR 1',
      startDate: '2020-06-20',
      expectedEndDate: null,
    })
    const rarRequirement2 = fakeRequirement({
      requirementId: 2,
      length: 5,
      lengthUnit: 'Day',
      requirementNotes: 'RAR 2',
      startDate: null,
      expectedStartDate: '2020-12-20',
      expectedEndDate: '2021-12-20',
    })
    const softDeletedRequirement = fakeRequirement({ softDeleted: true })
    const requirement = fakeRequirement({
      requirementId: 3,
      length: 6,
      lengthUnit: 'Month',
      requirementTypeMainCategory: { code: 'M' },
      requirementNotes: 'Plain old requirement',
      startDate: null,
      expectedStartDate: null,
      expectedEndDate: null,
    })
    const terminated = fakeRequirement({
      requirementId: 4,
      length: 1,
      lengthUnit: 'Year',
      requirementTypeMainCategory: { code: 'H' },
      requirementNotes: 'Terminated requirement',
      startDate: '2021-01-01',
      terminationDate: '2021-02-01',
      active: false,
    })
    community.requirement.getRequirementsByConvictionIdUsingGET.withArgs(options).resolves(
      fakeOkResponse({
        requirements: [rarRequirement1, rarRequirement2, softDeletedRequirement, requirement, terminated],
      }),
    )

    const observed = await subject.getConvictionRequirements(options)

    expect(observed).toEqual([
      {
        type: ConvictionRequirementType.Aggregate,
        name: '9 days RAR',
        isRar: true,
        requirements: [
          {
            id: 1,
            length: '4 days',
            notes: 'RAR 1',
            startDate: {
              value: DateTime.fromObject({ year: 2020, month: 6, day: 20 }),
              expected: false,
            },
            endDate: null,
          },
          {
            id: 2,
            length: '5 days',
            notes: 'RAR 2',
            startDate: {
              value: DateTime.fromObject({ year: 2020, month: 12, day: 20 }),
              expected: true,
            },
            endDate: {
              value: DateTime.fromObject({ year: 2021, month: 12, day: 20 }),
              expected: true,
            },
          },
        ],
      },
      {
        id: 3,
        type: ConvictionRequirementType.Unit,
        name: '6 months curfew',
        isRar: false,
        length: '6 months',
        notes: 'Plain old requirement',
        startDate: null,
        endDate: null,
      },
      {
        id: 4,
        type: ConvictionRequirementType.Unit,
        name: '1 year alcohol treatment (terminated)',
        isRar: false,
        length: '1 year',
        notes: 'Terminated requirement',
        startDate: {
          value: DateTime.fromObject({ year: 2021, month: 1, day: 1 }),
          expected: false,
        },
        endDate: {
          value: DateTime.fromObject({ year: 2021, month: 2, day: 1 }),
          expected: false,
        },
      },
    ] as ConvictionRequirement[])
  })
})
