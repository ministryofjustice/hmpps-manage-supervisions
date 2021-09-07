import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { URL } from 'url'
import { Config, ServerConfig } from '../../config'
import { Request } from 'express'

const DEFAULT_REDIRECT = '/'

@Injectable()
export class LoginService {
  public static REDIRECT_PARAM = 'redirect'

  private readonly domain: URL

  constructor(config: ConfigService<Config>) {
    this.domain = config.get<ServerConfig>('server').domain
  }

  sanitiseRedirectUrl(request: Request): string {
    const raw = request.query[LoginService.REDIRECT_PARAM]
    if (!raw || typeof raw !== 'string') {
      return DEFAULT_REDIRECT
    }

    const url = new URL(raw, this.domain)

    if (url.hostname !== this.domain.hostname) {
      // forbid an open redirect https://cwe.mitre.org/data/definitions/601.html
      return DEFAULT_REDIRECT
    }

    return raw
  }
}
