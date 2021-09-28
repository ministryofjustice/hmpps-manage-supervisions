import { Test } from '@nestjs/testing'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { ComplianceService } from './compliance.service'
import { Conviction } from '../../community-api/client'
import { fakeConviction } from '../../community-api/community-api.fake'
import { DateTime } from 'luxon'
import { BreachService } from '../../community-api/breach'
import { fakeBreachSummary } from '../../community-api/breach/breach.fake'
import { ComplianceConvictionSummary } from './compliance.types'

describe('ComplianceService', () => {
  let subject: ComplianceService
  let breachService: SinonStubbedInstance<BreachService>

  beforeEach(async () => {
    breachService = createStubInstance(BreachService)

    const module = await Test.createTestingModule({
      providers: [ComplianceService, { provide: BreachService, useValue: breachService }],
    }).compile()

    subject = module.get(ComplianceService)
  })

  it('returns null when sentence is missing', async () => {
    const conviction: Conviction = {}
    const observed = await subject.getComplianceSummary('some-crn', conviction)
    expect(observed).toBeNull()
  })

  it('gets conviction summary', async () => {
    const conviction = fakeConviction({
      sentence: {
        startDate: '2020-05-06',
        terminationDate: '2021-05-06',
        terminationReason: 'Revoked',
        originalLength: 12,
        originalLengthUnits: 'Month',
        sentenceType: { description: 'ORA Community Order' },
      },
      offences: [{ mainOffence: true, offenceCount: 2, detail: { subCategoryDescription: 'Some offence' } }],
    })
    const activeBreach = fakeBreachSummary({ active: true })
    const inactiveBreach = fakeBreachSummary({ active: false })
    breachService.getBreaches.withArgs('some-crn', conviction.convictionId).resolves({
      breaches: [activeBreach, inactiveBreach],
      lastRecentBreachEnd: DateTime.fromObject({ year: 2018, month: 2, day: 1 }),
    })

    const observed = await subject.getComplianceSummary('some-crn', conviction)

    expect(observed).toEqual({
      mainOffence: 'Some offence (2 counts)',
      length: '12 months',
      progress: '12 months',
      name: '12 month Community Order',
      startDate: DateTime.fromObject({ year: 2020, month: 5, day: 6 }),
      endDate: DateTime.fromObject({ year: 2021, month: 5, day: 6 }),
      terminationReason: 'Revoked',
      activeBreach: {
        ...activeBreach,
        additionalActiveBreaches: 0,
      },
      inBreach: true,
      allBreaches: [activeBreach, inactiveBreach],
      previousBreaches: [inactiveBreach],
      lastRecentBreachEnd: DateTime.fromObject({ year: 2018, month: 2, day: 1 }),
    } as ComplianceConvictionSummary)
  })
})
