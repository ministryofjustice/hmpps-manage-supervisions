import { Test } from '@nestjs/testing'
import { RiskController } from './risk.controller'
import { MockLinksModule } from '../../common/links/links.mock'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { RiskService } from './risk.service'
import { fakeRegistrationDetails, fakeRiskRegistrations, fakeRisks } from './risk.fake'
import { AssessRisksAndNeedsApiStatus, RemovedRisksListViewModel, RiskDetailsViewModel } from './risk.types'
import { BreadcrumbType, UtmMedium } from '../../common/links'
import { DateTime } from 'luxon'
import { RedirectResponse } from '../../common'
import { CasePage, CaseRiskViewModel } from '../case.types'
import { EligibilityService } from '../../community-api/eligibility'
import { MockOffenderModule, OffenderServiceFixture } from '../offender/offender.mock'

describe('RiskController', () => {
  let subject: RiskController
  let offenderFixture: OffenderServiceFixture
  let riskService: SinonStubbedInstance<RiskService>

  beforeEach(async () => {
    riskService = createStubInstance(RiskService)

    const module = await Test.createTestingModule({
      controllers: [RiskController],
      imports: [MockLinksModule, MockOffenderModule.register()],
      providers: [
        { provide: RiskService, useValue: riskService },
        { provide: EligibilityService, useValue: null },
      ],
    }).compile()

    subject = module.get(RiskController)
    offenderFixture = module.get(OffenderServiceFixture)
  })

  it('gets removed risk list', async () => {
    offenderFixture.havingOffender()

    const risks = fakeRiskRegistrations()
    riskService.getRiskRegistrations.withArgs('some-crn').resolves(risks)

    const observed = await subject.getRemovedRiskFlags('some-crn')

    const links = MockLinksModule.of({ crn: 'some-crn', offenderName: 'Liz Danger Haggis' })
    expect(observed).toEqual({
      displayName: 'Liz Danger Haggis',
      breadcrumbs: links.breadcrumbs(BreadcrumbType.RemovedRisksList),
      removedRisks: risks.inactive,
    } as RemovedRisksListViewModel)
  })

  it('gets risk detail', async () => {
    offenderFixture.havingOffender()

    const details = fakeRegistrationDetails()
    riskService.getRiskRegistrationDetails.withArgs('some-crn', 1234).resolves(details)

    const observed = await subject.getRiskDetails('some-crn', 1234)

    const links = MockLinksModule.of({ crn: 'some-crn', offenderName: 'Liz Danger Haggis', entityName: details.text })
    expect(observed).toEqual({
      displayName: 'Liz Danger Haggis',
      breadcrumbs: links.breadcrumbs(BreadcrumbType.RiskDetails),
      registration: details,
    } as RiskDetailsViewModel)
  })

  it('risk detail redirects to removed risk detail if is removed risk', async () => {
    offenderFixture.havingOffender()

    const details = fakeRegistrationDetails({
      removed: DateTime.fromObject({ year: 2018, month: 5, day: 2, hour: 10, minute: 23 }),
      removedBy: 'Oliver Dank',
    })
    riskService.getRiskRegistrationDetails.withArgs('some-crn', 1234).resolves(details)

    const observed = await subject.getRiskDetails('some-crn', 1234)

    expect(observed).toEqual({ statusCode: 302, url: details.links.view } as RedirectResponse)
  })

  it('gets removed risk detail', async () => {
    offenderFixture.havingOffender()

    const details = fakeRegistrationDetails({
      removed: DateTime.fromObject({ year: 2018, month: 5, day: 2, hour: 10, minute: 23 }),
      removedBy: 'Oliver Dank',
    })
    riskService.getRiskRegistrationDetails.withArgs('some-crn', 2345).resolves(details)

    const observed = await subject.getRemovedRiskDetails('some-crn', 2345)

    const links = MockLinksModule.of({ crn: 'some-crn', offenderName: 'Liz Danger Haggis', entityName: details.text })
    expect(observed).toEqual({
      displayName: 'Liz Danger Haggis',
      breadcrumbs: links.breadcrumbs(BreadcrumbType.RemovedRiskDetails),
      registration: details,
    } as RiskDetailsViewModel)
  })

  it('removed risk detail redirects to risk detail if not removed', async () => {
    offenderFixture.havingOffender()

    const details = fakeRegistrationDetails()
    riskService.getRiskRegistrationDetails.withArgs('some-crn', 2345).resolves(details)

    const observed = await subject.getRemovedRiskDetails('some-crn', 2345)

    expect(observed).toEqual({ statusCode: 302, url: details.links.view } as RedirectResponse)
  })

  it('gets risks', async () => {
    offenderFixture.havingOffender().havingCasePageOf()

    const risks = fakeRisks()
    riskService.getRisks.withArgs('some-crn').resolves(risks)

    const registrations = fakeRiskRegistrations()
    riskService.getRiskRegistrations.withArgs('some-crn').resolves(registrations)

    const observed = await subject.getRisk('some-crn')

    expect(observed).toBe(offenderFixture.caseViewModel)
    offenderFixture.shouldHaveCalledCasePageOf<CaseRiskViewModel>({
      page: CasePage.Risk,
      assessRisksAndNeedsApiStatus: AssessRisksAndNeedsApiStatus.Available,
      risks,
      registrations,
      links: {
        viewInactiveRegistrations: offenderFixture.links.url(BreadcrumbType.RemovedRisksList),
        roshCommunity: offenderFixture.links.url(BreadcrumbType.ExitToOASys, {
          utm: { medium: UtmMedium.Risk, campaign: 'rosh-community' },
        }),
        roshSelf: offenderFixture.links.url(BreadcrumbType.ExitToOASys, {
          utm: { medium: UtmMedium.Risk, campaign: 'rosh-self' },
        }),
        noAssessment: offenderFixture.links.url(BreadcrumbType.ExitToOASys, {
          utm: { medium: UtmMedium.Risk, campaign: 'no-assessment' },
        }),
        addRiskFlag: offenderFixture.links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.Risk, campaign: 'add-risk-flag' },
        }),
      },
    })
  })
})
