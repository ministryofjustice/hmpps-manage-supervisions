import { Test } from '@nestjs/testing'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { CaseController } from './case.controller'
import { OffenderService } from './offender'
import { CasePage } from './case.types'
import { RedirectResponse } from '../common/dynamic-routing'
import { fakeOffenderDetail, fakePaginated } from '../community-api/community-api.fake'
import {
  fakeContactDetailsViewModel,
  fakePersonalCircumstanceDetail,
  fakePersonalDetailsViewModel,
} from './personal/personal.fake'
import { SentenceService } from './sentence'
import { ScheduleService } from './schedule'
import { AssessRisksAndNeedsApiStatus, RiskService } from './risk'
import {
  fakeComplianceDetails,
  fakeConvictionDetails,
  fakeConvictionRequirement,
  fakeConvictionSummary,
} from './sentence/sentence.fake'
import { fakeNextAppointmentSummary } from './schedule/schedule.fake'
import { MockLinksModule } from '../common/links/links.mock'
import { PersonalService } from './personal'
import { fakeRiskRegistrations, fakeRisks } from './risk/risk.fake'
import { EligibilityService } from '../community-api/eligibility'
import { ActivityComplianceFilter, ActivityService } from './activity'
import { fakeCaseActivityLogGroup } from './activity/activity.fake'
import { DateTime } from 'luxon'

describe('CaseController', () => {
  let subject: CaseController
  let offenderService: SinonStubbedInstance<OffenderService>
  let scheduleService: SinonStubbedInstance<ScheduleService>
  let sentenceService: SinonStubbedInstance<SentenceService>
  let riskService: SinonStubbedInstance<RiskService>
  let personalService: SinonStubbedInstance<PersonalService>
  let activityService: SinonStubbedInstance<ActivityService>

  beforeEach(async () => {
    offenderService = createStubInstance(OffenderService)
    scheduleService = createStubInstance(ScheduleService)
    sentenceService = createStubInstance(SentenceService)
    riskService = createStubInstance(RiskService)
    personalService = createStubInstance(PersonalService)
    activityService = createStubInstance(ActivityService)
    const module = await Test.createTestingModule({
      controllers: [CaseController],
      imports: [MockLinksModule],
      providers: [
        { provide: OffenderService, useValue: offenderService },
        { provide: SentenceService, useValue: sentenceService },
        { provide: ScheduleService, useValue: scheduleService },
        { provide: RiskService, useValue: riskService },
        { provide: PersonalService, useValue: personalService },
        { provide: EligibilityService, useValue: null },
        { provide: ActivityService, useValue: activityService },
      ],
    }).compile()
    subject = module.get(CaseController)
  })

  it('redirects to overview', () => {
    expect(subject.getIndex('some-crn')).toEqual({
      url: '/Case?crn=some-crn',
      statusCode: 302,
    } as RedirectResponse)
  })

  it('gets overview', async () => {
    const offender = fakeOffenderDetail()
    offenderService.getOffenderDetail.withArgs('some-crn').resolves(offender)
    const viewModel: any = { page: CasePage.Overview }
    const stub = offenderService.casePageOf.withArgs(offender, match.any).returns(viewModel)

    const circumstances = [fakePersonalCircumstanceDetail()]
    personalService.getPersonalCircumstances.withArgs('some-crn').resolves(circumstances)

    const contactDetails = fakeContactDetailsViewModel()
    const personalDetails = fakePersonalDetailsViewModel()
    personalService.getPersonalDetails
      .withArgs(offender, null, circumstances, null)
      .returns({ contactDetails, personalDetails })

    const conviction = fakeConvictionDetails({
      requirements: [fakeConvictionRequirement({ isRar: true, name: 'Some RAR requirement' })],
    })
    sentenceService.getConvictionDetails.withArgs('some-crn').resolves(conviction)

    const nextAppointment = fakeNextAppointmentSummary()
    scheduleService.getNextAppointment.withArgs('some-crn').resolves(nextAppointment)

    const registrations = fakeRiskRegistrations()
    riskService.getRiskRegistrations.withArgs('some-crn').resolves(registrations)

    const risks = fakeRisks()
    riskService.getRisks.withArgs('some-crn').resolves(risks)

    const compliance = fakeComplianceDetails()
    sentenceService.getSentenceComplianceDetails.withArgs('some-crn').resolves(compliance)

    const contacts = fakePaginated([fakeCaseActivityLogGroup()])
    const appointmentsWithoutAnOutcome = contacts.content
      .flatMap(x => x.entries)
      .filter(x => x.start < DateTime.now())
      .sort((a, b) => (a.start > b.start ? 1 : -1))
    const convictionSummary = fakeConvictionSummary()

    sentenceService.getCurrentConvictionSummary.withArgs('some-crn').resolves(convictionSummary)
    activityService.getActivityLogPage
      .withArgs('some-crn', offender, {
        conviction: convictionSummary,
        complianceFilter: ActivityComplianceFilter.WithoutOutcome,
      })
      .resolves(contacts)

    const observed = await subject.getOverview('some-crn')

    expect(observed).toBe(viewModel)
    expect(stub.getCall(0).args[1]).toEqual({
      page: CasePage.Overview,
      assessRisksAndNeedsApiStatus: AssessRisksAndNeedsApiStatus.Available,
      contactDetails,
      personalDetails,
      nextAppointment,
      registrations,
      risks,
      compliance,
      appointmentsWithoutAnOutcome,
    })
  })
})
