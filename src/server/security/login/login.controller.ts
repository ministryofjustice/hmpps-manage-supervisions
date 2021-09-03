import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { LoginGuard } from './login.guard'
import { Public } from '../authentication/public.decorator'
import { LoginService } from './login.service'
import { RedirectResponse } from '../../common'

@Public()
@Controller('login')
export class LoginController {
  constructor(private readonly service: LoginService) {}

  @Get()
  @UseGuards(LoginGuard)
  public get(): void {
    return
  }

  @Get('callback')
  @UseGuards(LoginGuard)
  @Redirect()
  public getCallback(@Req() req: Request): RedirectResponse {
    return RedirectResponse.found(this.service.sanitiseRedirectUrl(req))
  }
}
