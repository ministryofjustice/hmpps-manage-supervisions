import { SetMetadata, applyDecorators, UseGuards, UseFilters } from '@nestjs/common'
import { FeatureFlags } from '../../config'
import { FeaturesEnabledGuard } from './features-enabled.guard'
import { FeaturesNotEnabledFilter } from './features-not-enabled.filter'

export const FEATURES_ENABLED = 'FEATURES_ENABLED'

export const FeaturesEnabled = (...features: FeatureFlags[]) => {
  if (features.length === 0) {
    throw new Error('at least one feature flag is required')
  }
  return applyDecorators(
    SetMetadata(FEATURES_ENABLED, features),
    UseGuards(FeaturesEnabledGuard),
    UseFilters(FeaturesNotEnabledFilter),
  )
}
