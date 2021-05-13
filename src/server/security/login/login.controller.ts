import { Controller, Get, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { LoginGuard } from '../guards/login.guard'
import { Public } from '../meta/public.decorator'

@Public()
@Controller('login')
export class LoginController {
  @Get()
  @UseGuards(LoginGuard)
  public get(): void {
    return
  }

  @Get('callback')
  @UseGuards(LoginGuard)
  public async getCallback(@Res() res: Response): Promise<void> {
    res.redirect('/') // TODO redirect based on session
  }
}
