import * as path from 'path'
import { Router } from 'express'
import { useMvc } from '../mvc'

export default async function routes(router: Router): Promise<Router> {
  const rootPath = path.resolve(__dirname, '..')

  await useMvc(router, { controllers: `${rootPath}/**/*.controller.js` })
  return router
}
