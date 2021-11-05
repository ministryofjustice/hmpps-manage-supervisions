import { Request } from 'express'

export const DYNAMIC_RENDER_KEY = 'DYNAMIC_RENDER'
export const DYNAMIC_REDIRECT_KEY = 'DYNAMIC_REDIRECT'

export interface DynamicRenderOptions {
  templateFn: DynamicTemplateFn
}

export interface DynamicRedirectOptions {
  enabled: boolean
}

export type DynamicTemplateFn<Model = any> = (request: Request, model: Model) => string
