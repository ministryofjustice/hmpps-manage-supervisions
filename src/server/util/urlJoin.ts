import { URL } from 'url'
import { trim } from 'lodash'

export function urlJoin(hostOrRootPath: URL | string, ...pathTokens: string[]): string {
  const result = [hostOrRootPath instanceof URL ? hostOrRootPath.href : hostOrRootPath, ...pathTokens]
    .map(x => trim(x, '/'))
    .filter(x => x)
    .join('/')
  return !result.startsWith('http') ? `/${result}` : result
}
