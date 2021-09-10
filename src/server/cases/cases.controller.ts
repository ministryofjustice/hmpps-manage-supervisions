import { Controller, Get, Render, Req } from '@nestjs/common'
import { Breadcrumb, BreadcrumbType } from '../common/links'
import { CasesService } from './cases.service'

@Controller()
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  @Render('cases/index')
  @Breadcrumb({ type: BreadcrumbType.Cases, title: 'Cases' })
  async getCases(@Req() request) {
    const cases = await this.casesService.getCases(request.user.username)
    return { cases }
  }
}
