import { UseInterceptors } from '@nestjs/common'
import { RedirectInterceptor } from './redirect.interceptor'

export const DynamicRedirect = () => UseInterceptors(RedirectInterceptor)
