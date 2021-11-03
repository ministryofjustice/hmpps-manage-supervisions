import { SetMetadata } from '@nestjs/common'
import { DYNAMIC_REDIRECT_KEY, DynamicRedirectOptions } from './dynamic-routing.types'

export const DynamicRedirect = () => SetMetadata(DYNAMIC_REDIRECT_KEY, { enabled: true } as DynamicRedirectOptions)
