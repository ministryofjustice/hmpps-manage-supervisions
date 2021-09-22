import { Controller, Get, Render } from '@nestjs/common'
import { CurrentSecurityContext, SecurityContext } from '../security'
import { Breadcrumb, BreadcrumbType } from '../common/links'
import { CasesService } from './cases.service'

@Controller()
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  @Render('cases/index')
  @Breadcrumb({ type: BreadcrumbType.Cases, title: 'Cases' })
  async getCases(@CurrentSecurityContext() security: SecurityContext) {
    const cases = await this.casesService.getCases(security.username)
    return { cases }
  }
}
