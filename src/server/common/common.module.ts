import { HttpModule, Module } from '@nestjs/common'
import { CacheService } from './cache/cache.service'
import { RestService } from './rest/rest.service'
import { HmppsOidcService } from './hmpps-oidc/hmpps-oidc.service'

const EXTERNAL_SERVICES = [CacheService, RestService, HmppsOidcService]

@Module({
  imports: [HttpModule],
  providers: EXTERNAL_SERVICES,
  exports: EXTERNAL_SERVICES,
})
export class CommonModule {}
