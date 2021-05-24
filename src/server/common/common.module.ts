import { Module } from '@nestjs/common'
import { CacheService } from './cache/cache.service'
import { HmppsOidcService } from './hmpps-oidc/hmpps-oidc.service'
import { RestService } from './rest'

const EXTERNAL_SERVICES = [CacheService, RestService, HmppsOidcService]

@Module({
  providers: EXTERNAL_SERVICES,
  exports: EXTERNAL_SERVICES,
})
export class CommonModule {}
