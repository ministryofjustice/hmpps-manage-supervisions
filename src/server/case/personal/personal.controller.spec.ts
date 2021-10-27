import { Test } from '@nestjs/testing'
import { PersonalController } from './personal.controller'
import { MockLinksModule } from '../../common/links/links.mock'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { PersonalService } from './personal.service'
import {
  fakeContactDetailsViewModel,
  fakeDisabilityDetail,
  fakeGetAddressDetailResult,
  fakePersonalCircumstanceDetail,
  fakePersonalContactDetail,
  fakePersonalDetailsViewModel,
} from './personal.fake'
import { PersonalAddressesViewModel, PersonalContactViewModel, PersonalDisabilitiesViewModel } from './personal.types'
import { BreadcrumbType, UtmMedium } from '../../common/links'
import { AssessRisksAndNeedsApiStatus, RiskService } from '../risk'
import { CasePage, CasePersonalViewModel } from '../case.types'
import { fakeCriminogenicNeeds } from '../risk/risk.fake'
import { EligibilityService } from '../../community-api/eligibility'
import { MockOffenderModule, OffenderServiceFixture } from '../offender/offender.mock'

describe('PersonalController', () => {
  let subject: PersonalController
  let personalService: SinonStubbedInstance<PersonalService>
  let riskService: SinonStubbedInstance<RiskService>
  let offenderFixture: OffenderServiceFixture

  beforeEach(async () => {
    personalService = createStubInstance(PersonalService)
    riskService = createStubInstance(RiskService)

    const module = await Test.createTestingModule({
      controllers: [PersonalController],
      imports: [MockLinksModule, MockOffenderModule.register()],
      providers: [
        { provide: PersonalService, useValue: personalService },
        { provide: RiskService, useValue: riskService },
        { provide: EligibilityService, useValue: null },
      ],
    }).compile()

    subject = module.get(PersonalController)
    offenderFixture = module.get(OffenderServiceFixture)
  })

  it('gets addresses', async () => {
    offenderFixture.havingOffenderDetail()

    const details = fakeGetAddressDetailResult()
    personalService.getAddressDetail.withArgs(offenderFixture.offender).returns(details)

    const observed = await subject.getAddresses('some-crn')

    const links = MockLinksModule.of({ crn: 'some-crn', offenderName: 'Liz Danger Haggis' })
    expect(observed).toEqual({
      ...details,
      displayName: 'Liz Danger Haggis',
      breadcrumbs: links.breadcrumbs(BreadcrumbType.PersonalAddresses),
      links: {
        addMainAddress: links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.Personal, campaign: 'add-main-address' },
        }),
      },
    } as PersonalAddressesViewModel)
  })

  it('gets disabilities', async () => {
    offenderFixture.havingOffenderDetail()

    const disabilities = [fakeDisabilityDetail()]
    personalService.getDisabilities.withArgs(offenderFixture.offender).returns(disabilities)

    const observed = await subject.getDisabilities('some-crn')

    const links = MockLinksModule.of({ crn: 'some-crn', offenderName: 'Liz Danger Haggis' })
    expect(observed).toEqual({
      disabilities,
      displayName: 'Liz Danger Haggis',
      breadcrumbs: links.breadcrumbs(BreadcrumbType.PersonalDisabilities),
      links: {
        addMainAddress: links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.Personal, campaign: 'add-main-address' },
        }),
      },
    } as PersonalDisabilitiesViewModel)
  })

  it('gets personal contact', async () => {
    offenderFixture.havingOffender()

    const personalContact = fakePersonalContactDetail({ id: 100, description: 'Some personal contact' })
    const otherPersonalContact = fakePersonalContactDetail({ id: 101 })
    personalService.getPersonalContacts.withArgs('some-crn').resolves([otherPersonalContact, personalContact])

    const observed = await subject.getPersonalContact('some-crn', 100)

    const links = MockLinksModule.of({
      id: 100,
      entityName: 'Some personal contact',
      crn: 'some-crn',
      offenderName: 'Liz Danger Haggis',
    })
    expect(observed).toEqual({
      personalContact,
      displayName: 'Liz Danger Haggis',
      breadcrumbs: links.breadcrumbs(BreadcrumbType.PersonalContact),
      links: {
        addMainAddress: links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.Personal, campaign: 'add-main-address' },
        }),
      },
      ids: {
        crn: 'some-crn',
      },
    } as PersonalContactViewModel)
  })

  it('gets personal', async () => {
    offenderFixture.havingOffenderDetail().havingCasePageOf()

    const personalContacts = [fakePersonalContactDetail()]
    personalService.getPersonalContacts.withArgs('some-crn').resolves(personalContacts)

    const circumstances = [fakePersonalCircumstanceDetail()]
    personalService.getPersonalCircumstances.withArgs('some-crn').resolves(circumstances)

    const needs = fakeCriminogenicNeeds()
    riskService.getNeeds.withArgs('some-crn').resolves(needs)

    const contactDetails = fakeContactDetailsViewModel()
    const personalDetails = fakePersonalDetailsViewModel()
    personalService.getPersonalDetails
      .withArgs(offenderFixture.offender, personalContacts, circumstances, needs)
      .returns({ contactDetails, personalDetails })

    const observed = await subject.getPersonal('some-crn')

    expect(observed).toBe(offenderFixture.caseViewModel)
    offenderFixture.shouldHaveCalledCasePageOf<CasePersonalViewModel>({
      page: CasePage.Personal,
      assessRisksAndNeedsApiStatus: AssessRisksAndNeedsApiStatus.Available,
      contactDetails,
      personalDetails,
      links: {
        addressBook: offenderFixture.links.url(BreadcrumbType.PersonalAddresses),
        circumstances: offenderFixture.links.url(BreadcrumbType.PersonalCircumstances),
        disabilities: offenderFixture.links.url(BreadcrumbType.PersonalDisabilities),
        criminogenicNeeds: offenderFixture.links.url(BreadcrumbType.ExitToOASys, {
          utm: { medium: UtmMedium.Personal, campaign: 'criminogenic-needs' },
        }),
        viewEquality: offenderFixture.links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.Personal, campaign: 'view-equality' },
        }),
      },
    })
  })
})
