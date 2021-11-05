import { Module } from '@nestjs/common'
import { CacheService } from './cache/cache.service'
import { HmppsOidcService } from './hmpps-oidc/hmpps-oidc.service'
import { RestService } from './rest'
import { LinksService } from './links'
import { DiscoveryModule } from '@nestjs/core'
import { FeaturesEnabledGuard } from './features-enabled/features-enabled.guard'

@Module({
  imports: [DiscoveryModule],
  providers: [FeaturesEnabledGuard, CacheService, RestService, HmppsOidcService, LinksService],
  exports: [CacheService, RestService, HmppsOidcService, LinksService],
})
export class CommonModule {}
