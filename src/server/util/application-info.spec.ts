import { vol } from 'memfs'
import { writeFile, mkdir } from 'fs/promises'
import * as path from 'path'
import { getApplicationInfo } from './application-info'

jest.mock('fs')
jest.mock('fs/promises')

describe('application version', () => {
  beforeEach(async () => {
    // reset virtual filesystem & write out a dummy package.json to it
    vol.reset()
    await mkdir(__dirname, { recursive: true })
    await writeFile('package.json', JSON.stringify({ name: 'some-app', description: 'Some app', somethingElse: 'abc' }))
    delete process.env.BUILD_NUMBER
  })

  it('gets application version from build-info.json', async () => {
    await writeFile(
      path.join(__dirname, 'build-info.json'),
      JSON.stringify({ buildNumber: 'v1.0.0', apiSpecVersions: { community: '2021-10-04.6531.1680c86' } }),
    )
    expect(getApplicationInfo()).toEqual({
      description: 'Some app',
      name: 'some-app',
      version: 'v1.0.0',
      apiSpecVersions: { community: '2021-10-04.6531.1680c86' },
    })
  })

  it('gets application version from environment variable', () => {
    process.env.BUILD_NUMBER = 'v1.0.1'
    expect(getApplicationInfo()).toEqual({
      description: 'Some app',
      name: 'some-app',
      version: 'v1.0.1',
      apiSpecVersions: null,
    })
  })

  it('falls back to an empty version', () => {
    expect(getApplicationInfo()).toEqual({
      description: 'Some app',
      name: 'some-app',
      version: null,
      apiSpecVersions: null,
    })
  })
})
