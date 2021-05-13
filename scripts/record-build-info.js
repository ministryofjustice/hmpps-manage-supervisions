const fs = require('fs')
const path = require('path')

function getEnvironmentVariable(name) {
  if (process.env[name]) {
    return process.env[name]
  }
  throw new Error(`Missing env var ${name}`)
}

const buildInfo = {
  buildNumber: getEnvironmentVariable('BUILD_NUMBER'),
  gitRef: getEnvironmentVariable('GIT_REF'),
}

console.log(buildInfo)
const dist = path.resolve(__dirname, '..', 'dist')

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist)
}

fs.writeFileSync(path.join(dist, 'build-info.json'), JSON.stringify(buildInfo))
