import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { LoginGuard } from '../guards/login.guard'
import { Public } from '../meta/public.decorator'
import { UrlService } from '../url/url.service'
import { RedirectResponse } from '../../common'

@Public()
@Controller('login')
export class LoginController {
  constructor(private readonly url: UrlService) {}

  @Get()
  @UseGuards(LoginGuard)
  public get(): void {
    return
  }

  @Get('callback')
  @UseGuards(LoginGuard)
  @Redirect()
  public getCallback(@Req() req: Request): RedirectResponse {
    return RedirectResponse.found(this.url.sanitiseRedirectUrl(req))
  }
}
