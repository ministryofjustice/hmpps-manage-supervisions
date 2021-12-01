import { Controller, Get, Render } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config, ServerConfig } from '../config'

@Controller()
export class StaticController {
  constructor(private readonly config: ConfigService<Config>) {}

  @Get('accessibility-statement')
  @Render('static/accessibility-statement')
  async getAccessibilityStatement() {
    const { domain } = this.config.get<ServerConfig>('server')
    return { links: { domain } }
  }

  @Get('cookies')
  @Render('static/cookies')
  async getCookies() {
    // Do nothing.
  }
}
