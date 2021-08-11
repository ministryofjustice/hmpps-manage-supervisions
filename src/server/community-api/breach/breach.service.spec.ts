import { Test } from '@nestjs/testing'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { BreachService } from './breach.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../community-api.mock'
import { CommunityApiService } from '../community-api.service'
import { ContactMappingService } from '../contact-mapping'
import { NsiType } from '../well-known'
import { fakeOkResponse } from '../../common/rest/rest.fake'
import { fakeContactSummary, fakeNsi } from '../community-api.fake'
import { ContactSummary, Nsi } from '../client'
import { DateTime, Settings } from 'luxon'
import { GetBreachesResult } from './breach.types'
import { ContactTypeCategory } from '../../config'

describe('BreachService', () => {
  let subject: BreachService
  let community: MockCommunityApiService
  let contactMapping: SinonStubbedInstance<ContactMappingService>
  const now = DateTime.fromObject({ year: 2018, month: 5, day: 2 })

  beforeEach(async () => {
    Settings.now = () => now.valueOf()

    contactMapping = createStubInstance(ContactMappingService)

    const module = await Test.createTestingModule({
      providers: [BreachService, { provide: ContactMappingService, useValue: contactMapping }],
      imports: [MockCommunityApiModule.register()],
    }).compile()

    subject = module.get(BreachService)
    community = module.get(CommunityApiService)
  })

  it('ignores not started & soft deleted breach requests', async () => {
    havingBreachRequests({ actualStartDate: null }, { softDeleted: true })

    const observed = await subject.getBreaches('some-crn', 100)

    expect(observed).toEqual({ breaches: [], lastRecentBreachEnd: null } as GetBreachesResult)
  })

  it('gets active breach', async () => {
    havingBreachRequests({ active: true, actualStartDate: '2021-01-01', nsiStatus: { description: 'Some status' } })

    const observed = await subject.getBreaches('some-crn', 100)

    expect(observed).toEqual({
      breaches: [
        {
          active: true,
          startDate: DateTime.fromObject({ year: 2021, month: 1, day: 1 }),
          endDate: null,
          status: 'Some status',
          proven: false,
        },
      ],
      lastRecentBreachEnd: null,
    } as GetBreachesResult)
  })

  it('gets inactive breach without breach end contact', async () => {
    havingBreachRequests({
      active: false,
      actualStartDate: '2018-02-01',
      actualEndDate: '2018-03-01',
      nsiStatus: { description: 'Some status' },
      nsiOutcome: { description: 'Some outcome' },
    })
    havingContacts()

    const observed = await subject.getBreaches('some-crn', 100)

    shouldHaveRequestedCorrectContactRange('2018-02-01', '2018-03-02')
    expect(observed).toEqual({
      breaches: [
        {
          active: false,
          startDate: DateTime.fromObject({ year: 2018, month: 2, day: 1 }),
          endDate: DateTime.fromObject({ year: 2018, month: 3, day: 1 }),
          status: 'Some status',
          outcome: 'Some outcome',
          proven: false,
        },
      ],
      lastRecentBreachEnd: DateTime.fromObject({ year: 2018, month: 3, day: 1 }),
    } as GetBreachesResult)
  })

  it('gets inactive breach with breach end contact', async () => {
    havingBreachRequests({
      active: false,
      actualStartDate: '2016-01-01',
      actualEndDate: '2016-02-01',
      nsiStatus: { description: 'Some status' },
      nsiOutcome: { description: 'Some outcome' },
    })
    havingContacts(
      { type: { code: 'C1' }, contactStart: '2016-01-10T12:00:00+00:00' },
      { type: { code: 'C2' }, contactStart: '2016-01-11T12:00:00+00:00' },
    )
    havingBreachEndMeta('C1', 'Some breach end contact')
    havingBreachEndMeta('C2', 'Some later breach end that will be ignored (see comments in service)')

    const observed = await subject.getBreaches('some-crn', 100)

    shouldHaveRequestedCorrectContactRange('2016-01-01', '2016-02-02')
    expect(observed).toEqual({
      breaches: [
        {
          active: false,
          startDate: DateTime.fromObject({ year: 2016, month: 1, day: 1 }),
          endDate: DateTime.fromObject({ year: 2016, month: 2, day: 1 }),
          status: 'Some status',
          outcome: 'Some breach end contact',
          proven: true,
        },
      ],
      lastRecentBreachEnd: null,
    } as GetBreachesResult)
  })

  function havingBreachRequests(...partials: DeepPartial<Nsi>[]) {
    const nsis = partials.map(x => fakeNsi(x))
    community.breach.getNsiForOffenderByCrnAndConvictionIdUsingGET
      .withArgs(
        match({
          convictionId: 100,
          crn: 'some-crn',
          nsiCodes: [NsiType.BreachRequest],
        }),
      )
      .resolves(fakeOkResponse({ nsis }))
  }

  function havingContacts(...partials: DeepPartial<ContactSummary>[]) {
    const contacts = partials.map(x => fakeContactSummary(x))
    contactMapping.getAllBreachContactTypeCodes.returns(['BREACH'])
    community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET.resolves(
      fakeOkResponse({ content: contacts }),
    )
  }

  function shouldHaveRequestedCorrectContactRange(contactDateFrom: string, contactDateTo: string) {
    const arg = community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET.getCall(0).firstArg
    expect(arg).toEqual({
      crn: 'some-crn',
      convictionId: 100,
      contactDateFrom,
      contactDateTo,
      page: 0,
      pageSize: 1000,
      contactTypes: ['BREACH'],
    })
  }

  function havingBreachEndMeta(code: string, name: string) {
    contactMapping.getBreachMeta.withArgs(code).returns({
      type: ContactTypeCategory.BreachEnd,
      name,
      value: { code, name, proven: true },
    })
  }
})
