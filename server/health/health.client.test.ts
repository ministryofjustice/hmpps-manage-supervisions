import nock from 'nock'
import { HealthClient } from './health.client'
import { ApiConfig } from '../config'

describe('HealthClient', () => {
  const client = new HealthClient()
  const config: ApiConfig = {
    enabled: true,
    agent: {
      maxSockets: 100,
      maxFreeSockets: 10,
      freeSocketTimeout: 30000,
    },
    timeout: {
      response: 100,
      deadline: 150,
    },
    url: 'http://test-service.com',
  }
  const check = client.serviceCheckFactory('hmppsAuth', config, '/ping')

  let fakeServiceApi: nock.Scope

  beforeEach(() => {
    fakeServiceApi = nock('http://test-service.com')
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('Check healthy', () => {
    it('Should return data from api', async () => {
      fakeServiceApi.get('/ping').reply(200, 'pong')

      const output = await check()
      expect(output).toEqual({ healthy: true, name: 'hmppsAuth', result: 'OK' })
    })
  })

  describe('Check unhealthy', () => {
    it('Should throw error from api', async () => {
      fakeServiceApi.get('/ping').thrice().reply(500)

      const output = await check()
      expect(output.healthy).toEqual(false)
      expect(output.name).toEqual('hmppsAuth')
      expect((output.result as Error)?.message).toBe('Internal Server Error')
    })
  })

  describe('Check healthy retry test', () => {
    it('Should retry twice if request fails', async () => {
      fakeServiceApi
        .get('/ping')
        .reply(500, { failure: 'one' })
        .get('/ping')
        .reply(500, { failure: 'two' })
        .get('/ping')
        .reply(200, 'pong')

      const response = await check()
      expect(response).toEqual({ healthy: true, name: 'hmppsAuth', result: 'OK' })
    })

    it('Should retry twice if request times out', async () => {
      fakeServiceApi
        .get('/ping')
        .delay(10000) // delay set to 10s, timeout to 900/3=300ms
        .reply(200, { failure: 'one' })
        .get('/ping')
        .delay(10000)
        .reply(200, { failure: 'two' })
        .get('/ping')
        .reply(200, 'pong')

      const response = await check()
      expect(response).toEqual({ healthy: true, name: 'hmppsAuth', result: 'OK' })
    })

    it('Should fail if request times out three times', async () => {
      fakeServiceApi
        .get('/ping')
        .delay(10000) // delay set to 10s, timeout to 900/3=300ms
        .reply(200, { failure: 'one' })
        .get('/ping')
        .delay(10000)
        .reply(200, { failure: 'two' })
        .get('/ping')
        .delay(10000)
        .reply(200, { failure: 'three' })

      const output = await check()
      expect(output.healthy).toEqual(false)
      expect(output.name).toEqual('hmppsAuth')
      expect((output.result as Error)?.message).toBe('Response timeout of 100ms exceeded')
    })
  })
})
