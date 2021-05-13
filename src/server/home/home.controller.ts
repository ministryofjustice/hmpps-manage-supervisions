import { Controller, Get, Render } from '@nestjs/common'

@Controller()
export class HomeController {
  @Get()
  @Render('pages/index')
  get(): {} {
    return {}
  }
}
