import { Controller, Get, Render } from '@nestjs/common'
import { AuthenticatedUser } from '../common'
import { Breadcrumb, BreadcrumbType } from '../common/links'
import { CasesService } from './cases.service'

@Controller()
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  @Render('cases/index')
  @Breadcrumb({ type: BreadcrumbType.Cases, title: 'Cases' })
  async getCases(@AuthenticatedUser() user: User) {
    const cases = await this.casesService.getCases(user.username)
    return { cases }
  }
}
