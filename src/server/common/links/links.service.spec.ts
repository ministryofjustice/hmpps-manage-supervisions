import { Test } from '@nestjs/testing'
import { LinksService } from './links.service'
import { DiscoveryModule } from '@nestjs/core'
import { Breadcrumb } from './breadcrumb.decorator'
import { Controller, Get } from '@nestjs/common'
import { BreadcrumbType } from './types'

@Controller()
class HomeController {
  @Get()
  @Breadcrumb({ type: BreadcrumbType.Cases, title: 'Cases' })
  get() {
    throw new Error('not implemented')
  }
}

@Controller('offender/:crn(\\w+)')
class OffenderController {
  @Get('overview')
  @Breadcrumb({
    type: BreadcrumbType.Case,
    parent: BreadcrumbType.Cases,
    title: options => options.offenderName,
  })
  getCase() {
    throw new Error('not implemented')
  }

  @Get('personal')
  @Breadcrumb({
    type: BreadcrumbType.PersonalDetails,
    parent: BreadcrumbType.Case,
    title: 'Personal details',
  })
  getPersonal() {
    throw new Error('not implemented')
  }

  @Get('addresses')
  @Breadcrumb({
    type: BreadcrumbType.PersonalAddresses,
    parent: BreadcrumbType.PersonalDetails,
    title: 'Addresses',
  })
  getAddresses() {
    throw new Error('not implemented')
  }
}

describe('LinksService', () => {
  let subject: LinksService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [DiscoveryModule],
      providers: [LinksService],
      controllers: [HomeController, OffenderController],
    }).compile()

    subject = module.get(LinksService)
  })

  it('gets url', () => {
    const observed = subject.getUrl(BreadcrumbType.Case, { crn: 'some-crn' })
    expect(observed).toEqual('/offender/some-crn/overview')
  })

  it('gets breadcrumb', () => {
    const observed = subject.resolveAll(BreadcrumbType.PersonalAddresses, {
      crn: 'some-crn',
      offenderName: 'Liz Haggis',
    })
    expect(observed).toEqual([
      { text: 'Cases', href: '/' },
      { text: 'Liz Haggis', href: '/offender/some-crn/overview' },
      { text: 'Personal details', href: '/offender/some-crn/personal' },
      { text: 'Addresses' },
    ])
  })

  it('gets breadcrumb with overrides', () => {
    const observed = subject.resolveAll(BreadcrumbType.PersonalAddresses, {
      crn: 'some-crn',
      offenderName: 'Liz Haggis',
      parentOverrides: {
        [BreadcrumbType.PersonalDetails]: BreadcrumbType.Cases,
      },
    })
    expect(observed).toEqual([
      { text: 'Cases', href: '/' },
      { text: 'Personal details', href: '/offender/some-crn/personal' },
      { text: 'Addresses' },
    ])
  })
})
