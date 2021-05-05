import * as fs from 'fs'

const packageData = JSON.parse(fs.readFileSync('./package.json').toString())
const buildInfo = fs.existsSync('./build-info.json')
  ? JSON.parse(fs.readFileSync('./build-info.json', { encoding: 'utf8' }).toString())
  : {}
const buildNumber = buildInfo?.buildNumber || packageData.version

export default { buildNumber, packageData, buildInfo }
