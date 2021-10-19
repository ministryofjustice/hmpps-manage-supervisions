import { DynamicModule, Injectable, Module } from '@nestjs/common'
import { createStubInstance, match, SinonStub, SinonStubbedInstance } from 'sinon'
import { CasePageLinksOnly, CasePageOfOptions, OffenderService } from './offender.service'
import * as faker from 'faker'
import { OffenderDetail } from '../../community-api/client'
import { MockLinksModule } from '../../common/links/links.mock'
import { fakeOffenderDetailSummary } from '../../community-api/community-api.fake'
import { CaseViewModel } from '../case.types'

@Injectable()
export class OffenderServiceFixture {
  private getCasePageStub: SinonStub
  caseViewModel: any
  offender: OffenderDetail

  constructor(private readonly subject: SinonStubbedInstance<OffenderService>) {}

  get links() {
    return MockLinksModule.of({ crn: this.offender.otherIds.crn })
  }

  havingOffender(partial: DeepPartial<OffenderDetail> = {}) {
    const offender = fakeOffenderDetailSummary([
      {
        otherIds: { crn: 'some-crn', pncNumber: 'some-pnc' },
        firstName: 'Liz',
        middleNames: ['Danger'],
        surname: 'Haggis',
        preferredName: 'Bob',
      },
      partial,
    ])
    this.subject.getOffenderSummary.withArgs('some-crn').resolves(offender)
    this.offender = offender
    return this
  }

  havingOffenderDetail(partial: DeepPartial<OffenderDetail> = {}) {
    const offender = fakeOffenderDetailSummary([
      {
        otherIds: { crn: 'some-crn', pncNumber: 'some-pnc' },
        firstName: 'Liz',
        middleNames: ['Danger'],
        surname: 'Haggis',
        preferredName: 'Bob',
      },
      partial,
    ])
    this.subject.getOffenderDetail.withArgs('some-crn').resolves(offender)
    this.offender = offender
    return this
  }

  havingCasePageOf() {
    this.caseViewModel = { id: faker.datatype.uuid() }
    this.getCasePageStub = this.subject.casePageOf.withArgs(this.offender, match.any).returns(this.caseViewModel)
    return this
  }

  get theCasePageOfOptions(): CasePageOfOptions<any> {
    const arg = this.getCasePageStub.getCall(0).args[1]
    return { ...arg, links: arg.links(this.links) as any }
  }

  shouldHaveCalledCasePageOf<CasePage extends CaseViewModel>(
    expected: Omit<CasePageOfOptions<CasePage>, 'links'> & { links: CasePageLinksOnly<CasePage> },
  ) {
    expect(this.theCasePageOfOptions).toEqual(expected)
    return this
  }
}

@Module({})
export class MockOffenderModule {
  static register(): DynamicModule {
    const service = createStubInstance(OffenderService)
    const fixture = new OffenderServiceFixture(service)
    return {
      module: MockOffenderModule,
      providers: [
        { provide: OffenderService, useValue: service },
        { provide: OffenderServiceFixture, useValue: fixture },
      ],
      exports: [OffenderService, OffenderServiceFixture],
    }
  }
}
