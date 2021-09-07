import { Controller, Get, Redirect, Req } from '@nestjs/common'
import { Request } from 'express'
import { LogoutService } from './logout.service'
import { Public } from '../authentication'
import { RedirectResponse } from '../../common'

@Controller('logout')
@Public() // allow unauthenticated users to logout, this helps complete the flow when oauth fails during callback
export class LogoutController {
  constructor(private readonly service: LogoutService) {}

  @Get()
  @Redirect()
  async get(@Req() request: Request) {
    request.logOut()
    await new Promise(resolve => request.session.destroy(resolve))
    const url = this.service.getLogoutUrl()
    return RedirectResponse.found(url)
  }
}
