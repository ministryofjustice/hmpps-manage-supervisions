import { Test } from '@nestjs/testing'
import { OffenderService } from './offender.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../../community-api/community-api.mock'
import { CommunityApiService } from '../../community-api'
import { fakeOffenderDetail, fakeOffenderDetailSummary } from '../../community-api/community-api.fake'
import { fakeOkResponse } from '../../common/rest/rest.fake'
import { MockLinksModule } from '../../common/links/links.mock'
import { CasePage, CasePersonalViewModel } from '../case.types'
import { fakeContactDetailsViewModel, fakePersonalDetailsViewModel } from '../personal/personal.fake'
import { BreadcrumbType } from '../../common/links'

describe('OffenderService', () => {
  let subject: OffenderService
  let community: MockCommunityApiService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OffenderService],
      imports: [MockCommunityApiModule.register(), MockLinksModule],
    }).compile()

    subject = module.get(OffenderService)
    community = module.get(CommunityApiService)
  })

  it('gets offender detail', async () => {
    const offender = fakeOffenderDetail()
    const stub = community.offender.getOffenderDetailByCrnUsingGET.resolves(fakeOkResponse(offender))
    const observed = await subject.getOffenderDetail('some-crn')
    expect(observed).toBe(offender)
    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn' })
  })

  it('gets offender summary', async () => {
    const offender = fakeOffenderDetailSummary()
    const stub = community.offender.getOffenderSummaryByCrnUsingGET.resolves(fakeOkResponse(offender))
    const observed = await subject.getOffenderSummary('some-crn')
    expect(observed).toBe(offender)
    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn' })
  })

  it('gets case view model', () => {
    const contactDetails = fakeContactDetailsViewModel()
    const personalDetails = fakePersonalDetailsViewModel()

    const offender = fakeOffenderDetailSummary({
      otherIds: { crn: 'some-crn', pncNumber: 'some-pnc' },
      firstName: 'Liz',
      middleNames: ['Danger'],
      surname: 'Haggis',
      preferredName: 'Bob',
    })
    const observed = subject.casePageOf<CasePersonalViewModel>(offender, {
      page: CasePage.Personal,
      contactDetails,
      personalDetails,
    })

    const links = MockLinksModule.of({ crn: 'some-crn', offenderName: 'Liz Danger Haggis' })
    expect(observed).toEqual({
      page: CasePage.Personal,
      contactDetails,
      personalDetails,
      ids: {
        crn: 'SOME-CRN',
        pnc: 'some-pnc',
      },
      breadcrumbs: links.breadcrumbs(BreadcrumbType.PersonalDetails),
      displayName: 'Liz Danger Haggis (Bob)',
      shortName: 'Liz Haggis',
      links: {
        arrangeAppointment: links.url(BreadcrumbType.NewAppointment),
        addActivity: links.url(BreadcrumbType.ExitToDelius),
        addressBook: links.url(BreadcrumbType.PersonalAddresses),
        circumstances: links.url(BreadcrumbType.PersonalCircumstances),
        disabilities: links.url(BreadcrumbType.PersonalDisabilities),
        overview: links.url(BreadcrumbType.Case),
        personal: links.url(BreadcrumbType.PersonalDetails),
        schedule: links.url(BreadcrumbType.CaseSchedule),
        sentence: links.url(BreadcrumbType.CaseSentence),
        additionalOffences: links.url(BreadcrumbType.CaseSentenceOffences),
        activity: links.url(BreadcrumbType.CaseActivityLog),
        compliance: links.url(BreadcrumbType.Compliance),
        risk: links.url(BreadcrumbType.CaseRisk),
        toDelius: links.url(BreadcrumbType.ExitToDelius),
        toOASys: links.url(BreadcrumbType.ExitToOASys),
        viewInactiveRegistrations: links.url(BreadcrumbType.RemovedRisksList),
        previousConvictions: links.url(BreadcrumbType.CasePreviousConvictions),
        startBreach: links.url(BreadcrumbType.ExitToDelius),
      },
    })
  })
})
