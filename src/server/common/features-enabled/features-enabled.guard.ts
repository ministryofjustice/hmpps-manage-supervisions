import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Config, FeatureFlags, ServerConfig } from '../../config'
import { FEATURES_ENABLED } from './features-enabled.decorator'
import { ConfigService } from '@nestjs/config'
import { difference } from 'lodash'
import { FeaturesNotEnabledError } from './features-enabled.types'

@Injectable()
export class FeaturesEnabledGuard implements CanActivate {
  private readonly enabled: FeatureFlags[]

  constructor(private readonly reflector: Reflector, config: ConfigService<Config>) {
    const { features } = config.get<ServerConfig>('server')
    this.enabled = Object.entries(features)
      .filter(([, v]) => v)
      .map(([k]) => k as FeatureFlags)
  }

  canActivate(context: ExecutionContext): boolean {
    const required =
      this.reflector.getAllAndOverride<FeatureFlags[]>(FEATURES_ENABLED, [context.getHandler(), context.getClass()]) ||
      []

    if (required.length === 0) {
      return true
    }

    const missing = difference(required, this.enabled)
    if (missing.length === 0) {
      return true
    }

    throw new FeaturesNotEnabledError([...this.enabled], required, missing)
  }
}
