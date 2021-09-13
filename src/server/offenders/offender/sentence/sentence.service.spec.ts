import { Test } from '@nestjs/testing'
import { SentenceService } from './sentence.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../../../community-api/community-api.mock'
import { CommunityApiService } from '../../../community-api'
import { fakeConviction, fakeOffence } from '../../../community-api/community-api.fake'
import { fakeOkResponse } from '../../../common/rest/rest.fake'
import { DateTime } from 'luxon'
import {
  ComplianceConvictionSummary,
  ComplianceDetails,
  ComplianceStatusAlertLevel,
  ConvictionDetails,
  ConvictionRequirement,
  ConvictionRequirementType,
  CurrentComplianceConvictionSummary,
  PreviousConvictionSummary,
} from './sentence.types'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { RequirementService } from './requirement.service'
import { fakeComplianceConvictionSummary, fakeConvictionRequirement } from './sentence.fake'
import { Conviction } from '../../../community-api/client'
import { ComplianceService } from './compliance.service'
import { ActivityComplianceFilter, ActivityService } from '../activity'
import { BreachService } from '../../../community-api/breach'
import { fakeBreachSummary } from '../../../community-api/breach/breach.fake'
import { MockLinksModule } from '../../../common/links/links.mock'
import { BreadcrumbType } from '../../../common/links'

