import { Controller, Get, Render } from '@nestjs/common'
import { Breadcrumb, BreadcrumbType } from '../common/links'

@Controller()
export class HomeController {
  @Get()
  @Render('home/index')
  @Breadcrumb({ type: BreadcrumbType.Cases, title: 'Cases' })
  get(): {} {
    return {}
  }
}
