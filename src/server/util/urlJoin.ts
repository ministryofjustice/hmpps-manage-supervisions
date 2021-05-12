import { trim } from 'lodash'

export function urlJoin(hostOrRootPath: string, ...pathTokens: string[]): string {
  const result = [hostOrRootPath, ...pathTokens]
    .map(x => trim(x, '/'))
    .filter(x => x)
    .join('/')
  return !result.startsWith('http') ? `/${result}` : result
}