describe('SentenceService', () => {
  let subject: SentenceService
  let community: MockCommunityApiService
  let requirementService: SinonStubbedInstance<RequirementService>
  let complianceService: SinonStubbedInstance<ComplianceService>
  let activityService: SinonStubbedInstance<ActivityService>
  let breachService: SinonStubbedInstance<BreachService>

  beforeEach(async () => {
    requirementService = createStubInstance(RequirementService)
    complianceService = createStubInstance(ComplianceService)
    activityService = createStubInstance(ActivityService)
    breachService = createStubInstance(BreachService)
    const module = await Test.createTestingModule({
      providers: [
        SentenceService,
        { provide: RequirementService, useValue: requirementService },
        { provide: ComplianceService, useValue: complianceService },
        { provide: ActivityService, useValue: activityService },
        { provide: BreachService, useValue: breachService },
      ],
      imports: [
        MockCommunityApiModule.register(),
        MockLinksModule.register({ [BreadcrumbType.CaseActivityLog]: '/case-activity-log' }),
      ],
    }).compile()

    subject = module.get(SentenceService)
    community = module.get(CommunityApiService)
  })

  function havingConvictions(...partials: DeepPartial<Conviction>[]) {
    const convictions = partials.map(x => fakeConviction(x))
    community.offender.getConvictionsForOffenderByCrnUsingGET
      .withArgs({ crn: 'some-crn' })
      .resolves(fakeOkResponse(convictions))
    return convictions
  }
  function havingBreaches(crn: string, convictionId: number) {
    const activeBreach = fakeBreachSummary({ active: true })
    const inactiveBreaches = [fakeBreachSummary({ active: false, proven: true }), fakeBreachSummary({ active: false })]
    const breachesResult = {
      breaches: [activeBreach, ...inactiveBreaches],
      lastRecentBreachEnd: DateTime.fromObject({ year: 2018, month: 2, day: 1 }),
    }
    breachService.getBreaches.withArgs(crn, convictionId).resolves(breachesResult)
    return breachesResult
  }

  function havingRequirements(convictionId: number, ...partials: DeepPartial<ConvictionRequirement>[]) {
    const requirements = partials.map(x => fakeConvictionRequirement(x))
    requirementService.getConvictionRequirements
      .withArgs(match({ crn: 'some-crn', convictionId }))
      .resolves(requirements)
    return requirements
  }

  it('gets sentence details', async () => {
    const sentenceDate = DateTime.now()
      .minus({ month: 6, day: 1 })
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

    havingConvictions(
      {
        convictionId: 100,
        active: true,
        convictionDate: '2020-01-02',
        sentence: {
          startDate: sentenceDate.toISODate(),
          expectedSentenceEndDate: '2021-01-02',
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
              code: '80700',
              description: 'Some main offence',
              mainCategoryDescription: 'Some offence category',
              subCategoryDescription: 'Some offence sub-category',
            },
          }),
          fakeOffence({
            mainOffence: false,
            offenceCount: 9,
            offenceDate: '2021-05-01',
            detail: {
              code: '80701',
              subCategoryDescription: 'Some additional offence',
              mainCategoryDescription: 'Some additional offence category',
            },
          }),
        ],
      },
      { active: false, convictionDate: '2019-01-02', convictionId: 101 },
      { active: false, convictionDate: '2019-01-02', convictionId: 102 },
    )
    havingBreaches('some-crn', 101)
    havingBreaches('some-crn', 102)
    const requirements = havingRequirements(100, {})

    const observed = await subject.getConvictionDetails('some-crn')

    expect(observed).toEqual({
      previousConvictions: {
        count: 2,
        lastEnded: DateTime.fromObject({ year: 2019, month: 1, day: 2 }),
      },
      previousBreaches: {
        count: 2,
      },
      offence: {
        id: '1',
        date: DateTime.fromObject({ year: 2021, month: 2, day: 1 }),
        description: 'Some offence sub-category (8 counts)',
        category: 'Some offence category',
        code: '80700',
        additionalOffences: [
          {
            code: '80701',
            name: 'Some additional offence (9 counts)',
            category: 'Some additional offence category',
            date: DateTime.fromObject({ year: 2021, month: 5, day: 1 }),
          },
        ],
      },
      sentence: {
        description: '12 month Community Order',
        convictionDate: DateTime.fromObject({ year: 2020, month: 1, day: 2 }),
        startDate: sentenceDate,
        endDate: DateTime.fromObject({ year: 2021, month: 1, day: 2 }),
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
      requirements,
    } as ConvictionDetails)
  })

  describe('offence detail', () => {
    it('handles no current conviction', async () => {
      havingConvictions()
      const observed = await subject.getOffenceDetails('some-crn')
      expect(observed).toBeNull()
    })

    it('gets offence details', async () => {
      havingConvictions({
        active: true,
        offences: [
          fakeOffence({
            mainOffence: true,
            offenceId: '1',
            offenceDate: '2021-02-01',
            offenceCount: 8,
            detail: {
              code: '80700',
              description: 'Some main offence',
              mainCategoryDescription: 'Some offence category',
              subCategoryDescription: 'Some offence sub-category',
            },
          }),
          fakeOffence({
            mainOffence: false,
            offenceCount: 9,
            offenceDate: '2021-05-01',
            detail: {
              code: '80701',
              subCategoryDescription: 'Some additional offence',
              mainCategoryDescription: 'Some additional offence category',
            },
          }),
        ],
      })

      const observed = await subject.getOffenceDetails('some-crn')

      expect(observed).toEqual({
        id: '1',
        date: DateTime.fromObject({ year: 2021, month: 2, day: 1 }),
        description: 'Some offence sub-category (8 counts)',
        category: 'Some offence category',
        code: '80700',
        additionalOffences: [
          {
            code: '80701',
            name: 'Some additional offence (9 counts)',
            category: 'Some additional offence category',
            date: DateTime.fromObject({ year: 2021, month: 5, day: 1 }),
          },
        ],
      })
    })
  })

  describe('compliance summary', () => {
    function havingComplianceSummary(conviction: Conviction, partial: DeepPartial<ComplianceConvictionSummary> = {}) {
      const summary = fakeComplianceConvictionSummary(partial)
      complianceService.convictionSummary.withArgs('some-crn', conviction).resolves(summary)
      return summary
    }

    function havingAppointmentCounts(
      counts: Partial<Record<ActivityComplianceFilter, number>>,
      from: DateTime | null = null,
    ) {
      for (const [filter, count] of Object.entries(counts)) {
        activityService.getActivityLogComplianceCount
          .withArgs('some-crn', 100, filter as ActivityComplianceFilter, from)
          .resolves(count)
      }
    }

    it('gets breach in progress compliance', async () => {
      const previousConvictionDate = DateTime.now()
        .minus({ months: 20 })
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      const [conviction, previousConviction] = havingConvictions(
        { convictionId: 100, active: true },
        { active: false, sentence: { terminationDate: previousConvictionDate.toISODate() } },
        { active: false, sentence: { terminationDate: '2018-01-01', description: 'Really old conviction, ignored' } },
      )
      havingRequirements(100, {
        type: ConvictionRequirementType.Unit,
        isRar: true,
        name: 'Some RAR requirement',
      })
      const currentSummary = havingComplianceSummary(conviction)
      const previousSummary = havingComplianceSummary(previousConviction)
      havingAppointmentCounts(
        {
          [ActivityComplianceFilter.Appointments]: 7,
          [ActivityComplianceFilter.CompliedAppointments]: 1,
          [ActivityComplianceFilter.FailedToComplyAppointments]: 2,
          [ActivityComplianceFilter.AcceptableAbsenceAppointments]: 3,
          [ActivityComplianceFilter.WithoutOutcome]: 1,
        },
        currentSummary.lastRecentBreachEnd,
      )

      const observed = await subject.getSentenceComplianceDetails('some-crn')

      expect(observed).toEqual({
        current: {
          ...currentSummary,
          requirement: 'Some RAR requirement',
          appointments: {
            acceptableAbsences: {
              name: '3 acceptable absences',
              value: 3,
              link: '/case-activity-log/acceptable-absence-appointments',
            },
            complied: {
              name: '1 complied',
              value: 1,
              link: '/case-activity-log/complied-appointments',
            },
            failureToComply: {
              name: '2 unacceptable absences',
              value: 2,
              link: '/case-activity-log/failed-to-comply-appointments',
            },
            withoutAnOutcome: {
              name: '1 without a recorded outcome',
              value: 1,
              link: '/case-activity-log/without-an-outcome',
            },
            total: {
              name: '7 national standard appointments',
              value: 7,
              link: '/case-activity-log/appointments',
            },
          },
          period: 'since last breach',
          status: {
            alertLevel: ComplianceStatusAlertLevel.Danger,
            description: 'Breach in progress',
            value: 'in-breach',
            breachSuggested: false,
          },
        },
        previous: {
          convictions: [previousSummary],
          dateFrom: DateTime.now().minus({ years: 2 }).set({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }),
          totalBreaches: 1,
        },
      } as ComplianceDetails)
    })

    it('gets failure to comply compliance', async () => {
      const [conviction] = havingConvictions({ convictionId: 100, active: true, sentence: { failureToComplyLimit: 3 } })
      havingRequirements(100)
      havingComplianceSummary(conviction, { inBreach: false, activeBreach: null, lastRecentBreachEnd: null })
      havingAppointmentCounts({
        [ActivityComplianceFilter.Appointments]: 6,
        [ActivityComplianceFilter.CompliedAppointments]: 1,
        [ActivityComplianceFilter.FailedToComplyAppointments]: 2,
        [ActivityComplianceFilter.AcceptableAbsenceAppointments]: 3,
      })

      const observed = await subject.getSentenceComplianceDetails('some-crn')

      expect({ period: observed.current.period, status: observed.current.status }).toEqual({
        period: 'within 12 months',
        status: {
          alertLevel: ComplianceStatusAlertLevel.Warning,
          description: '2 failures to comply within 12 months',
          value: 'failure-to-comply',
          breachSuggested: false,
        },
      } as Pick<CurrentComplianceConvictionSummary, 'period' | 'status'>)
    })

    it('gets pending breach compliance', async () => {
      const [conviction] = havingConvictions({ convictionId: 100, active: true, sentence: { failureToComplyLimit: 2 } })
      havingRequirements(100)
      havingComplianceSummary(conviction, { inBreach: false, lastRecentBreachEnd: null })
      havingAppointmentCounts({
        [ActivityComplianceFilter.Appointments]: 6,
        [ActivityComplianceFilter.CompliedAppointments]: 1,
        [ActivityComplianceFilter.FailedToComplyAppointments]: 2,
        [ActivityComplianceFilter.AcceptableAbsenceAppointments]: 3,
      })

      const observed = await subject.getSentenceComplianceDetails('some-crn')

      expect({ period: observed.current.period, status: observed.current.status }).toEqual({
        period: 'within 12 months',
        status: {
          alertLevel: ComplianceStatusAlertLevel.Danger,
          description: '2 failures to comply within 12 months',
          value: 'pending-breach',
          breachSuggested: true,
        },
      } as Pick<CurrentComplianceConvictionSummary, 'period' | 'status'>)
    })

    it('gets clean compliance', async () => {
      const [conviction] = havingConvictions({ convictionId: 100, active: true })
      havingRequirements(100)
      havingComplianceSummary(conviction, { inBreach: false, activeBreach: null, lastRecentBreachEnd: null })
      havingAppointmentCounts({
        [ActivityComplianceFilter.Appointments]: 6,
        [ActivityComplianceFilter.CompliedAppointments]: 1,
        [ActivityComplianceFilter.FailedToComplyAppointments]: 0,
        [ActivityComplianceFilter.AcceptableAbsenceAppointments]: 3,
      })

      const observed = await subject.getSentenceComplianceDetails('some-crn')

      expect({ period: observed.current.period, status: observed.current.status }).toEqual({
        period: 'within 12 months',
        status: {
          alertLevel: ComplianceStatusAlertLevel.Success,
          description: 'No failures to comply within 12 months',
          value: 'clean',
          breachSuggested: false,
        },
      } as Pick<CurrentComplianceConvictionSummary, 'period' | 'status'>)
    })

    it('gets clean since previous breach compliance', async () => {
      const [conviction] = havingConvictions({ convictionId: 100, active: true })
      havingRequirements(100)
      const current = havingComplianceSummary(conviction, { inBreach: false, activeBreach: null })
      havingAppointmentCounts(
        {
          [ActivityComplianceFilter.Appointments]: 6,
          [ActivityComplianceFilter.CompliedAppointments]: 1,
          [ActivityComplianceFilter.FailedToComplyAppointments]: 0,
          [ActivityComplianceFilter.AcceptableAbsenceAppointments]: 3,
        },
        current.lastRecentBreachEnd,
      )

      const observed = await subject.getSentenceComplianceDetails('some-crn')

      expect({ period: observed.current.period, status: observed.current.status }).toEqual({
        period: 'since last breach',
        status: {
          alertLevel: ComplianceStatusAlertLevel.Warning,
          description: 'No failures to comply since last breach',
          value: 'previous-breach',
          breachSuggested: false,
        },
      } as Pick<CurrentComplianceConvictionSummary, 'period' | 'status'>)
    })
  })

  describe('getting previous convictions', () => {
    it('handles no previous convictions', async () => {
      havingConvictions({ convictionId: 100, active: true })
      const observed = await subject.getPreviousConvictions('some-crn')
      expect(observed).toEqual([])
    })

    it('gets previous convictions', async () => {
      havingConvictions({
        convictionId: 100,
        active: false,
        sentence: {
          sentenceType: { description: 'ORA Community Order' },
          originalLength: 12,
          originalLengthUnits: 'Months',
          terminationDate: '2021-08-25',
        },
        offences: [
          {
            mainOffence: true,
            offenceCount: 2,
            detail: { subCategoryDescription: 'Some offence' },
          },
        ],
      })
      const observed = await subject.getPreviousConvictions('some-crn')
      expect(observed).toEqual([
        {
          endDate: DateTime.fromObject({ year: 2021, month: 8, day: 25 }),
          mainOffence: 'Some offence (2 counts)',
          name: '12 month Community Order',
        },
      ] as PreviousConvictionSummary[])
    })
  })
})
