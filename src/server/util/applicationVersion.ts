import * as fs from 'fs'
import * as path from 'path'

const PACKAGE_JSON_PATH = 'package.json'
const BUILD_INFO_PATH = path.join(__dirname, 'build-info.json')

export interface ApplicationInfo {
  packageData: {
    name: string
    version: string
    description: string
  }
  version?: string
}

function getVersion(): string {
  // try to read from file first, this is created by 'scripts/record-build-info' in the Dockerfile
  if (fs.existsSync(BUILD_INFO_PATH)) {
    return JSON.parse(fs.readFileSync(BUILD_INFO_PATH, { encoding: 'utf8' }))
  }
  // otherwise we're running outside docker, so attempt to read from environment variables
  return process.env.BUILD_NUMBER || null
}

export const ApplicationVersion: ApplicationInfo = {
  packageData: JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, { encoding: 'utf8' })),
  version: getVersion(),
}
