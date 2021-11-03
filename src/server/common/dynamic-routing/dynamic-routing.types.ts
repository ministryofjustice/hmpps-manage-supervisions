import { Request } from 'express'

export const DYNAMIC_RENDER_KEY = 'DYNAMIC_RENDER_KEY'
export const DYNAMIC_REDIRECT_KEY = 'DYNAMIC_REDIRECT_KEY'

export interface DynamicRenderOptions {
  templateFn: DynamicTemplateFn
}

export interface DynamicRedirectOptions {
  enabled: boolean
}

export type DynamicTemplateFn<Model = any> = (request: Request, model: Model) => string
