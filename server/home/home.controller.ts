import { Controller, Get, Render } from '../mvc'

@Controller('/')
export class HomeController {
  @Get()
  @Render('pages/index')
  get(): {} {
    return {}
  }
}
