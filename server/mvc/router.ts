import { trim, replace } from 'lodash'
import glob from 'glob'
import { Request, Response, Router } from 'express'
import { plainToClass } from 'class-transformer'
import { Container } from 'typedi'
import logger from '../../logger'
import { ControllerMeta, EndpointMeta, ParamMeta, ParamSource } from './types'
import { ControllerContext } from './controller.context'
import { HealthException, RedirectException } from './errors'

interface MvcOptions {
  controllers: string
}

async function loadModules(pattern: string) {
  // Detect ts-node (https://github.com/TypeStrong/ts-node/issues/846) & switch to .ts files
  const tsNode = process[Symbol.for('ts-node.register.instance')]
  const isTsNode = tsNode && 'ts' in tsNode
  const isTest = process.env.NODE_ENV === 'test'
  const fixedPattern = isTest || isTsNode ? replace(pattern, /\.js$/, '.ts') : pattern

  const promises = await new Promise<Promise<void>[]>((resolve, reject) =>
    glob(fixedPattern, {}, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files.map(f => import(f)))
      }
    }),
  )

  await Promise.all(promises)
}

type KeyedParamMeta = ParamMeta & { key: string }

interface ResolvedEndpointMeta {
  id: string
  controller: ControllerMeta
  endpoint: EndpointMeta
  params: KeyedParamMeta[]
}

async function mapParameter(id: string, p: KeyedParamMeta, req: Request, res: Response) {
  switch (p.src) {
    case ParamSource.Body: {
      if (!p.type || [String, Boolean, Number, Array, Object].includes(p.type as any)) {
        return req.body
      }
      // use class-transformer where appropriate
      return plainToClass(p.type as any, req.body, { excludeExtraneousValues: true })
    }

    case ParamSource.Request:
      return req

    case ParamSource.Response:
      return res

    default: {
      const src = req[p.src]
      if (p.src === ParamSource.Url && !(p.key in src)) {
        throw new Error(`[${id}] url parameter with name ${p.key} is not defined`)
      }
      const value = src[p.key]
      switch (p.type) {
        case Number:
          return parseInt(value as string, 10)
        default:
          return value
      }
    }
  }
}

async function mvcRequestHandler(
  { id, controller, endpoint, params }: ResolvedEndpointMeta,
  req: Request,
  res: Response,
) {
  const argPromises = params.map(async p => mapParameter(id, p, req, res))
  const args = await Promise.all(argPromises)

  const instance = Container.get(controller.type)
  const viewModel = await instance[endpoint.action.name](...args)

  // TODO support changing status
  res.status(200)
  if (endpoint.template) {
    res.render(endpoint.template, viewModel)
  } else {
    res.json(viewModel)
  }
}

export async function useMvc(router: Router, options: MvcOptions): Promise<void> {
  await loadModules(options.controllers)

  for (const controller of ControllerContext.value) {
    for (const endpoint of controller.endpoints) {
      const path = `/${[controller.path, endpoint.path]
        .map(x => trim(x, '/'))
        .filter(x => x)
        .join('/')}`
      if (!(endpoint.method in router)) {
        throw Error(`unknown http method ${endpoint.method}`)
      }

      const meta: ResolvedEndpointMeta = {
        id: `${controller.type.name}.${endpoint.action.name}`,
        controller,
        endpoint,
        params: Object.entries(endpoint.params)
          .map(([key, p]) => ({
            key,
            ...p,
          }))
          .sort((a, b) => a.index - b.index),
      }

      logger.info(`[${meta.id}] ${endpoint.method.toUpperCase()} ${path}`)

      router[endpoint.method](path, async (req, res, next) => {
        try {
          await mvcRequestHandler(meta, req, res)
        } catch (e) {
          if (e instanceof RedirectException) {
            res.status(e.status).redirect(e.url)
            return
          }
          if (e instanceof HealthException) {
            res.status(503).json(e.health)
            return
          }
          next(e)
        }
      })
    }
  }
}
