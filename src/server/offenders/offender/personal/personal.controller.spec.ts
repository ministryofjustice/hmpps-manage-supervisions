import { Test } from '@nestjs/testing'
import { PersonalController } from './personal.controller'
import { fakeBreadcrumbs, MockLinksModule } from '../../../common/links/links.mock'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { OffenderService } from '../offender.service'
import { PersonalService } from './personal.service'
import { fakeOffenderDetail, fakeOffenderDetailSummary } from '../../../community-api/community-api.fake'
import { fakeDisabilityDetail, fakeGetAddressDetailResult, fakePersonalContactDetail } from './personal.fake'
import { PersonalAddressesViewModel, PersonalContactViewModel, PersonalDisabilitiesViewModel } from './personal.types'
import { BreadcrumbType } from '../../../common/links'
import { OffenderDetail, OffenderDetailSummary } from '../../../community-api'

describe('PersonalController', () => {
  let subject: PersonalController
  let offenderService: SinonStubbedInstance<OffenderService>
  let personalService: SinonStubbedInstance<PersonalService>
  let offender: OffenderDetail | OffenderDetailSummary

  beforeEach(async () => {
    offenderService = createStubInstance(OffenderService)
    personalService = createStubInstance(PersonalService)

    const module = await Test.createTestingModule({
      controllers: [PersonalController],
      imports: [MockLinksModule],
      providers: [
        { provide: OffenderService, useValue: offenderService },
        { provide: PersonalService, useValue: personalService },
      ],
    }).compile()

    subject = module.get(PersonalController)
  })

  function havingOffender() {
    offender = fakeOffenderDetail({ firstName: 'Liz', middleNames: ['Danger'], surname: 'Haggis' })
    offenderService.getOffenderDetail.withArgs('some-crn').resolves(offender)
  }

  function havingOffenderSummary() {
    offender = fakeOffenderDetailSummary({ firstName: 'Liz', middleNames: ['Danger'], surname: 'Haggis' })
    offenderService.getOffenderSummary.withArgs('some-crn').resolves(offender)
  }

  it('gets addresses', async () => {
    havingOffender()

    const details = fakeGetAddressDetailResult()
    personalService.getAddressDetail.withArgs(offender).returns(details)

    const observed = await subject.getAddresses('some-crn')

    expect(observed).toEqual({
      ...details,
      displayName: 'Liz Danger Haggis',
      breadcrumbs: fakeBreadcrumbs(BreadcrumbType.PersonalAddresses, {
        crn: 'some-crn',
        offenderName: 'Liz Danger Haggis',
      }),
    } as PersonalAddressesViewModel)
  })

  it('gets disabilities', async () => {
    havingOffender()

    const disabilities = [fakeDisabilityDetail()]
    personalService.getDisabilities.withArgs(offender).returns(disabilities)

    const observed = await subject.getDisabilities('some-crn')

    expect(observed).toEqual({
      disabilities,
      displayName: 'Liz Danger Haggis',
      breadcrumbs: fakeBreadcrumbs(BreadcrumbType.PersonalDisabilities, {
        crn: 'some-crn',
        offenderName: 'Liz Danger Haggis',
      }),
    } as PersonalDisabilitiesViewModel)
  })

  it('gets personal contact', async () => {
    havingOffenderSummary()

    const personalContact = fakePersonalContactDetail({ id: 100, description: 'Some personal contact' })
    const otherPersonalContact = fakePersonalContactDetail({ id: 101 })
    personalService.getPersonalContacts.withArgs('some-crn').resolves([otherPersonalContact, personalContact])

    const observed = await subject.getPersonalContact('some-crn', 100)

    expect(observed).toEqual({
      personalContact,
      displayName: 'Liz Danger Haggis',
      breadcrumbs: fakeBreadcrumbs(BreadcrumbType.PersonalContact, {
        id: 100,
        crn: 'some-crn',
        offenderName: 'Liz Danger Haggis',
        entityName: 'Some personal contact',
      }),
      ids: {
        crn: 'some-crn',
      },
    } as PersonalContactViewModel)
  })
})
