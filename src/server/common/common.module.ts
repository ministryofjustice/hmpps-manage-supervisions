import { Module } from '@nestjs/common'
import { CacheService } from './cache/cache.service'
import { HmppsOidcService } from './hmpps-oidc/hmpps-oidc.service'
import { RestService } from './rest'
import { ContactMappingService } from './contact-mapping'
import { LinksService } from './links'
import { DiscoveryModule } from '@nestjs/core'

@Module({
  imports: [DiscoveryModule],
  providers: [CacheService, RestService, HmppsOidcService, ContactMappingService, LinksService],
  exports: [CacheService, RestService, HmppsOidcService, ContactMappingService, LinksService],
})
export class CommonModule {}
