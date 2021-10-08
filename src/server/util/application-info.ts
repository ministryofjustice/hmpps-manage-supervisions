import * as fs from 'fs'
import * as path from 'path'

const PACKAGE_JSON_PATH = 'package.json'
const BUILD_INFO_PATH = path.join(__dirname, 'build-info.json')

export interface ApplicationInfo {
  name: string
  description: string
  version?: string
  apiSpecVersions: Record<string, string>
}

export function getApplicationInfo(): ApplicationInfo {
  const { name, description } = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, { encoding: 'utf8' }))
  const buildInfo = fs.existsSync(BUILD_INFO_PATH)
    ? JSON.parse(fs.readFileSync(BUILD_INFO_PATH, { encoding: 'utf8' }))
    : null
  return {
    name,
    description,
    version: buildInfo?.buildNumber || process.env.BUILD_NUMBER || null,
    apiSpecVersions: buildInfo?.apiSpecVersions || null,
  }
}
