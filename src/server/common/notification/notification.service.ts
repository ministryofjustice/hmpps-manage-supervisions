import { Inject, Injectable, Scope } from '@nestjs/common'
import { Request } from 'express'
import { REQUEST } from '@nestjs/core'
import { NotificationLevel } from './notification.types'

/**
 * Simple wrapper for connect-flash
 */
@Injectable({ scope: Scope.REQUEST })
export class NotificationService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  notify(level: NotificationLevel, message: string) {
    this.request.flash(level, message)
  }
}
