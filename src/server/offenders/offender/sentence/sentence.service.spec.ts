import { Test } from '@nestjs/testing'
import { SentenceService } from './sentence.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../../../community-api/community-api.mock'
import { CommunityApiService } from '../../../community-api'
import { fakeConviction, fakeRequirement } from '../../../community-api/community-api.fake'
import { fakeOkResponse } from '../../../common/rest/rest.fake'
import { DateTime } from 'luxon'
import { quantity } from '../../../util/math'
import { ConvictionDetails } from './sentence.types'

describe('SentenceService', () => {
  let subject: SentenceService
  let community: MockCommunityApiService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SentenceService],
      imports: [MockCommunityApiModule.register()],
    }).compile()

    subject = module.get(SentenceService)
    community = module.get(CommunityApiService)
  })

  it('gets sentence details', async () => {
    const conviction = fakeConviction(
      {
        active: true,
        sentence: {
          startDate: DateTime.now().minus({ month: 6, day: 1 }).toISODate(),
          originalLength: 12,
          originalLengthUnits: 'Months',
        },
      },
      { additionalOffences: 1 },
    )
    const previousConviction = fakeConviction({ active: false })

    community.offender.getConvictionsForOffenderByCrnUsingGET
      .withArgs({ crn: 'some-crn' })
      .resolves(fakeOkResponse([conviction, previousConviction]))

    const requirement = fakeRequirement({ length: 27, rarCount: 5 })
    community.requirement.getRequirementsByConvictionIdUsingGET
      .withArgs({
        crn: 'some-crn',
        convictionId: conviction.convictionId,
        activeOnly: true,
      })
      .resolves(
        fakeOkResponse({
          requirements: [requirement, fakeRequirement({ requirementTypeMainCategory: { code: 'non-rar' } })],
        }),
      )

    const observed = await subject.getConvictionDetails('some-crn')

    const {
      sentence,
      offences: [mainOffence, additionalOffence],
    } = conviction

    expect(observed).toEqual({
      previousConvictions: {
        count: 1,
        lastEnded: DateTime.fromISO(previousConviction.convictionDate),
        link: '/offenders/some-crn/previous-convictions',
      },
      mainOffence: {
        id: mainOffence.offenceId,
        date: DateTime.fromISO(mainOffence.offenceDate),
        description: mainOffence.detail.description,
      },
      additionalOffences: [
        {
          id: additionalOffence.offenceId,
          date: DateTime.fromISO(additionalOffence.offenceDate),
          description: additionalOffence.detail.description,
        },
      ],
      sentence: {
        description: sentence.description,
        convictionDate: DateTime.fromISO(conviction.convictionDate),
        startDate: DateTime.fromISO(sentence.startDate),
        endDate: DateTime.fromISO(sentence.expectedSentenceEndDate),
        length: quantity(sentence.originalLength, sentence.originalLengthUnits),
        elapsed: '6 months elapsed (of 12 months)',
        courtAppearance: conviction.courtAppearance.courtName,
        responsibleCourt: conviction.responsibleCourt.courtName,
      },
      requirement: { length: '27 days', progress: '5 days' },
    } as ConvictionDetails)
  })
})
