import { Test } from '@nestjs/testing'
import { RiskController } from './risk.controller'
import { fakeBreadcrumbs, MockLinksModule } from '../../../common/links/links.mock'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { OffenderService } from '../offender.service'
import { RiskService } from './risk.service'
import { fakeOffenderDetailSummary } from '../../../community-api/community-api.fake'
import { fakeRegistrationDetails, fakeRiskRegistrations } from './risk.fake'
import { RemovedRisksListViewModel, RiskDetailsViewModel } from './risk.types'
import { BreadcrumbType } from '../../../common/links'
import { OffenderDetail, OffenderDetailSummary } from '../../../community-api/client'
import { DateTime } from 'luxon'
import { RedirectResponse } from '../../../common'

describe('RiskController', () => {
  let subject: RiskController
  let offenderService: SinonStubbedInstance<OffenderService>
  let riskService: SinonStubbedInstance<RiskService>
  let offender: OffenderDetail | OffenderDetailSummary

  beforeEach(async () => {
    offenderService = createStubInstance(OffenderService)
    riskService = createStubInstance(RiskService)

    const module = await Test.createTestingModule({
      controllers: [RiskController],
      imports: [MockLinksModule],
      providers: [
        { provide: OffenderService, useValue: offenderService },
        { provide: RiskService, useValue: riskService },
      ],
    }).compile()

    subject = module.get(RiskController)
  })

  function havingOffenderSummary() {
    offender = fakeOffenderDetailSummary({
      firstName: 'Liz',
      middleNames: ['Danger'],
      surname: 'Haggis',
      otherIds: { crn: 'some-crn' },
    })
    offenderService.getOffenderSummary.withArgs('some-crn').resolves(offender)
  }

  it('gets removed risk list', async () => {
    havingOffenderSummary()

    const risks = fakeRiskRegistrations()
    riskService.getRiskRegistrations.withArgs('some-crn').resolves(risks)

    const observed = await subject.getRemovedRiskFlags('some-crn')

    expect(observed).toEqual({
      displayName: 'Liz Danger Haggis',
      breadcrumbs: fakeBreadcrumbs(BreadcrumbType.RemovedRisksList, {
        crn: 'some-crn',
        offenderName: 'Liz Danger Haggis',
      }),
      removedRisks: risks.inactive,
    } as RemovedRisksListViewModel)
  })

  it('gets risk detail', async () => {
    havingOffenderSummary()

    const details = fakeRegistrationDetails()
    riskService.getRiskRegistrationDetails.withArgs('some-crn', 1234).resolves(details)

    const observed = await subject.getRiskDetails('some-crn', 1234)

    expect(observed).toEqual({
      displayName: 'Liz Danger Haggis',
      breadcrumbs: fakeBreadcrumbs(BreadcrumbType.RiskDetails, {
        crn: 'some-crn',
        offenderName: 'Liz Danger Haggis',
        entityName: details.text,
      }),
      registration: details,
      exitUrl: '/offender/some-crn/to-delius',
    } as RiskDetailsViewModel)
  })

  it('risk detail redirects to removed risk detail if is removed risk', async () => {
    havingOffenderSummary()

    const details = fakeRegistrationDetails({
      removed: DateTime.fromObject({ year: 2018, month: 5, day: 2, hour: 10, minute: 23 }),
      removedBy: 'Oliver Dank',
    })
    riskService.getRiskRegistrationDetails.withArgs('some-crn', 1234).resolves(details)

    const observed = await subject.getRiskDetails('some-crn', 1234)

    expect(observed).toEqual({
      statusCode: 302,
      url: details.link,
    } as RedirectResponse)
  })

  it('gets removed risk detail', async () => {
    havingOffenderSummary()

    const details = fakeRegistrationDetails({
      removed: DateTime.fromObject({ year: 2018, month: 5, day: 2, hour: 10, minute: 23 }),
      removedBy: 'Oliver Dank',
    })
    riskService.getRiskRegistrationDetails.withArgs('some-crn', 2345).resolves(details)

    const observed = await subject.getRemovedRiskDetails('some-crn', 2345)

    expect(observed).toEqual({
      displayName: 'Liz Danger Haggis',
      breadcrumbs: fakeBreadcrumbs(BreadcrumbType.RemovedRiskDetails, {
        crn: 'some-crn',
        offenderName: 'Liz Danger Haggis',
        entityName: details.text,
      }),
      registration: details,
      exitUrl: '/offender/some-crn/to-delius',
    } as RiskDetailsViewModel)
  })

  it('removed risk detail redirects to risk detail if not removed', async () => {
    havingOffenderSummary()

    const details = fakeRegistrationDetails()
    riskService.getRiskRegistrationDetails.withArgs('some-crn', 2345).resolves(details)

    const observed = await subject.getRemovedRiskDetails('some-crn', 2345)

    expect(observed).toEqual({
      statusCode: 302,
      url: details.link,
    } as RedirectResponse)
  })
})
