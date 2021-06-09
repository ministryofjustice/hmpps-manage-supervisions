import { Module } from '@nestjs/common'
import { CacheService } from './cache/cache.service'
import { HmppsOidcService } from './hmpps-oidc/hmpps-oidc.service'
import { RestService } from './rest'
import { ContactMappingService } from './contact-mapping/contact-mapping.service'

@Module({
  providers: [CacheService, RestService, HmppsOidcService, ContactMappingService],
  exports: [CacheService, RestService, HmppsOidcService, ContactMappingService],
})
export class CommonModule {}
