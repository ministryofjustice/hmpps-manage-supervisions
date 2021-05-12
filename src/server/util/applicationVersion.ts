import * as fs from 'fs'

const packageData = JSON.parse(fs.readFileSync('package.json').toString())
const buildInfoPath = 'build-info.json'
const buildInfo = fs.existsSync(buildInfoPath)
  ? JSON.parse(fs.readFileSync(buildInfoPath, { encoding: 'utf8' }).toString())
  : {}

export interface ApplicationInfo {
  buildNumber: string
  packageData: {
    name: string
    version: string
    description: string
  }
  buildInfo: {
    buildNumber: string
    gitRef: string
  }
}

export const ApplicationVersion: ApplicationInfo = {
  buildNumber: buildInfo?.buildNumber || packageData.version,
  packageData,
  buildInfo,
}
