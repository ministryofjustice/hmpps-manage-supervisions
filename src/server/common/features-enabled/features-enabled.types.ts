import { FeatureFlags } from '../../config'

export class FeaturesNotEnabledError extends Error {
  constructor(readonly enabled: FeatureFlags[], readonly required: FeatureFlags[], readonly missing: FeatureFlags[]) {
    super(`${required.join(', ')} must be enabled to use this feature but only ${enabled.join(', ')} are enabled`)
  }
}
