import { Test } from '@nestjs/testing'
import { SentenceService } from './sentence.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../../../community-api/community-api.mock'
import { CommunityApiService } from '../../../community-api'
import { fakeConviction, fakeOffence } from '../../../community-api/community-api.fake'
import { fakeOkResponse } from '../../../common/rest/rest.fake'
import { DateTime } from 'luxon'
import { ConvictionDetails } from './sentence.types'
import { SinonStubbedInstance, createStubInstance, match } from 'sinon'
import { RequirementService } from './requirement.service'
import { fakeConvictionRequirement } from './sentence.fake'

describe('SentenceService', () => {
  let subject: SentenceService
  let community: MockCommunityApiService
  let requirementService: SinonStubbedInstance<RequirementService>

  beforeEach(async () => {
    requirementService = createStubInstance(RequirementService)

    const module = await Test.createTestingModule({
      providers: [SentenceService, { provide: RequirementService, useValue: requirementService }],
      imports: [MockCommunityApiModule.register()],
    }).compile()

    subject = module.get(SentenceService)
    community = module.get(CommunityApiService)
  })

  it('gets sentence details', async () => {
    const sentenceDate = DateTime.now()
      .minus({ month: 6, day: 1 })
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    const conviction = fakeConviction({
      active: true,
      sentence: {
        startDate: sentenceDate.toISODate(),
        originalLength: 12,
        originalLengthUnits: 'Months',
        sentenceType: { description: 'ORA community order' },
        additionalSentences: [
          {
            amount: 100,
            length: 6,
            notes: 'Some additional sentence notes',
            type: { description: 'Some additional sentence' },
          },
        ],
      },
      courtAppearance: {
        courtName: 'Some court',
      },
      responsibleCourt: { courtName: 'Some responsible court' },
      offences: [
        fakeOffence({
          mainOffence: true,
          offenceId: '1',
          offenceDate: '2021-02-01',
          offenceCount: 8,
          detail: {
            description: 'Some main offence',
            mainCategoryDescription: 'Some offence category',
            subCategoryDescription: 'Some offence sub-category',
          },
        }),
        fakeOffence({
          mainOffence: false,
          offenceCount: 9,
          detail: { subCategoryDescription: 'Some additional offence' },
        }),
      ],
    })
    const previousConviction = fakeConviction({ active: false })
    const requirement = fakeConvictionRequirement()

    community.offender.getConvictionsForOffenderByCrnUsingGET
      .withArgs({ crn: 'some-crn' })
      .resolves(fakeOkResponse([conviction, previousConviction]))

    requirementService.getConvictionRequirements
      .withArgs(match({ crn: 'some-crn', convictionId: conviction.convictionId }))
      .resolves([requirement])

    const observed = await subject.getConvictionDetails('some-crn')

    const { sentence } = conviction

    expect(observed).toEqual({
      previousConvictions: {
        count: 1,
        lastEnded: DateTime.fromISO(previousConviction.convictionDate),
        link: '/offenders/some-crn/previous-convictions',
      },
      offence: {
        id: '1',
        date: DateTime.fromObject({ year: 2021, month: 2, day: 1 }),
        description: 'Some offence sub-category (8 counts)',
        category: 'Some offence category',
        additionalOffences: ['Some additional offence (9 counts)'],
      },
      sentence: {
        description: '12 month Community Order',
        convictionDate: DateTime.fromISO(conviction.convictionDate),
        startDate: sentenceDate,
        endDate: DateTime.fromISO(sentence.expectedSentenceEndDate),
        elapsed: '6 months elapsed (of 12 months)',
        courtAppearance: 'Some court',
        responsibleCourt: 'Some responsible court',
        additionalSentences: [
          {
            length: 6,
            name: 'Some additional sentence',
            notes: 'Some additional sentence notes',
            value: 100,
          },
        ],
      },
      requirements: [requirement],
    } as ConvictionDetails)
  })
})
