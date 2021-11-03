import { SetMetadata } from '@nestjs/common'
import { DYNAMIC_RENDER_KEY, DynamicRenderOptions, DynamicTemplateFn } from './dynamic-routing.types'
import { get } from 'lodash'

export enum DynamicTemplateArgType {
  Static = 'static',
  Param = 'param',
  Result = 'result',
}

interface TemplateTokenBase<Type extends DynamicTemplateArgType> {
  type: Type
}

interface StaticTemplateToken extends TemplateTokenBase<DynamicTemplateArgType.Static> {
  value: string
}

interface ParamTemplateToken extends TemplateTokenBase<DynamicTemplateArgType.Param> {
  name: string
}

interface ResultTemplateToken extends TemplateTokenBase<DynamicTemplateArgType.Result> {
  path: string
}

type TemplateToken = StaticTemplateToken | ParamTemplateToken | ResultTemplateToken

function getTemplateFn(url: string): DynamicTemplateFn {
  const argTypes = Object.values(DynamicTemplateArgType).join('|')
  const tokens: TemplateToken[] = url
    .split('/')
    .filter(x => x)
    .map(x => x.trim())
    .map(x => {
      const match = x.match(`(${argTypes}):(.+)`)
      if (!match) {
        return { type: DynamicTemplateArgType.Static, value: x }
      }

      const [, type, value] = match
      switch (type) {
        case DynamicTemplateArgType.Param:
          return { type, name: value }
        case DynamicTemplateArgType.Result:
          return { type, path: value }
        default:
          throw new Error(`unknown dynamic parameter type ${type}`)
      }
    })

  return (request, model) => {
    const result = []
    for (const token of tokens) {
      let value: string
      switch (token.type) {
        case DynamicTemplateArgType.Static:
          value = token.value
          break
        case DynamicTemplateArgType.Param:
          value = request.params[token.name]
          break
        case DynamicTemplateArgType.Result:
          value = get(model, token.path)
          break
      }

      if (!value) {
        throw new Error(`cannot resolve dynamic template token ${JSON.stringify(token)}`)
      }

      result.push(value)
    }
    return result.join('/')
  }
}

/**
 * Renders a template from the specified URL.
 * Supports dynamic URL tokens in the form '{source}:{value}' where source is one of:
 * param: value as name of route parameter
 * result: value as path within action result
 *
 * e.g. 'views/param:someRouteParam/result:some.path.within[0].result'
 */
export const DynamicRender = (dynamicTemplateUrl: string) =>
  SetMetadata(DYNAMIC_RENDER_KEY, { templateFn: getTemplateFn(dynamicTemplateUrl) } as DynamicRenderOptions)
